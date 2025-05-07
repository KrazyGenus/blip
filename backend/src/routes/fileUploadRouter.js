const express = require('express');
const router = express.Router();
const upload = require('../controllers/fileUploadController');

router.post('/upload', (req, res, next) => {
    console.log('Received file upload request');
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message }); // Handle errors from Multer (including fileFilter)
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        console.log('Uploaded file:', req.file);
        res.status(200).json({ message: 'Upload successful!', filename: req.file.filename });
    });
});

module.exports = router;