# How to Run the Resolution Images Migration

## Problem
The foreign key constraint error occurred because the table creation order or constraint naming was incorrect.

## Solution
The updated migration file now:
1. Adds columns to `complaints` table first
2. Drops the old table if it exists (clean slate)
3. Creates the new table with proper InnoDB engine
4. Uses explicit constraint names
5. Verifies the migration succeeded

## Step-by-Step Instructions

### Option 1: Using MySQL CLI (Recommended)

```bash
# Navigate to project root
cd /path/to/project

# Run the migration
mysql -u root -p complaint_system < database/add_resolution_images_table.sql

# When prompted, enter your MySQL password
```

### Option 2: Using TablePlus

1. Open TablePlus
2. Connect to your MySQL database
3. Open the file: `database/add_resolution_images_table.sql`
4. Click "Execute" or press Cmd+Enter
5. Wait for completion message

### Option 3: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your database
3. File → Open SQL Script → Select `database/add_resolution_images_table.sql`
4. Click the lightning bolt icon to execute
5. Check the output panel for success message

### Option 4: Using phpMyAdmin

1. Login to phpMyAdmin
2. Select database: `complaint_system`
3. Click "SQL" tab
4. Copy and paste the contents of `database/add_resolution_images_table.sql`
5. Click "Go" to execute

## Verification

After running the migration, verify it succeeded:

```sql
-- Check if complaint_resolutions table exists
SHOW TABLES LIKE 'complaint_resolutions';

-- Check table structure
DESCRIBE complaint_resolutions;

-- Check new columns in complaints table
DESCRIBE complaints;
-- Should show: resolution_id, resolved_by, resolved_at

-- Check foreign keys
SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_NAME = 'complaint_resolutions';
```

## Expected Output

```
+------------------------+
| Tables_in_complaint_system |
+------------------------+
| complaint_resolutions  |
+------------------------+

Field              | Type         | Null | Key | Default | Extra
-------------------------------------------------------------------
id                 | int          | NO   | PRI | NULL    | auto_increment
complaint_id       | int          | NO   | MUL | NULL    |
officer_id         | int          | YES  | MUL | NULL    |
before_image_path  | varchar(500) | YES  |     | NULL    |
after_image_path   | varchar(500) | YES  |     | NULL    |
resolution_notes   | longtext     | YES  |     | NULL    |
resolved_at        | timestamp    | NO   |     | CURRENT_TIMESTAMP |
created_at         | timestamp    | NO   |     | CURRENT_TIMESTAMP |
```

## Troubleshooting

### Error: "Table already exists"
- The migration includes `DROP TABLE IF EXISTS` to handle this
- Just run the migration again

### Error: "Foreign key constraint is incorrectly formed"
- Ensure MySQL version is 5.7 or higher
- Check that `users` and `complaints` tables exist
- Verify both tables use InnoDB engine

### Error: "Access denied"
- Check your MySQL username and password
- Ensure user has CREATE/ALTER TABLE permissions
- Try with root user: `mysql -u root -p`

### Error: "Database doesn't exist"
- Run the main schema first: `mysql -u root -p < database/schema.sql`
- Then run this migration

## Rollback (if needed)

If you need to undo the migration:

```sql
-- Drop the new table
DROP TABLE IF EXISTS complaint_resolutions;

-- Remove new columns from complaints table
ALTER TABLE complaints DROP COLUMN IF EXISTS resolution_id;
ALTER TABLE complaints DROP COLUMN IF EXISTS resolved_by;
ALTER TABLE complaints DROP COLUMN IF EXISTS resolved_at;

-- Remove indexes
ALTER TABLE complaints DROP INDEX IF EXISTS idx_resolution_id;
ALTER TABLE complaints DROP INDEX IF EXISTS idx_resolved_by;
ALTER TABLE complaints DROP INDEX IF EXISTS idx_resolved_at;
```

## Next Steps

1. ✅ Run the migration
2. ✅ Verify tables were created
3. ✅ Restart backend server: `cd backend && npm start`
4. ✅ Test the feature in Officer Dashboard
5. ✅ Upload before/after images when resolving a complaint

## Database Schema After Migration

```
complaint_resolutions
├── id (PK, auto-increment)
├── complaint_id (FK → complaints.id)
├── officer_id (FK → users.id)
├── before_image_path (VARCHAR 500)
├── after_image_path (VARCHAR 500)
├── resolution_notes (TEXT)
├── resolved_at (TIMESTAMP)
└── created_at (TIMESTAMP)

complaints (updated)
├── ... existing columns ...
├── resolution_id (INT, new)
├── resolved_by (INT, new)
└── resolved_at (TIMESTAMP, new)
```

## Performance Notes

- Indexes added on complaint_id, officer_id, resolved_at for fast queries
- Foreign keys ensure referential integrity
- InnoDB engine provides transaction support
- CASCADE delete ensures orphaned records are cleaned up

## Security Notes

- Officer ID is tracked for accountability
- Timestamps are automatically recorded
- Foreign key constraints prevent invalid data
- Images stored separately from database

## Support

If you encounter issues:
1. Check MySQL version: `SELECT VERSION();`
2. Check table engines: `SHOW CREATE TABLE complaints;`
3. Check user permissions: `SHOW GRANTS FOR 'root'@'localhost';`
4. Review MySQL error log for detailed error messages
