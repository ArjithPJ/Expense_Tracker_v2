const Sequelize = require('sequelize');

const sequelize = require('../util/database');


const Users = sequelize.define('users', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
    
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  premium: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  totalExpense: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});

module.exports = Users;

