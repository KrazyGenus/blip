const { databaseManager } = require('../core/database');
const { hashPassword, unhashAndCompare } = require('../core/security');

/**
 * This fuction and the proceeding ones are intented for when the user signups for an account
 * the end of it's boundry is marked by a END statment in comment form
 */


/**
 * @isExistingEmail
 * It's main purpose is to find out if an email already exist during login and during registration.
 * @param {*} email 
 * @returns boolean | err object.
 */
async function isExistingEmail(email){
    if (email === undefined){return false;}
    const query = `SELECT email FROM user_account.users WHERE email=$1 LIMIT 1;`;
    try {
        const dbStatus = await databaseManager.isAlive();
        if (dbStatus === true) {
            const pool = databaseManager.getPool();
            const result = await pool.query(query, [email]);
            return result.rowCount > 0;
        }
        else {
            await databaseManager.reconnect();
            const pool = databaseManager.getPool();
            const result = await pool.query(query, [email]);
            return result.rowCount > 0;
        }
    } catch(err){
        console.log('Generated error from the isExstingEmail', err);
        throw err;
    }
}

/**
 * START ==> userRegistration
 */

/**
 * @userRegistration
 * @param {username, email, password}
 * @returns a success message or an error message depending on the state of their registration.
 * */
async function userRegistration(username, email, password) {
    try {
        // Input validation
        if (!username || !email || !password) {
            return {success: false, message: 'All fileds are required.'};
        }

        // check if the email exists
        const emailStatus = await isExistingEmail(email);
        if (emailStatus){
            return {success:false, message: 'Email already registered.'};
        }
        // this indicates a user with that email does not exist in the database.
        const pool = databaseManager.getPool();
        const password_hash = await hashPassword(password);
        console.log('hashed_password', password_hash);
        const query = `
            INSERT INTO user_account.users (username, email, password_hash)
            VALUES ($1, $2, $3)
            RETURNING *;
            `;
        const result = await pool.query(query, [username, email, password_hash]);
        console.log('during registration:', result);
        return {
            success: true,
            data: result.rows[0],
            message: 'User registered successfully'
        };

    } catch (error) {
        console.log('Registration error', error);
        return {
            success: false, 
            message: 'User registration failed',
            error: error.message
        }
    }
}

/** END ==> userRegistation */





/**
 * START ==> userLogin
 */
/**
 * @userLogin
 * @param {email, password}
 * @returns a success message and a redirect to the dashboard or an error message depending on the state of their login.
 */
async function userLogin(loginEmail, password) {
    // check fields
    if(!loginEmail || !password) {
        return {success: false, message: 'All fields are required'};
    }
    const emailStatus = await isExistingEmail(loginEmail);
    if (!emailStatus) {
        return {success: false, message: 'email or password wrong, try again.'};
    }

    if (emailStatus) {
        try {
            // Get user from database
            const pool = databaseManager.getPool();
            const query = `
                SELECT *  FROM user_account.users WHERE email=$1;
        `;
            const result = await pool.query(query, [loginEmail]);

            const user = result.rows[0];
            console.log('During db retrival object', user);
            //verify password
            const isPasswordValid = await unhashAndCompare(password, user.password_hash);
            if (!isPasswordValid){
                return {success: false, message: 'Invalid password'};
            }

            // Successful login
            return {
                success: true,
                user: {
                    id: user.user_id,
                    username: user.username,
                    email: user.email
                },
                message: 'Login successful'
        }
    }
    catch (error) {
        
        console.log(error);
        //[re[are a json if you feel like it]]        
    }
}
}

/**
 * END ==> userLogin
 */


module.exports = {isExistingEmail, userRegistration, userLogin};