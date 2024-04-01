const Users = require('../models/users');
const Expenses = require('../models/expenses');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv');

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

