const express = require('express');
const loginAndSignUpRouter = express.Router()
const { userRegistration, userLogin} = require('../../crud/userAuth');



loginAndSignUpRouter.post("/login", async (req, res) => {
    console.log('A request was made to me!');
    const { email, password } = req.body;
    console.log('in login route', email, password);
    const response = await userLogin(email, password);
    console.log("Response from login", response);
    if (response.success) {
        return res.json({status: 200, message: 'success'});
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

