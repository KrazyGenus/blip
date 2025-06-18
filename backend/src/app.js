const express = require('express');
const cors = require('cors');
const videoUploadRoute = require('./routes/videoUploadRoute');
const loginAndSignUpRouter = require('./routes/loginAndSignUpRoute');
const userDashBoardRoute = require('./routes/userDashBoardRoute')
const { signDecodeToken } = require('./core/security')
const app = express();

// MiddleWare
// Auth middleware
async function auth(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Missing token'} );
    }
    console.log("In middle headd", token);
    try {
        const user = await signDecodeToken(token);
        if (user === false){return res.status(401).json({error: 'Invalid token or expired token'});}
        console.log("From middleware", user);
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({error: 'Invalid token or expired token'});
    }

}


app.use(cors());
app.use(express.json());
app.use('/api/user/upload', auth, videoUploadRoute);
app.use('/api/user', loginAndSignUpRouter);
app.use('/api/user/dashboard', auth, userDashBoardRoute);

module.exports = app;