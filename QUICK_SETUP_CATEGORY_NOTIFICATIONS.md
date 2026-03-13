# Quick Setup: Category-Based Officer Notifications

## 3-Step Setup

### Step 1: Create Database Tables

Run these SQL commands in your database:

```sql
-- Table 1: Officer Categories
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

-- Table 2: Category Notifications
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

First, find your officers:
```sql
SELECT id, name FROM users WHERE role = 'officer';
```

Then assign categories (replace IDs with your actual officer IDs):
```sql
-- Officer 2 handles Infrastructure
INSERT INTO officer_categories (officer_id, category, is_active) 
VALUES (2, 'infrastructure', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- Officer 3 handles Sanitation
INSERT INTO officer_categories (officer_id, category, is_active) 
VALUES (3, 'sanitation', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- Officer 4 handles Traffic
INSERT INTO officer_categories (officer_id, category, is_active) 
VALUES (4, 'traffic', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- Officer 5 handles Safety
INSERT INTO officer_categories (officer_id, category, is_active) 
VALUES (5, 'safety', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- Officer 6 handles Utilities
INSERT INTO officer_categories (officer_id, category, is_active) 
VALUES (6, 'utilities', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;
```

### Step 3: Verify Setup

Check that everything is configured:
```sql
-- View all officer category assignments
SELECT oc.id, u.name as officer_name, oc.category, oc.is_active
FROM officer_categories oc
JOIN users u ON oc.officer_id = u.id
ORDER BY u.name, oc.category;
```

## How It Works

1. **Citizen submits complaint** with category (e.g., "Infrastructure")
2. **Officer assigned to that category** gets notification in bell icon
3. **Officer clicks notification** to view complaint
4. **Notification marked as read** automatically

## Testing

### Test Scenario
1. Log in as officer (e.g., officer ID 2 for Infrastructure)
2. Have another user submit an Infrastructure complaint
3. Check notification bell - should show unread count
4. Click bell to see notification
5. Click notification to open complaint
6. Verify notification is marked as read

### Verify in Database
```sql
-- Check if notification was created
SELECT * FROM category_notifications 
WHERE officer_id = 2 
ORDER BY created_at DESC 
LIMIT 5;

-- Check unread count for officer 2
SELECT COUNT(*) as unread_count
FROM category_notifications
WHERE officer_id = 2 AND is_read = FALSE;
```

## Troubleshooting

### Error: Foreign key constraint fails
**Cause**: Officer ID doesn't exist in users table
**Fix**: Use correct officer IDs from `SELECT id FROM users WHERE role = 'officer'`

### Officer not seeing notifications
**Check**:
1. Is officer assigned to the complaint's category?
   ```sql
   SELECT * FROM officer_categories 
   WHERE officer_id = ? AND category = ?;
   ```
2. Is complaint status 'submitted'?
   ```sql
   SELECT status FROM complaints WHERE id = ?;
   ```

### Notifications not showing in UI
**Check**:
1. Open browser DevTools → Console
2. Check for JavaScript errors
3. Verify API endpoint is working:
   ```
   GET http://localhost:5000/api/notifications/officer/category/notifications?officer_id=2
   ```

## Categories Available

- infrastructure
- sanitation
- traffic
- safety
- utilities

## Files Changed

- Backend: `backend/controllers/notificationController.js`
- Backend: `backend/routes/notifications.js`
- Frontend: `frontend/src/components/OfficerNotificationBell.jsx`

## Next Steps

1. Create test officers if needed
2. Assign categories to officers
3. Test by submitting complaints
4. Verify notifications appear
5. Check that officers only see their category complaints

## Support

For detailed documentation, see: `CATEGORY_BASED_NOTIFICATIONS_COMPLETE.md`
