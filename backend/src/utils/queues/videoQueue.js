const { Queue, Worker } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const util = require('util');
const { bufferToStream } = require('../bufferToStream');
const { frameAnalysisQueue } = require('./inferenceQueue');
const rimraf = require('rimraf'); // For recursive directory deletion
const { Writable } = require('stream');
const writeFile = util.promisify(fs.writeFile);

// Temporary directory configuration
const PROCESSED_FRAMES_TEMP_DIR = path.join(__dirname, 'temp_processed_frames');

// Initialize queues
const videoQueue = new Queue('video-processing-queue', { 
  connection: redisClient.getConnection() 
});

// --- Video Processing Worker ---
const videoWorker = new Worker(
  'video-processing-queue',
  async (job) => {
    const buffer = Buffer.from(job.data.chunk, 'base64');
    const { chunkIndex } = job.data;
    const jobId = job.id;

    // Create a unique temporary directory for this job's chunk
    const chunkTempDir = path.join(PROCESSED_FRAMES_TEMP_DIR, `job-${jobId}-chunk-${chunkIndex}`);
    
    // Ensure the job-specific temp directory exists
    // fs.promises.mkdir is already Promise-based
    try {
        await fs.promises.mkdir(chunkTempDir, { recursive: true });
        console.log(`[Job ${jobId}] Created temporary directory: ${chunkTempDir}`);
    } catch (mkdirErr) {
        console.error(`[Job ${jobId}] ERROR: Failed to create temp directory ${chunkTempDir}:`, mkdirErr);
        throw mkdirErr; // Fail the job if directory cannot be created
    }

    const readableStream = bufferToStream(buffer);
    const tempFramePaths = [];
    let frameCounter = 0;

    // Encapsulate FFmpeg processing within a Promise
    const processingPromise = new Promise((resolve, reject) => {
      // Create a custom Writable stream to consume FFmpeg's output
      const outputStream = new Writable({
        objectMode: false, // FFmpeg outputs binary buffers
        write(frameData, encoding, callback) {
          // Construct unique path for each frame
          const framePath = path.join(chunkTempDir, `frame-${frameCounter}.jpg`);
          
          // Use promisified writeFile for asynchronous disk write
          writeFile(framePath, frameData)
            .then(() => {
              tempFramePaths.push(framePath); // Add path only upon successful write
              frameCounter++;
              callback(); // Signal that the stream is ready for the next chunk
            })
            .catch(writeErr => {
              console.error(`[Job ${jobId}] ERROR: Failed to save frame ${framePath}:`, writeErr);
              callback(writeErr); // Signal error to the stream
            });
        }
      });

      ffmpeg(readableStream)
      
        .outputOptions([
          '-vf', 'select=gt(scene\\,0.4)', // Scene change detection
          '-vsync', 'vfr', // Variable frame rate (only output selected frames)
        
          '-vcodec', 'mjpeg', // MJPEG codec for image output
          '-q:v', '2' // High quality for MJPEG
        ])
        .on('start', (commandLine) => {
            console.log(`[Job ${jobId}] FFmpeg command: ${commandLine}`);
        })
        .on('end', () => {
          // When FFmpeg finishes, resolve the processing promise
          console.log(`[Job ${jobId}] FFmpeg finished processing. Total frames extracted: ${frameCounter}.`);
          resolve({ tempFramePaths, frameCounter });
        })
        .on('error', (err, stdout, stderr) => {
          // If FFmpeg errors, reject the processing promise
          console.error(`[Job ${jobId}] FFmpeg error:`, err.message);
          console.error(`[Job ${jobId}] FFmpeg stdout:`, stdout);
          console.error(`[Job ${jobId}] FFmpeg stderr:`, stderr);
          reject(new Error(`FFmpeg processing failed: ${err.message}`));
        })
        // Crucially, pipe FFmpeg's output to our custom Writable stream
        .pipe(outputStream, { end: true }); // `end: true` ensures outputStream is closed when FFmpeg finishes
    });
    
    try {
      // 1. Wait for frame extraction and saving to disk to complete
      const { tempFramePaths: frames, frameCounter: frameCount } = await processingPromise;
      
      // 2. Create array of enqueuing promises
      const enqueuePromises = frames.map(async (framePath) => { // Mark callback as async to await queue.add
        try {
          const newJob = await frameAnalysisQueue.add('analyze-frame', {
            framePath, // Path to the saved frame
            chunkIndex,
            jobId,
          }, { 
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 }
          });
          console.log(`[Job ${jobId}] Enqueued analysis job ${newJob.id} for ${framePath}`);
          return newJob.id; // Return the new job ID
        } catch (enqueueErr) {
          console.error(`[Job ${jobId}] ERROR: Failed to enqueue frame analysis job for ${framePath}:`, enqueueErr);
          throw enqueueErr; // Re-throw to cause Promise.all to reject
        }
      });

      // 3. Wait for ALL analysis jobs to be successfully added to the queue
      const enqueuedJobIds = await Promise.all(enqueuePromises);
      console.log(`[Job ${jobId}] All ${enqueuedJobIds.length} frame analysis jobs enqueued.`);
      
      // 4. Schedule cleanup of the chunk's temporary directory
      // Cleanup should ideally be tied to the *completion* of analysis jobs, not just enqueuing.
      // For a simple timed cleanup, ensure it's long enough for analysis.
      // A more robust solution involves a separate cleanup job or mechanism.
      console.log(`[Job ${jobId}] Scheduling cleanup for ${chunkTempDir} in 1 hour.`);
      setTimeout(async () => {
        try {
          // fs.promises.rm is the modern, Promise-based way to remove directories
          await fs.promises.rm(chunkTempDir, { recursive: true, force: true });
          console.log(`[Job ${jobId}] Successfully cleaned up temporary directory: ${chunkTempDir}`);
        } catch (cleanupErr) {
          console.error(`[Job ${jobId}] ERROR: Cleanup failed for ${chunkTempDir}:`, cleanupErr);
        }
      }, 3600000); // 1 hour (3600 * 1000 ms)

      // Resolve the worker job with relevant status
      return { 
        chunkIndex, 
        frameCount, 
        totalAnalysisJobsEnqueued: enqueuedJobIds.length,
        tempDir: chunkTempDir
      };
    } catch (error) {
      console.error(`[Job ${jobId}] Fatal error during processing or enqueuing:`, error);
      // Immediate cleanup on error for the current chunk's temp directory
      try {
        await fs.promises.rm(chunkTempDir, { recursive: true, force: true });
        console.log(`[Job ${jobId}] Cleaned up temporary directory ${chunkTempDir} due to error.`);
      } catch (cleanupErr) {
        console.error(`[Job ${jobId}] ERROR: Cleanup failed during error handling for ${chunkTempDir}:`, cleanupErr);
      }
      throw error; // Re-throw to make BullMQ mark the job as failed
    }
  },
  {
    connection: redisClient.getConnection(),
    concurrency: 4,
    limiter: {
      max: 2, // Max 2 jobs per second for this worker instance
      duration: 1000
    }
  }
);

// --- Graceful Shutdown ---
async function shutdown() {
  console.log('SIGINT/SIGTERM received. Shutting down workers gracefully...');
  await videoWorker.close();
  // If frameAnalysisQueue is used as a producer here, you might also close it.
  // If frameAnalysisQueue is handled by another worker process, closing it here is unnecessary.
  // await frameAnalysisQueue.close();
  console.log('Video Worker stopped.');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// --- Error Handling for Worker Events ---
videoWorker.on('failed', (job, err) => {
  console.error(`[Job ${job.id}] Video processing job failed:`, err.message, err.stack);
  // Log job data for debugging failed jobs
  console.error(`[Job ${job.id}] Job data:`, job.data);
});

videoWorker.on('error', (err) => {
  console.error('Video Worker encountered an unexpected internal error:', err);
});

module.exports = { videoQueue, videoWorker, PROCESSED_FRAMES_TEMP_DIR };