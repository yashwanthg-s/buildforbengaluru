const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // In production, verify JWT token and check admin role
  // For now, just pass through
  next();
};

// Admin routes
router.get('/stats', verifyAdmin, AdminController.getStats);
router.get('/all-complaints', verifyAdmin, AdminController.getAllComplaints);
router.get('/emergency', verifyAdmin, AdminController.getEmergencyComplaints);
router.get('/feedbacks', verifyAdmin, AdminController.getAllFeedbacks);
router.get('/report', verifyAdmin, AdminController.getDailyReport);

module.exports = router;
