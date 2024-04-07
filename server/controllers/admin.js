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


exports.getExpenses = async (req, res, next) => {
    try{
        const currentPage = req.query.page;
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization header is missing or invalid' });
        }

        const token = authHeader.split(' ')[1]; // Extract just the token value
        console.log("Token:", token);
        const id = await jwt.verify(token, 'nffoinofinoeifnaskmoj')
        const total = await Expenses.count();
        console.log(total);
        const pageExpenses = await Expenses.findAll({
            where: {id: id.id},
            offset: (currentPage-1)*10,
            limit: 10
        });
        console.log("pageExpenses:", pageExpenses);
        res.status(200).json({
            pageExpenses: pageExpenses,
            currentPage: currentPage,
            hasNextPage: 10*currentPage<total,
            nextPage: currentPage + 1,
            hasPreviousPage: currentPage > 1,
            previousPage: currentPage - 1,
            lastPage: Math.ceil(total/10)
        });
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: error});
    }
}


exports.postAddExpense = async (req, res, next) => {
    const amount = req.body.amount;
    const description = req.body.description;
    const category = req.body.category;
    const token = req.body.token;
    const currentPage = req.body.currentPage;
    const t = await sequelize.transaction();
    try {
        // Verify the token
        const decoded = await jwt.verify(token, 'nffoinofinoeifnaskmoj');
        console.log('Decoded token:', decoded);

        // Start a transaction
        

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
        await t.commit();
        // Fetch the updated expenses
        const expenses = await Expenses.findAll({ where: {id: decoded.id}});

        // Send the response
        console.log("Final Expenses: ", expenses);
        const pageExpenses = await Expenses.findAll({
            where: { id: decoded.id},
            offset: (currentPage-1)*10,
            limit: 10
        });

        console.log("pageExpenses:",pageExpenses);
        console.log("Expenses:", expenses);
        
        return res.status(200).json({ message: 'Expense Added', expenses: expenses, pageExpenses: pageExpenses });
    } 
    catch (error) {
        // Rollback the transaction if an error occurs
        console.error('Error creating expense:', error);
        await t.rollback();
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.postDeleteExpense = async (req, res, next) => {
    const expenseId = req.body.expense_id;
    const token = req.body.token;
    const currentPage = req.body.currentPage;

    try {
        const decoded = jwt.verify(token, 'nffoinofinoeifnaskmoj');
        console.log('Decoded token:', decoded.id);

        // Start a transaction
        const t = await sequelize.transaction();

        try {
            // Find the expense by its primary key and delete it
            const expense = await Expenses.findByPk(expenseId, { transaction: t });
            await expense.destroy({ transaction: t });
            
            await t.commit();
            const pageExpenses = await Expenses.findAll({
                where: { id: decoded.id},
                offset: (currentPage-1)*10,
                limit: 10
            });
    
            // Retrieve updated expenses
            const expenses = await Expenses.findAll({where: {id: decoded.id}},);
            console.log("pageExpenses:",pageExpenses);
            console.log("Expenses:", expenses);

            // Send response
            return res.status(200).json({ message: "Expense Deleted", expenses: expenses, pageExpenses: pageExpenses });
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








