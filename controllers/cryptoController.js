const Crypto = require('../models/Crypto');

const getAllCryptos = async (req, res) => {
  try {
    const cryptos = await Crypto.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: cryptos.length, data: cryptos });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch cryptocurrencies.' });
  }
};

const getTopGainers = async (req, res) => {
  try {
    const gainers = await Crypto.find({ change24h: { $gt: 0 } }).sort({ change24h: -1 }).limit(10);
    res.status(200).json({ success: true, count: gainers.length, data: gainers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch top gainers.' });
  }
};

const getNewListings = async (req, res) => {
  try {
    const newCoins = await Crypto.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json({ success: true, count: newCoins.length, data: newCoins });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch new listings.' });
  }
};

const addCrypto = async (req, res) => {
  const { name, symbol, price, image, change24h } = req.body;
  if (!name || !symbol || price === undefined || change24h === undefined)
    return res.status(400).json({ success: false, message: 'Please provide name, symbol, price, and 24h change.' });
  try {
    const crypto = await Crypto.create({ name, symbol, price, image, change24h });
    res.status(201).json({ success: true, message: `${crypto.name} (${crypto.symbol}) added successfully.`, data: crypto });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: 'Failed to add cryptocurrency.' });
  }
};

module.exports = { getAllCryptos, getTopGainers, getNewListings, addCrypto };
