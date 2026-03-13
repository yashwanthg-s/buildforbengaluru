const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const ComplaintController = require('../controllers/complaintController');

// Middleware to verify token (basic implementation)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // In production, verify JWT token here
  // For now, just pass through
  next();
};

// Routes
router.post('/', verifyToken, upload.single('image'), ComplaintController.createComplaint);
router.get('/', verifyToken, ComplaintController.getComplaints);
router.get('/:id', verifyToken, ComplaintController.getComplaintById);
router.patch('/:id/status', verifyToken, ComplaintController.updateComplaintStatus);
router.post('/:id/feedback', verifyToken, ComplaintController.submitFeedback);
router.delete('/:id', verifyToken, ComplaintController.deleteComplaint);
router.post('/validate-image', verifyToken, ComplaintController.validateImage);

module.exports = router;
