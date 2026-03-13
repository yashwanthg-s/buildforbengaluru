# Notification System Implementation

## Overview
The notification system allows citizens to receive real-time updates when officers change the status of their complaints. A notification bell icon appears in the header for citizen users, showing unread notification count and a dropdown with all notifications.

## Features

### 1. Notification Bell Icon
- Displays in the header for citizen users only
- Shows unread notification count badge
- Click to open/close notification dropdown
- Auto-refreshes every 30 seconds

### 2. Notification Dropdown
- Lists all notifications (up to 50 most recent)
- Shows complaint title, update message, status, and time
- Unread notifications highlighted in blue
- Click notification to mark as read
- "Mark all read" button to clear all unread notifications
- Responsive design for mobile devices

### 3. Notification Data
Each notification includes:
- Complaint title
- Update message from officer
- Current complaint status (color-coded)
- Timestamp (relative: "5m ago", "2h ago", etc.)
- Read/unread status

## Database Changes

### Schema Update
Added `is_read` column to `complaint_updates` table:
```sql
ALTER TABLE complaint_updates 
ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
```

### Migration
Run the migration file for existing databases:
```bash
mysql -u root -p complaint_system < database/add_notification_column.sql
```

Or manually in TablePlus:
1. Open complaint_system database
2. Go to SQL tab
3. Run: `ALTER TABLE complaint_updates ADD COLUMN is_read BOOLEAN DEFAULT FALSE;`
4. Run: `ALTER TABLE complaint_updates ADD INDEX idx_is_read (is_read);`

## Backend Implementation

### New Files Created
1. `backend/routes/notifications.js` - Notification routes
2. `backend/controllers/notificationController.js` - Notification logic

### API Endpoints

#### GET /api/notifications
Get all notifications for a user
- Query params: `user_id` (required)
- Returns: notifications array, unread count

#### PATCH /api/notifications/:id/read
Mark a specific notification as read
- Params: `id` (notification ID)

#### POST /api/notifications/mark-all-read
Mark all notifications as read for a user
- Body: `{ user_id: number }`

### How It Works
1. When officer updates complaint status, a record is created in `complaint_updates` table
2. Notification controller queries `complaint_updates` joined with `complaints` to get user's notifications
3. Frontend polls every 30 seconds for new notifications
4. Unread notifications are highlighted and counted

## Frontend Implementation

### New Files Created
1. `frontend/src/components/NotificationBell.jsx` - Notification bell component
2. `frontend/src/services/notificationService.js` - API service
3. `frontend/src/styles/NotificationBell.css` - Notification styles

### Component Integration
- Added to `App.jsx` header (citizen users only)
- Positioned next to user info
- Uses dropdown pattern with click-outside detection

### Features
- Real-time polling (30-second intervals)
- Optimistic UI updates (instant feedback)
- Relative timestamps ("5m ago", "2h ago")
- Color-coded status indicators
- Smooth animations and transitions
- Mobile responsive

## Usage

### For Citizens
1. Log in as a citizen
2. Submit a complaint
3. When an officer updates the complaint status, a notification appears
4. Click the bell icon (🔔) to view notifications
5. Unread count shows on the bell badge
6. Click a notification to mark it as read
7. Click "Mark all read" to clear all unread notifications

### For Officers
When updating a complaint status:
1. The system automatically creates a notification entry
2. The citizen who submitted the complaint will see the notification
3. No additional action needed from officers

## Testing

### Test Scenario
1. Log in as citizen and submit a complaint
2. Log out and log in as officer
3. Update the complaint status with a message
4. Log out and log in as the same citizen
5. Check the notification bell - should show unread count
6. Click bell to see the notification
7. Click notification to mark as read

### Database Check
```sql
-- View all notifications
SELECT * FROM complaint_updates ORDER BY created_at DESC;

-- View unread notifications for user
SELECT cu.*, c.title 
FROM complaint_updates cu
JOIN complaints c ON cu.complaint_id = c.id
WHERE c.user_id = 1 AND cu.is_read = FALSE;
```

## Styling

### Color Scheme
- Unread notifications: Light blue background (#e3f2fd)
- Unread badge: Red (#f44336)
- Status colors:
  - Under Review: Blue (#2196F3)
  - Resolved: Green (#4CAF50)
  - Rejected: Red (#f44336)

### Responsive Design
- Desktop: 380px wide dropdown
- Mobile: 320px wide dropdown
- Scrollable list with custom scrollbar
- Touch-friendly tap targets

## Future Enhancements

### Potential Improvements
1. WebSocket integration for real-time updates (no polling)
2. Push notifications (browser notifications API)
3. Email notifications for critical updates
4. Notification preferences (enable/disable types)
5. Notification history archive
6. Sound alerts for new notifications
7. Desktop notifications when tab is inactive

### Performance Optimization
1. Implement pagination for large notification lists
2. Add caching layer (Redis) for frequently accessed notifications
3. Optimize database queries with better indexing
4. Implement notification aggregation (group similar notifications)

## Troubleshooting

### Notifications Not Appearing
1. Check if `is_read` column exists in `complaint_updates` table
2. Verify notification routes are registered in `server.js`
3. Check browser console for API errors
4. Verify user_id is being passed correctly

### Badge Count Incorrect
1. Clear browser localStorage and refresh
2. Check database for orphaned notification records
3. Verify the unread count query in backend

### Dropdown Not Closing
1. Check if click-outside handler is working
2. Verify ref is attached to dropdown container
3. Check for z-index conflicts with other elements

## Files Modified

### Backend
- `backend/server.js` - Added notification routes
- `backend/controllers/notificationController.js` - Created
- `backend/routes/notifications.js` - Created

### Frontend
- `frontend/src/App.jsx` - Added NotificationBell component
- `frontend/src/components/NotificationBell.jsx` - Created
- `frontend/src/services/notificationService.js` - Created
- `frontend/src/styles/NotificationBell.css` - Created

### Database
- `database/schema.sql` - Added is_read column
- `database/add_notification_column.sql` - Migration file created

## Summary
The notification system is now fully implemented and integrated. Citizens will receive notifications when officers update their complaint status, with a clean UI showing unread counts and detailed notification information.
