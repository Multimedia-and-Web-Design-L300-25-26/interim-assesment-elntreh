const express = require('express');
const router = express.Router();
const { getPortfolio, buyCrypto, sellCrypto, getTransactions } = require('../controllers/portfolioController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // all portfolio routes require auth
router.get('/', getPortfolio);
router.post('/buy', buyCrypto);
router.post('/sell', sellCrypto);
router.get('/transactions', getTransactions);

module.exports = router;
