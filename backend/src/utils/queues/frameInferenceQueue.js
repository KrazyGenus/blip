const { Queue } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');

const frameInferenceQueue  = new Queue('frameInferenceQueue', {connection: redisClient.getConnection()});

module.exports = { frameInferenceQueue }