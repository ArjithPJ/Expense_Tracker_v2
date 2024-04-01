const Sequelize = require('sequelize');

const sequelize = new Sequelize('expense_tracker', 'root', 'Arjith@2000', {
  dialect: 'mysql',
  host: 'localhost'
});


module.exports = sequelize;