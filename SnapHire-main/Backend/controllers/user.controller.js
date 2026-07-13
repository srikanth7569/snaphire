const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const blacklistTokenModel = require('../models/blacklistToken.model');

// Register User
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { fullname, email, password } = req.body;

  const existingUser = await userModel.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'User already registered' });

  const hashedPassword = await userModel.hashPassword(password);

  const user = await userService.createUser({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password: hashedPassword
  });

  const token = user.generateAuthToken();

  res.status(201).json({
    token,
    user: {
      _id: user._id,
      fullname: user.fullname,
      email: user.email
    }
  });
};

// Login User
const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

  const token = user.generateAuthToken();
  res.cookie('token', token, { httpOnly: true });

  res.status(200).json({
    token,
    user: {
      _id: user._id,
      fullname: user.fullname,
      email: user.email
    }
  });
};

// Get User Profile (Protected)
const getUserProfile = async (req, res) => {
  res.status(200).json({ user: req.user });
};

// Logout User
const logoutUser = async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (token) await blacklistTokenModel.create({ token });

  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser
};
