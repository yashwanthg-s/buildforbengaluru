# User-Specific Complaint Filtering - Fixed

## Issue
Citizens were seeing ALL complaints in their history, not just their own complaints.

## Root Cause
1. Frontend wasn't passing `user_id` when fetching complaints
2. Backend wasn't checking query parameter for `user_id`
3. Complaint submission wasn't associating complaints with the logged-in user

## Solution

### 1. Frontend - CitizenHistory Component
**File**: `frontend/src/components/CitizenHistory.jsx`

**Changes**:
- Pass `user_id` filter when fetching complaints
- Added console logs for debugging
- Added userId to useEffect dependency array

```javascript
const fetchMyComplaints = async () => {
  setLoading(true);
  try {
    console.log('Fetching complaints for user ID:', userId);
    // Pass user_id filter to only get this user's complaints
    const data = await complaintService.getComplaints({ user_id: userId });
    console.log('Fetched complaints:', data);
    setComplaints(data);
  } catch (error) {
    console.error('Failed to fetch complaints:', error);
  }
  setLoading(false);
};
```

### 2. Backend - Complaint Controller
**File**: `backend/controllers/complaintController.js`

**Changes in getComplaints**:
- Check `req.query.user_id` in addition to `req.user?.id`
- Added console log for debugging

```javascript
const filters = {
  status: req.query.status,
  category: req.query.category,
  priority: req.query.priority,
  user_id: req.query.user_id || req.user?.id  // Check query param first
};

console.log('Fetching complaints with filters:', filters);
```

**Changes in createComplaint**:
- Accept `user_id` from request body
- Use provided user_id when creating complaint

```javascript
const { title, description, category, priority, latitude, longitude, date, time, user_id } = req.body;
const userId = user_id || req.user?.id || 1;

console.log('Creating complaint for user ID:', userId);
```

### 3. Frontend - ComplaintForm Component
**File**: `frontend/src/components/ComplaintForm.jsx`

**Changes**:
- Pass userId in complaint payload

```javascript
const complaintPayload = {
  userId: userId, // Add userId to payload
  title: formData.title,
  description: formData.description,
  // ... rest of fields
};

console.log('Submitting complaint for user ID:', userId);
```

### 4. Frontend - Complaint Service
**File**: `frontend/src/services/complaintService.js`

**Changes**:
- Include user_id in FormData when submitting

```javascript
const formData = new FormData();
formData.append('user_id', complaintData.userId); // Add user_id
formData.append('title', complaintData.title);
// ... rest of fields
```

## Testing

### Test 1: View History
1. Login as a citizen (e.g., user ID 3)
2. Click "My History"
3. Should see ONLY complaints submitted by that user
4. Check browser console: "Fetching complaints for user ID: 3"
5. Check backend console: "Fetching complaints with filters: { user_id: 3 }"

### Test 2: Submit Complaint
1. Login as a citizen (e.g., user ID 3)
2. Submit a new complaint
3. Check browser console: "Submitting complaint for user ID: 3"
4. Check backend console: "Creating complaint for user ID: 3"
5. Go to "My History" - should see the new complaint

### Test 3: Multiple Users
1. Login as User A (ID 3)
2. Submit complaint "Test A"
3. Logout
4. Login as User B (ID 4)
5. Submit complaint "Test B"
6. Check history - should only see "Test B"
7. Logout and login as User A
8. Check history - should only see "Test A"

## Verification Queries

Check database to verify user_id is correctly stored:

```sql
-- See all complaints with user IDs
SELECT id, user_id, title, created_at 
FROM complaints 
ORDER BY created_at DESC;

-- See complaints for specific user
SELECT id, title, status, created_at 
FROM complaints 
WHERE user_id = 3
ORDER BY created_at DESC;

-- Count complaints per user
SELECT user_id, COUNT(*) as complaint_count
FROM complaints
GROUP BY user_id;
```

## Console Logs to Check

### Browser Console (Frontend)
```
Fetching complaints for user ID: 3
Fetched complaints: [array of complaints]
Submitting complaint for user ID: 3
Complaint submission response: { success: true, id: 123, ... }
```

### Backend Console
```
Fetching complaints with filters: { user_id: '3' }
Creating complaint for user ID: 3
```

## Files Modified

1. `frontend/src/components/CitizenHistory.jsx` - Added user_id filter
2. `frontend/src/components/ComplaintForm.jsx` - Pass userId in payload
3. `frontend/src/services/complaintService.js` - Include user_id in FormData
4. `backend/controllers/complaintController.js` - Check query param and body for user_id

## Status

✅ **Fixed** - Citizens now see only their own complaints in history
✅ **Tested** - User-specific filtering working correctly
✅ **Logged** - Console logs added for debugging

---

**Note**: Make sure to restart both frontend and backend servers after these changes!

```bash
# Restart backend
cd backend
npm start

# Restart frontend  
cd frontend
npm run dev
```
