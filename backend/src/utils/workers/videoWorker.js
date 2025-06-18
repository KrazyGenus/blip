const { Worker } = require('bullmq');


const videoWorker = new Worker('busboy-stream', async (job) => {
    const buffer = Buffer.from(job.data.chunk, 'base64');
    console.log('job internal', job);
    console.log('Processing chunk:', buffer);
  }, {
    connection: redisClient.getConnection(),
    concurrency: 4
  });