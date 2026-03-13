const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');

// Middleware to verify token (basic implementation)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // In production, verify JWT token here
  // For now, just pass through
  next();
};

// Routes
router.get('/', verifyToken, NotificationController.getNotifications);
router.patch('/:id/read', verifyToken, NotificationController.markAsRead);
router.post('/mark-all-read', verifyToken, NotificationController.markAllAsRead);

// Officer notification routes
router.get('/officer', verifyToken, NotificationController.getOfficerNotifications);
router.patch('/officer/:id/read', verifyToken, NotificationController.markOfficerNotificationAsRead);
router.post('/officer/mark-all-read', verifyToken, NotificationController.markAllOfficerNotificationsAsRead);

// Category-based notification routes (new complaints in officer's categories)
router.get('/officer/category/notifications', verifyToken, NotificationController.getCategoryBasedNotifications);
router.patch('/officer/category/:complaintId/read', verifyToken, NotificationController.markCategoryNotificationAsRead);
router.post('/officer/category/mark-all-read', verifyToken, NotificationController.markAllCategoryNotificationsAsRead);

module.exports = router;
