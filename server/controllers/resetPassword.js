const Users = require('../models/users');
const ForgotPasswordRequests = require('../models/forgotPasswordRequests');
const bcrypt = require('bcrypt');
const path = require('path');

require('dotenv').config();

const sequelize = require('../util/database');

exports.getResetPassword = async (req, res, next) => {
    const uuid = req.params.uuid;
    console.log(uuid);
    try{
        res.sendFile(path.join(__dirname, '../', 'public', 'Login', 'resetPassword.html'));
    }
    catch(error){
        console.error(error);
    }
};

exports.postResetPassword = async (req, res, next) => {
    const newPassword = req.body.password;
    const email = req.body.email;
    const t = await sequelize.transaction();
    const saltrounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltrounds);
    try{
        const user = await Users.findOne({ where:{ email: email}, transaction: t});
        const isActive = await ForgotPasswordRequests.findOne({ where: {userId: user.id }, transaction: t});
        if(isActive.isActive){
        
            await Users.update(
                { password: hashedPassword },
                { where: { email: email }, transaction: t }
            );
            await ForgotPasswordRequests.update(
                {isActive: false},
                {where: {userId:user.id}}
            );
            res.status(200).json({message: "Password Updated"});
            await t.commit();
        }
        else{
            await t.rollback();
            res.status(401).json({message: "Reset Password Link expired"});
        }
    }
    catch(error){
        await t.rollback();
        console.error(error);
        res.status(500).json({message: "Internal Server Error"});
    }

};
