# Quick Reference - Officer Resolution Images

## What's New?

Officers must upload **before and after images** when resolving complaints.

## For Officers

### How to Resolve a Complaint

1. **Open Officer Dashboard** → View assigned complaints
2. **Select a Complaint** → Click to view details
3. **Change Status to "Resolved"** → Select from dropdown
4. **Click "📸 Upload Resolution Images"** → New button appears
5. **Upload Before Image** → Photo showing the issue
6. **Upload After Image** → Photo showing it's fixed
7. **Add Notes** (optional) → Describe what was done
8. **Click "Submit Resolution"** → Done!

### Requirements

- ✅ Both images are **mandatory**
- ✅ Before image must show the issue
- ✅ After image must show the resolution
- ✅ Images must be actual photos (not screenshots)
- ✅ Notes are optional but recommended

## For Citizens

### How to View Resolution

1. **Open My Complaint History**
2. **Click on a Resolved Complaint**
3. **Scroll to "✅ Resolution Proof"** section
4. **See Before Image** → The original issue
5. **See After Image** → How it was fixed
6. **Read Resolution Notes** → What officer did

## Database

### New Table
```
complaint_resolutions
├── id (primary key)
├── complaint_id (links to complaint)
├── officer_id (who resolved it)
├── before_image_path (issue photo)
├── after_image_path (fixed photo)
├── resolution_notes (description)
└── resolved_at (timestamp)
```

### New Columns in complaints
```
├── resolution_id (links to resolution)
├── resolved_by (officer ID)
└── resolved_at (when resolved)
```

## API Endpoint

```
POST /api/complaints/:id/resolve

Body:
{
  "officer_id": 2,
  "before_image": "base64_string",
  "after_image": "base64_string",
  "resolution_notes": "Fixed the issue"
}

Response:
{
  "success": true,
  "resolution_id": 1,
  "before_image_path": "/uploads/resolution-123-before-xxx.jpg",
  "after_image_path": "/uploads/resolution-123-after-xxx.jpg"
}
```

## Files Changed

### Backend
- `backend/models/Complaint.js` - Added resolution methods
- `backend/controllers/complaintController.js` - Added resolve endpoint
- `backend/routes/complaints.js` - Added resolve route

### Frontend
- `frontend/src/components/OfficerDashboard.jsx` - Added image upload UI
- `frontend/src/components/CitizenHistory.jsx` - Added resolution display
- `frontend/src/styles/OfficerDashboard.css` - Added upload styles
- `frontend/src/styles/CitizenHistory.css` - Added display styles

### Database
- `database/add_resolution_images_table.sql` - New migration

## Setup

```bash
# 1. Run migration
mysql -u root -p complaint_system < database/add_resolution_images_table.sql

# 2. Restart backend
cd backend && npm start

# 3. Test in browser
# Login as officer → Resolve a complaint → Upload images
```

## Key Points

| Aspect | Details |
|--------|---------|
| **Who** | Officers only |
| **When** | When resolving complaints |
| **What** | Before and after images |
| **Why** | Prevent fake resolutions, provide proof |
| **Where** | Officer Dashboard → Resolve section |
| **How** | Upload files, add notes, submit |
| **Visibility** | Citizens see in complaint history |

## Validation

- ✅ Both images required
- ✅ Images must be valid files
- ✅ Officer ID must be valid
- ✅ Complaint must exist
- ✅ Status must be "resolved"

## Error Handling

| Error | Solution |
|-------|----------|
| "Both images required" | Upload before and after images |
| "Officer ID invalid" | Check officer login |
| "Complaint not found" | Refresh and try again |
| "Image save failed" | Check disk space and permissions |
| "Database error" | Check MySQL connection |

## Testing

```javascript
// Test endpoint with curl
curl -X POST http://localhost:5000/api/complaints/1/resolve \
  -H "Content-Type: application/json" \
  -d '{
    "officer_id": 2,
    "before_image": "data:image/jpeg;base64,...",
    "after_image": "data:image/jpeg;base64,...",
    "resolution_notes": "Fixed the issue"
  }'
```

## Performance

- Images stored on disk (not database)
- Unique filenames prevent conflicts
- Base64 adds ~33% size overhead
- Consider compression for large files

## Security

- Officer ID tracked for accountability
- Timestamp recorded automatically
- Images stored with restricted access
- Audit trail created for each resolution

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Upload button not showing | Select "Resolved" status first |
| Images not saving | Check `/backend/uploads` permissions |
| Citizens can't see images | Verify image paths in database |
| Database error | Run migration: `add_resolution_images_table.sql` |

## Next Steps

1. ✅ Run database migration
2. ✅ Restart backend server
3. ✅ Test officer resolution flow
4. ✅ Test citizen view flow
5. ✅ Monitor image storage usage
6. ✅ Consider image compression
7. ✅ Add admin review dashboard
8. ✅ Track SLA compliance

## Support

For issues:
1. Check browser console for errors
2. Check backend logs
3. Verify database migration ran
4. Check file permissions on `/backend/uploads`
5. Verify MySQL connection
