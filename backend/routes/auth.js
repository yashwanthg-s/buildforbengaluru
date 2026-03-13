const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Signup route
router.post('/signup', AuthController.signup);

// Login route
router.post('/login', AuthController.login);

module.exports = router;
