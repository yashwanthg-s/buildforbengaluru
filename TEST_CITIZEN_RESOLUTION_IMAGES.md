# Test: Citizen Seeing Resolution Images

## Quick Test (5 minutes)

### Step 1: Restart Backend
```bash
cd backend
npm run dev
```

You should see:
```
Server running on port 5000
Environment: development
```

### Step 2: Open Frontend
Go to http://localhost:5173

### Step 3: Login as Citizen
- Use your citizen account credentials
- Or create a new citizen account

### Step 4: Go to "My History"
- Click "My History" button in the top right

### Step 5: Select a Resolved Complaint
- Look for a complaint with status "✅ RESOLVED"
- Click on it

### Step 6: Check for Resolution Images
You should see:

```
✅ Resolution Proof

Officer has provided before and after images showing the resolution

[BEFORE IMAGE]          [AFTER IMAGE]
[Image showing issue]   [Image showing fixed]

Resolution Notes
Fixed the pothole with asphalt
```

If you see this, the fix is working! ✅

---

## Detailed Test

### Test Case 1: Resolved Complaint with Images

**Setup:**
1. Officer has resolved a complaint with before/after images
2. Citizen is viewing their complaint history

**Expected Result:**
- Complaint shows status: "✅ RESOLVED"
- "Resolution Proof" section displays
- Before image shows
- After image shows
- Resolution notes show (if provided)

**How to Verify:**
1. Login as citizen
2. Go to "My History"
3. Click on resolved complaint
4. Check if images display

### Test Case 2: Unresolved Complaint

**Setup:**
1. Complaint is still "SUBMITTED" or "UNDER_REVIEW"
2. Citizen is viewing their complaint history

**Expected Result:**
- No "Resolution Proof" section
- Only shows original complaint image

**How to Verify:**
1. Login as citizen
2. Go to "My History"
3. Click on unresolved complaint
4. Should NOT see "Resolution Proof" section

### Test Case 3: Multiple Resolved Complaints

**Setup:**
1. Citizen has multiple resolved complaints
2. Some with images, some without

**Expected Result:**
- Each resolved complaint shows its own before/after images
- Images are correctly matched to each complaint

**How to Verify:**
1. Login as citizen
2. Go to "My History"
3. Click through multiple resolved complaints
4. Verify each shows correct images

---

## Database Verification

### Check if Resolution Data Exists

```sql
-- Check complaint_resolutions table
SELECT * FROM complaint_resolutions;

-- Check if complaints have resolution_id
SELECT id, title, status, resolution_id, before_image_path, after_image_path 
FROM complaints 
WHERE status = 'resolved';

-- Check the JOIN query
SELECT c.id, c.title, c.status, 
       cr.before_image_path, cr.after_image_path, cr.resolution_notes
FROM complaints c 
LEFT JOIN complaint_resolutions cr ON c.id = cr.complaint_id 
WHERE c.status = 'resolved';
```

---

## Browser DevTools Check

### Check Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Go to "My History" in the app
4. Click on a resolved complaint
5. Look for API request to `/api/complaints` or `/api/complaints/:id`
6. Check Response tab
7. Should see `before_image_path` and `after_image_path` fields

**Expected Response:**
```json
{
  "success": true,
  "complaint": {
    "id": 1,
    "title": "Pothole on Main Street",
    "status": "resolved",
    "resolution_id": 1,
    "before_image_path": "/uploads/resolution-1-before-1234567890-123456789.jpg",
    "after_image_path": "/uploads/resolution-1-after-1234567890-123456789.jpg",
    "resolution_notes": "Fixed the pothole with asphalt",
    ...
  }
}
```

### Check Console for Errors

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any red error messages
4. Should be no errors related to image loading

---

## Troubleshooting

### Issue: Images Still Not Showing

**Check 1: Backend Restarted?**
- Did you restart the backend after the fix?
- Run: `npm run dev` in backend folder

**Check 2: Database Has Resolution Data?**
- Run: `SELECT * FROM complaint_resolutions;`
- Should show at least one record

**Check 3: Images Exist on Disk?**
- Check: `backend/uploads/` directory
- Should see files like: `resolution-1-before-*.jpg`

**Check 4: API Response Has Image Paths?**
- Open DevTools → Network tab
- Check API response for `before_image_path` and `after_image_path`
- Should not be NULL

### Issue: "Resolution Proof" Section Not Showing

**Check 1: Complaint Status is "resolved"?**
- In "My History", complaint should show "✅ RESOLVED"
- If not, officer hasn't resolved it yet

**Check 2: Complaint Has resolution_id?**
- Run: `SELECT resolution_id FROM complaints WHERE id = 1;`
- Should not be NULL

**Check 3: Frontend Code Correct?**
- Check CitizenHistory.jsx
- Should have code to display resolution section

### Issue: Images Load But Show Broken

**Check 1: Image Files Exist?**
- Check: `backend/uploads/` directory
- Files should be: `resolution-{id}-before-*.jpg`

**Check 2: Backend Serving Uploads?**
- Try: `http://localhost:5000/uploads/resolution-1-before-*.jpg`
- Should show the image

**Check 3: Image Path Correct?**
- Check database: `SELECT before_image_path FROM complaint_resolutions;`
- Should be: `/uploads/resolution-1-before-*.jpg`

---

## Success Criteria

✅ **Test Passed If:**
1. Citizen can see "Resolution Proof" section for resolved complaints
2. Before image displays correctly
3. After image displays correctly
4. Resolution notes display (if provided)
5. No console errors
6. API response includes image paths

❌ **Test Failed If:**
1. "Resolution Proof" section doesn't show
2. Images don't load
3. Console shows errors
4. API response missing image paths

---

## Quick Checklist

- [ ] Backend restarted with `npm run dev`
- [ ] Frontend running at http://localhost:5173
- [ ] Logged in as citizen
- [ ] Viewing "My History"
- [ ] Selected a resolved complaint
- [ ] Can see "Resolution Proof" section
- [ ] Before image displays
- [ ] After image displays
- [ ] No console errors
- [ ] Database has resolution data

---

## Next Steps

If test passes:
- ✅ Feature is working!
- Citizens can now see before/after images
- Admins can also see them in admin dashboard

If test fails:
- Check troubleshooting section above
- Verify backend was restarted
- Check database has resolution data
- Check browser console for errors
- Review API response in DevTools

---

## Summary

The fix updates the backend to fetch resolution image paths from the database. Citizens should now see before/after images when viewing resolved complaints.

Test it by:
1. Restart backend
2. Login as citizen
3. Go to "My History"
4. Click on resolved complaint
5. Should see images!
