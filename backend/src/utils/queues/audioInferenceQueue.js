const { Queue } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');

const audioInferenceQueue  = new Queue('audioInferenceQueue', { connection: redisClient.getConnection() });

module.exports = { audioInferenceQueue }