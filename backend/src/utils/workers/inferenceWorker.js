const { Worker } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');


console.log('inferenceQueue worker started!');
const worker = new Worker('inferenceQueue', async(job) => {
    job.data.forEach((item) => {
        console.log('infrence queue:: ', item);
    })
}, { connection: redisClient.getConnection() })