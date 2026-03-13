-- Officer Categories Assignment Table
-- This table tracks which officers are responsible for which complaint categories

CREATE TABLE IF NOT EXISTS officer_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  officer_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_officer_id (officer_id),
  INDEX idx_category (category),
  INDEX idx_officer_category (officer_id, category),
  FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_officer_category (officer_id, category)
);

-- Insert category assignments for existing officers
-- This will only insert for officers that actually exist in the users table
INSERT INTO officer_categories (officer_id, category, is_active) 
SELECT u.id, 'infrastructure', TRUE
FROM users u
WHERE u.role = 'officer'
LIMIT 1
ON DUPLICATE KEY UPDATE is_active = TRUE;

INSERT INTO officer_categories (officer_id, category, is_active) 
SELECT u.id, 'sanitation', TRUE
FROM users u
WHERE u.role = 'officer'
LIMIT 1 OFFSET 1
ON DUPLICATE KEY UPDATE is_active = TRUE;

INSERT INTO officer_categories (officer_id, category, is_active) 
SELECT u.id, 'traffic', TRUE
FROM users u
WHERE u.role = 'officer'
LIMIT 1 OFFSET 2
ON DUPLICATE KEY UPDATE is_active = TRUE;

INSERT INTO officer_categories (officer_id, category, is_active) 
SELECT u.id, 'safety', TRUE
FROM users u
WHERE u.role = 'officer'
LIMIT 1 OFFSET 3
ON DUPLICATE KEY UPDATE is_active = TRUE;

INSERT INTO officer_categories (officer_id, category, is_active) 
SELECT u.id, 'utilities', TRUE
FROM users u
WHERE u.role = 'officer'
LIMIT 1 OFFSET 4
ON DUPLICATE KEY UPDATE is_active = TRUE;
