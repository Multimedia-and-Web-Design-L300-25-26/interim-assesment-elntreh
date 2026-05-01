const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');

// GET /api/portfolio — get user's portfolio
const getPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: req.user._id, holdings: [], cashBalance: 10000 });
    }
    res.json({ success: true, data: portfolio });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch portfolio.' });
  }
};

// POST /api/portfolio/buy
const buyCrypto = async (req, res) => {
  const { coinId, symbol, name, image, amount, price } = req.body;
  if (!coinId || !symbol || !name || !amount || !price)
    return res.status(400).json({ success: false, message: 'Missing required fields.' });

  const total = parseFloat(amount) * parseFloat(price);

  try {
    let portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (!portfolio) portfolio = await Portfolio.create({ userId: req.user._id, holdings: [], cashBalance: 10000 });

    if (portfolio.cashBalance < total)
      return res.status(400).json({ success: false, message: `Insufficient balance. You have $${portfolio.cashBalance.toFixed(2)} available.` });

    // Update or create holding
    const existingIdx = portfolio.holdings.findIndex(h => h.coinId === coinId);
    if (existingIdx >= 0) {
      const existing = portfolio.holdings[existingIdx];
      const newAmount = existing.amount + parseFloat(amount);
      const newAvg = ((existing.avgBuyPrice * existing.amount) + total) / newAmount;
      portfolio.holdings[existingIdx].amount = newAmount;
      portfolio.holdings[existingIdx].avgBuyPrice = newAvg;
      portfolio.holdings[existingIdx].image = image || existing.image;
    } else {
      portfolio.holdings.push({ coinId, symbol, name, image: image || '', amount: parseFloat(amount), avgBuyPrice: parseFloat(price) });
    }

    portfolio.cashBalance -= total;
    await portfolio.save();

    await Transaction.create({ userId: req.user._id, type: 'buy', coinId, symbol, name, image: image || '', amount: parseFloat(amount), price: parseFloat(price), total });

    res.json({ success: true, message: `Successfully bought ${amount} ${symbol}`, data: portfolio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Buy transaction failed.' });
  }
};

// POST /api/portfolio/sell
const sellCrypto = async (req, res) => {
  const { coinId, symbol, name, image, amount, price } = req.body;
  if (!coinId || !symbol || !name || !amount || !price)
    return res.status(400).json({ success: false, message: 'Missing required fields.' });

  try {
    const portfolio = await Portfolio.findOne({ userId: req.user._id });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found.' });

    const holdingIdx = portfolio.holdings.findIndex(h => h.coinId === coinId);
    if (holdingIdx < 0) return res.status(400).json({ success: false, message: `You don't own any ${symbol}.` });

    const holding = portfolio.holdings[holdingIdx];
    if (holding.amount < parseFloat(amount))
      return res.status(400).json({ success: false, message: `Insufficient ${symbol}. You own ${holding.amount}.` });

    const total = parseFloat(amount) * parseFloat(price);
    holding.amount -= parseFloat(amount);

    if (holding.amount <= 0) {
      portfolio.holdings.splice(holdingIdx, 1);
    }

    portfolio.cashBalance += total;
    await portfolio.save();

    await Transaction.create({ userId: req.user._id, type: 'sell', coinId, symbol, name, image: image || '', amount: parseFloat(amount), price: parseFloat(price), total });

    res.json({ success: true, message: `Successfully sold ${amount} ${symbol}`, data: portfolio });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sell transaction failed.' });
  }
};

// GET /api/portfolio/transactions
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch transactions.' });
  }
};

module.exports = { getPortfolio, buyCrypto, sellCrypto, getTransactions };
