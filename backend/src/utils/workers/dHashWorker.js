const { Worker } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');
const { processFrame } = require('../hash_frames');

console.log('dHashQueue worker started!');
const worker = new Worker('dHashQueue', async(job) => {
    job.data.forEach(async (item) => {
        console.log('frame path', item.framePath);
        await processFrame(item.framePath, item);
    })
}, { connection: redisClient.getConnection(), concurrency: 1 })