const { Queue, Worker } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');

const inferenceQueue  = new Queue('inferenceQueue', {connection: redisClient.getConnection()});

module.exports = { inferenceQueue }