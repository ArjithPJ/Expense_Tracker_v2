const jwt = require('jsonwebtoken');
const Users = require('../models/users');

const authenticate = (req, res, next ) => {
    try{
        const token = req.body.token;
        console.log(req.header);
        console.log(token);
        const userid = jwt.verify(token, 'nffoinofinoeifnaskmoj');
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