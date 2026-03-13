# Resolution Images Setup Guide

## Overview
This guide walks you through setting up and testing the officer resolution images feature (before/after work documentation).

## What This Feature Does
- Officers can upload **before** and **after** images when resolving complaints
- Images are saved to disk and database
- Citizens can see the before/after images in their complaint history
- Admins can review resolutions in the admin dashboard

---

## Quick Start (5 minutes)

### 1. Apply Database Migration

**Option A: Using Node.js (Recommended)**
```bash
cd backend
node run-migration.js
```

**Option B: Using TablePlus**
1. Open TablePlus
2. Connect to `complaint_system` database
3. Click SQL button
4. Copy content from `database/add_resolution_images_table.sql`
5. Click Execute

**Option C: Using MySQL CLI**
```bash
mysql -u root complaint_system < database/add_resolution_images_table.sql
```

### 2. Verify Migration

```bash
cd backend
node -e "
const pool = require('./config/database');
(async () => {
  const conn = await pool.getConnection();
  const [tables] = await conn.execute(\"SHOW TABLES LIKE 'complaint_resolutions'\");
  console.log(tables.length > 0 ? '✓ Tables created' : '✗ Tables missing');
  conn.release();
  process.exit(0);
})();
"
```

### 3. Start Backend & Frontend

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Test the Feature

1. Open http://localhost:5173
2. Login as an officer
3. Select a complaint
4. Click "Update Status" → Select "Resolved"
5. Click "Upload Resolution Images"
6. Upload before and after images
7. Click "Submit Resolution"

---

## Detailed Setup

### Database Schema

The migration creates/updates:

**1. New columns in `complaints` table:**
- `resolution_id` (INT) - Links to complaint_resolutions table
- `resolved_by` (INT) - Officer ID who resolved it
- `resolved_at` (TIMESTAMP) - When it was resolved

**2. New `complaint_resolutions` table:**
```sql
CREATE TABLE complaint_resolutions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  officer_id INT,
  before_image_path VARCHAR(500),
  after_image_path VARCHAR(500),
  resolution_notes TEXT,
  resolved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### Backend Implementation

**Endpoint:** `POST /api/complaints/:id/resolve`

**Request Body:**
```json
{
  "officer_id": 2,
  "before_image": "data:image/jpeg;base64,...",
  "after_image": "data:image/jpeg;base64,...",
  "resolution_notes": "Fixed the pothole with asphalt"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Complaint resolved successfully",
  "resolution_id": 1,
  "before_image_path": "/uploads/resolution-1-before-1234567890-123456789.jpg",
  "after_image_path": "/uploads/resolution-1-after-1234567890-123456789.jpg"
}
```

**Files:**
- `backend/controllers/complaintController.js` - `resolveComplaint()` method
- `backend/models/Complaint.js` - `addResolution()` method
- `backend/routes/complaints.js` - Route registration

### Frontend Implementation

**Officer Dashboard:**
- File: `frontend/src/components/OfficerDashboard.jsx`
- Shows 3-step workflow:
  1. Upload before image
  2. Upload after image
  3. Add optional notes
- Converts images to base64 before sending
- Sends to `/api/complaints/:id/resolve` endpoint

**Citizen History:**
- File: `frontend/src/components/CitizenHistory.jsx`
- Displays before/after images for resolved complaints
- Shows resolution notes

**Admin Dashboard:**
- File: `frontend/src/components/AdminDashboard.jsx`
- Shows resolved complaints with before/after images
- Can review officer work

---

## Testing

### Test 1: Database Migration

```bash
cd backend
node run-migration.js
```

Expected output:
```
✅ Migration completed successfully!
✓ complaint_resolutions table exists
✓ resolution_id column: ✓
✓ resolved_by column: ✓
✓ resolved_at column: ✓
```

### Test 2: Endpoint Test

```bash
cd backend
node test-resolution-endpoint.js
```

Expected output:
```
✅ Test PASSED - Resolution created successfully!
   Resolution ID: 1
   Before image: /uploads/resolution-1-before-...jpg
   After image: /uploads/resolution-1-after-...jpg
```

### Test 3: Manual UI Test

1. Start backend: `npm run dev` (in backend)
2. Start frontend: `npm run dev` (in frontend)
3. Login as officer
4. Select a complaint
5. Click "Update Status" → "Resolved"
6. Upload before and after images
7. Click "Submit Resolution"
8. Check database: `SELECT * FROM complaint_resolutions;`

### Test 4: Verify Images in Database

```sql
-- Check resolutions
SELECT * FROM complaint_resolutions;

-- Check complaint status
SELECT id, status, resolution_id, resolved_by, resolved_at 
FROM complaints 
WHERE status = 'resolved';

-- Check image files exist
-- Look in: backend/uploads/
-- Files should be: resolution-{id}-before-*.jpg, resolution-{id}-after-*.jpg
```

---

## Troubleshooting

### Issue: "Cannot find module 'base64-js'"
**Status:** ✅ FIXED
- The code now uses Node.js built-in `Buffer` instead

### Issue: "Foreign key constraint is incorrectly formed"
**Status:** ✅ FIXED
- Migration file now uses proper InnoDB syntax

### Issue: "Access denied for user 'root'@'localhost' to database 'information_schema'"
**Status:** ✅ FIXED
- Migration no longer queries information_schema

### Issue: Migration fails with "Table already exists"
**Solution:** The migration uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times

### Issue: Images not saving to database
**Checklist:**
- [ ] Migration applied? Run `node run-migration.js`
- [ ] Backend running? Check console for errors
- [ ] Images being sent? Check browser DevTools → Network tab
- [ ] Database connection working? Check `.env` file
- [ ] Uploads directory exists? Check `backend/uploads/`

### Issue: "Complaint not found" error
**Solution:** Make sure complaint ID exists and is in "under_review" status

### Issue: Images saved but showing NULL in database
**Possible causes:**
1. Migration not applied
2. Database connection issue
3. SQL query failing silently

**Debug:**
1. Check if `complaint_resolutions` table exists: `SHOW TABLES LIKE 'complaint_resolutions';`
2. Check if columns exist: `DESCRIBE complaints;`
3. Add console.log in `resolveComplaint()` method
4. Check backend logs for errors

---

## File Structure

```
backend/
├── controllers/
│   └── complaintController.js (resolveComplaint method)
├── models/
│   └── Complaint.js (addResolution method)
├── routes/
│   └── complaints.js (POST /:id/resolve route)
├── uploads/ (where images are saved)
├── run-migration.js (migration runner)
└── test-resolution-endpoint.js (endpoint tester)

frontend/
├── components/
│   ├── OfficerDashboard.jsx (upload UI)
│   ├── CitizenHistory.jsx (view resolutions)
│   └── AdminDashboard.jsx (review resolutions)
└── styles/
    └── OfficerDashboard.css

database/
└── add_resolution_images_table.sql (migration file)
```

---

## Next Steps

1. ✅ Apply migration: `node backend/run-migration.js`
2. ✅ Test endpoint: `node backend/test-resolution-endpoint.js`
3. ✅ Test UI: Upload images through officer dashboard
4. ✅ Verify database: Check `complaint_resolutions` table
5. ✅ Check citizen view: See images in citizen history
6. ✅ Check admin view: See resolutions in admin dashboard

---

## Support

If you encounter issues:

1. Check `DEBUG_RESOLUTION_IMAGES.md` for detailed debugging steps
2. Review backend console logs: `npm run dev`
3. Check browser DevTools → Network tab for API requests
4. Verify database tables: `SHOW TABLES;` and `DESCRIBE complaint_resolutions;`
5. Check file system: `ls -la backend/uploads/`

---

## Feature Checklist

- [x] Database migration created
- [x] Backend endpoint implemented
- [x] Frontend officer dashboard UI
- [x] Frontend citizen history display
- [x] Frontend admin dashboard display
- [x] Image saving to disk
- [x] Image saving to database
- [x] Error handling
- [x] Migration runner script
- [x] Endpoint test script
- [x] Debugging guide

All components are ready to use!
