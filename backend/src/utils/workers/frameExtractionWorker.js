const { Worker } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { dHashQueue } = require('../queues/dHashQueue');

console.log('👷 Worker starting...');

const worker = new Worker('videoMetaQueue', async (job) => {
  if (job.name !== 'process_video') {
    console.warn('Skipping unknown job:', job.name);
    return;
  }

  const { tempPath, frameDir, jobId, userId } = job.data;

  if (!fs.existsSync(tempPath)) {
    throw new Error(`File not found: ${tempPath}`);
  }

  return new Promise((resolve, reject) => {
    const timeStamps = [];
    ffmpeg(tempPath)
      .outputOptions([
        '-vf', "select='gt(scene,0.04)',showinfo",
        '-vsync', 'vfr',
        '-q:v', '2'
      ])
      .output(`${frameDir}/scene-%03d.jpeg`)
      .on('stderr', (line) => {
        const match = line.match(/pts_time:([\d.]+)/);
        if(match) {
          timeStamps.push(parseFloat(match[1]));
        }
      })
      .on('end', () => {
        console.log(`✅ Job ${userId}:${jobId} completed.`);
        const metadata = timeStamps.map((start, i) => ({
          jobId,
          userId,
          index: i + 1,
          start,
          end: timeStamps[i + 1] || null,
          framePath: path.join(frameDir, `scene-${String(i + 1).padStart(3, '0')}.jpeg`)
        }))
        dHashQueue.add('frame-meta', metadata);
        fs.unlinkSync(tempPath);
        return resolve();
      })
      .on('error', (err) => {
        console.error(`❌ FFmpeg failed for job ${jobId}:`, err.message);
        reject(err);
      })
      .run();
  });

}, {
  connection: redisClient.getConnection()
});
