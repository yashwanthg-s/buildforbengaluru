# Debug: Resolution Images Not Storing in Database

## Problem Summary
Images are NOT being saved to the database when officers resolve complaints. The `before_image_path` and `after_image_path` columns show NULL.

## Root Cause Analysis

The code is correct, but the **migration hasn't been applied to the database**. The `complaint_resolutions` table doesn't exist yet.

## Step 1: Verify Database Tables Exist

Run this in MySQL/TablePlus to check if the tables exist:

```sql
-- Check if complaint_resolutions table exists
SHOW TABLES LIKE 'complaint_resolutions';

-- Check if complaints table has the new columns
DESCRIBE complaints;
```

**Expected output for DESCRIBE complaints:**
- Should show columns: `resolution_id`, `resolved_by`, `resolved_at`

If these columns are missing, proceed to Step 2.

---

## Step 2: Apply the Migration

### Option A: Using TablePlus (Recommended for Windows)

1. Open TablePlus
2. Connect to your `complaint_system` database
3. Click the **SQL** button (or press Cmd+Shift+E)
4. Copy and paste the entire content from `database/add_resolution_images_table.sql`
5. Click **Execute** (or press Cmd+Enter)
6. You should see: "Migration completed!" message

### Option B: Using MySQL Command Line

```bash
cd backend
mysql -u root -p complaint_system < ../database/add_resolution_images_table.sql
```

When prompted for password, press Enter (if no password) or enter your MySQL password.

### Option C: Using Node.js Script

Create a file `backend/run-migration.js`:

```javascript
const pool = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await pool.getConnection();
  try {
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../database/add_resolution_images_table.sql'),
      'utf8'
    );
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await connection.execute(statement);
      }
    }
    
    console.log('✓ Migration completed successfully!');
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runMigration();
```

Then run:
```bash
cd backend
node run-migration.js
```

---

## Step 3: Verify Migration Success

After running the migration, verify the tables exist:

```sql
-- Check complaint_resolutions table
DESCRIBE complaint_resolutions;

-- Check complaints table has new columns
DESCRIBE complaints;

-- Should show these columns in complaints:
-- - resolution_id (INT)
-- - resolved_by (INT)
-- - resolved_at (TIMESTAMP)
```

---

## Step 4: Test the Resolution Endpoint

### Using Postman or curl

1. **Get a complaint ID** - First, get a complaint that's in "under_review" status
2. **Prepare test images** - Convert images to base64 or use sample data

**Test with curl:**

```bash
curl -X POST http://localhost:5000/api/complaints/1/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "officer_id": 2,
    "before_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "after_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "resolution_notes": "Fixed the pothole"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Complaint resolved successfully",
  "resolution_id": 1,
  "before_image_path": "/uploads/resolution-1-before-1234567890-123456789.jpg",
  "after_image_path": "/uploads/resolution-1-after-1234567890-123456789.jpg"
}
```

### Using the Frontend

1. Start the backend: `npm run dev` (in backend folder)
2. Start the frontend: `npm run dev` (in frontend folder)
3. Login as an officer
4. Select a complaint
5. Click "Update Status" → Select "Resolved"
6. Click "Upload Resolution Images"
7. Upload before and after images
8. Click "Submit Resolution"

---

## Step 5: Verify Data in Database

After submitting a resolution, check the database:

```sql
-- Check if resolution was created
SELECT * FROM complaint_resolutions;

-- Check if complaint was updated
SELECT id, status, resolution_id, resolved_by, resolved_at FROM complaints WHERE id = 1;

-- Check if images were saved to disk
-- Look in: backend/uploads/ directory
-- Files should be named: resolution-{complaintId}-{before|after}-{timestamp}-{random}.jpg
```

---

## Step 6: Debugging Checklist

If images still aren't saving, check:

- [ ] **Migration applied?** Run `DESCRIBE complaint_resolutions;` - should show the table
- [ ] **Backend running?** Check console for errors: `npm run dev` in backend folder
- [ ] **Images being sent?** Check browser DevTools → Network tab → POST /api/complaints/{id}/resolve
  - Look at Request body - should have `before_image` and `after_image` as base64 strings
- [ ] **Backend receiving images?** Add console.log in `resolveComplaint()` method
- [ ] **Images being saved to disk?** Check `backend/uploads/` directory
- [ ] **Database insert working?** Check MySQL error logs

---

## Step 7: Add Debugging Logs

If still having issues, add logging to `backend/controllers/complaintController.js`:

In the `resolveComplaint` method, add after line 510:

```javascript
console.log('=== RESOLVE COMPLAINT DEBUG ===');
console.log('Complaint ID:', id);
console.log('Officer ID:', officer_id);
console.log('Before image length:', before_image?.length);
console.log('After image length:', after_image?.length);
console.log('Resolution notes:', resolution_notes);
```

In the `saveResolutionImage` function, add after line 10:

```javascript
console.log('=== SAVE RESOLUTION IMAGE DEBUG ===');
console.log('Image type:', type);
console.log('Image data length:', imageData?.length);
console.log('Complaint ID:', complaintId);
```

Then restart the backend and try uploading again. Check the console output.

---

## Common Issues & Solutions

### Issue: "Cannot find module 'base64-js'"
**Solution**: Already fixed. The code now uses Node.js built-in `Buffer` instead.

### Issue: "Foreign key constraint is incorrectly formed"
**Solution**: Already fixed. The migration file now uses proper InnoDB syntax.

### Issue: "Access denied for user 'root'@'localhost' to database 'information_schema'"
**Solution**: Already fixed. The migration no longer queries information_schema.

### Issue: Images saved but database shows NULL
**Possible causes:**
1. Migration not applied - run Step 2
2. Database connection issue - check `.env` file
3. SQL query failing silently - add error logging

### Issue: "Complaint not found" error
**Solution**: Make sure the complaint ID exists and is in "under_review" status

---

## Next Steps

1. **Run the migration** (Step 2)
2. **Verify tables exist** (Step 3)
3. **Test the endpoint** (Step 4)
4. **Check database** (Step 5)
5. **If still failing**, add debugging logs (Step 7)

Once images are storing correctly, they will automatically display in:
- **Citizen History** - Shows before/after images of resolved complaints
- **Admin Dashboard** - Shows resolution details in the resolved section
