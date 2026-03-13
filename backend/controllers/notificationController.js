const pool = require('../config/database');

class NotificationController {
  /**
   * Get notifications for a user
   */
  static async getNotifications(req, res) {
    try {
      const userId = req.query.user_id || req.user?.id;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const connection = await pool.getConnection();
      try {
        // Get notifications from complaint_updates for this user's complaints
        const query = `
          SELECT 
            cu.id,
            cu.complaint_id,
            cu.message,
            cu.created_at,
            cu.is_read,
            c.title as complaint_title,
            c.status as complaint_status
          FROM complaint_updates cu
          JOIN complaints c ON cu.complaint_id = c.id
          WHERE c.user_id = ?
          ORDER BY cu.created_at DESC
          LIMIT 50
        `;
        
        const [notifications] = await connection.execute(query, [userId]);
        
        // Count unread notifications
        const unreadCount = notifications.filter(n => !n.is_read).length;
        
        res.json({
          success: true,
          count: notifications.length,
          unread_count: unreadCount,
          notifications
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications',
        error: error.message
      });
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      
      const connection = await pool.getConnection();
      try {
        await connection.execute(
          'UPDATE complaint_updates SET is_read = TRUE WHERE id = ?',
          [id]
        );
        
        res.json({
          success: true,
          message: 'Notification marked as read'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(req, res) {
    try {
      const userId = req.body.user_id || req.user?.id;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }

      const connection = await pool.getConnection();
      try {
        await connection.execute(`
          UPDATE complaint_updates cu
          JOIN complaints c ON cu.complaint_id = c.id
          SET cu.is_read = TRUE
          WHERE c.user_id = ? AND cu.is_read = FALSE
        `, [userId]);
        
        res.json({
          success: true,
          message: 'All notifications marked as read'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message
      });
    }
  }

  /**
   * Get officer notifications (assignments from admin)
   */
  static async getOfficerNotifications(req, res) {
    try {
      const officerId = req.query.officer_id || req.user?.id;
      
      if (!officerId) {
        return res.status(400).json({
          success: false,
          message: 'Officer ID is required'
        });
      }

      const connection = await pool.getConnection();
      try {
        // Get assignment notifications for this officer
        const query = `
          SELECT 
            oa.id,
            oa.complaint_id,
            oa.assigned_at,
            oa.is_read,
            c.title as complaint_title,
            c.priority,
            c.category,
            c.status as complaint_status,
            c.latitude,
            c.longitude,
            u.name as assigned_by_name
          FROM officer_assignments oa
          JOIN complaints c ON oa.complaint_id = c.id
          JOIN users u ON oa.assigned_by = u.id
          WHERE oa.officer_id = ?
          ORDER BY oa.assigned_at DESC
          LIMIT 50
        `;
        
        const [notifications] = await connection.execute(query, [officerId]);
        
        // Count unread notifications
        const unreadCount = notifications.filter(n => !n.is_read).length;
        
        res.json({
          success: true,
          count: notifications.length,
          unread_count: unreadCount,
          notifications
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get officer notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch officer notifications',
        error: error.message
      });
    }
  }

  /**
   * Mark officer notification as read
   */
  static async markOfficerNotificationAsRead(req, res) {
    try {
      const { id } = req.params;
      
      const connection = await pool.getConnection();
      try {
        await connection.execute(
          'UPDATE officer_assignments SET is_read = TRUE WHERE id = ?',
          [id]
        );
        
        res.json({
          success: true,
          message: 'Notification marked as read'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Mark officer notification as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  }

  /**
   * Mark all officer notifications as read
   */
  static async markAllOfficerNotificationsAsRead(req, res) {
    try {
      const officerId = req.body.officer_id || req.user?.id;
      
      if (!officerId) {
        return res.status(400).json({
          success: false,
          message: 'Officer ID is required'
        });
      }

      const connection = await pool.getConnection();
      try {
        await connection.execute(
          'UPDATE officer_assignments SET is_read = TRUE WHERE officer_id = ? AND is_read = FALSE',
          [officerId]
        );
        
        res.json({
          success: true,
          message: 'All notifications marked as read'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Mark all officer notifications as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message
      });
    }
  }
}

module.exports = NotificationController;
