const express = require('express');
const { videoUpload } = require('../crud/videoUpload');
const videoUploadRoute = express.Router();


videoUploadRoute.post('/', async (req, res) => {
  console.log('User upload route', req.user);
  const uploadResponse = await videoUpload(req, res);
  console.log('video upload object', uploadResponse);
  if (uploadResponse.status === 202 ){
    res.status(202).json({message: uploadResponse.message, jobs: uploadResponse.jobIds});
  }
  else {
    console.log('Upload error', uploadResponse);
  }
});

module.exports = { videoUploadRoute };
