// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const captainModel = require('../models/captain.model');
const blacklistTokenModel = require('../models/blacklistToken.model');

/**
 * Middleware to authenticate Users
 */
const authUser = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

    // Check blacklist
    const blacklisted = await blacklistTokenModel.findOne({ token });
    if (blacklisted) return res.status(401).json({ message: 'Unauthorized: Token is blacklisted' });

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?._id) return res.status(401).json({ message: 'Unauthorized: Invalid token' });

    // Fetch User
    const user = await userModel.findById(decoded._id);
    if (!user) return res.status(401).json({ message: 'Unauthorized: User not found' });

    req.user = user; // attach user to request
    next();
  } catch (err) {
    console.error('🔴 Auth User Middleware Error:', err);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

/**
 * Middleware to authenticate Captains
 */
const authCaptain = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

    // Check blacklist
    const blacklisted = await blacklistTokenModel.findOne({ token });
    if (blacklisted) return res.status(401).json({ message: 'Unauthorized: Token is blacklisted' });

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?._id) return res.status(401).json({ message: 'Unauthorized: Invalid token' });

    // Fetch Captain
    const captain = await captainModel.findById(decoded._id);
    if (!captain) return res.status(401).json({ message: 'Unauthorized: Captain not found' });

    req.captain = captain; // attach captain to request
    next();
  } catch (err) {
    console.error('🔴 Auth Captain Middleware Error:', err);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = {
  authUser,
  authCaptain
};
