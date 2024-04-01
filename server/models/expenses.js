const Sequelize = require('sequelize');

const sequelize = require('../util/database');


const Expenses = sequelize.define('expenses', {
  expense_id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  amount: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
    
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false
  },
  id: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

module.exports = Expenses;