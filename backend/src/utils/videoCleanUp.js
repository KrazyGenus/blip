const fs = require('fs');


/**
 * 
 * @param {*} path 
 */
async function cleanUpSingleVideo(pathToSingleFile) {
    try {
        fs.rm(pathToSingleFile);
        console.log(`${pathToSingleFile} was removed!`);
    }
    catch(err) {console.error(`Error when removing ${pathToSingleFile}: ${err}`);}
}


/**
 * 
 * @param {*} dirToChunkedVideos 
 */
async function cleanUpChunkedVideos(dirToChunkedVideos) {

}

module.exports = { cleanUpSingleVideo, cleanUpChunkedVideos }