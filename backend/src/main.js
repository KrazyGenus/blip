const express = require('express');
const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const cors = require('cors');


ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const PORT = process.env.PORT || 3000; // Use port 3000 for Project IDX

// Configure CORS for Project IDX
app.use(cors());
app.use(express.json());



app.post('/api/upload', (req, res) => {
  const busboy = Busboy({ headers: req.headers });

  busboy.on('file', (fieldname, fileStream, filename, encoding, mimetype) => {
    console.log(`Received file [${fieldname}]: ${filename}`);

    // Ensure output directory exists
    const outputDir = path.join(__dirname, 'frames');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    // Process with ffmpeg
    ffmpeg(fileStream)
      .inputFormat('mp4') // adjust if different format
      .outputOptions('-vf', 'fps=1') // 1 frame per second
      .output(path.join(outputDir, 'frame-%03d.jpg'))
      .on('end', () => {
        console.log('Finished saving frames');
        res.status(200).send('Frames saved');
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        res.status(500).send('Failed to process video');
      })
      .run();
  });

  req.pipe(busboy);
});

// Make sure server binds to 0.0.0.0 for IDX
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Video upload endpoint available at: http://localhost:${PORT}/api/upload`);
    console.log(`Uploaded videos will be available at: http://localhost:${PORT}/uploads/[filename]`);
  });