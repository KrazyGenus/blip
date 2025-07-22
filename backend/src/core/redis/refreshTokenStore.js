// Assuming this file is src/utils/refresh_token_manager.js
const { redisClient } = require('./connection'); // Correctly imports your custom RedisClient instance
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const { refreshAccessToken } = require('./refreshAcess'); // Assuming this path is correct
const verifyRefreshTokenRoute = express.Router();

/**
 * handles storing, verifying, revoking refresh tokens
 */
    
/**
 *
 * @param {*} currentUserId
 * @param {*} currentUserEmail
 * @returns A generated UUID to be used as the refresh token
 */

async function setRefreshToken(currentUserId, currentUserEmail) {
    try {
        const connection = await redisClient.getConnection(); // Correctly awaits the connection

        const uuidNumber = uuidv4();
        // FIX 1: Correct arguments for hset.
        // ioredis's hset expects key, field1, value1, field2, value2...
        // Or you can use hmset, which is an alias for this multi-field usage.
        await connection.hset(
            `refresh_token:${uuidNumber}`,
            'uuid', uuidNumber,
            'userId', currentUserId,
            'email', currentUserEmail
        );

        await connection.expire(`refresh_token:${uuidNumber}`, 60 * 60 * 24 * 7); // 7 days
        console.log(`Refresh token ${uuidNumber} saved for user: ${currentUserId}`);
        return uuidNumber;
    } catch (error) {
        console.error("❌ Error saving refresh token in Redis:", error);
        throw error; // Re-throw to propagate the error
    }
}


/**
 * @param {*} req
 * @param {*} res
 */
verifyRefreshTokenRoute.post('/', async (req, res) => {
    try {
        const obtainedRefreshToken = req.cookies.refreshToken;
        console.log('Refresh token obtained from cookie:', obtainedRefreshToken);

        // FIX 2: Await the connection here as well.
        const connection = await redisClient.getConnection();

        // FIX 3: Remove the .on("error") listener here.
        // Connection errors are handled by your RedisClient wrapper.
        // If hgetall fails, it will be caught by the try-catch block.
        const userRefreshObject = await connection.hgetall(`refresh_token:${obtainedRefreshToken}`);
        console.log('User refresh object from Redis:', userRefreshObject);

        // Ensure userRefreshObject is not empty and uuid matches
        if (userRefreshObject && userRefreshObject.uuid === obtainedRefreshToken) {
            console.log('Refresh token is valid. Generating new access token.');
            const newAccessToken = await refreshAccessToken(userRefreshObject.userId, userRefreshObject.email);
            console.log('Your new access token generated.');
            return res.status(200).json({ token: newAccessToken });
        } else {
            console.log('Invalid or expired refresh token.');
            return res.status(401).json({ message: 'Invalid or expired refresh token.' });
        }
    } catch (error) {
        console.error('Error during refresh token verification:', error);
        return res.status(500).json({ message: 'Internal server error during token verification.' });
    }
});

module.exports = { verifyRefreshTokenRoute, setRefreshToken };