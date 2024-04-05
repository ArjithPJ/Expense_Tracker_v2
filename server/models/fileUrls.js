const Sequelize = require('sequelize');

const sequelize = require('../util/database');


const FileUrls = sequelize.define('fileUrls', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    filename: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    fileUrl: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    }
});

module.exports = FileUrls;

