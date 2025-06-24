const { Queue } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');

const uploadMetaDataQueue = new Queue('uploadMetaDataQueue', {
  connection: redisClient.getConnection()
});

module.exports = { uploadMetaDataQueue };
