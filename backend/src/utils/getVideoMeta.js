const ffmpeg = require('fluent-ffmpeg');


async function extractMetaData(filePath) {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
        try {
            console.log(metadata);
            return metadata;
        }
        catch(err) {
            console.log('During meta extraction', err)
        }
    });
}

module.exports = { extractMetaData };