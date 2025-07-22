const { createClient } = require('@deepgram/sdk');
const fs = require('fs').promises;
const env = require('../../env-loader');
const DEEP_GRAM_KEY = env.DEEP_GRAM_KEY;

/**
 * speechToText
 */
async function speechToTextDeepGram(audioJobPath) {
    console.log('DEEP GRAM KEY', DEEP_GRAM_KEY);
    const deepgramClient = createClient(DEEP_GRAM_KEY);

    // file read
    const audioBuffer = await fs.readFile(audioJobPath);

    // Here the deepgram client is called with the payload(audio), a desturcuring of output is required to get
    //results or error
    const { result, error } = await deepgramClient.listen.prerecorded.transcribeFile(
        // Path to audio file or buffer
        audioBuffer,
        // deepgram config for audio analysis
        {
            model: "nova-3",
            utterances: true,
            punctuate: true,
        }
    );

    if (error) {
        console.log('There was or an error eccoured during transcribing', error);
    }
    else if (result) {
        console.log(JSON.stringify(result));
        return result;
    }
}
module.exports = { speechToTextDeepGram }