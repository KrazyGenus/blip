const { extractMetaData } = require('../utils/getVideoMeta');
const ffmpeg = require('fluent-ffmpeg');
const { videoQueue } = require('../utils/batchProcessor');
const { cleanUpSingleVideo } = require('../utils/videoCleanUp');


async function videoProcessing(pathToVideo) {
    console.log('File was uploaded to: ', pathToVideo);
}




/**
 * 
 * @param {*} filePath 
 * @param {*} userId 
 */
const splitVideoIntoChunks = async (filePath, userId) => {
    const metadata =  await extractMetaData(filePath);
    const duration = metadata.format.duration;
    //const videoName = metadata.format.tags.title.replaceAll(' ', '_');
    const chunkSize = 600; // 10 mins
    const numChunks  = Math.ceil(duration / chunkSize);


    for (let i = 0; i < numChunks; i++) {
        const start = i * chunkSize;
        const chunkPath = `/uploads/${userId}/chunks/chunk-${i}.mp4`;

        await new Promise((resolve, reject) => {
            ffmpeg(filePath)
                .setStartTime(start)
                .setDuration(chunkSize)
                .output(chunkPath)
                .on('end', resolve)
                .on('error', reject)
                .run();
        });
        // Add chunk to BullMQ
        await videoQueue.add('processChunk', {
            userId,
            chunkIndex: i,
            chunkPath
        });
    }
    await cleanUpSingleVideo(filePath);
};


module.exports = { videoProcessing, splitVideoIntoChunks }