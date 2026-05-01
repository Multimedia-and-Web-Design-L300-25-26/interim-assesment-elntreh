const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['buy', 'sell'], required: true },
  coinId: { type: String, required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
