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

async function signGenerateToken(userId, userEmail) {
    const privateKey = fs.readFileSync("/home/krazygenus/Desktop/blip/backend/private.key", "utf8");
    const token = jwt.sign({ id: userId, email: userEmail }, privateKey, {
        algorithm: "RS256",
        expiresIn: "1h"
    });
    return token;
}

async function signDecodeToken(token) {
    try {
        const publicKey = fs.readFileSync("/home/krazygenus/Desktop/blip/backend/public.key", "utf8");
        const decode = jwt.verify(token, publicKey, {
            algorithms: ["RS256"]
        });
        return {status: 200, decode };
    } catch (error) {
        console.error("JWT Decode Error:", error);
        return { status: false, error };
    }
}

module.exports = {hashPassword, unhashAndCompare, signGenerateToken, signDecodeToken};