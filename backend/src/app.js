const express = require('express');
const cors = require('cors');
const { videoUploadRoute } = require('./routes/videoUploadRoute');
const loginAndSignUpRouter = require('./routes/loginAndSignUpRoute');
const userDashBoardRoute = require('./routes/userDashBoardRoute');
const { signDecodeToken } = require('./core/security');
const cookieParser = require('cookie-parser');

const app = express();
const { verifyRefreshTokenRoute } = require('./core/redis/refreshTokenStore');


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function auth(req, res, next) {
    const token = req.headers.authorization;
    console.log('in middle ware token', token);
    if (!token) {
        return res.status(401).json({ error: 'Missing token'} );
    }
    try {
        const user = await signDecodeToken(token);
        console.log('in middle ware after decoding', user);
        if (user.status === 401){return res.status(401).json({error: 'Invalid token or expired token'});}
        console.log("From middleware", user);
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
    }

}


app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api/user/upload', auth, videoUploadRoute);
app.use('/api/user/auth', loginAndSignUpRouter);
app.use('/api/user/auth/refresh', verifyRefreshTokenRoute);
app.use('/api/user/dashboard', auth, userDashBoardRoute);

module.exports = app;