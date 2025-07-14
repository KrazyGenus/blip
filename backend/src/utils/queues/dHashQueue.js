const { Queue } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');

const dHashQueue  = new Queue('dHashQueue', { connection: redisClient.getConnection() });

module.exports = { dHashQueue }