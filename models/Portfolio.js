const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  coinId: { type: String, required: true },       // CoinGecko id e.g. "bitcoin"
  symbol: { type: String, required: true },        // e.g. "BTC"
  name: { type: String, required: true },
  image: { type: String, default: '' },
  amount: { type: Number, required: true, min: 0 },
  avgBuyPrice: { type: Number, required: true, min: 0 },
});

const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  holdings: [holdingSchema],
  cashBalance: { type: Number, default: 10000 }, // virtual demo balance in USD
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
