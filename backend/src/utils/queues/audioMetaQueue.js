const { Queue } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');

const audioMetaQueue = new Queue('audioMetaQueue', {
  connection: redisClient.getConnection()
});

module.exports = { audioMetaQueue };
