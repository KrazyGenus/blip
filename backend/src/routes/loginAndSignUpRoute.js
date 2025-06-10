const express = require('express');
const loginAndSignUpRouter = express.Router()
const { userRegistration, userLogin} = require('../crud/userAuth');
const { signGenerateToken, signDecodeToken } = require('../core/security');


loginAndSignUpRouter.post("/login", async (req, res) => {
    console.log('A request was made to me!');
    const { email, password } = req.body;
    console.log('in login route', email, password);
    try {
        const response = await userLogin(email, password);
        console.log("Response from login", response);
        if (response.success) {
            const token = await signGenerateToken(response.user.id, response.user.email);
            console.log('Generated token backend:',  token);
            return res.json({status: 200, message: 'success', token});
        }
    } catch (error) {
        return res.json({status: 401, message:error});
    }
});


loginAndSignUpRouter.post("/signup", async (req, res) => {
    console.log('A request was made to the signup route');
    const { username, email, password } = req.body;
    const response = await userRegistration(username, email, password);
    console.log("Response from registration: ", response);
    return res.json({status: 200, message: 'success'});
});


module.exports = loginAndSignUpRouter;

