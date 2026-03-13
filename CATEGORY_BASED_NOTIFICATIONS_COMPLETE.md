# Category-Based Officer Notifications - Complete Implementation

## Overview
Officers now receive notifications for new complaints submitted in their assigned categories. This allows for efficient complaint routing and ensures officers only see complaints relevant to their area of responsibility.

## System Architecture

### Flow Diagram
```
Citizen Submits Complaint
    ↓
Complaint saved with category (e.g., "Infrastructure")
    ↓
System finds officers assigned to that category
    ↓
Notification created in category_notifications table
    ↓
Officer sees notification in bell icon
    ↓
Officer clicks notification
    ↓
Complaint opens in dashboard
    ↓
Notification marked as read
```

## Database Schema

### 1. officer_categories Table
Tracks which officers are responsible for which categories.

```sql
CREATE TABLE officer_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  officer_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_officer_category (officer_id, category)
);
```

**Example Data**:
```
officer_id | category
-----------|---------------
2          | infrastructure
3          | sanitation
4          | traffic
5          | safety
6          | utilities
```

### 2. category_notifications Table
Tracks which officers have seen which complaints.

```sql
CREATE TABLE category_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  officer_id INT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_officer_complaint (officer_id, complaint_id)
);
```

## Backend Implementation

### New Notification Controller Methods

#### 1. getCategoryBasedNotifications()
Gets all new complaints in officer's assigned categories.

**Endpoint**: `GET /api/notifications/officer/category/notifications?officer_id=2`

**Logic**:
1. Get categories assigned to officer
2. Find all complaints in those categories with status='submitted'
3. Check if officer has seen each complaint
4. Return list with read status

**Response**:
```json
{
  "success": true,
  "count": 3,
  "unread_count": 2,
  "notifications": [
    {
      "complaint_id": 40,
      "complaint_title": "Broken streetlight",
      "category": "infrastructure",
      "complaint_status": "submitted",
      "latitude": 13.0235,
      "longitude": 74.9680,
      "created_at": "2026-03-13T10:30:00Z",
      "citizen_name": "John Doe",
      "is_read": false
    }
  ]
}
```

#### 2. markCategoryNotificationAsRead()
Marks a specific notification as read.

**Endpoint**: `PATCH /api/notifications/officer/category/:complaintId/read`

**Body**: `{ "officer_id": 2 }`

**Logic**:
1. Insert/update entry in category_notifications table
2. Set is_read = TRUE

#### 3. markAllCategoryNotificationsAsRead()
Marks all notifications as read for an officer.

**Endpoint**: `POST /api/notifications/officer/category/mark-all-read`

**Body**: `{ "officer_id": 2 }`

**Logic**:
1. Get all categories for officer
2. Find all complaints in those categories
3. Mark all as read

## Frontend Implementation

### OfficerNotificationBell Component Updates

**Changes**:
1. Fetch from `/api/notifications/officer/category/notifications` instead of `/api/notifications/officer`
2. Display category-based notifications
3. Show citizen name instead of "Assigned by"
4. Show category instead of priority
5. Mark as read using new endpoint

**Notification Display**:
```
📋 Broken streetlight
Submitted by John Doe
infrastructure • 5m ago
```

**Features**:
- Auto-refresh every 30 seconds
- Unread count badge
- Click to open complaint
- Mark as read on click
- Mark all as read button

## API Routes

### New Routes Added

```javascript
// Get category-based notifications
GET /api/notifications/officer/category/notifications

// Mark single notification as read
PATCH /api/notifications/officer/category/:complaintId/read

// Mark all notifications as read
POST /api/notifications/officer/category/mark-all-read
```

## Setup Instructions

### Step 1: Create Tables
Run the migration files:
- `database/add_officer_categories_table.sql`
- `database/add_category_notifications_table.sql`

### Step 2: Assign Categories to Officers
```sql
-- Check existing officers
SELECT id, name, role FROM users WHERE role = 'officer';

-- Assign categories
INSERT INTO officer_categories (officer_id, category, is_active) 
VALUES (2, 'infrastructure', TRUE);

INSERT INTO officer_categories (officer_id, category, is_active) 
VALUES (3, 'sanitation', TRUE);

-- etc...
```

### Step 3: Verify Setup
```sql
-- Check officer categories
SELECT oc.*, u.name 
FROM officer_categories oc
JOIN users u ON oc.officer_id = u.id
WHERE oc.is_active = TRUE;
```

## How It Works

### Scenario: Infrastructure Officer Gets Notification

1. **Citizen submits complaint**
   - Title: "Broken streetlight on Main Street"
   - Category: "infrastructure"
   - Saved to complaints table

2. **System creates notifications**
   - Query finds officer_id=2 assigned to "infrastructure"
   - Creates entry in category_notifications:
     - complaint_id: 40
     - officer_id: 2
     - is_read: FALSE

3. **Officer sees notification**
   - Bell icon shows unread count: 1
   - Clicks bell to open dropdown
   - Sees: "📋 Broken streetlight on Main Street"
   - Shows: "Submitted by John Doe • infrastructure • 5m ago"

4. **Officer clicks notification**
   - Complaint opens in dashboard
   - Notification marked as read
   - Unread count decreases

## Testing

### Test Case 1: Single Category Notification
1. Create officer with infrastructure category
2. Submit infrastructure complaint
3. Verify officer sees notification
4. Verify other officers don't see it

### Test Case 2: Multiple Categories
1. Create officer with multiple categories
2. Submit complaints in each category
3. Verify officer sees all notifications

### Test Case 3: Mark as Read
1. Get notification
2. Click to mark as read
3. Verify is_read = TRUE in database
4. Verify unread count decreases

### SQL Test Queries
```sql
-- Check notifications for officer 2
SELECT cn.*, c.title, u.name as officer_name
FROM category_notifications cn
JOIN complaints c ON cn.complaint_id = c.id
JOIN users u ON cn.officer_id = u.id
WHERE cn.officer_id = 2
ORDER BY cn.created_at DESC;

-- Check unread count for officer 2
SELECT COUNT(*) as unread_count
FROM category_notifications
WHERE officer_id = 2 AND is_read = FALSE;
```

## Files Modified

### Backend
- `backend/controllers/notificationController.js`
  - Added getCategoryBasedNotifications()
  - Added markCategoryNotificationAsRead()
  - Added markAllCategoryNotificationsAsRead()

- `backend/routes/notifications.js`
  - Added 3 new routes for category notifications

### Frontend
- `frontend/src/components/OfficerNotificationBell.jsx`
  - Updated fetchNotifications() to use category endpoint
  - Updated handleMarkAsRead() for category notifications
  - Updated notification display to show category info
  - Updated handleNotificationClick() for new data structure

### Database
- `database/add_officer_categories_table.sql`
- `database/add_category_notifications_table.sql`

## Troubleshooting

### Issue: Officer not receiving notifications
**Solution**:
1. Check if officer is assigned to category:
   ```sql
   SELECT * FROM officer_categories 
   WHERE officer_id = ? AND category = ?;
   ```
2. Check if complaint has correct category
3. Check if complaint status is 'submitted'

### Issue: Notifications not showing in UI
**Solution**:
1. Check browser console for errors
2. Verify API endpoint returns data
3. Check if officer_id is passed correctly
4. Verify notification bell is polling correctly

### Issue: Foreign key constraint error
**Solution**:
- Ensure officer IDs exist in users table before inserting into officer_categories
- Use SELECT to verify officers exist first

## Future Enhancements

1. **Admin Panel**: Allow admins to assign/reassign categories to officers
2. **Multiple Categories**: Allow officers to handle multiple categories
3. **Notification Preferences**: Email, SMS, push notifications
4. **Notification History**: Archive and search past notifications
5. **Bulk Actions**: Assign multiple complaints at once
6. **Real-time Updates**: Use WebSockets instead of polling
7. **Notification Filters**: Filter by date, priority, location
8. **Notification Templates**: Customizable notification messages

## Performance Considerations

### Query Optimization
- Indexed on officer_id, category, complaint_id
- LEFT JOIN for efficient read status checking
- LIMIT 50 to prevent large result sets

### Polling Strategy
- 30-second interval balances responsiveness and server load
- Can be adjusted based on traffic

### Scalability
- Category_notifications table grows with complaints
- Consider archiving old notifications after 30 days
- Add database partitioning if needed

## Security

- Officer can only see notifications for their assigned categories
- Notifications are officer-specific (unique constraint)
- Foreign keys ensure data integrity
- No sensitive data in notifications

## Compliance

- Notifications are audit-logged in category_notifications table
- Tracks who saw what and when
- Useful for SLA monitoring and compliance reporting
