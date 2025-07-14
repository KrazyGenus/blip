const { redisClient } = require('./connection');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const { refreshAccessToken } = require('./refreshAcess');
const verifyRefreshTokenRoute = express.Router();

/**
 * handles storing, verifying, revoking refresh tokens
 */



/**
 * 
 * @param {*} currentUserId 
 * @param {*} currentUserEmail 
 * @returns A genenrated UUID to be used as the refresh token
 */

async function setRefreshToken(currentUserId, currentUserEmail) {
    try {
        const redisConnection = redisClient.getConnection();

        const uuidNumber = uuidv4();
        await redisConnection.hset(`refresh_token:${uuidNumber}`, {
            uuid: uuidNumber,
            userId: currentUserId,
            email: currentUserEmail,
        });
    
        await redisConnection.expire(`refresh_token:${uuidNumber}`, 60 * 60 * 24 * 7); // 7 days
        return uuidNumber;
    } catch (error) {
        console.error("❌ Error saving refresh token in Redis:", error);
    }
  }
  

/**
 * @param {*} req
 * @param {*} res
 */
verifyRefreshTokenRoute.post('/', async (req, res) => {
    try {
        const obtainedRefreshToken = req.cookies.refreshToken;
        console.log('Refresh token after expire', obtainedRefreshToken);
        const redisConnection = redisClient.getConnection();
        redisConnection.on("error", (err) => console.log("Redis Error", err));
        const userRefreshObject = await redisConnection.hgetall(`refresh_token:${obtainedRefreshToken}`);
        console.log('user object', userRefreshObject);
        if (userRefreshObject.uuid === obtainedRefreshToken) {
            console.log('PERFECT!');
            const newAccessToken = await refreshAccessToken(userRefreshObject.userId, userRefreshObject.email);
            console.log('Your new access token: ',newAccessToken);
            return res.status(200).json({token: newAccessToken});
        }
    } catch (error) {
        console.log('Error during fetch of user saved ', error);
    }
});

module.exports = { verifyRefreshTokenRoute, setRefreshToken };