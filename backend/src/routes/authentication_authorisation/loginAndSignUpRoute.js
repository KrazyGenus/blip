const express = require('express');
const loginAndSignUpRouter = express.Router()




loginAndSignUpRouter.post("/login", async (req, res) => {
    console.log('A request was made to me!');
});


loginAndSignUpRouter.post("/signup", async (req, res) => {
    console.log('A request was made to the signup route');
    return res.status(200).json({message: "Signup success."})
});


module.exports = loginAndSignUpRouter;

