const { Queue } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');

const videoMetaQueue = new Queue('videoMetaQueue', {
  connection: redisClient.getConnection()
});

module.exports = { videoMetaQueue };
