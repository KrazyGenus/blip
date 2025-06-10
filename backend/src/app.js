const express = require('express');
const cors = require('cors');
const videoUploadRoute = require('./routes/videoUploadRoute');
const loginAndSignUpRouter = require('./routes/loginAndSignUpRoute');
const userDashBoardRoute = require('./routes/userDashBoardRoute')
const app = express();

// Configure CORS for Project IDX
app.use(cors());
app.use(express.json());
app.use('/api/upload', videoUploadRoute);
app.use('/api/user', loginAndSignUpRouter);
app.use('/api/user/dashboard', userDashBoardRoute);

module.exports = app;