const express = require('express');
const userDashBoardRoute = express.Router();
const { signDecodeToken } = require('../core/security');
const { decode } = require('jsonwebtoken');


userDashBoardRoute.get("/", async (req, res) => {
    console.log('Request was made to here dashboard, was it ye?!')
    // const authHeader = req.headers.authorization;
    // if (!authHeader) {return res.json({status: 401, message: "Path not approved."});}
    // const token = authHeader.split(" ")[1];
    // console.log('the request token is', token);
    try {
        // const decoded = await signDecodeToken(token);
        // console.log("i am the token ahhh: ", decoded);
        // if (decoded.status === 200) {
        //     return res.json({status: 200, message: 'Authorization valid'});
        // }
        console.log("Dashboard user object", req.user);
        console.log("PASS!");
    } catch (error) {
        
    }
});


module.exports = userDashBoardRoute;