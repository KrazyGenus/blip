const { Worker } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');
const { speechToTextDeepGram } = require('../../inference/speechToTextDeepGram');
const { geminiTextAnalysisQueue } = require('../queues/geminiTextAnalysisQueue');
const fs = require('fs').promises;
/**
 * Serves as the purpose of interacting with the function
 * that transcripts the extracted audio from the video.
 */
async function startAudioInferenceWorker() {
    console.log('🎶 📃 Audio Inference Worker started')
    let redisConnectionInstance;
    try {
        // Await the actual Redis connection instance to be ready
        redisConnectionInstance = await redisClient.getConnection();
        console.log('Redis client connection is established and ready for BullMQ Worker.');
    } catch (error) {
        console.error('Failed to get Redis connection for BullMQ Worker. Exiting:', error);
        // It's critical to exit if the worker can't connect to Redis
        process.exit(1);
    }

    const worker = new Worker('audioInferenceQueue', async (job) => {
        try {
            console.log('path to saved audio', job.data);
            const { jobId, userId,notifyChannel, tempPath, audioDir, originalName, size, savePath } = job.data;
            const response = await speechToTextDeepGram(savePath);
            const fullTranscript = JSON.stringify(response.results.channels[0].alternatives[0].transcript);
            const utterancesArray = response.results?.utterances;
            console.log('Full Transcript:', fullTranscript);
            console.log('Utterances:', JSON.stringify(utterancesArray));
            await geminiTextAnalysisQueue.add('dgram-response',
                {
                    jobId,
                    userId,
                    notifyChannel,
                    tempPath,
                    audioDir,
                    originalName,
                    size,
                    savePath,
                    fullTranscript,
                    utterancesArray
                }
            );
        } catch (error) {
            console.log('An error occured during audio transcription using DeepGram', error);
        }
    }, { connection: redisConnectionInstance, concurrency: 1 });
}

startAudioInferenceWorker();