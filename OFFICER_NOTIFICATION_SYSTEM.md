# Officer Notification System Implementation

## Overview
Officers now receive notifications when admins assign complaints to them. A notification bell icon appears in the officer dashboard header, showing unread assignment count. Clicking a notification opens the assigned complaint directly.

## Features

### 1. Officer Notification Bell
- Displays in officer dashboard header
- Shows unread assignment count badge
- Click to open/close notification dropdown
- Auto-refreshes every 30 seconds
- Click notification to open complaint details

### 2. Notification Dropdown
- Lists all assignments (up to 50 most recent)
- Shows complaint title, priority, category, and assigned time
- Unread notifications highlighted in blue
- Click notification to mark as read and open complaint
- "Mark all read" button to clear all unread notifications
- Responsive design for mobile devices

### 3. Notification Data
Each notification includes:
- Complaint title
- Priority level (color-coded)
- Category
- Assigned by (admin name)
- Timestamp (relative: "5m ago", "2h ago", etc.)
- Read/unread status

## Database Changes

### New Table: officer_assignments
Tracks which officer is assigned to which complaint:
```sql
CREATE TABLE officer_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  complaint_id INT NOT NULL,
  officer_id INT NOT NULL,
  assigned_by INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  ...
);
```

### Migration
Run the migration file for existing databases:
```bash
mysql -u root -p complaint_system < database/add_officer_assignments_table.sql
```

Or manually in TablePlus:
1. Open complaint_system database
2. Go to SQL tab
3. Copy and paste the SQL from `add_officer_assignments_table.sql`
4. Run the query

## Backend Implementation

### Modified Files
1. `backend/controllers/notificationController.js` - Added officer notification endpoints
2. `backend/routes/notifications.js` - Added officer notification routes
3. `backend/models/Complaint.js` - Modified updateStatus to create officer assignments
4. `backend/controllers/complaintController.js` - Added admin_id parameter to status updates

### New API Endpoints

#### GET /api/notifications/officer
Get all assignment notifications for an officer
- Query params: `officer_id` (required)
- Returns: notifications array, unread count

#### PATCH /api/notifications/officer/:id/read
Mark a specific officer notification as read
- Params: `id` (notification ID)

#### POST /api/notifications/officer/mark-all-read
Mark all officer notifications as read
- Body: `{ officer_id: number }`

### How It Works
1. When admin clicks "Assign to Officer" on a complaint, status changes to 'under_review'
2. Backend creates a record in `officer_assignments` table with officer_id=2 (hardcoded officer)
3. Officer notification controller queries this table to get assignments
4. Frontend polls every 30 seconds for new notifications
5. Clicking notification marks it as read and opens the complaint

## Frontend Implementation

### New Files Created
1. `frontend/src/components/OfficerNotificationBell.jsx` - Officer notification bell component

### Modified Files
1. `frontend/src/components/OfficerDashboard.jsx` - Added notification bell and click handler
2. `frontend/src/services/complaintService.js` - Added admin_id parameter support
3. `frontend/src/components/AdminDashboard.jsx` - Pass admin_id when assigning
4. `frontend/src/App.jsx` - Pass userId to OfficerDashboard
5. `frontend/src/styles/OfficerDashboard.css` - Added dashboard header styling

### Component Integration
- Added to OfficerDashboard header
- Positioned next to dashboard title
- Uses same dropdown pattern as citizen notifications
- Clicking notification opens complaint in detail panel

### Features
- Real-time polling (30-second intervals)
- Optimistic UI updates (instant feedback)
- Relative timestamps ("5m ago", "2h ago")
- Color-coded priority indicators
- Smooth animations and transitions
- Mobile responsive
- Click notification to open complaint

## Usage

### For Officers
1. Log in as officer (username: `officer`, password: `officer`)
2. Look at dashboard header - notification bell (🔔) appears
3. When admin assigns a complaint, unread count shows on badge
4. Click bell to see assignment notifications
5. Click a notification to:
   - Mark it as read
   - Open the complaint in detail panel
6. Click "Mark all read" to clear all unread notifications

### For Admins
When assigning a complaint:
1. Log in as admin
2. Go to Admin Dashboard
3. Click "Detect Emergency Using AI" or view any complaint
4. Click "Assign to Officer" button
5. Officer automatically receives notification
6. No additional action needed

## Testing

### Test Scenario
1. Log in as admin (username: `admin`, password: `admin`)
2. Go to Admin Dashboard
3. Find a submitted complaint
4. Click "Assign to Officer"
5. Log out and log in as officer (username: `officer`, password: `officer`)
6. Check notification bell - should show unread count
7. Click bell to see the assignment
8. Click the notification - complaint should open in detail panel
9. Badge should disappear after marking as read

### Database Check
```sql
-- View all officer assignments
SELECT * FROM officer_assignments ORDER BY assigned_at DESC;

-- View unread assignments for officer
SELECT oa.*, c.title 
FROM officer_assignments oa
JOIN complaints c ON oa.complaint_id = c.id
WHERE oa.officer_id = 2 AND oa.is_read = FALSE;

-- View who assigned what
SELECT 
  oa.id,
  c.title as complaint,
  u1.name as officer,
  u2.name as assigned_by,
  oa.assigned_at,
  oa.is_read
FROM officer_assignments oa
JOIN complaints c ON oa.complaint_id = c.id
JOIN users u1 ON oa.officer_id = u1.id
JOIN users u2 ON oa.assigned_by = u2.id
ORDER BY oa.assigned_at DESC;
```

## Hardcoded User IDs

The system uses hardcoded user IDs for simplicity:
- Officer ID: 2 (username: `officer`)
- Admin ID: 3 (username: `admin`)
- Citizen ID: 1 (or dynamically created)

These are defined in:
- `backend/models/Complaint.js` - Officer ID in updateStatus
- `frontend/src/components/AdminDashboard.jsx` - Admin ID in handleAssignToOfficer

## Styling

### Color Scheme
- Unread notifications: Light blue background (#e3f2fd)
- Unread badge: Red (#f44336)
- Priority colors:
  - Critical: Red (#dc3545)
  - High: Orange (#fd7e14)
  - Medium: Yellow (#ffc107)
  - Low: Green (#28a745)

### Responsive Design
- Desktop: 380px wide dropdown
- Mobile: 320px wide dropdown
- Scrollable list with custom scrollbar
- Touch-friendly tap targets

## Notification Click Behavior

When officer clicks a notification:
1. Notification is marked as read (API call)
2. Dropdown closes
3. Complaint is selected in the list
4. Complaint details panel opens on the right
5. Badge count decreases by 1

This is handled by the `onNotificationClick` callback:
```javascript
const handleNotificationClick = async (complaintId) => {
  // Find and select the complaint
  const complaint = complaints.find(c => c.id === complaintId);
  if (complaint) {
    handleSelectComplaint(complaint);
  }
};
```

## Future Enhancements

### Potential Improvements
1. Support multiple officers (currently hardcoded to officer_id=2)
2. Allow admin to select which officer to assign
3. WebSocket integration for real-time updates (no polling)
4. Push notifications (browser notifications API)
5. Email notifications for critical assignments
6. Notification preferences (enable/disable types)
7. Assignment history and analytics
8. Reassignment capability
9. Officer workload balancing

### Performance Optimization
1. Implement pagination for large notification lists
2. Add caching layer (Redis) for frequently accessed data
3. Optimize database queries with better indexing
4. Implement notification aggregation
5. Add notification expiry (auto-delete old notifications)

## Troubleshooting

### Notifications Not Appearing
1. Check if `officer_assignments` table exists in database
2. Verify notification routes are registered in `server.js`
3. Check browser console for API errors
4. Verify officer_id is being passed correctly (should be 2)
5. Check if admin_id is being passed when assigning (should be 3)

### Badge Count Incorrect
1. Clear browser localStorage and refresh
2. Check database for orphaned assignment records
3. Verify the unread count query in backend

### Notification Click Not Opening Complaint
1. Check if complaint exists in current filtered list
2. Verify complaint_id matches between notification and complaint
3. Check browser console for errors
4. Ensure handleSelectComplaint is working properly

### Assignment Not Creating Notification
1. Verify admin_id is being passed in the API call
2. Check if status is changing to 'under_review'
3. Look for errors in backend console
4. Check if officer_id=2 exists in users table

## Files Modified/Created

### Backend
- `backend/controllers/notificationController.js` - Added officer notification methods
- `backend/routes/notifications.js` - Added officer notification routes
- `backend/models/Complaint.js` - Modified updateStatus method
- `backend/controllers/complaintController.js` - Added admin_id parameter

### Frontend
- `frontend/src/components/OfficerNotificationBell.jsx` - Created
- `frontend/src/components/OfficerDashboard.jsx` - Added notification bell
- `frontend/src/services/complaintService.js` - Added admin_id support
- `frontend/src/components/AdminDashboard.jsx` - Pass admin_id
- `frontend/src/App.jsx` - Pass userId to OfficerDashboard
- `frontend/src/styles/OfficerDashboard.css` - Added header styling

### Database
- `database/schema.sql` - Added officer_assignments table
- `database/add_officer_assignments_table.sql` - Migration file created

## Summary
The officer notification system is now fully implemented! Officers receive notifications when admins assign complaints, with a clean UI showing unread counts and the ability to click notifications to open complaints directly.
