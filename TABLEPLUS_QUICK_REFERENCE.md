# TablePlus Quick Reference

## 30-Second Setup

### 1. Create Connection
- Open TablePlus
- Click **"+"** → **MySQL**
- Enter:
  - **Name:** `complaint_system`
  - **Host:** `localhost`
  - **Port:** `3306`
  - **User:** `root`
  - **Password:** (leave empty)
  - **Database:** `complaint_system`
- Click **"Test"** → **"Save"**

### 2. Import Schema
- Right-click connection → **"Import"**
- Select `database/schema.sql`
- Click **"Import"**

### 3. Verify
- Expand connection in sidebar
- Should see 3 tables:
  - ✅ complaints
  - ✅ users
  - ✅ complaint_updates

---

## Essential Queries

### View All Complaints
```sql
SELECT * FROM complaints ORDER BY created_at DESC;
```

### View by Status
```sql
SELECT * FROM complaints WHERE status = 'submitted';
```

### View by Location
```sql
SELECT id, title, latitude, longitude, date FROM complaints;
```

### Count by Category
```sql
SELECT category, COUNT(*) FROM complaints GROUP BY category;
```

### Insert Test Data
```sql
INSERT INTO complaints 
(user_id, title, description, image_path, latitude, longitude, date, time, category, priority, status)
VALUES 
(1, 'Test', 'Test complaint', '/uploads/test.jpg', 40.7128, -74.0060, '2024-03-12', '14:30:00', 'infrastructure', 'high', 'submitted');
```

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Execute Query | `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows) |
| New Query Tab | `Cmd+T` / `Ctrl+T` |
| Format SQL | `Cmd+Shift+F` / `Ctrl+Shift+F` |
| Search | `Cmd+F` / `Ctrl+F` |

---

## Connection Details

```
Host:     localhost
Port:     3306
User:     root
Password: (empty)
Database: complaint_system
```

---

## Tables Overview

### complaints
- Stores all submitted complaints
- Geo-tagged with latitude/longitude
- Tracks status and priority

### users
- Stores user information
- Tracks role (citizen/officer/admin)

### complaint_updates
- Stores status updates
- Tracks officer actions
- Maintains audit trail

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection refused | Check MySQL is running |
| Database not found | Run: `mysql -u root -p < database/schema.sql` |
| Import failed | Try SQL editor method instead |
| Slow queries | Check indexes are created |

---

## Next Steps

1. ✅ Setup TablePlus connection
2. ✅ Import schema
3. Run backend: `npm run dev`
4. Run frontend: `npm run dev`
5. Test at http://localhost:5173

---

## Useful Links

- TablePlus Docs: https://docs.tableplus.com/
- MySQL Docs: https://dev.mysql.com/doc/
- Project Setup: See SETUP.md
- Quick Start: See QUICK_START.md
