const { Queue } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');



const geminiTextAnalysisQueue = new Queue('geminiTextAnalysisQueue', { connection: redisClient.getConnection() });

module.exports = { geminiTextAnalysisQueue };