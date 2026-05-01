const Alert = require('../models/Alert');

const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch alerts.' });
  }
};

const createAlert = async (req, res) => {
  const { coinId, symbol, name, targetPrice, direction } = req.body;
  if (!coinId || !symbol || !name || !targetPrice || !direction)
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  try {
    const alert = await Alert.create({ userId: req.user._id, coinId, symbol, name, targetPrice, direction });
    res.status(201).json({ success: true, message: `Alert created for ${symbol}`, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create alert.' });
  }
};

const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found.' });
    res.json({ success: true, message: 'Alert deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete alert.' });
  }
};

module.exports = { getAlerts, createAlert, deleteAlert };
