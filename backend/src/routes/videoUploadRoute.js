const express = require('express');
const videoUploadRoute = express.Router();
const fs = require('fs').promises; // Use promises for fs operations
const path = require('path');
const Busboy = require('busboy');

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

const processVideo = (fileStream, mimetype, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(fileStream)
            .inputFormat(mimetype.split('/')[1])
            .output(outputPath)
            .on('end', resolve) // Resolve the promise on 'end' event
            .on('error', reject) // Reject the promise on 'error' event
            .run();
    });
};

videoUploadRoute.post('/', async (req, res) => {
    const busboy = Busboy({ headers: req.headers });

    try {
        await new Promise((resolve, reject) => {
            busboy.on('file', async (fieldname, fileStream, filename, encoding, mimetype) => {
                const outputDir = path.join(__dirname, 'frames');
                await fs.mkdir(outputDir, { recursive: true });
                const outputPath = path.join(outputDir, 'frame-%03d.jpg');

                try {
                    await processVideo(fileStream, mimetype, outputPath);
                    res.status(200).send('Frames saved');
                    resolve(); // Resolve the outer promise when processing is successful
                } catch (error) {
                    console.error('FFmpeg processing failed:', error);
                    res.status(500).send('Failed to process video');
                    reject(error); // Reject the outer promise if FFmpeg fails
                }
            });

            busboy.on('error', (err) => {
                console.error('Busboy error:', err);
                res.status(500).send('Busboy error');
                reject(err); // Reject the outer promise if Busboy encounters an error
            });

            req.pipe(busboy); // Pipe the request to Busboy here, after setting up listeners
        });
    } catch (error) {
        // The errors are already handled within the busboy promise
    }
});

module.exports = videoUploadRoute;