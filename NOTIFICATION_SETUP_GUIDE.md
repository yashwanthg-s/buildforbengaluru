# Notification System - Quick Setup Guide

## Step 1: Update Database Schema

You need to add the `is_read` column to the `complaint_updates` table.

### Option A: Using TablePlus (Recommended)
1. Open TablePlus and connect to your database
2. Select `complaint_system` database
3. Click on the SQL tab at the bottom
4. Copy and paste this SQL:
```sql
ALTER TABLE complaint_updates 
ADD COLUMN is_read BOOLEAN DEFAULT FALSE;

ALTER TABLE complaint_updates 
ADD INDEX idx_is_read (is_read);
```
5. Click Run (or press Ctrl+Enter)
6. You should see "Query executed successfully"

### Option B: Using Migration File
Run this command in your terminal:
```bash
mysql -u root -p complaint_system < database/add_notification_column.sql
```

### Verify the Column Was Added
In TablePlus:
1. Click on `complaint_updates` table
2. Go to Structure tab
3. You should see `is_read` column with type BOOLEAN

## Step 2: Restart Backend Server

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

## Step 3: Restart Frontend

1. Stop your frontend server (Ctrl+C)
2. Start it again:
```bash
cd frontend
npm run dev
```

## Step 4: Test the Notification System

### Test Flow:
1. **As Citizen:**
   - Log in as a citizen (or sign up new account)
   - Submit a complaint with title "Test Notification"
   - Note the complaint ID or title
   - Log out

2. **As Officer:**
   - Log in as officer (username: `officer`, password: `officer`)
   - Find the "Test Notification" complaint
   - Click "Update Status"
   - Change status to "Under Review"
   - Add message: "We are reviewing your complaint"
   - Click Update
   - Log out

3. **Back as Citizen:**
   - Log in as the same citizen
   - Look at the header - you should see a bell icon (🔔) with a red badge showing "1"
   - Click the bell icon
   - You should see the notification with the officer's message
   - Click the notification to mark it as read
   - The badge should disappear

## What You Should See

### Notification Bell (Header)
- Bell icon (🔔) appears next to user info (citizens only)
- Red badge with number shows unread count
- Badge disappears when all notifications are read

### Notification Dropdown
- Opens when you click the bell
- Shows complaint title, message, status, and time
- Unread notifications have blue background
- "Mark all read" button at the top
- Scrollable list if many notifications

### Notification Content
- **Title:** Your complaint title
- **Message:** Officer's update message
- **Status:** Color-coded (Blue=Under Review, Green=Resolved, Red=Rejected)
- **Time:** Relative time ("5m ago", "2h ago", "1d ago")

## Troubleshooting

### Bell Icon Not Showing
- Make sure you're logged in as a citizen (not officer or admin)
- Check browser console for errors (F12)
- Verify NotificationBell component is imported in App.jsx

### No Notifications Appearing
- Check if `is_read` column exists in database
- Verify backend server is running without errors
- Check Network tab in browser (F12) for API calls to `/api/notifications`
- Make sure officer actually updated a complaint you submitted

### Badge Count Wrong
- Click "Mark all read" to reset
- Refresh the page
- Check database: `SELECT * FROM complaint_updates WHERE is_read = FALSE;`

### Dropdown Not Opening
- Check browser console for JavaScript errors
- Try clicking the bell icon again
- Refresh the page

## Database Queries for Testing

### View All Notifications
```sql
SELECT 
  cu.id,
  cu.message,
  cu.is_read,
  cu.created_at,
  c.title as complaint_title,
  c.user_id
FROM complaint_updates cu
JOIN complaints c ON cu.complaint_id = c.id
ORDER BY cu.created_at DESC;
```

### View Unread Notifications for User ID 1
```sql
SELECT 
  cu.*,
  c.title
FROM complaint_updates cu
JOIN complaints c ON cu.complaint_id = c.id
WHERE c.user_id = 1 AND cu.is_read = FALSE;
```

### Manually Mark All as Read
```sql
UPDATE complaint_updates SET is_read = TRUE;
```

### Manually Create Test Notification
```sql
INSERT INTO complaint_updates (complaint_id, message, old_status, new_status, is_read)
VALUES (1, 'Test notification message', 'submitted', 'under_review', FALSE);
```

## Features Summary

✅ Notification bell icon in header (citizens only)
✅ Unread count badge
✅ Dropdown with notification list
✅ Mark individual notification as read
✅ Mark all notifications as read
✅ Auto-refresh every 30 seconds
✅ Color-coded status indicators
✅ Relative timestamps
✅ Mobile responsive design
✅ Click outside to close dropdown

## Next Steps

The notification system is now complete! Citizens will automatically receive notifications when officers update their complaint status. No additional configuration needed.

If you want to test with multiple users:
1. Create multiple citizen accounts
2. Submit complaints from each account
3. Update them as officer
4. Log in as each citizen to see their specific notifications
