# Officer Notification System - Quick Setup Guide

## Step 1: Update Database Schema

You need to add the `officer_assignments` table to track complaint assignments.

### Option A: Using TablePlus (Recommended)
1. Open TablePlus and connect to your database
2. Select `complaint_system` database
3. Click on the SQL tab at the bottom
4. Copy and paste this SQL:
```sql
CREATE TABLE IF NOT EXISTS officer_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  officer_id INT NOT NULL,
  assigned_by INT NOT NULL COMMENT 'Admin user ID who made the assignment',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  INDEX idx_complaint_id (complaint_id),
  INDEX idx_officer_id (officer_id),
  INDEX idx_is_read (is_read),
  INDEX idx_assigned_at (assigned_at),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_complaint_officer (complaint_id, officer_id)
);
```
5. Click Run (or press Ctrl+Enter)
6. You should see "Query executed successfully"

### Option B: Using Migration File
Run this command in your terminal:
```bash
mysql -u root -p complaint_system < database/add_officer_assignments_table.sql
```

### Verify the Table Was Created
In TablePlus:
1. Refresh the database
2. You should see `officer_assignments` table in the list
3. Click on it to view the structure

## Step 2: Verify User Accounts

Make sure you have officer and admin accounts:

### Check Existing Users
```sql
SELECT id, username, role FROM users WHERE role IN ('officer', 'admin');
```

### Create Officer Account (if not exists)
```sql
-- Officer account: username=officer, password=officer
INSERT INTO users (id, name, email, username, password, role, is_active)
VALUES (2, 'Officer User', 'officer@system.com', 'officer', '$2b$10$YourHashHere', 'officer', TRUE)
ON DUPLICATE KEY UPDATE role='officer';
```

### Create Admin Account (if not exists)
```sql
-- Admin account: username=admin, password=admin
INSERT INTO users (id, name, email, username, password, role, is_active)
VALUES (3, 'Admin User', 'admin@system.com', 'admin', '$2b$10$YourHashHere', 'admin', TRUE)
ON DUPLICATE KEY UPDATE role='admin';
```

Note: The password hashes above are placeholders. The actual hashes are created when you sign up or use the authentication system.

## Step 3: Restart Backend Server

1. Stop your backend server (Ctrl+C in the terminal)
2. Start it again:
```bash
cd backend
npm start
```

The server should start without errors and you'll see:
```
Server running on port 5000
```

## Step 4: Restart Frontend

1. Stop your frontend server (Ctrl+C)
2. Start it again:
```bash
cd frontend
npm run dev
```

## Step 5: Test the Officer Notification System

### Test Flow:

1. **As Admin:**
   - Log in as admin (username: `admin`, password: `admin`)
   - Go to Admin Dashboard
   - Find a submitted complaint (or submit one as citizen first)
   - Click "Assign to Officer" button
   - You should see "Complaint assigned to officer dashboard"
   - Log out

2. **As Officer:**
   - Log in as officer (username: `officer`, password: `officer`)
   - Look at the dashboard header - you should see a bell icon (🔔)
   - The bell should have a red badge showing "1" (unread count)
   - Click the bell icon
   - You should see the assignment notification with:
     - Complaint title
     - "Assigned by Admin User"
     - Priority and category
     - Time ("Just now" or "5m ago")
   - Click the notification
   - The complaint should open in the detail panel on the right
   - The badge should disappear (marked as read)

## What You Should See

### Officer Dashboard Header
- Bell icon (🔔) appears next to the dashboard title
- Red badge with number shows unread assignment count
- Badge disappears when all notifications are read

### Notification Dropdown
- Opens when you click the bell
- Shows assignment details:
  - "🚨 New Assignment: [Complaint Title]"
  - "Assigned by [Admin Name]"
  - Priority (color-coded)
  - Category
  - Time ("Just now", "5m ago", etc.)
- Unread notifications have blue background
- "Mark all read" button at the top
- Scrollable list if many notifications

### Notification Click Behavior
- Clicking a notification:
  1. Marks it as read
  2. Closes the dropdown
  3. Opens the complaint in the detail panel
  4. Badge count decreases

## Troubleshooting

### Bell Icon Not Showing
- Make sure you're logged in as officer (not citizen or admin)
- Check browser console for errors (F12)
- Verify OfficerNotificationBell component is imported in OfficerDashboard.jsx
- Check that userId is being passed to OfficerDashboard

### No Notifications Appearing
- Check if `officer_assignments` table exists in database
- Verify backend server is running without errors
- Check Network tab in browser (F12) for API calls to `/api/notifications/officer`
- Make sure admin actually assigned a complaint
- Verify officer_id=2 exists in users table

### Badge Count Wrong
- Click "Mark all read" to reset
- Refresh the page
- Check database: `SELECT * FROM officer_assignments WHERE is_read = FALSE;`

### Notification Click Not Opening Complaint
- Check browser console for JavaScript errors
- Verify the complaint exists in the officer's assigned list
- Make sure the complaint status is 'under_review'
- Try refreshing the page and clicking again

### Assignment Not Creating Notification
- Check if admin_id is being passed (should be 3)
- Verify status is changing to 'under_review'
- Look for errors in backend console
- Check database: `SELECT * FROM officer_assignments ORDER BY assigned_at DESC;`

## Database Queries for Testing

### View All Officer Assignments
```sql
SELECT 
  oa.id,
  oa.complaint_id,
  c.title as complaint_title,
  oa.officer_id,
  oa.assigned_by,
  u.name as assigned_by_name,
  oa.assigned_at,
  oa.is_read
FROM officer_assignments oa
JOIN complaints c ON oa.complaint_id = c.id
JOIN users u ON oa.assigned_by = u.id
ORDER BY oa.assigned_at DESC;
```

### View Unread Assignments for Officer
```sql
SELECT 
  oa.*,
  c.title,
  c.priority,
  c.category
FROM officer_assignments oa
JOIN complaints c ON oa.complaint_id = c.id
WHERE oa.officer_id = 2 AND oa.is_read = FALSE;
```

### Manually Create Test Assignment
```sql
-- First, get a complaint ID
SELECT id, title FROM complaints WHERE status = 'under_review' LIMIT 1;

-- Then create assignment (replace 1 with actual complaint_id)
INSERT INTO officer_assignments (complaint_id, officer_id, assigned_by, is_read)
VALUES (1, 2, 3, FALSE);
```

### Manually Mark All as Read
```sql
UPDATE officer_assignments SET is_read = TRUE WHERE officer_id = 2;
```

### Delete All Assignments (for testing)
```sql
DELETE FROM officer_assignments;
```

## Features Summary

✅ Notification bell icon in officer dashboard header
✅ Unread assignment count badge
✅ Dropdown with assignment list
✅ Click notification to open complaint
✅ Mark individual notification as read
✅ Mark all notifications as read
✅ Auto-refresh every 30 seconds
✅ Color-coded priority indicators
✅ Relative timestamps
✅ Mobile responsive design
✅ Click outside to close dropdown

## User IDs Reference

The system uses these hardcoded user IDs:
- **Officer ID: 2** (username: `officer`, password: `officer`)
- **Admin ID: 3** (username: `admin`, password: `admin`)
- **Citizen ID: 1+** (dynamically created via signup)

These IDs are used in:
- `backend/models/Complaint.js` - Creates assignment with officer_id=2
- `frontend/src/components/AdminDashboard.jsx` - Passes admin_id=3
- `frontend/src/components/OfficerNotificationBell.jsx` - Fetches for officer_id

## Next Steps

The officer notification system is now complete! Officers will automatically receive notifications when admins assign complaints to them. No additional configuration needed.

If you want to test with multiple officers or admins:
1. Create additional user accounts in the database
2. Modify the hardcoded IDs in the code
3. Implement officer selection in admin dashboard (future enhancement)
