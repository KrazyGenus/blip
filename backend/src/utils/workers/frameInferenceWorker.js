const { Worker } = require('bullmq');
const { gemeniVisualAnalysis } = require('../../inference/gemeniVisualAnalysis');
const { redisClient } = require('../../core/redis/connection'); // Your Redis client setup
const { fileToGenerativePart } = require('../fileToGenerativePart'); // Your helper function


console.log('Frame Inference Worker starting...');

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
        async (jobs) => { // This 'jobs' will now correctly be an array of Job objects
            // Add a type check here for immediate debugging confirmation
            console.log(`[Worker Processor] Type of 'jobs': ${typeof jobs}, Is Array: ${Array.isArray(jobs)}`);
            console.log(`[Worker Processor] Processing a batch of ${jobs.length} jobs from frameInferenceQueue`);

            // Extract all frames paths from the batch of jobs
            const framePaths = jobs.map(job => job.data.framePath);

            // Concurrently convert all file paths to Gemini Part objects
            // Promise.all will wait for all fileToGenerativePart promises to resolve
            const fileToGenerativeParts = await Promise.all(
                framePaths.map(filePath => fileToGenerativePart(filePath))
            );

            // Send the array of Gemini Part objects to your analysis function
            const gemeniVisualAnalysisResponse = await gemeniVisualAnalysis(fileToGenerativeParts);

            console.log(`Batch processing complete for ${jobs.length} jobs. Gemini response:`, gemeniVisualAnalysisResponse);

            // --- IMPORTANT: Return results for each job in the batch ---
            // BullMQ expects an array of results when using batch processing.
            // You need to map the single Gemini response back to each job's outcome.
            const resultsForIndividualJobs = jobs.map(job => {
                return {
                    jobId: job.id,
                    status: 'completed', // Or 'completed_with_violations' based on `gemeniVisualAnalysisResponse`
                    result: gemeniVisualAnalysisResponse // Attach the full batch response to each job
                };
            });

            return resultsForIndividualJobs; // This is crucial for BullMQ to mark jobs as completed
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