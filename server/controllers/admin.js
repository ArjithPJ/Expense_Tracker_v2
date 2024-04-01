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
    console.log("Name: ", name);

    try {
        // Check if user already exists
        const existingUser = await Users.findOne({where:{ email: email}});
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
        });
        console.log(newUser);
        const token = jwt.sign({id: newUser.id},'nffoinofinoeifnaskmoj');
        return res.status(201).json({message: "Signup successful", token: token});
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getLogin = (req, res, next) => {
    res.sendFile(path.join(__dirname,'../','../','client','Login','login.html'));
};

exports.postLogin = async (req, res, next) => {
    try{
        const email = req.body.email;
        const password = req.body.password;

    
        const user = await Users.findOne({ where: { email: email } });

        if (user) {
            const isPasswordCorrect = await bcrypt.compare(password, user.password);

            if (isPasswordCorrect) {
                const userId = user.id;
                const premium = user.premium;
                console.log("User id:", userId);
                const expenses = await Expenses.findAll({where:{id: userId}});
                const token = jwt.sign({ id: userId }, 'nffoinofinoeifnaskmoj');
                res.status(201).json({ token: token, id: userId, expenses: expenses, premium: premium });
            } else {
                res.status(401).json({ message: "Incorrect Password" });
            }
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.postAddExpense = (req, res, next) => {
    const amount = req.body.amount;
    const description = req.body.description;
    const category = req.body.category;
    const token =req.body.token;
    console.log("amount", amount);
    console.log("description", description);
    console.log("category", category);
    console.log("token", token);
    jwt.verify(token, 'nffoinofinoeifnaskmoj', (err, decoded) => {
        if (err) {
            console.error('Token verification failed:', err);
        } else {
            console.log('Decoded token:', decoded);

            Expenses.create({
                amount: amount,
                description: description,
                category: category,
                id:  decoded.id
            })
            .then(() => {
                return sequelize.query(`SELECT * FROM expenses`);
            })
            .then(([expenses, metadata])=>{
                console.log("Final Expenses: ", expenses);
                return res.status(200).json({message: 'Expense Added', expenses: expenses});
            })
            .catch(error => {
                console.error('Error creating expense:', error);
                return res.status(500).json({ message: 'Internal server error' });
            });
        }
    });
};

exports.getHome = (req, res, next) => {
    const token = req.params.id;
    console.log(process.env.RAZORPAY_KEY_ID);
    jwt.verify(token,'nffoinofinoeifnaskmoj', (err,decoded) => {
        if(err){
            console.error('Token Verification failed:', err);
        } 
        else{
            console.log('Decoded token:', decoded);
            sequelize.query(`SELECT * from expenses WHERE id='${decoded.id}'`)
            .then(([expenses, metadata])=>{
                console.log(expenses);
                res.sendFile(path.join(__dirname, '../','../', 'client', 'Home', 'index.html'));
                // res.render('admin/home', {
                //     pageTitle: 'Home',
                //     path: 'admin/home',
                //     expenses: expenses,
                //     id: token
                // });
            });
        }
    });
};

exports.postDeleteExpense =(req, res, next) => {
    const expenseId = req.body.expense_id;
    const token = req.body.token;
    jwt.verify(token, 'nffoinofinoeifnaskmoj', (err, decoded) => {
        if(err){
            console.log('Token Verification failed:', err);
        }
        else{
            console.log('Decoded token:', decoded);
            Expenses.findByPk(expenseId)
            .then(expense => {
                return expense.destroy();
            })
            .then(() => {
                sequelize.query(`SELECT * from expenses WHERE id='${decoded.id}'`)
                .then(([expenses, metadata])=>{
                    console.log(expenses);
                    return expenses;
                })
                .then((expenses) => {
                    res.status(200).json({message: "Expense Deleted", expenses: expenses});
                })
            })
            
            .catch((err) => {
                console.log(err);
                res.status(500).json({ message: "Internal server error" });
            });
        }
    })
};