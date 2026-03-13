# Create Database - Quick Fix

## Your Error
```
Unknown database 'complaint_system'
```

**Good news:** MySQL is running! ✅
**What's needed:** Create the database

---

## Quick Fix (Choose One)

### Option 1: Using TablePlus (Easiest) ⭐

1. **Click "OK"** to close the error
2. **Click "Connect"** anyway (it will connect to MySQL server)
3. **Click "SQL"** tab at the top
4. **Paste this:**
   ```sql
   CREATE DATABASE complaint_system;
   ```
5. **Press `Cmd+Enter` (Mac) or `Ctrl+Enter` (Windows)**
6. **Wait for success message**
7. **Close and reopen the connection**
8. **Click "Test"** - should now work ✅

### Option 2: Using Terminal

```bash
# Connect to MySQL
mysql -u root -p

# When prompted for password, press Enter (or enter your password if you set one)

# Then type:
CREATE DATABASE complaint_system;

# You should see:
# Query OK, 1 row affected

# Exit
EXIT;
```

### Option 3: Using Docker (If Using Docker)

```bash
# If you're using Docker MySQL, run:
docker exec mysql-complaint mysql -u root -proot -e "CREATE DATABASE complaint_system;"
```

---

## After Creating Database

1. **In TablePlus**, click "Test" again
2. Should now show ✅ **Connection successful**
3. Click "Connect"
4. **Import schema:**
   - Right-click connection → "Import"
   - Select `database/schema.sql`
   - Click "Import"
5. **Verify 3 tables created:**
   - complaints
   - users
   - complaint_updates

---

## Step-by-Step in TablePlus

```
1. Error dialog appears
   ↓
2. Click "OK"
   ↓
3. Click "Connect" (ignore the error)
   ↓
4. Click "SQL" tab
   ↓
5. Paste: CREATE DATABASE complaint_system;
   ↓
6. Press Cmd+Enter or Ctrl+Enter
   ↓
7. See: "Query OK, 1 row affected"
   ↓
8. Close connection (X button)
   ↓
9. Click "Test" again
   ↓
10. Should see ✅ Connection successful
```

---

## Verify It Worked

After creating database:

1. **In TablePlus**, click "Test"
2. Should show ✅ **Connection successful**
3. Click "Connect"
4. You should see database listed in sidebar

---

## Next: Import Schema

After database is created:

1. Right-click connection → "Import"
2. Select `database/schema.sql`
3. Click "Import"
4. Wait for completion

You should then see 3 tables:
- ✅ complaints
- ✅ users
- ✅ complaint_updates

---

## Then Continue

1. ✅ MySQL running
2. ✅ Database created
3. ✅ Schema imported
4. Start backend: `npm run dev`
5. Start AI service: `python main.py`
6. Start frontend: `npm run dev`
7. Test at http://localhost:5173

---

## Troubleshooting

### Still Getting Error After Creating Database?

1. **Close TablePlus completely**
2. **Reopen TablePlus**
3. **Try connecting again**

### Can't Connect to MySQL?

Make sure MySQL is running:
- Windows: Check Services (services.msc)
- Mac: `brew services list`
- Docker: `docker ps`

### Forgot MySQL Password?

If you set a password during MySQL install:
- Enter it in the "Password" field in TablePlus
- Also update `backend/.env`:
  ```env
  DB_PASSWORD=your_password
  ```

---

## You're Almost There! 🎉

Just need to:
1. Create database (this page)
2. Import schema
3. Start servers
4. Test application
