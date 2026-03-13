const pool = require('../config/database');

class Complaint {
  static async create(complaintData) {
    const connection = await pool.getConnection();
    try {
      const query = `
        INSERT INTO complaints 
        (user_id, title, description, image_path, latitude, longitude, date, time, category, priority, status, accuracy, device_info, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute(query, [
        complaintData.user_id,
        complaintData.title,
        complaintData.description,
        complaintData.image_path,
        complaintData.latitude,
        complaintData.longitude,
        complaintData.date,
        complaintData.time,
        complaintData.category || 'other',
        complaintData.priority || 'medium',
        'submitted',
        complaintData.accuracy || null,
        complaintData.device_info || null,
        complaintData.ip_address || null
      ]);

      return result.insertId;
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT c.*, 
        cr.before_image_path,
        cr.after_image_path,
        cr.resolution_notes
        FROM complaints c 
        LEFT JOIN complaint_resolutions cr ON c.id = cr.complaint_id
        WHERE c.id = ?
      `;
      const [rows] = await connection.execute(query, [id]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  static async findAll(filters = {}) {
    const connection = await pool.getConnection();
    try {
      let query = `
        SELECT c.*, 
        EXISTS(SELECT 1 FROM complaint_feedback WHERE complaint_id = c.id) as has_feedback,
        cr.before_image_path,
        cr.after_image_path,
        cr.resolution_notes
        FROM complaints c 
        LEFT JOIN complaint_resolutions cr ON c.id = cr.complaint_id
        WHERE 1=1
      `;
      const params = [];

      if (filters.status) {
        // Handle multiple statuses (comma-separated)
        if (filters.status.includes(',')) {
          const statuses = filters.status.split(',');
          const placeholders = statuses.map(() => '?').join(',');
          query += ` AND c.status IN (${placeholders})`;
          params.push(...statuses);
        } else {
          query += ' AND c.status = ?';
          params.push(filters.status);
        }
      }
      if (filters.category) {
        query += ' AND c.category = ?';
        params.push(filters.category);
      }
      if (filters.priority) {
        query += ' AND c.priority = ?';
        params.push(filters.priority);
      }
      if (filters.user_id) {
        query += ' AND c.user_id = ?';
        params.push(filters.user_id);
      }

      query += ' ORDER BY c.created_at DESC LIMIT 100';

      const [rows] = await connection.execute(query, params);
      return rows;
    } finally {
      connection.release();
    }
  }

  static async updateStatus(id, status, message = '', adminId = null) {
    const connection = await pool.getConnection();
    try {
      const query = `
        UPDATE complaints 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await connection.execute(query, [status, id]);

      // Add update record if message provided
      if (message) {
        const updateQuery = `
          INSERT INTO complaint_updates (complaint_id, message)
          VALUES (?, ?)
        `;
        await connection.execute(updateQuery, [id, message]);
      }

      // If status is 'under_review' and adminId provided, create officer assignment
      // Assuming officer_id = 2 (hardcoded officer account)
      if (status === 'under_review' && adminId) {
        const officerId = 2; // Hardcoded officer user ID
        
        // Check if assignment already exists
        const [existing] = await connection.execute(
          'SELECT id FROM officer_assignments WHERE complaint_id = ? AND officer_id = ?',
          [id, officerId]
        );
        
        if (existing.length === 0) {
          // Create new assignment notification
          await connection.execute(
            'INSERT INTO officer_assignments (complaint_id, officer_id, assigned_by) VALUES (?, ?, ?)',
            [id, officerId, adminId]
          );
        }
      }

      return true;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      const query = 'DELETE FROM complaints WHERE id = ?';
      await connection.execute(query, [id]);
      return true;
    } finally {
      connection.release();
    }
  }

  static async addFeedback(complaintId, userId, rating, feedbackText = '') {
    const connection = await pool.getConnection();
    try {
      const query = `
        INSERT INTO complaint_feedback (complaint_id, user_id, rating, feedback_text)
        VALUES (?, ?, ?, ?)
      `;
      await connection.execute(query, [complaintId, userId, rating, feedbackText]);
      return true;
    } finally {
      connection.release();
    }
  }

  static async getStatistics() {
    const connection = await pool.getConnection();
    try {
      const [stats] = await connection.execute(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN priority IN ('critical', 'high') AND status = 'submitted' THEN 1 ELSE 0 END) as emergency,
          SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
          SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
        FROM complaints
      `);

      const [avgRating] = await connection.execute(`
        SELECT AVG(rating) as avgRating
        FROM complaint_feedback
      `);

      return {
        ...stats[0],
        avgRating: avgRating[0].avgRating || 0
      };
    } finally {
      connection.release();
    }
  }

  static async getEmergencyComplaints() {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT * FROM complaints 
        WHERE priority IN ('critical', 'high') 
        AND status IN ('submitted', 'under_review')
        ORDER BY 
          CASE priority 
            WHEN 'critical' THEN 1 
            WHEN 'high' THEN 2 
            ELSE 3 
          END,
          created_at DESC
        LIMIT 100
      `;
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  static async getUnassignedComplaints() {
    const connection = await pool.getConnection();
    try {
      // Get only submitted (unassigned) complaints
      const query = `
        SELECT * FROM complaints 
        WHERE status = 'submitted'
        ORDER BY 
          CASE priority 
            WHEN 'critical' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
            ELSE 5 
          END,
          created_at DESC
        LIMIT 200
      `;
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  static async getAllFeedbacks() {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT 
          cf.*,
          c.title as complaint_title,
          c.category as complaint_category,
          c.latitude as complaint_latitude,
          c.longitude as complaint_longitude,
          u.name as user_name
        FROM complaint_feedback cf
        JOIN complaints c ON cf.complaint_id = c.id
        LEFT JOIN users u ON cf.user_id = u.id
        ORDER BY cf.created_at DESC
        LIMIT 100
      `;
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  static async getDailyReport(date) {
    const connection = await pool.getConnection();
    try {
      const [report] = await connection.execute(`
        SELECT 
          COUNT(*) as total_complaints,
          SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
          SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical,
          SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high
        FROM complaints
        WHERE DATE(created_at) = ?
      `, [date]);

      return report[0];
    } finally {
      connection.release();
    }
  }

  static async getAllForAdmin() {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT c.*, 
        cr.before_image_path,
        cr.after_image_path,
        cr.resolution_notes,
        COALESCE(cc.complaint_count, 1) as duplicate_count
        FROM complaints c 
        LEFT JOIN complaint_resolutions cr ON c.id = cr.complaint_id
        LEFT JOIN complaint_clusters cc ON c.id = cc.primary_complaint_id
        WHERE c.id NOT IN (
          SELECT DISTINCT ccm.complaint_id 
          FROM complaint_cluster_members ccm
          INNER JOIN complaint_clusters cc2 ON ccm.cluster_id = cc2.id
          WHERE ccm.complaint_id != cc2.primary_complaint_id
        )
        ORDER BY c.created_at DESC
        LIMIT 1000
      `;
      const [rows] = await connection.execute(query);
      return rows;
    } finally {
      connection.release();
    }
  }

  static async getRecentInArea(category, latitude, longitude, days = 30) {
    const connection = await pool.getConnection();
    try {
      // Get complaints within ~5km radius and same category from last X days
      const query = `
        SELECT id, title, description, category, latitude, longitude, created_at
        FROM complaints
        WHERE category = ?
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        AND (
          6371 * acos(
            cos(radians(?)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(latitude))
          )
        ) <= 5
        ORDER BY created_at DESC
        LIMIT 50
      `;
      
      const [rows] = await connection.execute(query, [
        category,
        days,
        latitude,
        longitude,
        latitude
      ]);
      
      return rows;
    } finally {
      connection.release();
    }
  }

  static async linkToCluster(complaintId, clusterHash, primaryComplaintId, similarityScore) {
    const connection = await pool.getConnection();
    try {
      // Check if cluster exists
      let [clusters] = await connection.execute(
        'SELECT id FROM complaint_clusters WHERE cluster_hash = ?',
        [clusterHash]
      );

      let clusterId;
      
      if (clusters.length === 0) {
        // Create new cluster
        const [result] = await connection.execute(
          `INSERT INTO complaint_clusters 
          (cluster_hash, category, primary_complaint_id, latitude, longitude, complaint_count)
          SELECT ?, category, ?, latitude, longitude, 1
          FROM complaints WHERE id = ?`,
          [clusterHash, primaryComplaintId, primaryComplaintId]
        );
        clusterId = result.insertId;
        
        // Link primary complaint to cluster
        await connection.execute(
          'INSERT INTO complaint_cluster_members (cluster_id, complaint_id, similarity_score) VALUES (?, ?, ?)',
          [clusterId, primaryComplaintId, 1.0]
        );
      } else {
        clusterId = clusters[0].id;
      }

      // Link new complaint to cluster
      await connection.execute(
        'INSERT INTO complaint_cluster_members (cluster_id, complaint_id, similarity_score) VALUES (?, ?, ?)',
        [clusterId, complaintId, similarityScore]
      );

      // Update cluster count
      await connection.execute(
        'UPDATE complaint_clusters SET complaint_count = complaint_count + 1 WHERE id = ?',
        [clusterId]
      );

      return clusterId;
    } finally {
      connection.release();
    }
  }

  static async addResolution(complaintId, officerId, beforeImagePath, afterImagePath, notes = '') {
    const connection = await pool.getConnection();
    try {
      console.log('\n  === ADD RESOLUTION TO DATABASE ===');
      console.log(`  Complaint ID: ${complaintId}`);
      console.log(`  Officer ID: ${officerId}`);
      console.log(`  Before image: ${beforeImagePath}`);
      console.log(`  After image: ${afterImagePath}`);
      console.log(`  Notes: ${notes.substring(0, 50)}...`);

      // Insert resolution record
      const query = `
        INSERT INTO complaint_resolutions 
        (complaint_id, officer_id, before_image_path, after_image_path, resolution_notes)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      console.log('  📝 Executing INSERT query...');
      const [result] = await connection.execute(query, [
        complaintId,
        officerId,
        beforeImagePath,
        afterImagePath,
        notes
      ]);

      const resolutionId = result.insertId;
      console.log(`  ✓ Resolution record created with ID: ${resolutionId}`);

      // Update complaint with resolution info
      const updateQuery = `
        UPDATE complaints 
        SET status = 'resolved', resolution_id = ?, resolved_by = ?, resolved_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      console.log('  📝 Executing UPDATE query...');
      await connection.execute(updateQuery, [resolutionId, officerId, complaintId]);
      console.log(`  ✓ Complaint updated with resolution info\n`);

      return resolutionId;
    } catch (error) {
      console.error('  ❌ Database error:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getResolution(complaintId) {
    const connection = await pool.getConnection();
    try {
      const query = `
        SELECT * FROM complaint_resolutions 
        WHERE complaint_id = ?
      `;
      const [rows] = await connection.execute(query, [complaintId]);
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }
}

module.exports = Complaint;
