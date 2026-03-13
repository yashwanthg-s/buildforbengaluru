# Setup Officer Resolution Images Feature

## Quick Setup Guide

### Step 1: Run Database Migration

Execute the SQL migration to create the new table and columns:

```bash
# Using MySQL CLI
mysql -u root -p complaint_system < database/add_resolution_images_table.sql

# Or using TablePlus/MySQL Workbench
# Open database/add_resolution_images_table.sql and execute
```

### Step 2: Verify Database Changes

Check that the new table was created:

```sql
-- Check if table exists
SHOW TABLES LIKE 'complaint_resolutions';

-- Check table structure
DESCRIBE complaint_resolutions;

-- Check new columns in complaints table
DESCRIBE complaints;
-- Should show: resolution_id, resolved_by, resolved_at
```

### Step 3: Restart Backend Server

The backend code is already updated. Just restart:

```bash
cd backend
npm start
```

### Step 4: Test the Feature

1. **Login as Officer**: Use officer credentials
2. **View Assigned Complaints**: Should see complaints in Officer Dashboard
3. **Select a Complaint**: Click on any complaint to view details
4. **Change Status to "Resolved"**: Select "Resolved" from status dropdown
5. **Click "Upload Resolution Images"**: Button appears when "Resolved" is selected
6. **Upload Before Image**: Select image showing the issue
7. **Upload After Image**: Select image showing the resolved issue
8. **Add Notes** (optional): Describe what was done
9. **Click "Submit Resolution"**: 
   - Images are uploaded
   - Resolution record is created
   - Complaint status changes to "resolved"
   - Citizen is notified

### Step 5: Verify in Database

Check that resolution was saved:

```sql
-- View all resolutions
SELECT * FROM complaint_resolutions;

-- View specific complaint with resolution
SELECT c.id, c.title, c.status, cr.before_image_path, cr.after_image_path, cr.resolution_notes
FROM complaints c
LEFT JOIN complaint_resolutions cr ON c.id = cr.complaint_id
WHERE c.id = 1;
```

## File Structure

```
backend/
├── controllers/
│   └── complaintController.js (updated with resolveComplaint method)
├── models/
│   └── Complaint.js (updated with addResolution, getResolution methods)
├── routes/
│   └── complaints.js (updated with /resolve endpoint)
└── uploads/
    └── resolution-*.jpg (new resolution images)

frontend/
├── components/
│   └── OfficerDashboard.jsx (updated with resolution image upload UI)
└── styles/
    └── OfficerDashboard.css (updated with resolution form styles)

database/
└── add_resolution_images_table.sql (new migration file)
```

## API Endpoint

**POST** `/api/complaints/:id/resolve`

Example request:
```javascript
const formData = new FormData();
formData.append('officer_id', 2);
formData.append('before_image', beforeImageBase64);
formData.append('after_image', afterImageBase64);
formData.append('resolution_notes', 'Fixed the issue');

fetch(`http://localhost:5000/api/complaints/1/resolve`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    officer_id: 2,
    before_image: beforeImageBase64,
    after_image: afterImageBase64,
    resolution_notes: 'Fixed the issue'
  })
});
```

## Troubleshooting

### Images not saving
- Check that `/backend/uploads` directory exists and is writable
- Check file permissions: `chmod 755 backend/uploads`
- Check disk space availability

### Database migration fails
- Ensure MySQL is running
- Check database credentials in `.env`
- Verify you're connected to the correct database

### Officer can't see "Upload Resolution Images" button
- Make sure status is set to "Resolved"
- Check browser console for JavaScript errors
- Verify backend is running and accessible

### Images not showing in citizen notification
- Check that image paths are correct in database
- Verify images exist in `/backend/uploads` directory
- Check that frontend is using correct image URLs

## Next Steps

1. **Citizen Notification**: Update notification system to include resolution images
2. **Admin Dashboard**: Add view to see resolution images for quality assurance
3. **Citizen History**: Show resolution images in citizen's complaint history
4. **Image Validation**: Add validation to ensure images are actually different (before vs after)
5. **SLA Tracking**: Track time from complaint to resolution with images

## Security Notes

- Images are stored on server disk with unique filenames
- Officer ID is tracked for accountability
- Resolution timestamp is automatically recorded
- Consider adding image compression to save disk space
- Consider adding image encryption for sensitive issues
