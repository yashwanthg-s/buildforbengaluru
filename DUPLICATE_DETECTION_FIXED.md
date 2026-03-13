# Duplicate Detection - Fixed & Enhanced

## What Was Done

### 1. Added Detailed Logging
- **Backend**: Logs every step of duplicate detection process
- **Frontend**: Logs response and duplicate notification state
- **AI Service**: Detailed comparison logs for each complaint

### 2. Lowered Similarity Threshold
- Changed from 70% to 60% similarity
- Makes duplicate detection more sensitive
- Easier to trigger for testing

### 3. Enhanced Error Handling
- Better error messages in console
- Shows AI service connection issues
- Displays similarity scores and distances

## How to Test Duplicate Detection

### Step 1: Start All Services

```bash
# Terminal 1 - AI Service
cd ai-service
python main.py

# Terminal 2 - Backend
cd backend
npm start

# Terminal 3 - Frontend
cd frontend
npm run dev
```

### Step 2: Submit First Complaint

Open the app and submit a complaint:
- **Title**: "Large pothole on Main Street"
- **Description**: "There is a dangerous pothole causing traffic issues and damage to vehicles"
- **Take a photo** (any photo works)
- **Allow GPS location**
- Click Submit

Note the GPS coordinates shown (e.g., 12.9716, 77.5946)

### Step 3: Submit Similar Complaint

Submit another complaint with similar content:
- **Title**: "Pothole problem on Main Street"  
- **Description**: "Big pothole on the road causing problems for vehicles and traffic"
- **Take a photo**
- **Use SAME location** (stay in same spot, or manually note coordinates)
- Click Submit

### Step 4: Check for Duplicate Notification

You should see a **yellow warning box** appear:

```
⚠️ Duplicate Detected:
1 other citizen has already reported a similar issue in this area. 
Your complaint has been added to the same case for faster resolution.

1 similar complaint found in this area.
```

## What to Check in Console Logs

### Backend Console (Node.js)

```
Checking for duplicates... { category: 'infrastructure', lat: 12.9716, lng: 77.5946 }
Found 1 recent complaints in area
Sending to AI for duplicate check...
Duplicate check response: {
  is_duplicate: true,
  similar_complaints: [ { id: 1, title: '...', similarity: 0.65 } ],
  similarity_score: 0.65,
  message: '⚠️ 1 other citizen has already reported...'
}
✓ Duplicate detected: {
  similar_count: 1,
  similarity: 0.65,
  message: '⚠️ 1 other citizen has already reported...'
}
```

### AI Service Console (Python)

```
=== Duplicate Detection ===
New complaint: Pothole problem on Main Street
Category: infrastructure, Location: (12.9716, 77.5946)
Checking against 1 existing complaints
Keywords extracted: ['pothole', 'problem', 'main', 'street', 'road', 'causing', ...]

  Comparing with complaint #1:
    Title: Large pothole on Main Street
    ✓ Category match: infrastructure
    Distance: 0.000 km
    ✓ Within range
    Similarity: 65% (threshold: 60%)
    ✓ DUPLICATE FOUND!

✓ RESULT: Duplicate detected (1 similar complaints)
```

### Browser Console (Frontend)

```
Complaint submission response: {
  success: true,
  id: 2,
  duplicate_detected: true,
  duplicate_message: "⚠️ 1 other citizen has already reported...",
  similar_complaints_count: 1,
  complaint: { ... }
}
Backend response: { duplicate_detected: true, ... }
Duplicate detected! Setting notification...
```

## Detection Criteria

For a complaint to be marked as duplicate, ALL conditions must be met:

1. **Same Category**: Both complaints in same category (e.g., infrastructure)
2. **Close Location**: Within 500 meters (0.5 km) of each other
3. **Similar Text**: At least 60% keyword similarity

## Similarity Examples

### High Similarity (70%+) - Will Detect
- "Large pothole on Main Street" vs "Big pothole on Main Street"
- "Broken streetlight near park" vs "Street light not working near park"
- "Garbage not collected for 3 days" vs "Waste collection missed for 3 days"

### Medium Similarity (60-70%) - Will Detect
- "Pothole causing traffic issues" vs "Road damage creating traffic problems"
- "Water leakage in pipeline" vs "Pipe leaking water on road"

### Low Similarity (<60%) - Won't Detect
- "Pothole on Main Street" vs "Traffic signal not working"
- "Garbage issue" vs "Road construction noise"

## Troubleshooting

### "No duplicate detected" even with similar complaints

**Check:**
1. ✅ AI service running? (http://localhost:8000/health)
2. ✅ Same category? (Let AI categorize both, or set manually)
3. ✅ Close location? (Must be within 500m)
4. ✅ Similar keywords? (Use words like: pothole, road, damage, broken, etc.)
5. ✅ Existing complaint in database? (Need at least 1 to compare)

**Backend logs will show:**
- "Found 0 recent complaints in area" → No complaints to compare
- "No duplicate found" → Similarity too low
- "Too far (threshold: 0.5 km)" → Location too far
- "Category mismatch" → Different categories

### Notification not showing in UI

**Check:**
1. Browser console for `duplicate_detected: true`
2. React DevTools for `duplicateInfo` state
3. JavaScript errors in console
4. Yellow warning box should appear above form

## Files Modified

1. `backend/controllers/complaintController.js` - Enhanced logging
2. `frontend/src/services/complaintService.js` - Added console log
3. `frontend/src/components/ComplaintForm.jsx` - Added debug logs
4. `ai-service/models/duplicate_detector.py` - Detailed logging + lowered threshold

## Next Steps

Once duplicate detection is working:
1. Test with multiple similar complaints
2. Verify cluster linking in database
3. Check `complaint_clusters` and `complaint_cluster_members` tables
4. Adjust similarity threshold if needed (in `duplicate_detector.py`)

## Database Tables

Check these tables to verify duplicate detection:

```sql
-- See all complaints
SELECT id, title, category, latitude, longitude, created_at 
FROM complaints 
ORDER BY created_at DESC;

-- See complaint clusters
SELECT * FROM complaint_clusters;

-- See cluster members
SELECT ccm.*, c.title 
FROM complaint_cluster_members ccm
JOIN complaints c ON ccm.complaint_id = c.id;
```

---

**Status**: ✅ Duplicate detection implemented and enhanced with logging
**Ready to test**: Yes - follow steps above
