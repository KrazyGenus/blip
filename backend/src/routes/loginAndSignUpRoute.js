const express = require('express');
const loginAndSignUpRouter = express.Router()
const { userRegistration, userLogin} = require('../crud/userAuth');
const { signGenerateToken, signDecodeToken } = require('../core/security');


loginAndSignUpRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const response = await userLogin(email, password);
        console.log('response from db', response);
        if (response.success) {
            const token = await signGenerateToken(response.user.id, response.user.email);
            res.cookie('refreshToken', token.refreshToken,  {
                httpOnly: true,
                secure: true,
                sameSite: "Strict",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days life span
            });
            return res.json({status: 200, message: 'success', userId: token.userId, token: token.accessToken});
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

