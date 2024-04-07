const Users = require('../models/users');
const Expenses = require('../models/expenses');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const sequelize = require('../util/database');


exports.getExpenses = async (req, res, next) => {
    try{
        const page = req.query.page;
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization header is missing or invalid' });
        }

        const token = authHeader.split(' ')[1]; // Extract just the token value
        console.log("Token:", token);
        const id = await jwt.verify(token, 'nffoinofinoeifnaskmoj')
        const total = await Expenses.count({where: { id: id.id}});
        console.log(total);
        const pageExpenses = await Expenses.findAll({
            where: {id: id.id},
            offset: (page-1)*5,
            limit: 5
        });
        console.log("pageExpenses:", pageExpenses);
        res.status(200).json({
            pageExpenses: pageExpenses,
            currentPage: parseInt(page,10),
            hasNextPage: 5*parseInt(page,10)<total,
            nextPage: parseInt(page,10) + 1,
            hasPreviousPage: parseInt(page,10) > 1,
            previousPage: parseInt(page,10) - 1,
            lastPage: Math.ceil(total/5)
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

        const total = await Expenses.count({where: {id: decoded.id}});
        const pageExpenses = await Expenses.findAll({
            where: { id: decoded.id},
            offset: (currentPage-1)*5,
            limit: 5
        });

        console.log("pageExpenses:",pageExpenses);
        console.log("Expenses:", expenses);
        const lastPage = Math.ceil(total/5)
        
        return res.status(200).json({ message: 'Expense Added', expenses: expenses, pageExpenses: pageExpenses,currentPage: 1,
        hasNextPage: parseInt(currentPage,10)<total,
        nextPage: parseInt(currentPage, 10)+1,
        hasPreviousPage: parseInt(currentPage,10) > 1,
        previousPage: parseInt(currentPage,10) - 1,
        lastPage: parseInt(lastPage,10) });
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
                offset: (currentPage-1)*5,
                limit: 5
            });
    
            // Retrieve updated expenses
            const expenses = await Expenses.findAll({where: {id: decoded.id}},);
            console.log("pageExpenses:",pageExpenses);
            console.log("Expenses:", expenses);
            const total = await Expenses.count({where: {id: decoded.id}});
            const lastPage = Math.ceil(total/5);
            
            return res.status(200).json({ message: 'Expense Added', expenses: expenses, pageExpenses: pageExpenses,currentPage: 1,
            hasNextPage: parseInt(currentPage,10)<total,
            nextPage: parseInt(currentPage, 10)+1,
            hasPreviousPage: parseInt(currentPage,10) > 1,
            previousPage: parseInt(currentPage,10) - 1,
            lastPage: parseInt(lastPage,10) });
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








