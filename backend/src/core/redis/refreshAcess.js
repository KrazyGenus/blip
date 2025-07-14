
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');

/**
 * This function runs on when the refreshtoken requires a new access,
 * the previous allocated one expiring 
 * @param {*} userId 
 * @param {*} userEmail 
 * @returns An access token
 */
async function refreshAccessToken(userId, userEmail) {
    try {
        const privateKey = fs.readFileSync("/home/krazygenus/Desktop/blip/backend/private.key", "utf8");
        const accessToken = jwt.sign({ id: userId, email: userEmail }, privateKey, {
            algorithm: "RS256",
            expiresIn: "1h"
        });
        return accessToken;
    } catch (error) {
        console.log('Error when reading in private key', error);
    }
}

module.exports = { refreshAccessToken }