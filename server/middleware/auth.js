const jwt = require('jsonwebtoken');
const Users = require('../models/users');
require('dotenv').config();

const authenticate = (req, res, next ) => {
    try{
        console.log("Hello");
        const token = req.body.token;
        console.log(token);
        console.log(req.header);
        console.log(token);
        const userid = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log(userid);
        Users.findByPk(userid.id).then(user => {
            console.log(JSON.stringify(user));
            req.user = user;
            next();
        }).catch(err => {
            throw new Error(err)
        })
    }
    catch(error){
        console.log("Error",error);
        return res.status(401).json({success: false})
    }
};

module.exports = {
    authenticate
}