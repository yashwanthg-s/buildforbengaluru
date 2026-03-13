-- Migration: Add is_read column to complaint_updates table
-- Run this if you already have the complaint_updates table created

USE complaint_system;

-- Add is_read column if it doesn't exist
ALTER TABLE complaint_updates 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE AFTER new_status;

-- Add index for better query performance
ALTER TABLE complaint_updates 
ADD INDEX IF NOT EXISTS idx_is_read (is_read);

-- Set all existing notifications as unread
UPDATE complaint_updates SET is_read = FALSE WHERE is_read IS NULL;

SELECT 'Migration completed: is_read column added to complaint_updates table' AS status;
