# Simple Migration Guide - Officer Resolution Images

## The Problem
MySQL access denied error when running migration with information_schema queries.

## The Solution
Use the simplified migration file that only does direct table operations.

## How to Run

### Option 1: TablePlus (Easiest)
1. Open TablePlus
2. Connect to your MySQL database
3. Open file: `database/add_resolution_images_table.sql`
4. Click "Execute" button (or Cmd+Enter)
5. Wait for "Migration completed!" message

### Option 2: MySQL CLI
```bash
mysql -u root -p complaint_system < database/add_resolution_images_table.sql
```
Then enter your password when prompted.

### Option 3: MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. File → Open SQL Script
4. Select: `database/add_resolution_images_table.sql`
5. Click Execute (lightning bolt icon)

### Option 4: phpMyAdmin
1. Login to phpMyAdmin
2. Select database: `complaint_system`
3. Click "SQL" tab
4. Copy-paste the SQL from `database/add_resolution_images_table.sql`
5. Click "Go"

## What the Migration Does

1. **Adds 3 columns to complaints table:**
   - `resolution_id` - Links to resolution record
   - `resolved_by` - Officer ID who resolved it
   - `resolved_at` - When it was resolved

2. **Creates complaint_resolutions table:**
   - Stores before/after images
   - Stores resolution notes
   - Tracks officer and timestamp

3. **Adds indexes** for fast queries

## Verification

After running, check if it worked:

```sql
-- Check if columns were added
DESCRIBE complaints;
-- Should show: resolution_id, resolved_by, resolved_at

-- Check if table was created
SHOW TABLES LIKE 'complaint_resolutions';
-- Should show: complaint_resolutions

-- Check table structure
DESCRIBE complaint_resolutions;
```

## Expected Result

```
+------------------------+
| Tables_in_complaint_system |
+------------------------+
| complaint_resolutions  |
+------------------------+

Field              | Type         | Null | Key
---------------------------------------------------
id                 | int          | NO   | PRI
complaint_id       | int          | NO   | MUL
officer_id         | int          | YES  | MUL
before_image_path  | varchar(500) | YES  |
after_image_path   | varchar(500) | YES  |
resolution_notes   | longtext     | YES  |
resolved_at        | timestamp    | NO   |
created_at         | timestamp    | NO   |
```

## If It Fails

### Error: "Table already exists"
- The migration uses `CREATE TABLE IF NOT EXISTS`
- Just run it again, it will skip existing tables

### Error: "Column already exists"
- The migration uses `ADD COLUMN IF NOT EXISTS`
- Just run it again, it will skip existing columns

### Error: "Foreign key constraint"
- Make sure `users` and `complaints` tables exist
- Run the main schema first: `mysql -u root -p < database/schema.sql`

### Error: "Access denied"
- Use a user with CREATE/ALTER permissions
- Try with root: `mysql -u root -p`

## Next Steps

1. ✅ Run the migration
2. ✅ Verify tables were created
3. ✅ Restart backend: `npm run dev`
4. ✅ Test officer resolution feature

## Files

- **Migration file**: `database/add_resolution_images_table.sql`
- **Alternative**: `database/add_resolution_images_table_safe.sql` (same thing)

## That's It!

The migration is now simple and should work without permission issues. Just run it and you're done!
