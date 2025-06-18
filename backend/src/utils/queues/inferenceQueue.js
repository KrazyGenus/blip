const { Queue, Worker } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');

const frameAnalysisQueue  = new Queue('frame-analysis-queue', {connection: redisClient.getConnection()});

module.exports = { frameAnalysisQueue }