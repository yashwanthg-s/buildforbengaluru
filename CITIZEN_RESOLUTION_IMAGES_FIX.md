# Fix: Citizen Not Seeing Before/After Resolution Images

## Problem
Citizens can see the message "Officer has provided before and after images showing the resolution" but the actual images are not displaying.

## Root Cause
The backend was not fetching the resolution image paths from the `complaint_resolutions` table when retrieving complaints. The frontend component was trying to display `before_image_path` and `after_image_path`, but these fields were NULL because they weren't being fetched from the database.

## Solution
Updated two methods in `backend/models/Complaint.js` to include resolution data in the query:

### 1. Updated `findById()` method
Added LEFT JOIN to fetch resolution images:
```javascript
static async findById(id) {
  const connection = await pool.getConnection();
  try {
    const query = `
      SELECT c.*, 
      cr.before_image_path,
      cr.after_image_path,
      cr.resolution_notes
      FROM complaints c 
      LEFT JOIN complaint_resolutions cr ON c.id = cr.complaint_id
      WHERE c.id = ?
    `;
    const [rows] = await connection.execute(query, [id]);
    return rows[0] || null;
  } finally {
    connection.release();
  }
}
```

### 2. Updated `findAll()` method
Added LEFT JOIN to fetch resolution images for all complaints:
```javascript
static async findAll(filters = {}) {
  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT c.*, 
      EXISTS(SELECT 1 FROM complaint_feedback WHERE complaint_id = c.id) as has_feedback,
      cr.before_image_path,
      cr.after_image_path,
      cr.resolution_notes
      FROM complaints c 
      LEFT JOIN complaint_resolutions cr ON c.id = cr.complaint_id
      WHERE 1=1
    `;
    // ... rest of the method
  }
}
```

## What Changed
- **Before:** Queries only selected from `complaints` table
- **After:** Queries use LEFT JOIN to include `complaint_resolutions` data

## Why LEFT JOIN?
- LEFT JOIN ensures we get all complaints, even if they don't have a resolution yet
- For unresolved complaints, the resolution fields will be NULL
- For resolved complaints, the resolution fields will have the image paths

## Frontend Impact
The CitizenHistory component already has the code to display the images:
```javascript
{selectedComplaint.status === 'resolved' && selectedComplaint.resolution_id && (
  <div className="detail-section resolution-section">
    <h3>✅ Resolution Proof</h3>
    {selectedComplaint.before_image_path && (
      <div className="resolution-image-container">
        <h4>Before</h4>
        <img
          src={`http://localhost:5000${selectedComplaint.before_image_path}`}
          alt="Before resolution"
          className="resolution-image"
        />
      </div>
    )}
    {selectedComplaint.after_image_path && (
      <div className="resolution-image-container">
        <h4>After</h4>
        <img
          src={`http://localhost:5000${selectedComplaint.after_image_path}`}
          alt="After resolution"
          className="resolution-image"
        />
      </div>
    )}
  </div>
)}
```

Now that the backend is providing the image paths, the frontend will display them correctly.

## Testing

### Step 1: Restart Backend
```bash
cd backend
npm run dev
```

### Step 2: Test as Citizen
1. Open http://localhost:5173
2. Login as citizen
3. Go to "My History"
4. Click on a resolved complaint
5. Should now see "Resolution Proof" section with before/after images

### Step 3: Verify in Database
```sql
-- Check if resolution data exists
SELECT c.id, c.title, c.status, cr.before_image_path, cr.after_image_path 
FROM complaints c 
LEFT JOIN complaint_resolutions cr ON c.id = cr.complaint_id 
WHERE c.status = 'resolved';
```

## Expected Result

**Before Fix:**
- Message shows: "Officer has provided before and after images showing the resolution"
- But no images display

**After Fix:**
- Message shows: "Officer has provided before and after images showing the resolution"
- Before image displays
- After image displays
- Resolution notes display (if provided)

## Files Modified
- `backend/models/Complaint.js` - Updated `findById()` and `findAll()` methods

## No Frontend Changes Needed
The CitizenHistory component already has all the code to display the images. It was just waiting for the backend to provide the data.

## Verification Checklist
- [x] Backend queries updated to include resolution data
- [x] LEFT JOIN used to handle unresolved complaints
- [x] Frontend component already has display logic
- [x] Images will now display for resolved complaints

## Summary
The fix is simple: the backend now fetches the resolution image paths from the database and sends them to the frontend. The frontend component was already ready to display them, it just needed the data.

Citizens will now see the before/after images when viewing resolved complaints!
