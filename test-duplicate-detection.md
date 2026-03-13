# Testing Duplicate Detection

## Steps to Test

1. **Ensure AI Service is Running**
   ```bash
   cd ai-service
   python main.py
   ```
   Should see: "Uvicorn running on http://0.0.0.0:8000"

2. **Ensure Backend is Running**
   ```bash
   cd backend
   npm start
   ```
   Should see: "Server running on port 5000"

3. **Test Duplicate Detection Flow**

   a. Submit first complaint with these details:
   - Title: "Large pothole on Main Street"
   - Description: "There is a dangerous pothole causing traffic issues"
   - Category: infrastructure (or let AI detect)
   - Location: Use your current GPS location

   b. Submit second complaint (similar):
   - Title: "Pothole problem on Main Street"
   - Description: "Big pothole on the road causing problems for vehicles"
   - Category: infrastructure
   - Location: Use the SAME or very close GPS location (within 500m)

4. **Check Console Logs**

   **Backend Console** should show:
   ```
   Checking for duplicates... { category: 'infrastructure', lat: X, lng: Y }
   Found N recent complaints in area
   Sending to AI for duplicate check...
   Duplicate check response: { is_duplicate: true, ... }
   ✓ Duplicate detected: { similar_count: 1, similarity: 0.75, message: '...' }
   ```

   **Browser Console** should show:
   ```
   Complaint submission response: {
     success: true,
     id: X,
     duplicate_detected: true,
     duplicate_message: "⚠️ 1 other citizen has already reported...",
     similar_complaints_count: 1
   }
   Backend response: { duplicate_detected: true, ... }
   Duplicate detected! Setting notification...
   ```

   **Frontend UI** should display:
   - Yellow warning box with "⚠️ Duplicate Detected:"
   - Message about similar complaints
   - Count of similar complaints

## Troubleshooting

### Issue: No duplicate detected even with similar complaints

**Possible causes:**

1. **AI Service not running**
   - Check if http://localhost:8000/health responds
   - Backend logs will show: "Duplicate check failed: connect ECONNREFUSED"

2. **Complaints too different**
   - Similarity threshold is 70%
   - Try using more similar keywords: "pothole", "road", "damage"
   - Check backend logs for similarity score

3. **Location too far**
   - Complaints must be within 500m (0.5km)
   - Use same GPS coordinates for testing

4. **Different categories**
   - Complaints must be in same category
   - Let AI categorize both, or manually set same category

5. **No existing complaints in database**
   - Need at least 1 existing complaint to detect duplicates
   - Submit first complaint, then submit similar one

### Issue: Duplicate notification not showing in UI

**Check:**
1. Browser console for response object
2. Does response have `duplicate_detected: true`?
3. Check React state in DevTools
4. Look for JavaScript errors in console

### Manual API Test

Test the AI duplicate detection directly:

```bash
# Test with curl (if AI service is running)
curl -X POST http://localhost:8000/check-duplicate \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pothole on Main Street",
    "description": "Large pothole causing traffic issues",
    "category": "infrastructure",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "existing_complaints": [
      {
        "id": 1,
        "title": "Road damage on Main Street",
        "description": "Big pothole on the road",
        "category": "infrastructure",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "created_at": "2026-03-12"
      }
    ]
  }'
```

Expected response:
```json
{
  "is_duplicate": true,
  "similar_complaints": [...],
  "cluster_hash": "...",
  "similarity_score": 0.75,
  "message": "⚠️ 1 other citizen has already reported...",
  "keywords": [...]
}
```

## Current Status

✅ Backend code implemented
✅ Frontend UI implemented
✅ AI duplicate detector implemented
✅ Database tables created
✅ Logging added for debugging

🔍 Need to verify:
- AI service is running
- Similar complaints exist in database
- Response is reaching frontend correctly
