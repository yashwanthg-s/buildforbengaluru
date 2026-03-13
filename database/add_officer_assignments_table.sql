-- Migration: Add officer_assignments table for tracking complaint assignments
-- Run this to enable officer notifications when admin assigns complaints

USE complaint_system;

-- Create officer_assignments table
CREATE TABLE IF NOT EXISTS officer_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  officer_id INT NOT NULL,
  assigned_by INT NOT NULL COMMENT 'Admin user ID who made the assignment',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  INDEX idx_complaint_id (complaint_id),
  INDEX idx_officer_id (officer_id),
  INDEX idx_is_read (is_read),
  INDEX idx_assigned_at (assigned_at),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_complaint_officer (complaint_id, officer_id)
);

-- Create officer user if not exists (id=2, username=officer, password=officer)
-- Password is bcrypt hash of 'officer'
INSERT INTO users (id, name, email, username, password, role, is_active)
VALUES (2, 'Officer User', 'officer@system.com', 'officer', '$2b$10$YourBcryptHashHere', 'officer', TRUE)
ON DUPLICATE KEY UPDATE role='officer';

-- Create admin user if not exists (id=3, username=admin, password=admin)
-- Password is bcrypt hash of 'admin'
INSERT INTO users (id, name, email, username, password, role, is_active)
VALUES (3, 'Admin User', 'admin@system.com', 'admin', '$2b$10$YourBcryptHashHere', 'admin', TRUE)
ON DUPLICATE KEY UPDATE role='admin';

SELECT 'Migration completed: officer_assignments table created' AS status;
