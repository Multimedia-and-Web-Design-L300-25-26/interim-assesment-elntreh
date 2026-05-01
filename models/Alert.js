const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coinId: { type: String, required: true },
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  targetPrice: { type: Number, required: true },
  direction: { type: String, enum: ['above', 'below'], required: true },
  triggered: { type: Boolean, default: false },
  triggeredAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
