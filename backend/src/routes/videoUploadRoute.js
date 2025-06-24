const express = require('express');
const path = require('path');
const fs = require('fs');
const busboy = require('busboy');
const { v4: uuidv4 } = require('uuid');
const { uploadMetaDataQueue } = require('../utils/queues/uploadMetaDataQueue');

const videoUploadRoute = express.Router();
const TEMP_DIR = '/home/krazygenus/Desktop/blip/backend/src/temp';
const FRAME_BASE_DIR = '/home/krazygenus/Desktop/blip/backend/src/frames';

videoUploadRoute.post('/', (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const bb = busboy({ headers: req.headers });
  const uploadPromises = [];
  const userId = req.user.id;

  bb.on('file', (fieldname, file, fileInfo) => {
    const jobId = uuidv4();
    const safeName = fileInfo.filename.replace(/\s+/g, '_');
    const tempPath = path.join(TEMP_DIR, `${jobId}_${safeName}`);
    const frameDir = path.join(FRAME_BASE_DIR, `user_${userId}`, jobId);

    fs.mkdirSync(path.dirname(tempPath), { recursive: true });
    fs.mkdirSync(frameDir, { recursive: true });

    const writeStream = fs.createWriteStream(tempPath);

    const filePromise = new Promise((resolve) => {
      let size = 0;
      file.on('data', chunk => size += chunk.length);
      file.pipe(writeStream)
        .on('finish', () => {
          uploadMetaDataQueue.add('process_video', {
            jobId,
            userId,
            tempPath,
            frameDir,
            originalName: safeName,
            size
          });
          resolve(jobId);
        });
    });

    uploadPromises.push(filePromise);
  });

  bb.on('finish', async () => {
    const jobIds = await Promise.all(uploadPromises);
    res.status(202).json({ message: `${jobIds.length} video(s) queued`, jobIds });
  });

  req.pipe(bb);
});

module.exports = { videoUploadRoute };
