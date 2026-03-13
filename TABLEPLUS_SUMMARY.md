# TablePlus Setup Summary

## Quick Start (2 minutes)

### 1. Create Connection
```
TablePlus → "+" → MySQL
├─ Name: complaint_system
├─ Host: localhost
├─ Port: 3306
├─ User: root
├─ Password: (empty)
└─ Database: complaint_system
```

### 2. Test & Save
```
Click "Test" → ✅ Connection successful
Click "Save" → Connection appears in sidebar
```

### 3. Import Schema
```
Right-click connection → "Import"
Select: database/schema.sql
Click: "Import"
```

### 4. Verify
```
Expand connection → Should see 3 tables:
✅ complaints
✅ users
✅ complaint_updates
```

---

## Connection Details

| Setting | Value |
|---------|-------|
| **Name** | complaint_system |
| **Host** | localhost |
| **Port** | 3306 |
| **User** | root |
| **Password** | (empty) |
| **Database** | complaint_system |

---

## Your .env File

Already configured in `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=complaint_system
```

---

## Database Tables

### complaints
- Main table for storing complaints
- Geo-tagged with latitude/longitude
- Tracks status and priority
- **Columns:** id, user_id, title, description, image_path, latitude, longitude, date, time, category, priority, status, created_at, updated_at

### users
- Stores user information
- Tracks role (citizen/officer/admin)
- **Columns:** id, name, email, phone, role, created_at

### complaint_updates
- Stores status updates and messages
- Maintains audit trail
- **Columns:** id, complaint_id, officer_id, message, created_at

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

### View by Category
```sql
SELECT * FROM complaints WHERE category = 'infrastructure';
```

### Count by Priority
```sql
SELECT priority, COUNT(*) FROM complaints GROUP BY priority;
```

### Find by Location
```sql
SELECT id, title, latitude, longitude FROM complaints 
WHERE latitude BETWEEN 40.7 AND 40.8 
AND longitude BETWEEN -74.1 AND -74.0;
```

### Insert Test Data
```sql
INSERT INTO complaints 
(user_id, title, description, image_path, latitude, longitude, date, time, category, priority, status)
VALUES 
(1, 'Test Complaint', 'Test description', '/uploads/test.jpg', 40.7128, -74.0060, '2024-03-12', '14:30:00', 'infrastructure', 'high', 'submitted');
```

---

## Keyboard Shortcuts

| Action | Mac | Windows |
|--------|-----|---------|
| Execute Query | `Cmd+Enter` | `Ctrl+Enter` |
| New Query | `Cmd+T` | `Ctrl+T` |
| Format SQL | `Cmd+Shift+F` | `Ctrl+Shift+F` |
| Search | `Cmd+F` | `Ctrl+F` |

---

## Common Tasks

### Export Data
1. Right-click table
2. Select "Export"
3. Choose format (CSV, JSON, SQL)
4. Save file

### Backup Database
1. Right-click connection
2. Select "Backup"
3. Choose location
4. TablePlus creates .sql file

### Restore Database
1. Right-click connection
2. Select "Restore"
3. Select backup file
4. Confirm

### View Query Performance
1. Open SQL editor
2. Type: `EXPLAIN SELECT * FROM complaints;`
3. Execute to see query plan

---

## Troubleshooting

### Connection Refused
- Check MySQL is running
- Verify host: `localhost`
- Verify port: `3306`

### Database Not Found
- Run: `CREATE DATABASE complaint_system;`
- Then import schema

### Import Failed
- Try SQL editor method
- Check file path
- Verify file permissions

### Slow Queries
- Check indexes are created
- Use EXPLAIN to analyze
- Monitor query performance

---

## Next Steps

1. ✅ Setup TablePlus connection
2. ✅ Import database schema
3. ✅ Verify tables created
4. Start backend: `npm run dev`
5. Start frontend: `npm run dev`
6. Test at http://localhost:5173
7. Submit complaint
8. View in TablePlus: `SELECT * FROM complaints;`

---

## Documentation Files

- **TABLEPLUS_SETUP.md** - Detailed setup guide
- **TABLEPLUS_QUICK_REFERENCE.md** - Quick reference
- **TABLEPLUS_VISUAL_GUIDE.md** - Step-by-step with visuals
- **SETUP.md** - Backend setup
- **QUICK_START.md** - Quick start guide

---

## Support

- TablePlus Docs: https://docs.tableplus.com/
- MySQL Docs: https://dev.mysql.com/doc/
- Project Docs: See INDEX.md

---

## You're Ready! 🎉

Your TablePlus connection is configured and ready to use.

**Start the servers and begin testing!**
