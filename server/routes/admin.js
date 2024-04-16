const express =require('express');

const adminController = require('../controllers/admin');
const signupController = require('../controllers/signup');
const loginController = require('../controllers/login');
const forgotPasswordController = require('../controllers/forgotPassword');
const resetPasswordController = require('../controllers/resetPassword');
const purchaseController = require('../controllers/purchases');
const downloadController = require('../controllers/download');
const authenticatemiddleware = require('../middleware/auth');

const router = express.Router();

//router.get('/signup', adminController.getSignup);
router.post('/signup', signupController.postSignup);
//router.get('/home/:id', adminController.getHome);

//router.get('/login', adminController.getLogin);
router.post('/login', loginController.postLogin);

router.get('/home', adminController.getExpenses);
router.post('/add-expense/:id', adminController.postAddExpense);
router.post('/delete-expense/:id', adminController.postDeleteExpense);

router.post('/buypremium/:id',purchaseController.postbuyPremium);
router.post('/premium/leaderboard',purchaseController.postLeaderboard);

router.post('/password/forgotpassword', forgotPasswordController.postForgotPassword);


router.get('/password/resetpassword/:uuid', resetPasswordController.getResetPassword);
router.post('/password/resetpassword', resetPasswordController.postResetPassword);

router.get('/download', downloadController.getDownload);
router.post('/download', authenticatemiddleware.authenticate, downloadController.postDownload);

module.exports = router;