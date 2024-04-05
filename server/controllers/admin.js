const Users = require('../models/users');
const Expenses = require('../models/expenses');
const ForgotPasswordRequests = require('../models/forgotPasswordRequests');
const FileUrls = require('../models/fileUrls');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Sib = require('sib-api-v3-sdk');
const AWS = require('aws-sdk');
const Userservices = require('../services/userservices');
require('dotenv').config();


const sequelize = require('../util/database');


exports.getSignup = (req, res, next) => {
    res.sendFile(path.join(__dirname, '../', '../','client', 'Signup', 'signup.html'));
};

exports.postSignup = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    try {
        // Check if user already exists
        const t = await sequelize.transaction();
        const existingUser = await Users.findOne({where:{ email: email}},{ transaction: t});
        if (existingUser) {
            console.log("Account already exists");
            return res.status(409).json({message: "Account already exists"});
        }

        // Encrypt the password
        const saltrounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltrounds);

        // Create user with encrypted password
        const newUser = await Users.create({
            name: name,
            email: email,
            password: hashedPassword // Store the hashed password
        }, {transaction: t});
        console.log(newUser);
        const token = jwt.sign({id: newUser.id},'nffoinofinoeifnaskmoj');

        await t.commit();
        return res.status(201).json({message: "Signup successful", token: token});
    } catch (error) {
        console.error("Error:", error);
        await t.rollback();
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.postLogin = async (req, res, next) => {
    const t = await sequelize.transaction();
    try{
        
        const email = req.body.email;
        const password = req.body.password;

    
        const user = await Users.findOne({ where: { email: email } },{transaction: t});

        if (user) {
            const isPasswordCorrect = await bcrypt.compare(password, user.password);

            if (isPasswordCorrect) {
                const userId = user.id;
                const premium = user.premium;
                console.log("User id:", userId);
                const expenses = await Expenses.findAll({where:{id: userId}},{transaction: t});
                const token = jwt.sign({ id: userId }, 'nffoinofinoeifnaskmoj');
                await t.commit();
                res.status(201).json({ token: token, id: userId, expenses: expenses, premium: premium });
            } else {
                res.status(401).json({ message: "Incorrect Password" });
            }
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error:", error);
        await t.rollback();
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.postAddExpense = async (req, res, next) => {
    const { amount, description, category, token } = req.body;

    try {
        // Verify the token
        const decoded = jwt.verify(token, 'nffoinofinoeifnaskmoj');
        console.log('Decoded token:', decoded);

        // Start a transaction
        const t = await sequelize.transaction();

        // Create the expense
        await Expenses.create({
            amount: amount,
            description: description,
            category: category,
            id: decoded.id
        }, { transaction: t });

        // Increment the totalExpense for the user
        await Users.update(
            { totalExpense: sequelize.literal(`totalExpense + ${amount}`) },
            { where: { id: decoded.id }, transaction: t }
        );

        // Commit the transaction
        await t.commit();

        // Fetch the updated expenses
        const [expenses, metadata] = await sequelize.query(`SELECT * FROM expenses`);

        // Send the response
        console.log("Final Expenses: ", expenses);
        return res.status(200).json({ message: 'Expense Added', expenses: expenses });
    } catch (error) {
        // Rollback the transaction if an error occurs
        console.error('Error creating expense:', error);
        if (t) await t.rollback();
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.postDeleteExpense = async (req, res, next) => {
    const expenseId = req.body.expense_id;
    const token = req.body.token;

    try {
        const decoded = jwt.verify(token, 'nffoinofinoeifnaskmoj');
        console.log('Decoded token:', decoded);

        // Start a transaction
        const t = await sequelize.transaction();

        try {
            // Find the expense by its primary key and delete it
            const expense = await Expenses.findByPk(expenseId, { transaction: t });
            await expense.destroy({ transaction: t });

            // Retrieve updated expenses
            const [expenses, metadata] = await sequelize.query(`SELECT * FROM expenses WHERE id='${decoded.id}'`, { transaction: t });
            console.log(expenses);

            // Commit the transaction
            await t.commit();

            // Send response
            return res.status(200).json({ message: "Expense Deleted", expenses: expenses });
        } catch (error) {
            // Rollback the transaction if an error occurs
            await t.rollback();
            console.log('Error deleting expense:', error);
            return res.status(500).json({ message: "Internal server error" });
        }
    } catch (error) {
        console.log('Token Verification failed:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.postForgotPassword = async (req, res, next) => {
    const email =req.body.email;
    const client = Sib.ApiClient.instance;
    const t = await sequelize.transaction();
    try{
        const apiKey = client.authentications['api-key'];
        apiKey.apiKey = process.env.SMTP_API_KEY;

        const resetToken = uuidv4();
        const resetLink = `http://localhost:3000/password/resetpassword/${resetToken}`;
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

exports.getResetPassword = async (req, res, next) => {
    const uuid = req.params.uuid;
    console.log(uuid);
    try{
        res.sendFile(path.join(__dirname, '../', '../','client', 'Login', 'resetPassword.html'));
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
    console.log("111");
    const hashedPassword = await bcrypt.hash(newPassword, saltrounds);
    try{
        const user = await Users.findOne({ where:{ email: email}, transaction: t});
        const isActive = await ForgotPasswordRequests.findOne({ where: {userId: user.id }, transaction: t});
        console.log("222")
        console.log("isActive", isActive);
        if(isActive.isActive){
        
            await Users.update(
                { password: hashedPassword },
                { where: { email: email }, transaction: t }
            );
            console.log("damns")
            await ForgotPasswordRequests.update(
                {isActive: false},
                {where: {userId:user.id}}
            );
            console.log("wtf");
            res.status(200).json({message: "Password Updated"});
            await t.commit();
            console.log("333");
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

exports.postDownload = async (req, res, next) => {
    try{
        const token =req.body.token;
        const decoded = await jwt.verify(token, 'nffoinofinoeifnaskmoj');
        const expenses = await Expenses.findAll({ where: {id: decoded.id }});
        console.log(expenses);
        const stringifiedExpenses = JSON.stringify(expenses);
        const userId = decoded.id;
        const filename = `Expenses${userId}/${new Date()}.txt`;
        const fileUrl = await uploadToS3(stringifiedExpenses, filename);
        await FileUrls.create({
            id: userId,
            filename: filename,
            fileUrl: fileUrl
        });
        const downloads = await FileUrls.findAll({ where:{ id: userId}});

        res.status(200).json({fileUrl: fileUrl, success: true, downloads: downloads, err: null});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Internal Server Error", fileUrl: '', downloads: '', success: false, err: error})
    }
    
}

function uploadToS3(data, filename) {
    const BUCKET_NAME = 'expensetracker2000';
    const IAM_USER_KEY = 'AKIAVRUVUZ54K3XJPK4O';
    const IAM_USER_SECRET ='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';
    
    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
        //Bucket: BUCKET_NAME
    });
    var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
    }
    return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3response) => {
            if(err){
                console.log('Something went wrong', err);
                reject(err);
            }
            else{
                resolve(s3response.Location);
            }
        })
    })
    

}




