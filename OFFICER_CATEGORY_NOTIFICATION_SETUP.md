# Officer Category-Based Notifications Setup

## Overview
Officers now receive notifications for new complaints submitted in their assigned categories. When a citizen submits a complaint, officers responsible for that category get notified.

## Database Setup

### Step 1: Create Tables
Run these SQL migrations in order:

```sql
-- 1. Create officer_categories table
CREATE TABLE IF NOT EXISTS officer_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  officer_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_officer_id (officer_id),
  INDEX idx_category (category),
  INDEX idx_officer_category (officer_id, category),
  FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_officer_category (officer_id, category)
);

-- 2. Create category_notifications table
CREATE TABLE IF NOT EXISTS category_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  officer_id INT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_complaint_id (complaint_id),
  INDEX idx_officer_id (officer_id),
  INDEX idx_is_read (is_read),
  INDEX idx_officer_complaint (officer_id, complaint_id),
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_officer_complaint (officer_id, complaint_id)
);
```

### Step 2: Assign Categories to Officers

First, check which officers exist:
```sql
SELECT id, name, role FROM users WHERE role = 'officer';
```

Then assign categories to officers:
```sql
-- Example: Assign Infrastructure to officer ID 2
INSERT INTO officer_categories (officer_id, category, is_active) 
VALUES (2, 'infrastructure', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- Assign Sanitation to officer ID 3
INSERT INTO officer_categories (officer_id, category, is_active) 
VALUES (3, 'sanitation', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- Assign Traffic to officer ID 4
INSERT INTO officer_categories (officer_id, category, is_active) 
VALUES (4, 'traffic', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- Assign Safety to officer ID 5
INSERT INTO officer_categories (officer_id, category, is_active) 
VALUES (5, 'safety', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- Assign Utilities to officer ID 6
INSERT INTO officer_categories (officer_id, category, is_active) 
VALUES (6, 'utilities', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;
```

**Note**: Replace the officer IDs (2, 3, 4, 5, 6) with actual officer IDs from your database.

## How It Works

### 1. Citizen Submits Complaint
- Citizen submits a complaint with category (e.g., "Infrastructure")
- Complaint is saved to database

### 2. Officer Gets Notified
- System finds all officers assigned to that category
- Creates notification entries in `category_notifications` table
- Officer sees notification in the bell icon

### 3. Officer Views Notification
- Officer clicks notification bell
- Sees list of new complaints in their category
- Notification shows:
  - Complaint title
  - Category
  - Citizen name
  - Time submitted
  - Location (latitude/longitude)

### 4. Officer Marks as Read
- Officer clicks notification to view complaint
- Notification is marked as read
- Complaint opens in dashboard

## API Endpoints

### Get Category-Based Notifications
```
GET /api/notifications/officer/category/notifications?officer_id=2
```

Response:
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

### Mark Notification as Read
```
PATCH /api/notifications/officer/category/:complaintId/read
Body: { "officer_id": 2 }
```

### Mark All Notifications as Read
```
POST /api/notifications/officer/category/mark-all-read
Body: { "officer_id": 2 }
```

## Frontend Integration

### OfficerNotificationBell Component
- Fetches category-based notifications every 30 seconds
- Shows unread count badge
- Displays notification dropdown with:
  - Complaint title
  - Category
  - Citizen name
  - Time submitted
- Clicking notification marks it as read and opens complaint

### Officer Dashboard
- Filters complaints by category
- Shows only complaints in officer's assigned category
- Displays new notifications in bell icon

## Categories

Available complaint categories:
- Infrastructure
- Sanitation
- Traffic
- Safety
- Utilities

## Files Modified

### Backend
- `backend/controllers/notificationController.js` - Added category notification methods
- `backend/routes/notifications.js` - Added category notification routes

### Frontend
- `frontend/src/components/OfficerNotificationBell.jsx` - Updated to fetch category notifications

### Database
- `database/add_officer_categories_table.sql` - Officer category assignments
- `database/add_category_notifications_table.sql` - Notification tracking

## Testing

### Test Scenario
1. Create test officers with different categories assigned
2. Submit complaints in different categories
3. Check that officers receive notifications for their categories only
4. Verify notifications appear in bell icon
5. Click notification and verify complaint opens
6. Verify notification is marked as read

### SQL Queries for Testing

Check officer categories:
```sql
SELECT oc.*, u.name 
FROM officer_categories oc
JOIN users u ON oc.officer_id = u.id
WHERE oc.is_active = TRUE;
```

Check notifications:
```sql
SELECT cn.*, c.title, u.name as officer_name
FROM category_notifications cn
JOIN complaints c ON cn.complaint_id = c.id
JOIN users u ON cn.officer_id = u.id
ORDER BY cn.created_at DESC;
```

## Troubleshooting

### Officers not receiving notifications
1. Check if officer is assigned to the complaint's category:
   ```sql
   SELECT * FROM officer_categories 
   WHERE officer_id = ? AND category = ?;
   ```

2. Check if notification was created:
   ```sql
   SELECT * FROM category_notifications 
   WHERE officer_id = ? AND complaint_id = ?;
   ```

### Notifications not showing in UI
1. Check browser console for errors
2. Verify API endpoint is returning data
3. Check if officer_id is being passed correctly

## Future Enhancements

1. Add ability for admins to assign/reassign categories to officers
2. Add multiple categories per officer
3. Add notification preferences (email, SMS, push)
4. Add notification history/archive
5. Add bulk notification actions
