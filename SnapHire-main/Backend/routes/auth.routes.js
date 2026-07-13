const express = require('express');
const { registerUser, loginUser, getUserProfile, logoutUser } = require('../controllers/auth.controller');
const { authUser } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', authUser, getUserProfile);
router.post('/logout', authUser, logoutUser);

module.exports = router;
