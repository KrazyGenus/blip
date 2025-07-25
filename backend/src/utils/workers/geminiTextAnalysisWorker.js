const { Worker } = require('bullmq');
const { redisClient } = require('../../core/redis/connection');
const { geminiTextAnalysis } = require('../../inference/geminiTextAnalysis');
const { fireStoreClient } = require('../../core/firestore/connection');

async function geminiTextAnalysisStart() {
    console.log('GemeniAudioAnalysis Worker Start.')
    let redisConnectionInstance;
    try {
        redisConnectionInstance = redisClient.getConnection();
    } catch (error) {
        console.log('Error occured during connection to redis', error);
        process.exit(1);
    }

    const worker = new Worker('geminiTextAnalysisQueue', async(job) => {
        console.log('Gemeni Audio Analysis worker received a job');
        console.log('Job received', job.data);
        const {
            jobId,
            userId,
            notifyChannel,
            tempPath,
            audioDir,
            originalName,
            size,
            savePath,
            fullTranscript,
            utterancesArray } = job.data;
        try {
            const geminiTextAnalysisResponse = await geminiTextAnalysis(fullTranscript, utterancesArray);
            if (geminiTextAnalysisResponse) {
                await fireStoreClient.createOrUpdateDocument(
                    userId,
                    jobId,
                    'audioViolations',
                    geminiTextAnalysisResponse);
            }
         

        } catch (error) {
            console.log('Error encountered, when passing transcript et al to gemini', error);
            process.exit(1);
        }
    },  { connection: redisConnectionInstance, concurrency: 1});
}
geminiTextAnalysisStart();