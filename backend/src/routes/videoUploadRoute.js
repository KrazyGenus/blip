const express = require('express');
const os = require('os');
const videoUploadRoute = express.Router();
const { upload } = require('../core/storage');
const { videoProcessing } = require('../core/videoProcessingPipeline');
const { extractMetaData } = require('../utils/getVideoMeta');
const busboy = require('busboy');
const { videoQueue } = require('../utils/queues/videoQueue');

// videoUploadRoute.post('/', upload.single('video'), async (req, res) => {
//     if(!req.file){return res.status(400).json({error: 'No file uploaded.'})}
//     res.status(200).json({success: true, message: 'Upload was successful'});
//     const response = await extractMetaData(req.file.path);
//     console.log('I am in videoupload route and i have: ', req.user);
// });

let tempBuffer = Buffer.alloc(0);
let chunkIndex = 0;
const CHUNK_LIMIT = 10 * 1024 * 1024; // 10MB
//const CHUNK_LIMIT = 5 * 1024 * 1024;  // 5MB

videoUploadRoute.post('/', async(req, res) => {
    const bb = busboy({ headers: req.headers });
    bb.on('file', (name, file, info) => {
      file.on('data', async (chunk) => {
        console.log(`File [${name}] got ${chunk.length} bytes`);
        tempBuffer = Buffer.concat([tempBuffer, chunk]);
        
        if (tempBuffer.length >= CHUNK_LIMIT) {
            const chunkToProcess = tempBuffer;
            tempBuffer = Buffer.alloc(0);
            try {
              await videoQueue.add('processChunk', 
                {
                  chunk: chunkToProcess.toString('base64'),
                  chunkIndex: chunkIndex++
            });
            } catch (error) {
              console.log('Error during queue', error);
            }
        }

      file.on('end', async () =>{
        console.log(`File [${name}] finished stream. Remaining buffer length: ${tempBuffer.length} bytes.`);
        if (tempBuffer.length > 0) {
            // Process any remaining data as the last chunk
            try {
                await videoQueue.add('processChunk', {
                    chunk: tempBuffer.toString('base64'),
                    chunkIndex: chunkIndex++
                }, {
                    jobId: `${name}-chunk-final-${chunkIndex - 1}`
                });
                console.log(`Successfully enqueued FINAL chunk ${chunkIndex - 1} of file [${name}] with ${tempBuffer.length} bytes.`);
            } catch (error) {
                console.error(`ERROR: Failed to enqueue FINAL chunk for file [${name}]:`, error);
            }
            tempBuffer = Buffer.alloc(0); // Clear the buffer after processing
        }
        console.log(`Finished processing file [${name}].`);
      });
      
      file.on('error', (err) => {
        console.error(`File [${name}] stream error:`, err);
        // Handle stream errors (e.g., client disconnected prematurely)
    });

    }).on('close', () => {
        console.log(`File [${name}] done`);
      });
    });



    bb.on('close', async () => {
      console.log('Done parsing form!');
      if (tempBuffer.length > 0) {
        await videoQueue.add('processChunk', {
          chunk:tempBuffer.toString('base64'),
          chunkIndex: chunkIndex++
        });
      }
      res.writeHead(303, { Connection: 'close', Location: '/' });
      res.end();
    });
    req.pipe(bb);
})
module.exports = videoUploadRoute;