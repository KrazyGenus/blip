const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');

// Create a Redis connection
const connection = new IORedis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null
});

const queueName = 'batchProcessingQueue';
const queue = new Queue(queueName, { connection });

const BATCH_SIZE = 10;
let currentBatch = [];

// Function to process a batch of jobs
async function processBatch(batch) {
  console.log(`\n=== PROCESSING BATCH OF ${batch.length} JOBS ===`);
  
  // Process all jobs in the batch
  const results = await Promise.all(
    batch.map(job => processJob(job))
  );
  
  console.log('=== BATCH PROCESSING COMPLETE ===\n');
  return results;
}

// Individual job processing function
async function processJob(job) {
  console.log(`Processing job ${job.id} - Item ${job.data.index}`);
  
  // Simulate work
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const result = {
    status: 'processed',
    index: job.data.index,
    timestamp: Date.now()
  };
  
  console.log(`Completed job ${job.id} - Item ${job.data.index}`);
  return result;
}

// Worker that collects jobs until batch is full
const worker = new Worker(queueName, async (job) => {
  // Add job to current batch
  currentBatch.push(job);
  
  // If batch is full, process it
  if (currentBatch.length >= BATCH_SIZE) {
    const batchToProcess = [...currentBatch];
    currentBatch = []; // Reset batch
    
    // Process the batch (note: we don't return here)
    processBatch(batchToProcess);
  }
  
  // We don't return anything because we're handling processing separately
}, { 
  connection,
  concurrency: 1 // Important: Only process one job at a time to maintain batch order
});

// Function to add jobs to the queue
async function addJob(jobData) {
  await queue.add('processItem', jobData);
  console.log(`Added job ${jobData.index}`);
}

// Simulate adding jobs at intervals
async function simulateJobAdds() {
  // Clear queue for testing
  await queue.drain();
  currentBatch = [];
  
  console.log('Simulating job additions...');
  
  // Add 25 jobs with random delays between them
  for (let i = 1; i <= 25; i++) {
    const delay = Math.floor(Math.random() * 800) + 200; // 200-1000ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    await addJob({
      index: i,
      message: `Item ${i} data`,
      timestamp: Date.now()
    });
  }
  
  // Process any remaining jobs in the final batch
  if (currentBatch.length > 0) {
    await processBatch(currentBatch);
    currentBatch = [];
  }
  
  console.log('Finished adding jobs');
}

// Handle shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  
  // Process any remaining jobs before exiting
  if (currentBatch.length > 0) {
    await processBatch(currentBatch);
  }
  
  await worker.close();
  await queue.close();
  await connection.quit();
  process.exit(0);
});

// Run the simulation
(async function() {
  await simulateJobAdds();
})();
