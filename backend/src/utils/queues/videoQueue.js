const { Queue, Worker } = require('bullmq');
const { redisClient } = require('../../core/redis/connection'); // Assuming redisClient.getConnection() returns a Redis connection
const { bufferToStream } = require('../bufferToStream'); // Utility to convert a Buffer to a Readable stream
const ffmpeg = require('fluent-ffmpeg');
const { Writable } = require('stream');
const path = require('path');
const fs = require('fs');
const util = require('util');
const { frameAnalysisQueue } = require('./inferenceQueue');

// Promisify fs.writeFile and fs.unlink for cleaner async/await usage
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);

// --- Configuration and Setup ---
// Define a temporary directory for processed frames.
// It's crucial this directory exists and is accessible.
// In production, this would likely be a cloud storage bucket (e.g., S3, GCS).
const PROCESSED_FRAMES_TEMP_DIR = path.join(__dirname, 'temp_processed_frames');

// Ensure the temporary directory exists.
// Using `recursive: true` will create parent directories if they don't exist.
if (!fs.existsSync(PROCESSED_FRAMES_TEMP_DIR)) {
  console.log(`Creating temporary directory: ${PROCESSED_FRAMES_TEMP_DIR}`);
  fs.mkdirSync(PROCESSED_FRAMES_TEMP_DIR, { recursive: true });
}

// Initialize BullMQ queues.
// 'video-processing-queue' will handle incoming video chunks.
// 'frame-analysis-queue' will handle individual extracted frames.
const videoQueue = new Queue('video-processing-queue', { connection: redisClient.getConnection() });

console.log('BullMQ Queues initialized: video-processing-queue, frame-analysis-queue');

// --- Video Processing Worker Definition ---
// This worker consumes jobs from the 'video-processing-queue'.
// Each job represents a segment (chunk) of a video that needs to be processed by FFmpeg.
const videoWorker = new Worker(
  'video-processing-queue',
  async (job) => {
    const buffer = Buffer.from(job.data.chunk, 'base64'); // Reconstruct buffer from base64 string
    const { chunkIndex } = job.data;
    const jobUniqueId = job.id; // Using BullMQ job.id for unique temporary file naming

    console.log(`[Job ${jobUniqueId}] Started processing video chunk ${chunkIndex}.`);

    // Convert the incoming video chunk buffer into a readable stream for FFmpeg.
    const readableStream = bufferToStream(buffer);

    // This array will store the paths to all frames successfully saved to disk for this chunk.
    const tempFramePaths = [];
    let frameCounter = 0; // To keep track of the number of frames extracted and saved.

    // Return a Promise to ensure the worker function properly handles async operations
    // and resolves/rejects based on the FFmpeg process's outcome.
    return new Promise((resolve, reject) => {
      // --- Custom Writable Stream for FFmpeg Output ---
      // This `outputStream` is where FFmpeg will pipe its extracted frame data.
      // Its `write` method is executed every time FFmpeg outputs a new frame chunk.
      const outputStream = new Writable({
        objectMode: false, // FFmpeg outputs raw binary buffers, not objects.
        write(frameBuffer, encoding, callback) {
          // Construct a unique filename for each extracted frame.
          // Including `jobUniqueId` and `chunkIndex` ensures uniqueness across jobs and chunks.
          const frameFilename = `frame-${jobUniqueId}-${chunkIndex}-${frameCounter}.jpg`;
          const framePath = path.join(PROCESSED_FRAMES_TEMP_DIR, frameFilename);

          // Asynchronously write the received frameBuffer to the temporary file.
          // This is a crucial step for decoupling: we persist the data immediately.
          writeFile(framePath, frameBuffer)
            .then(() => {
              console.log(`[Job ${jobUniqueId}] Successfully saved frame ${frameFilename} to disk.`);
              tempFramePaths.push(framePath); // Add path to our list for later enqueuing.
              frameCounter++; // Increment counter for next frame.
              callback(); // IMPORTANT: Call callback() to signal that this chunk has been processed
                          // and the stream is ready for more data. This is how backpressure is managed.
            })
            .catch(err => {
              console.error(`[Job ${jobUniqueId}] ERROR: Failed to save frame ${frameFilename}:`, err);
              // If saving to disk fails, signal an error to the stream.
              // This will propagate the error up to the FFmpeg process.
              callback(err);
            });
        }
      });

      // --- FFmpeg Command Configuration ---
      ffmpeg(readableStream)
        .inputFormat('image2pipe') // Input is raw image data piped in.
        .outputOptions([
          // Video filter to detect scene changes.
          // `select=gt(scene\\,0.4)`: selects frames where the scene change detection metric is greater than 0.4.
          // A higher threshold (e.g., 0.4-0.6) means only very distinct scene changes are detected.
          // `showinfo`: provides detailed information about each frame, useful for debugging if needed.
          '-vf', 'select=gt(scene\\,0.4),showinfo',
          // `vfr` (Variable Frame Rate): Ensures FFmpeg only outputs frames that actually meet the `select` criteria,
          // avoiding duplicate frames or frames that don't represent a scene change.
          '-vsync', 'vfr',
          // Output format as a pipe of images.
          '-f', 'image2pipe',
          // Output codec for the images (MJPEG is suitable for streaming individual JPEG frames).
          '-vcodec', 'mjpeg',
          // Quality setting for MJPEG. 2 is very high quality, 31 is lowest.
          '-q:v', '2'
        ])
        // --- FFmpeg Event Handlers ---
        .on('start', (commandLine) => {
          console.log(`[Job ${jobUniqueId}] FFmpeg process spawned with command: ${commandLine}`);
        })
        .on('end', async () => {
          // This 'end' event fires when FFmpeg has finished processing the *entire* video chunk
          // and has flushed all its output to `outputStream`.
          console.log(`[Job ${jobUniqueId}] FFmpeg finished processing chunk ${chunkIndex}. Total frames extracted and saved: ${frameCounter}.`);

          // --- Stage 2: Enqueuing Frame Analysis Jobs ---
          // Now that all frames are safely persisted to disk (or S3),
          // we can proceed to enqueue jobs for their analysis.
          const enqueuePromises = tempFramePaths.map(async (framePath) => {
            try {
              // Add a new job to the 'frame-analysis-queue' for each saved frame.
              // The job data contains the path to the frame, allowing the frame analysis worker
              // to load and process it.
              const newJob = await frameAnalysisQueue.add('analyze-single-frame', {
                framePath: framePath,
                originalChunkIndex: chunkIndex,
              }, {
                attempts: 3,
              });
              console.log(`[Job ${jobUniqueId}] Successfully enqueued frame analysis job ${newJob.id} for frame: ${framePath}`);
              //return newJob.id; // Return the new job ID for tracking.
            } catch (enqueueErr) {
              console.error(`[Job ${jobUniqueId}] ERROR: Failed to enqueue frame analysis job for ${framePath}:`, enqueueErr);
              // If enqueuing a job fails, we re-throw the error.
              // This will cause the `Promise.all` below to reject,
              // and subsequently, the `videoWorker` job itself will fail and be retried by BullMQ.
              throw enqueueErr;
            }
          });

          try {
            // Wait for ALL the promises from `frameAnalysisQueue.add()` to resolve.
            // This ensures that all downstream analysis jobs for this chunk have been
            // successfully added to their respective queue before this `videoWorker` job completes.
            await Promise.all(enqueuePromises);
            console.log(`[Job ${jobUniqueId}] All ${enqueuePromises.length} frame analysis jobs successfully enqueued for chunk ${chunkIndex}.`);

            // Resolve the main video worker job's promise, indicating success.
            resolve({
              chunkIndex,
              totalFramesExtracted: frameCounter,
              totalFrameAnalysisJobsEnqueued: enqueuePromises.length
            });

          } catch (aggErr) {
            // Catch any errors that occurred during the Promise.all (e.g., failed `queue.add`).
            console.error(`[Job ${jobUniqueId}] ERROR: During frame job enqueuing for chunk ${chunkIndex}:`, aggErr);
            reject(new Error(`Failed to enqueue all frame analysis jobs for chunk ${chunkIndex}: ${aggErr.message}`));
          }
        })
        .on('error', (err) => {
          // Handle FFmpeg errors. This catches issues with the FFmpeg command itself,
          // or problems during piping to the outputStream.
          console.error(`[Job ${jobUniqueId}] FFmpeg error processing chunk ${chunkIndex}:`, err.message);
          // Reject the main video worker job's promise, marking it as failed.
          reject(new Error(`FFmpeg processing failed for chunk ${chunkIndex}: ${err.message}`));
        })
        // Pipe the readableStream (video chunk) into FFmpeg's stdin,
        // and pipe FFmpeg's stdout (extracted frames) into our custom outputStream.
        // `end: true` ensures the destination stream (outputStream) is ended when the source stream (FFmpeg's stdout) ends.
        .pipe(outputStream, { end: true });
    });
  },
  {
    connection: redisClient.getConnection(),
    concurrency: 4 // Process up to 4 video chunks concurrently per worker instance.
  }
);

// --- Error Handling and Graceful Shutdown ---
videoWorker.on('failed', (job, err) => {
  console.error(`[Job ${job.id}] Video processing job failed with error:`, err.message, err.stack);
});

videoWorker.on('error', (err) => {
  console.error('Video Worker encountered an unexpected error:', err);
});

// Implement graceful shutdown for the worker.
// In a real application, you'd listen for process signals (SIGINT, SIGTERM).
process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down workers gracefully...');
  await videoWorker.close();
  await frameAnalysisQueue.close(); // Also close the queue producer
  // await frameAnalysisWorker.close(); // If you have a separate frame analysis worker in the same process
  console.log('Workers and Queues closed.');
  process.exit(0);
});

// This worker logic would typically be in a separate file or a dedicated worker process.
// The main application would only enqueue jobs to `videoQueue`.
module.exports = {
  videoQueue,
  frameAnalysisQueue,
  videoWorker,
  PROCESSED_FRAMES_TEMP_DIR
};