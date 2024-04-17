const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');

//const errorController =require('./controllers/error');
const sequelize = require('./util/database');

const Users = require('./models/users');
const Expenses = require('./models/expenses');
const Orders = require('./models/purchases');
const ForgotPasswordRequests = require('./models/forgotPasswordRequests');
const FileUrls = require('./models/fileUrls');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require("compression");
const morgan = require("morgan");

const app = express();
// app.set('view engine', 'ejs');
// app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});

app.use(cors());


app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('combined', {stream: accessLogStream}),);

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.use(adminRoutes);
//app.use(errorController.get404);

app.use((req, res) => {
    console.log('url', req.Url);
    res.sendFile(path.join(__dirname, `public/${req.Url}`));
});

Users.hasMany(Expenses);
Expenses.belongsTo(Users, { foreignKey: 'id'});

Users.hasMany(Orders);
Orders.belongsTo(Users);

Users.hasMany(ForgotPasswordRequests);
ForgotPasswordRequests.belongsTo(Users);

sequelize
.sync()
.then(result => {
    
    app.listen(3000);
})
.catch(err => {
    console.log(err);
});
