const { Worker } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');
const ffmpeg = require('fluent-ffmpeg');
const { audioInferenceQueue } = require('../queues/audioInferenceQueue');



async function audioExtractionStart() {
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

    console.log('🎶 Audio Extraction Worker started!');
    const worker = new Worker('audioMetaQueue', async(job) => {
    console.log('Audio Worker processing a job!');
    const { jobId, userId, notifyChannel, tempPath, audioDir, originalName, size } = job.data;
    const audioName = `audio_${job.data.userId}_${job.data.originalName.split('.')[0]}`
    const extractAudio =  new Promise((resolve, reject) => {
        ffmpeg(job.data.tempPath)
            .noVideo()
            .audioChannels(1)
            .audioFilters('loudnorm')
            .audioFrequency(16000)
            .audioCodec('pcm_s16le')
            .format('wav')
            .on('end', () => {
                audioInferenceQueue.add('audio-extraction',
                    {
                        jobId,
                        userId,
                        notifyChannel,
                        tempPath,
                        audioDir,
                        originalName,
                        size,
                        savePath: `${job.data.audioDir}/${audioName}.wav`
                    });
                resolve(job);
            })
            .on('error', (err) => {
                console.error('Error extracting audio', err);
            })
            .save(`${job.data.audioDir}/${audioName}.wav`);
        });
        extractAudio.then((job) => {
            console.log('new job data', job);
        });
}, { connection: redisClient.getConnection(), concurrency: 1 });

    // --- Worker Event Listeners (for robust logging and debugging) ---
    // worker.on('')
}

audioExtractionStart();