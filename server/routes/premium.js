const express =require('express');

const adminController = require('../controllers/admin');
const purchaseController = require('../controllers/purchases');

const router = express.Router();

router.post('/premium/leaderboard',purchaseController.postLeaderboard);
module.exports = router;