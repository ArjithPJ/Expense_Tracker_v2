const Users = require('../models/users');
const Expenses = require('../models/expenses');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../util/database');

require('dotenv').config();

exports.postLogin = async (req, res, next) => {
    const t = await sequelize.transaction();
    try{
        
        const email = req.body.email;
        const password = req.body.password;

    
        const user = await Users.findOne({ where: { email: email } },{ transaction: t});

        if (user) {
            const isPasswordCorrect = await bcrypt.compare(password, user.password);

            if (isPasswordCorrect) {
                const userId = user.id;
                const premium = user.premium;
                console.log("User id:", userId);
                const expenses = await Expenses.findAll({where:{id: userId}},{transaction: t});
                const total = await Expenses.count({where: {id: userId}});
                const pageExpenses = await Expenses.findAll({
                    where: {id: userId},
                    offset: 0,
                    limit: 5
                });
                console.log("pageExpenses:", pageExpenses);
                const token = jwt.sign({ id: userId }, 'nffoinofinoeifnaskmoj');
                await t.commit();
                res.status(200).json({ token: token, id: userId, expenses: expenses, premium: premium, pageExpenses: pageExpenses, currentPage: 1,
                    hasNextPage: 5<total,
                    nextPage: 2,
                    hasPreviousPage: 1 > 1,
                    previousPage: 0,
                    lastPage: Math.ceil(total/5),
                    selectedValue: 5});
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