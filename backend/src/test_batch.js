// test_batch_worker_v2.js
require('dotenv').config(); // Load environment variables from .env

const { Worker, Queue } = require('bullmq');
const IORedis = require('ioredis');

// --- Global Uncaught Exception Handlers (CRITICAL FOR DEBUGGING SILENT EXITS) ---
process.on('uncaughtException', (err) => {
    console.error('\n!!! UNCAUGHT EXCEPTION !!!');
    console.error(err);
    console.error('Process will exit due to uncaught exception.');
    process.exit(1); // Exit with a failure code
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\n!!! UNHANDLED PROMISE REJECTION !!!');
    console.error('Reason:', reason);
    console.error('Promise:', promise);
    console.error('Process will exit due to unhandled rejection.');
    process.exit(1); // Exit with a failure code
});


// --- Configuration ---
const QUEUE_NAME = 'testSingleJobQueue'; // Changed queue name for this test
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

console.log(`--- BullMQ Single Job Test (V2) ---`);
console.log(`Queue Name: ${QUEUE_NAME}`);
console.log(`Redis Host: ${REDIS_HOST}:${REDIS_PORT}`);

// Global variable for the single Redis connection instance
let sharedRedisConnection = null;

// --- Helper function to get a READY Redis Connection ---
async function getReadyRedisConnection() {
    if (sharedRedisConnection && sharedRedisConnection.status === 'ready') {
        console.log('Redis: Reusing existing READY connection.');
        return sharedRedisConnection;
    }

    if (!sharedRedisConnection) {
        console.log('Redis: Creating new IORedis instance...');
        sharedRedisConnection = new IORedis({
            host: REDIS_HOST,
            port: REDIS_PORT,
            maxRetriesPerRequest: null, // Recommended for BullMQ
            lazyConnect: true, // CRITICAL: Explicitly lazy connect
        });

        sharedRedisConnection.on('ready', () => {
            console.log('Redis: Connection is READY for BullMQ!');
        });

        sharedRedisConnection.on('error', (err) => {
            console.error('Redis: Connection ERROR!', err);
            // On error, reset the connection to force re-initialization if needed
            sharedRedisConnection = null;
        });

        sharedRedisConnection.on('connect', () => {
            console.log('Redis: Connection established (TCP connected, not yet ready).');
        });

        sharedRedisConnection.on('close', () => {
            console.warn('Redis: Connection closed.');
            sharedRedisConnection = null; // Clear on close
        });
    }

    // Explicitly connect and wait for 'ready' status
    if (sharedRedisConnection.status !== 'ready') {
        console.log('Redis: Awaiting connection to become READY...');
        await sharedRedisConnection.connect(); // Initiate connection if not already connected

        // Wait for the 'ready' event
        await new Promise((resolve, reject) => {
            const onReady = () => {
                sharedRedisConnection.off('error', onError); // Clean up error listener
                resolve();
            };
            const onError = (err) => {
                sharedRedisConnection.off('ready', onReady); // Clean up ready listener
                reject(err);
            };
            sharedRedisConnection.once('ready', onReady);
            sharedRedisConnection.once('error', onError);
        });
    }

    return sharedRedisConnection;
}


// --- 1. Define the Worker (NO BATCH CONFIG) ---
async function startWorker() {
    let connectionInstance;
    try {
        connectionInstance = await getReadyRedisConnection(); // Await the truly ready connection
        console.log('Worker: Received READY Redis connection instance for BullMQ Worker.');
    } catch (error) {
        console.error('Worker: Failed to get Redis connection. Exiting:', error);
        process.exit(1);
    }

    let worker; // Declare worker outside try block for scope
    try {
        console.log('Worker: Attempting to instantiate BullMQ Worker...');
        worker = new Worker(
            QUEUE_NAME,
            async (job) => { // Expecting a SINGLE job object now
                console.log(`\n--- Worker Processor Invoked (Single Job) ---`);
                console.log(`Processing Job ID: ${job.id}, Data:`, job.data);
                
                // Simulate some async work
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                console.log(`Finished processing Job ID: ${job.id}`);
                return { jobId: job.id, status: 'processed_single', timestamp: new Date() };
            },
            {
                connection: connectionInstance, // Pass the awaited connection instance
                concurrency: 1, // Process one job at a time
                // REMOVED: batch: { ... }
            }
        );
        console.log(`Worker for '${QUEUE_NAME}' instantiated successfully.`);

    } catch (error) {
        console.error(`Worker: Error instantiating BullMQ Worker:`, error);
        process.exit(1);
    }


    console.log(`Worker for '${QUEUE_NAME}' initialized and listening for jobs.`);

    // Worker event listeners
    worker.on('active', (job) => {
        console.log(`[Worker Event] Job ${job.id} is active.`);
    });

    worker.on('completed', (job) => {
        console.log(`[Worker Event] Job ${job.id} completed. Result:`, job.returnvalue);
    });

    worker.on('failed', (job, err) => {
        console.error(`[Worker Event] Job ${job.id} failed with error:`, err);
    });

    worker.on('error', (err) => {
        console.error('[Worker Event] Worker experienced an error:', err);
    });

    worker.on('ready', () => {
        console.log('BullMQ Worker instance is ready to process jobs.');
    });
}

// --- 2. Define the Producer ---
async function addJobsToQueue(count = 1) { // Changed count to 1 for single job test
    let connectionInstance;
    try {
        connectionInstance = await getReadyRedisConnection(); // Await the truly ready connection
        console.log('Producer: Received READY Redis connection instance.');
    } catch (error) {
        console.error('Producer: Failed to get Redis connection. Exiting:', error);
        process.exit(1);
    }

    const queue = new Queue(QUEUE_NAME, { connection: connectionInstance });
    console.log(`Producer: Adding ${count} job(s) to queue '${QUEUE_NAME}'...`);

    for (let i = 0; i < count; i++) {
        const jobName = `test-job-${i + 1}`;
        const jobData = { message: `Hello from job ${i + 1}` };
        await queue.add(jobName, jobData);
        console.log(`  Producer: Added job ${jobName} (ID: ${jobData.id || 'N/A'})`);
    }
    console.log(`Producer: All ${count} job(s) added.`);

    // Give worker a moment to pick up jobs, then disconnect producer gracefully
    setTimeout(async () => {
        console.log('Producer: Disconnecting queue...');
        await queue.close();
        console.log('Producer: Queue disconnected.');
    }, 5000); // Give worker some time to pick up the job
}

// --- Start both Worker and Producer ---
async function main() {
    console.log('Main: Starting worker...');
    await startWorker();
    console.log('Main: Worker started. Giving it a moment before adding jobs...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Main: Adding jobs to queue...');
    await addJobsToQueue(1); // Add just one job
    console.log('Main: Jobs added. Script will now wait for processing...');
}

main().catch(console.error);

// Handle graceful shutdown for the entire script
process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT. Closing Redis connection...');
    if (sharedRedisConnection && sharedRedisConnection.status !== 'end') {
        await sharedRedisConnection.quit();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM. Closing Redis connection...');
    if (sharedRedisConnection && sharedRedisConnection.status !== 'end') {
        await sharedRedisConnection.quit();
    }
    process.exit(0);
});
