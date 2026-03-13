# Quick Start: Resolution Images (5 minutes)

## TL;DR - Just Do This

### 1. Apply Migration
```bash
cd backend
node run-migration.js
```

### 2. Start Backend
```bash
cd backend
npm run dev
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

### 4. Test
- Go to http://localhost:5173
- Login as officer
- Select complaint → "Update Status" → "Resolved"
- Upload before/after images
- Click "Submit Resolution"
- Check backend console for logs

---

## What Gets Created

**Database:**
- `complaint_resolutions` table (stores before/after images)
- New columns in `complaints` table

**Files:**
- Images saved to `backend/uploads/resolution-{id}-{before|after}-*.jpg`

**Database Records:**
- Resolution record with image paths
- Complaint status changed to "resolved"

---

## Verify It Works

### Check Database
```sql
SELECT * FROM complaint_resolutions;
```

### Check Files
```bash
ls -la backend/uploads/
# Should see: resolution-1-before-*.jpg, resolution-1-after-*.jpg
```

### Check Citizen View
- Login as citizen
- Go to "My Complaints"
- Click resolved complaint
- Should see before/after images

### Check Admin View
- Login as admin
- Go to "Admin Dashboard"
- Should see resolved complaints with images

---

## Logs to Expect

When you submit a resolution, backend console should show:

```
=== RESOLVE COMPLAINT DEBUG ===
Complaint ID: 1
Officer ID: 2
Before image length: 123456
After image length: 123456
✓ Complaint found: Pothole on Main Street
💾 Saving before image...
✓ Before image saved: /uploads/resolution-1-before-...jpg
💾 Saving after image...
✓ After image saved: /uploads/resolution-1-after-...jpg
📝 Adding resolution record to database...
✓ Resolution record created with ID: 1
✓ Complaint updated with resolution info
✅ Complaint resolved successfully
```

---

## If Something Goes Wrong

### Migration fails
- Check MySQL is running
- Check `.env` has correct DB credentials
- Try again: `node run-migration.js`

### Backend won't start
- Check port 5000 is free
- Check `.env` file exists
- Check `npm install` was run

### Images not saving
- Check `backend/uploads/` directory exists
- Check backend console for error logs
- Check browser DevTools → Network tab for API response

### Database shows NULL
- Run migration again: `node run-migration.js`
- Verify tables exist: `SHOW TABLES LIKE 'complaint_resolutions';`
- Check backend logs for errors

---

## Files to Know

- `backend/run-migration.js` - Run this first
- `backend/controllers/complaintController.js` - Has the resolve logic
- `backend/models/Complaint.js` - Database operations
- `frontend/src/components/OfficerDashboard.jsx` - Upload UI
- `database/add_resolution_images_table.sql` - Migration SQL

---

## That's It!

The feature is fully implemented. Just run the migration and test it out.

For detailed info, see:
- `RESOLUTION_IMAGES_ACTION_PLAN.md` - Step-by-step guide
- `RESOLUTION_IMAGES_SETUP_GUIDE.md` - Complete documentation
- `DEBUG_RESOLUTION_IMAGES.md` - Troubleshooting guide
