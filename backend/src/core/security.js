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


module.exports = {hashPassword, unhashAndCompare};