const express = require('express');
const cors = require('cors');
const videoUploadRoute = require('./routes/videoUploadRoute');
const loginAndSignUpRouter = require('./routes/authentication_authorisation/loginAndSignUpRoute');
const app = express();

// Configure CORS for Project IDX
app.use(cors());
app.use(express.json());
app.use('/api/upload', videoUploadRoute);
app.use('/api/user', loginAndSignUpRouter);

module.exports = app;