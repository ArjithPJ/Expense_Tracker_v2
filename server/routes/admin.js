const express =require('express');

const adminController = require('../controllers/admin');
const purchaseController = require('../controllers/purchases');
const authenticatemiddleware = require('../middleware/auth');

const router = express.Router();

//router.get('/signup', adminController.getSignup);
router.post('/signup', adminController.postSignup);
//router.get('/home/:id', adminController.getHome);

//router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);

router.post('/add-expense/:id', adminController.postAddExpense);
router.post('/delete-expense/:id', adminController.postDeleteExpense);

router.post('/buypremium/:id',purchaseController.postbuyPremium);
router.post('/premium/leaderboard',purchaseController.postLeaderboard);

router.post('/password/forgotpassword', adminController.postForgotPassword);
router.get('/password/resetpassword/:uuid', adminController.getResetPassword);
router.post('/password/resetpassword', adminController.postResetPassword);
router.post('/download', authenticatemiddleware.authenticate, adminController.postDownload);

module.exports = router;