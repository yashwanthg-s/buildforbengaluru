-- Simple Migration: Add resolution images table and columns
-- No information_schema queries - just direct table operations

USE complaint_system;

-- Step 1: Add columns to complaints table
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS resolution_id INT AFTER status;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS resolved_by INT AFTER resolution_id;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP NULL AFTER resolved_by;

-- Step 2: Add indexes for new columns
ALTER TABLE complaints ADD INDEX IF NOT EXISTS idx_resolution_id (resolution_id);
ALTER TABLE complaints ADD INDEX IF NOT EXISTS idx_resolved_by (resolved_by);
ALTER TABLE complaints ADD INDEX IF NOT EXISTS idx_resolved_at (resolved_at);

-- Step 3: Create complaint_resolutions table
CREATE TABLE IF NOT EXISTS complaint_resolutions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  officer_id INT,
  before_image_path VARCHAR(500),
  after_image_path VARCHAR(500),
  resolution_notes TEXT,
  resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_complaint_id (complaint_id),
  INDEX idx_officer_id (officer_id),
  INDEX idx_resolved_at (resolved_at),
  CONSTRAINT fk_resolution_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  CONSTRAINT fk_resolution_officer FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Done
SELECT 'Migration completed!' as status;
