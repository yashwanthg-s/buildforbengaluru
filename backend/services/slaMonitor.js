const pool = require('../config/database');

class SLAMonitor {
  constructor() {
    this.isRunning = false;
    this.checkInterval = 60 * 60 * 1000; // Check every hour
  }

  /**
   * Start SLA monitoring service
   */
  start() {
    if (this.isRunning) {
      console.log('SLA Monitor already running');
      return;
    }

    console.log('✓ SLA Monitor started');
    this.isRunning = true;

    // Run immediately
    this.checkSLAViolations();

    // Then run every hour
    this.intervalId = setInterval(() => {
      this.checkSLAViolations();
    }, this.checkInterval);
  }

  /**
   * Stop SLA monitoring service
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isRunning = false;
      console.log('SLA Monitor stopped');
    }
  }

  /**
   * Check for SLA violations and trigger escalations
   */
  async checkSLAViolations() {
    const connection = await pool.getConnection();
    
    try {
      console.log('Checking SLA violations...');

      // Get all unresolved complaints with their SLA config
      const query = `
        SELECT 
          c.id,
          c.title,
          c.priority,
          c.status,
          c.created_at,
          TIMESTAMPDIFF(HOUR, c.created_at, NOW()) as hours_elapsed,
          s.level_1_hours,
          s.level_2_hours,
          s.level_3_hours,
          (SELECT MAX(escalation_level) FROM complaint_escalations WHERE complaint_id = c.id) as current_escalation_level
        FROM complaints c
        JOIN sla_config s ON c.priority = s.priority
        WHERE c.status IN ('submitted', 'under_review')
        ORDER BY c.created_at ASC
      `;

      const [complaints] = await connection.execute(query);

      let escalationsTriggered = 0;

      for (const complaint of complaints) {
        const hoursElapsed = complaint.hours_elapsed;
        const currentLevel = complaint.current_escalation_level || 0;

        // Determine if escalation is needed
        let newLevel = null;
        let reason = '';

        if (hoursElapsed >= complaint.level_3_hours && currentLevel < 3) {
          newLevel = 3;
          reason = `Complaint unresolved for ${hoursElapsed} hours. Escalating to Commissioner.`;
        } else if (hoursElapsed >= complaint.level_2_hours && currentLevel < 2) {
          newLevel = 2;
          reason = `Complaint unresolved for ${hoursElapsed} hours. Escalating to Department Head.`;
        } else if (hoursElapsed >= complaint.level_1_hours && currentLevel < 1) {
          newLevel = 1;
          reason = `Complaint pending for ${hoursElapsed} hours. Sending reminder to assigned officer.`;
        }

        if (newLevel) {
          await this.createEscalation(connection, complaint.id, newLevel, hoursElapsed, reason);
          escalationsTriggered++;
          
          console.log(`Escalated complaint #${complaint.id} to level ${newLevel}`);
        }
      }

      console.log(`SLA Check complete. ${escalationsTriggered} escalations triggered.`);

    } catch (error) {
      console.error('SLA Monitor error:', error);
    } finally {
      connection.release();
    }
  }

  /**
   * Create escalation record
   */
  async createEscalation(connection, complaintId, level, hoursElapsed, reason) {
    const escalationMap = {
      1: { from: 'Officer', to: 'Officer (Reminder)' },
      2: { from: 'Officer', to: 'Department Head' },
      3: { from: 'Department Head', to: 'Commissioner' }
    };

    const escalation = escalationMap[level];

    const query = `
      INSERT INTO complaint_escalations 
      (complaint_id, escalation_level, escalated_from, escalated_to, reason, hours_elapsed)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await connection.execute(query, [
      complaintId,
      level,
      escalation.from,
      escalation.to,
      reason,
      hoursElapsed
    ]);

    // Add update to complaint_updates table
    const updateQuery = `
      INSERT INTO complaint_updates (complaint_id, message, old_status, new_status)
      VALUES (?, ?, ?, ?)
    `;

    await connection.execute(updateQuery, [
      complaintId,
      `🔔 SLA Escalation: ${reason}`,
      'escalated',
      'escalated'
    ]);
  }

  /**
   * Get escalation history for a complaint
   */
  static async getEscalationHistory(complaintId) {
    const connection = await pool.getConnection();
    
    try {
      const query = `
        SELECT * FROM complaint_escalations
        WHERE complaint_id = ?
        ORDER BY created_at ASC
      `;

      const [escalations] = await connection.execute(query, [complaintId]);
      return escalations;

    } finally {
      connection.release();
    }
  }

  /**
   * Get SLA status for a complaint
   */
  static async getSLAStatus(complaintId) {
    const connection = await pool.getConnection();
    
    try {
      const query = `
        SELECT 
          c.id,
          c.priority,
          c.status,
          c.created_at,
          TIMESTAMPDIFF(HOUR, c.created_at, NOW()) as hours_elapsed,
          s.level_1_hours,
          s.level_2_hours,
          s.level_3_hours,
          (SELECT MAX(escalation_level) FROM complaint_escalations WHERE complaint_id = c.id) as current_escalation_level
        FROM complaints c
        JOIN sla_config s ON c.priority = s.priority
        WHERE c.id = ?
      `;

      const [rows] = await connection.execute(query, [complaintId]);
      
      if (rows.length === 0) return null;

      const complaint = rows[0];
      const hoursElapsed = complaint.hours_elapsed;

      // Calculate time remaining for next escalation
      let nextEscalationIn = null;
      let nextEscalationLevel = null;
      const currentLevel = complaint.current_escalation_level || 0;

      if (currentLevel < 1) {
        nextEscalationIn = complaint.level_1_hours - hoursElapsed;
        nextEscalationLevel = 1;
      } else if (currentLevel < 2) {
        nextEscalationIn = complaint.level_2_hours - hoursElapsed;
        nextEscalationLevel = 2;
      } else if (currentLevel < 3) {
        nextEscalationIn = complaint.level_3_hours - hoursElapsed;
        nextEscalationLevel = 3;
      }

      return {
        complaint_id: complaint.id,
        priority: complaint.priority,
        status: complaint.status,
        hours_elapsed: hoursElapsed,
        current_escalation_level: currentLevel,
        next_escalation_level: nextEscalationLevel,
        next_escalation_in_hours: nextEscalationIn > 0 ? nextEscalationIn : 0,
        sla_thresholds: {
          level_1: complaint.level_1_hours,
          level_2: complaint.level_2_hours,
          level_3: complaint.level_3_hours
        }
      };

    } finally {
      connection.release();
    }
  }

  /**
   * Get all complaints approaching SLA deadline
   */
  static async getApproachingDeadlines(hoursThreshold = 6) {
    const connection = await pool.getConnection();
    
    try {
      const query = `
        SELECT 
          c.id,
          c.title,
          c.priority,
          c.status,
          TIMESTAMPDIFF(HOUR, c.created_at, NOW()) as hours_elapsed,
          s.level_1_hours,
          s.level_2_hours,
          s.level_3_hours,
          (SELECT MAX(escalation_level) FROM complaint_escalations WHERE complaint_id = c.id) as current_escalation_level
        FROM complaints c
        JOIN sla_config s ON c.priority = s.priority
        WHERE c.status IN ('submitted', 'under_review')
        HAVING 
          (current_escalation_level IS NULL AND (s.level_1_hours - hours_elapsed) <= ?) OR
          (current_escalation_level = 1 AND (s.level_2_hours - hours_elapsed) <= ?) OR
          (current_escalation_level = 2 AND (s.level_3_hours - hours_elapsed) <= ?)
        ORDER BY hours_elapsed DESC
      `;

      const [complaints] = await connection.execute(query, [
        hoursThreshold,
        hoursThreshold,
        hoursThreshold
      ]);

      return complaints;

    } finally {
      connection.release();
    }
  }
}

// Create singleton instance
const slaMonitor = new SLAMonitor();

module.exports = slaMonitor;
