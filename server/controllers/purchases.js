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

exports.postLeaderboard = async(req, res, next) => {
    const token = req.body.token;
    const decodedToken = jwt.verify(token, 'nffoinofinoeifnaskmoj');
    const id = decodedToken.id;
    try{
        const leaderboard =await sequelize.query(`SELECT u.name, SUM(e.amount) AS totalAmount
        FROM Users u
        JOIN Expenses e ON u.id = e.id
        GROUP BY u.id
        ORDER BY totalAmount DESC;`);
        res.status(200).json({leaderboard:leaderboard});
    }
    catch(error){
        console.error('Error fetching leaderboeard', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
};

// const getTotalAmountByNameDescending = async () => {
//     try {
//         const totalAmounts = await Expenses.findAll({
//             attributes: [
//                 [sequelize.col('users.name'), 'name'], // Alias the name column
//                 [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
//             ],
//             include: [{
//                 model: Users,
//                 attributes: [],
//             }],
//             group: ['Users.id'], // Group by Users.id to prevent duplicate names
//             order: [[sequelize.literal('totalAmount DESC')]]
//         });
//         return totalAmounts;
//     } catch (error) {
//         console.error('Error:', error);
//         throw error;
//     }
// };