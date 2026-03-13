-- Create Database
CREATE DATABASE IF NOT EXISTS complaint_system;
USE complaint_system;

-- Users Table (must be created first for foreign key references)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  username VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('citizen', 'officer', 'admin') DEFAULT 'citizen',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
);

-- Complaints Table with Geo-Tagged Evidence
CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(10, 8) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  category VARCHAR(100) DEFAULT 'other',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  status ENUM('submitted', 'under_review', 'resolved', 'rejected') DEFAULT 'submitted',
  accuracy INT COMMENT 'GPS accuracy in meters',
  device_info VARCHAR(255) COMMENT 'Device/browser information',
  ip_address VARCHAR(45) COMMENT 'User IP address',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_priority (priority),
  INDEX idx_location (latitude, longitude),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Complaint Comments/Updates
CREATE TABLE complaint_updates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  officer_id INT,
  message TEXT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_complaint_id (complaint_id),
  INDEX idx_officer_id (officer_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_read (is_read),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Audit Log Table
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Statistics/Analytics Table
CREATE TABLE complaint_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  total_complaints INT DEFAULT 0,
  submitted INT DEFAULT 0,
  under_review INT DEFAULT 0,
  resolved INT DEFAULT 0,
  rejected INT DEFAULT 0,
  avg_resolution_time INT COMMENT 'in hours',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_date (date),
  INDEX idx_date (date)
);

-- Feedback Table
CREATE TABLE complaint_feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL COMMENT '1-5 star rating',
  feedback_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_complaint_id (complaint_id),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Complaint Clusters Table (for duplicate detection)
CREATE TABLE complaint_clusters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cluster_hash VARCHAR(64) UNIQUE NOT NULL COMMENT 'Hash of location + category + keywords',
  category VARCHAR(100) NOT NULL,
  primary_complaint_id INT NOT NULL COMMENT 'First complaint in cluster',
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(10, 8) NOT NULL,
  keywords TEXT COMMENT 'Common keywords in cluster',
  complaint_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cluster_hash (cluster_hash),
  INDEX idx_location (latitude, longitude),
  INDEX idx_category (category),
  FOREIGN KEY (primary_complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- Complaint Cluster Members (links complaints to clusters)
CREATE TABLE complaint_cluster_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cluster_id INT NOT NULL,
  complaint_id INT NOT NULL,
  similarity_score DECIMAL(3, 2) COMMENT 'Similarity score 0.00-1.00',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cluster_id (cluster_id),
  INDEX idx_complaint_id (complaint_id),
  FOREIGN KEY (cluster_id) REFERENCES complaint_clusters(id) ON DELETE CASCADE,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  UNIQUE KEY unique_complaint_cluster (complaint_id, cluster_id)
);

-- SLA Escalations Table
CREATE TABLE complaint_escalations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  escalation_level INT NOT NULL COMMENT '1=Officer Reminder, 2=Department Head, 3=Commissioner',
  escalated_from VARCHAR(100) COMMENT 'Previous handler',
  escalated_to VARCHAR(100) COMMENT 'New handler',
  reason TEXT,
  hours_elapsed INT COMMENT 'Hours since complaint creation',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_complaint_id (complaint_id),
  INDEX idx_escalation_level (escalation_level),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- SLA Configuration Table
CREATE TABLE sla_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  priority VARCHAR(50) NOT NULL,
  level_1_hours INT NOT NULL COMMENT 'Hours before first reminder',
  level_2_hours INT NOT NULL COMMENT 'Hours before dept head escalation',
  level_3_hours INT NOT NULL COMMENT 'Hours before commissioner escalation',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_priority (priority)
);

-- Insert default SLA configurations
INSERT INTO sla_config (priority, level_1_hours, level_2_hours, level_3_hours) VALUES
('critical', 6, 12, 24),
('high', 24, 48, 72),
('medium', 48, 96, 144),
('low', 72, 144, 216)
ON DUPLICATE KEY UPDATE priority=priority;

-- Officer Assignments Table (tracks which officer is assigned to which complaint)
CREATE TABLE officer_assignments (
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

-- Insert default test user
INSERT INTO users (id, name, email, phone, role, is_active) VALUES 
(1, 'Test Citizen', 'citizen@test.com', '1234567890', 'citizen', TRUE)
ON DUPLICATE KEY UPDATE name=name;
