const User = require('../models/User');
const jwt = require('jsonwebtoken');

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(statusCode).json({
    success: true,
    user: { _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
  });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password.' });
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

const getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: { _id: req.user._id, name: req.user.name, email: req.user.email, createdAt: req.user.createdAt },
  });
};

const logout = async (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

module.exports = { register, login, getProfile, logout };
