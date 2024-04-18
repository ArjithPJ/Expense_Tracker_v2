const Users = require('../models/users');

const ForgotPasswordRequests = require('../models/forgotPasswordRequests');

const { v4: uuidv4 } = require('uuid');
const Sib = require('sib-api-v3-sdk');

require('dotenv').config();
const sequelize = require('../util/database');


exports.postForgotPassword = async (req, res, next) => {
    const email =req.body.email;
    const client = Sib.ApiClient.instance;
    const t = await sequelize.transaction();
    try{
        const apiKey = client.authentications['api-key'];
        apiKey.apiKey = process.env.SMTP_API_KEY;

        const resetToken = uuidv4();
        const resetLink = `http://44.206.240.170/password/resetpassword/${resetToken}`;
        console.log("Reset Link:", resetLink);

        const tranEmailApi = new Sib.TransactionalEmailsApi();

        const sender = {
            email: 'pjarjith@gmail.com'
        }
        const receivers = [
            {
                email: email
            }
        ]

        await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Reset Password',
            htmlContent: `Click <a href="${resetLink}">here</a> to reset your password.`
        }, {transaction: t});
        console.log("Email Sent");
        console.log(resetToken);

        const user = await Users.findOne({ where: { email: email}, transaction: t});
        let userId;
        console.log(user.id);
        if(user){
            userId = user.id;
            await ForgotPasswordRequests.create({
                uuid: resetToken,
                userId: userId,
                isActive: true
            }, {transaction: t});
        }
        await t.commit();
        res.status(200).json({message: "Email sent", email: email});
    }
    catch(error){
        await t.rollback();
        console.error(error);
        console.log("Email couldn't be sent");
        res.status(500).json({message: "Internal Server Error"});
    }
};
