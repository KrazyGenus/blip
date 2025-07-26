const { Worker } = require('bullmq');
const { geminiVisualAnalysis } = require('../../inference/geminiVisualAnalysis');
const { redisClient } = require('../../core/redis/connection'); // Your Redis client setup
const { fileToGenerativePart } = require('../fileToGenerativePart'); // Your helper function
const { fireStoreClient } = require('../../core/firestore/connection');

console.log('Frame Inference Worker starting...');
// --- Batching Configuration for Worker-Side Accumulation ---
const BATCHSIZE = 10; // The number of frames to accumulate before sending it over to gemeni
const BATCHTIMEOUTMS = 5000; // Max number of wait time before sening the batch
let currentBatch = [] // Array of current batch
let batchTimeoutId = null;

// function to process the accumulated jobs
async function processAccumulatedBatch(userId, jobId) {
    if (currentBatch.length === 0) {
        console.log('Worker batch No jobs in current batch to process');
        return;
    }
    const batchToProcess = [...currentBatch];
    currentBatch = []; // Empty it for the next batch
    if (batchTimeoutId) {
        clearTimeout(batchTimeoutId);
        batchTimeoutId = null;
    }

    try {
        // Extract the paths to the frames into an array to be sent for encoding
        // reencoding to base64 for Gemeni
        
        const framePaths = batchToProcess.map((job) => job.data.framePath);

        // Convert all current framePaths to Gemeni Part Objects
        const fileToGenerativeParts = await Promise.all(framePaths.map(filePath => fileToGenerativePart(filePath)));
        console.log('framePath len', fileToGenerativeParts.length);
        // Send the array of Gemini Part objects to your analysis function
        const gemeniVisualAnalysisResponse = await geminiVisualAnalysis(fileToGenerativeParts);
        console.log('The type is: ', typeof(gemeniVisualAnalysisResponse))
        console.log(`[Worker Batcher] Gemini analysis complete for batch. Overall assessment: ${gemeniVisualAnalysisResponse.overall_assessment}`);
        try {
           await fireStoreClient.createOrUpdateDocument(userId, jobId, 'visualViolations', gemeniVisualAnalysisResponse);
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.error('Worker inference failed, during inference', error);
        // batchToProcess.forEach((job) => {
        //     job.update({
        //         status: 'failed',
        //         error: error.message,
        //         result: null
        //     }).catch(err=>console.error('Failed to update job', err));
        // });
    }

}
// Wrap your worker instantiation in an async function
// This ensures we can `await` the Redis connection
async function startFrameInferenceWorker() {
    let redisConnectionInstance;
    try {
        // Await the actual Redis connection instance to be ready
        redisConnectionInstance = await redisClient.getConnection();
        console.log('Redis client connection is established and ready for BullMQ Worker.');
    } catch (error) {
        console.error('Failed to get Redis connection for BullMQ Worker. Exiting:', error);
        // It's critical to exit if the worker can't connect to Redis
        process.exit(1);
    }

    // Now, instantiate the worker, passing the *resolved* connection instance
    const worker = new Worker(
        'frameInferenceQueue',
        async (job) => {
            currentBatch.push(job);
            const { jobId, userId } = job.data; 
            if (currentBatch.length >= BATCHSIZE) {
                await processAccumulatedBatch(userId, jobId);
            }
            else {
                // If not full, set/reset a timeout to process partial batch
                if (batchTimeoutId) {
                    clearTimeout(batchTimeoutId);
                }
                batchTimeoutId = setTimeout(() => { processAccumulatedBatch(userId, jobId)}, BATCHTIMEOUTMS );
            }

            return {status: 'Pending batch processing'}
        },
        {
            connection: redisConnectionInstance, // Pass the awaited connection instance here
            concurrency: 1, // Number of batches to process concurrently
            batch: {
                size: 10,
                minSize: 5,
                timeout: 5000
            }
        }
    );

    console.log('BullMQ Worker for frameInferenceQueue initialized and listening for jobs.');

    // --- Worker Event Listeners (for robust logging and debugging) ---
    worker.on('active', (job) => {
        console.log(`[Worker Event] Job ${job.id} is active.`);
    });

    worker.on('completed', (job) => {
        console.log(`[Worker Event] Job ${job.id} (from batch) completed. Result:`, job.returnvalue);
    });

    worker.on('failed', (job, err) => {
        console.error(`[Worker Event] Job ${job.id} (from batch) failed with error:`, err);
    });

    worker.on('error', (err) => {
        console.error('[Worker Event] Worker experienced an error:', err);
    });

    worker.on('ready', () => {
        console.log('BullMQ Worker instance is ready to process jobs.');
    });

    worker.on('closed', () => {
        console.log('BullMQ Worker closed.');
    });

    // --- Graceful Shutdown (Highly Recommended for Workers) ---
    process.on('SIGINT', async () => {
        console.log('Received SIGINT. Closing worker...');
        await worker.close();
        await redisClient.disconnect(); // Ensure your redisClient has a disconnect method
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('Received SIGTERM. Closing worker...');
        await worker.close();
        await redisClient.disconnect();
        process.exit(0);
    });
}

// Call the async function to start the worker
startFrameInferenceWorker();