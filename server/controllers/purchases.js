const Users = require('../models/users');
const Expenses = require('../models/expenses');
const Orders = require('../models/purchases');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const sequelize = require('../util/database');
const Razorpay = require('razorpay');
require('dotenv').config();


exports.postbuyPremium = (req, res, next) => {
    console.log("Req.body: ", req.body);
    const { paymentId, token } = req.body;
    
    // Here, you would typically store the payment ID in your database
    // This is just a placeholder response
    const id = jwt.verify(token, 'nffoinofinoeifnaskmoj', (err, decoded) => {
        if(err){
            console.log("Something went wrong");
        }
        else{
            return decoded;
        }
    });
    console.log('Storing payment ID:', paymentId);
    console.log(id);

    sequelize.query(`UPDATE users SET premium=true WHERE id=${id.id}`)
    .then(()=>{
        res.status(200).json({ message: 'Payment ID stored successfully', payment_id: paymentId, premium: true });
    })
    .catch((err) => {
        res.status(500).json({message:"Internal Server Error"});
    })
};


exports.postLeaderboard = async (req, res, next) => {
    try{
        const users =await Users.findAll({
            attributes: ['id', 'name', 'totalExpense'],
            order: [['totalExpense', 'DESC']]
        });
        res.status(200).json({ leaderboard: users});
    }
    catch{
        console.error("Details not found");
    }
};