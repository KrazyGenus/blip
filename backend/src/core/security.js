/**
 * This module or script serves the purpose of hasing the user password and unhashing the user password
 * during registration and during login sessions.
 * The plainPassword --> represents the plain string password
 * The hashedPassword represents the already hashed password
 * Both of args or param will be required for hashing and unhashing.
 * @param {plainPassword, hashedPassword}
 * @returns a hashed password and a boolean dring the matchcheck, depening on the user operation.
 */


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { setRefreshToken, verifyRefreshToken } = require('./redis/refreshTokenStore');

/**
 * 
 * @param {*} plainPassword 
 * @returns A hashed password
 */
async function hashPassword(plainPassword) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(plainPassword, saltRounds);
    return hash;
}

/**
 * 
 * @param {*} plainPassword
 * @param {*} hashedPassword 
 * @returns boolean true if password match || flase if not
 */
async function unhashAndCompare(plainPassword, hashedPassword) {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
}




/**
 * 
 * @param {*} userId 
 * @param {*} userEmail 
 * @returns 
 */
async function signGenerateToken(userId, userEmail) {
    const privateKey = fs.readFileSync("/home/krazygenus/Desktop/blip/backend/private.key", "utf8");
    const accessToken = jwt.sign({ id: userId, email: userEmail }, privateKey, {
        algorithm: "RS256",
        expiresIn: "1h"
    });
    const refreshToken = await setRefreshToken(userId, userEmail);
    
    return {
        userId,
        status: 200,
        message: 'Login successful',
        accessToken,
        refreshToken
    }
}



/**
 * 
 * @param {*} token 
 * @returns 
 */
async function signDecodeToken(token) {
    try {
        if(token.startsWith('Bearer')) {
            let newToken = token.split(' ')[1];
            const publicKey = fs.readFileSync("/home/krazygenus/Desktop/blip/backend/public.key", "utf8");
            const decode = jwt.verify(newToken, publicKey, {
                algorithms: ["RS256"]
            });
            return { status: 200, decode };
        }
        else {
            const publicKey = fs.readFileSync("/home/krazygenus/Desktop/blip/backend/public.key", "utf8");
            const decode = jwt.verify(token, publicKey, {
                algorithms: ["RS256"]
            });
            return decode;
        }
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return {status: 401, message: 'Token expired, redirect to refresh route'}
        }
    }
}



module.exports = { hashPassword, unhashAndCompare, signGenerateToken, signDecodeToken, };