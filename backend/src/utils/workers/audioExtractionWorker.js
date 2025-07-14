const { Worker } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');
const ffmpeg = require('fluent-ffmpeg');
console.log('Audio Worker started!');
const worker = new Worker('audioMetaQueue', async(job) => {
    console.log('Audio Worker processing a job!');
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
                console.log('Audio extraction complete.')
                resolve(`${job.data.audioDir}/${audioName}.wav`);
            })
            .on('error', (err) => {
                console.error('Error extracting audio', err);
            })
            .save(`${job.data.audioDir}/${audioName}.wav`);
        });
        extractAudio.then((audioDirPath) => {
            console.log('saved to', audioDirPath);
        });
}, { connection: redisClient.getConnection(), concurrency: 1 });