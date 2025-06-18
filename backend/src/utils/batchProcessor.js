const { Queue, Worker } = require('bullmq');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const { PassThrough } = require('stream');


// Create queues
const videoQueue = new Queue('video');
const frameQueue = new Queue('frame');

// Frame extraction function
const extractFrames = (videoPath, onFrame) => {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(videoPath)
      .outputOptions([
        '-vf', 'select=gt(scene\\,0.4)', // Scene change detection
        '-vsync', 'vfr',
        '-f', 'image2pipe',
        '-vcodec', 'mjpeg'
      ])
      .format('image2pipe');

    const frameStream = new PassThrough();
    let buffer = Buffer.alloc(0);

    frameStream.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      let endIndex;

      while ((endIndex = buffer.indexOf(Buffer.from([0xFF, 0xD9]))) !== -1) {
        const frame = buffer.subarray(0, endIndex + 2);
        buffer = buffer.subarray(endIndex + 2);
        try {
          onFrame(frame); // Pass frame to callback
        } catch (err) {
          console.error('Error in onFrame handler:', err);
        }
      }
    });

    frameStream.on('end', () => resolve());
    frameStream.on('error', reject);
    command.on('error', reject);

    command.pipe(frameStream);
  });
};

// // Video processing worker
// const worker = new Worker('video', async (job) => {
//   const { userId, chunkIndex, chunkPath } = job.data;
//   const frameJobs = [];

//   const onFrame = (frameBuffer) => {
//     frameJobs.push(
//       frameQueue.add('process-frame', {
//         userId,
//         chunkIndex,
//         frameBuffer: frameBuffer.toString('base64') // Send to secondary queue
//       })
//     );
//   };

//   try {
//     await extractFrames(chunkPath, onFrame);
//     await Promise.all(frameJobs);
//   } catch (err) {
//     console.error(`Failed to process video chunk ${chunkPath}:`, err);
//     throw err;
//   }
// }, {
//   concurrency: 4
// });

module.exports = { videoQueue, frameQueue };
