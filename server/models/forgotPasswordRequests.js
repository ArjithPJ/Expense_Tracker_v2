const Sequelize = require('sequelize');

const sequelize = require('../util/database');


const ForgotPasswordRequests = sequelize.define('forgotpasswordrequests', {
  uuid: {
    type: Sequelize.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    allowNull: false 
  }
});

module.exports = ForgotPasswordRequests;