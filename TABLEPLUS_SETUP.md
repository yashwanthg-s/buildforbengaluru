# TablePlus Setup Guide

## Quick Connection Setup

### Step 1: Open TablePlus
1. Launch TablePlus application
2. Click **"Create..."** or **"+"** button
3. Select **MySQL**

### Step 2: Enter Connection Details

Fill in the following information:

| Field | Value |
|-------|-------|
| **Name** | `complaint_system` (or any name you prefer) |
| **Host** | `localhost` or `127.0.0.1` |
| **Port** | `3306` |
| **User** | `root` |
| **Password** | (leave empty if no password, or enter your MySQL password) |
| **Database** | `complaint_system` |

### Step 3: Test Connection
- Click **"Test"** button
- You should see "Connection successful"

### Step 4: Save Connection
- Click **"Save"** button
- Connection will appear in your sidebar

---

## Import Database Schema

### Method 1: Using TablePlus UI

1. **Open your connection** in TablePlus
2. Click **"File"** → **"Import"** (or use keyboard shortcut)
3. Select `database/schema.sql`
4. Click **"Import"**
5. Confirm when prompted

### Method 2: Using SQL Editor

1. **Open your connection** in TablePlus
2. Click **"SQL"** tab or press `Cmd+Shift+E` (Mac) / `Ctrl+Shift+E` (Windows)
3. Copy the contents of `database/schema.sql`
4. Paste into the SQL editor
5. Click **"Execute"** or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

### Method 3: Using Terminal

```bash
# If MySQL is installed locally
mysql -u root -p complaint_system < database/schema.sql

# Or with TablePlus CLI
tableplus mysql://root@localhost:3306/complaint_system < database/schema.sql
```

---

## Verify Database Setup

### Check Tables Created

1. In TablePlus, expand your connection
2. You should see three tables:
   - `complaints`
   - `users`
   - `complaint_updates`

### View Table Structure

1. Click on any table (e.g., `complaints`)
2. Click **"Structure"** tab to see columns
3. Verify all columns are present:
   - id, user_id, title, description, image_path
   - latitude, longitude, date, time
   - category, priority, status
   - created_at, updated_at

### Check Indexes

1. Click on `complaints` table
2. Click **"Indexes"** tab
3. You should see indexes on:
   - PRIMARY (id)
   - idx_user_id
   - idx_status
   - idx_category
   - idx_location (latitude, longitude)

---

## Common TablePlus Features

### Query Data

```sql
-- View all complaints
SELECT * FROM complaints;

-- View complaints by status
SELECT * FROM complaints WHERE status = 'submitted';

-- View complaints by location
SELECT id, title, latitude, longitude, date FROM complaints 
ORDER BY created_at DESC;

-- Count complaints by category
SELECT category, COUNT(*) as count FROM complaints 
GROUP BY category;
```

### Insert Test Data

```sql
-- Insert test user
INSERT INTO users (name, email, phone, role) 
VALUES ('Test Officer', 'officer@test.com', '1234567890', 'officer');

-- Insert test complaint
INSERT INTO complaints 
(user_id, title, description, image_path, latitude, longitude, date, time, category, priority, status)
VALUES 
(1, 'Test Complaint', 'This is a test complaint', '/uploads/test.jpg', 40.7128, -74.0060, '2024-03-12', '14:30:00', 'infrastructure', 'high', 'submitted');
```

### Export Data

1. Right-click on table
2. Select **"Export"**
3. Choose format (CSV, JSON, SQL)
4. Select location to save

### Backup Database

1. Right-click on connection
2. Select **"Backup"**
3. Choose backup location
4. TablePlus will create a `.sql` file

### Restore Database

1. Right-click on connection
2. Select **"Restore"**
3. Select backup file
4. Confirm restoration

---

## Troubleshooting

### Connection Failed

**Error:** "Connection refused"

**Solutions:**
1. Verify MySQL is running:
   ```bash
   # Mac
   brew services list
   
   # Windows
   services.msc (search for MySQL)
   
   # Linux
   sudo systemctl status mysql
   ```

2. Check host and port:
   - Host should be `localhost` or `127.0.0.1`
   - Port should be `3306` (default)

3. Verify credentials:
   - User: `root`
   - Password: (check your MySQL setup)

### Database Not Found

**Error:** "Unknown database 'complaint_system'"

**Solution:**
1. Create database first:
   ```sql
   CREATE DATABASE complaint_system;
   ```

2. Then import schema:
   ```bash
   mysql -u root -p complaint_system < database/schema.sql
   ```

### Import Failed

**Error:** "Error importing file"

**Solutions:**
1. Verify file path is correct
2. Check file permissions
3. Try using SQL editor method instead
4. Check for syntax errors in schema.sql

### Slow Queries

**Optimize:**
1. Add indexes (already done in schema)
2. Use EXPLAIN to analyze queries:
   ```sql
   EXPLAIN SELECT * FROM complaints WHERE status = 'submitted';
   ```

3. Monitor query performance in TablePlus

---

## TablePlus Tips & Tricks

### Keyboard Shortcuts

| Action | Mac | Windows |
|--------|-----|---------|
| Execute Query | `Cmd+Enter` | `Ctrl+Enter` |
| New Query | `Cmd+T` | `Ctrl+T` |
| Format SQL | `Cmd+Shift+F` | `Ctrl+Shift+F` |
| Search | `Cmd+F` | `Ctrl+F` |
| Duplicate Row | `Cmd+D` | `Ctrl+D` |
| Delete Row | `Cmd+Delete` | `Ctrl+Delete` |

### Favorites

1. Save frequently used queries
2. Click **"Favorites"** icon
3. Name your query
4. Access from sidebar

### Snippets

1. Create reusable SQL snippets
2. Click **"Snippets"** tab
3. Add new snippet
4. Use with autocomplete

### Dark Mode

1. Go to **Preferences**
2. Select **"Appearance"**
3. Choose **"Dark"** theme

---

## Environment Configuration

Your `.env` file is already configured for TablePlus:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=complaint_system
```

These match TablePlus connection settings.

---

## Next Steps

1. ✅ Setup TablePlus connection
2. ✅ Import database schema
3. ✅ Verify tables created
4. ✅ Test with sample queries
5. Start backend server: `npm run dev`
6. Start frontend: `npm run dev`
7. Test complaint submission

---

## Useful Queries for Testing

### Check Database Size
```sql
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'complaint_system'
ORDER BY (data_length + index_length) DESC;
```

### View Recent Complaints
```sql
SELECT id, title, status, category, priority, created_at
FROM complaints
ORDER BY created_at DESC
LIMIT 10;
```

### Count by Status
```sql
SELECT status, COUNT(*) as count
FROM complaints
GROUP BY status;
```

### Find Complaints by Location
```sql
SELECT id, title, latitude, longitude, date
FROM complaints
WHERE latitude BETWEEN 40.7 AND 40.8
  AND longitude BETWEEN -74.1 AND -74.0
ORDER BY created_at DESC;
```

---

## Support

For TablePlus help:
- Official docs: https://docs.tableplus.com/
- Support: support@tableplus.io
- Community: https://github.com/TablePlus/TablePlus

For this project:
- See SETUP.md for backend setup
- See QUICK_START.md for quick start
- See API_TESTING.md for API testing
