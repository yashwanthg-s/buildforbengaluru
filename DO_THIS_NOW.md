# DO THIS NOW - Create Database

## Your Current Error
```
Unknown database 'complaint_system'
```

**Good news:** MySQL is running! ✅
**What to do:** Create the database (2 minutes)

---

## 🎯 Exact Steps

### Step 1: Close Error
- Click **"OK"** on the error dialog

### Step 2: Connect Anyway
- Click **"Connect"** button
- (It will connect to MySQL server, just not the database yet)

### Step 3: Open SQL Editor
- Click **"SQL"** tab at the top

### Step 4: Create Database
- Copy this:
  ```sql
  CREATE DATABASE complaint_system;
  ```
- Paste into SQL editor
- Press `Cmd+Enter` (Mac) or `Ctrl+Enter` (Windows)
- Wait for: ✅ Query executed successfully

### Step 5: Reconnect
- Close the connection (click X)
- Double-click the connection again
- Click **"Test"**
- Should now show ✅ **Connection successful**

### Step 6: Import Schema
- Right-click connection
- Click **"Import"**
- Select `database/schema.sql`
- Click **"Import"**
- Wait for completion

### Step 7: Verify
- You should see 3 tables:
  - ✅ complaints
  - ✅ users
  - ✅ complaint_updates

---

## ✅ Done!

Your database is now ready. Next:

1. Start backend: `npm run dev`
2. Start AI service: `python main.py`
3. Start frontend: `npm run dev`
4. Test at http://localhost:5173

---

## Need Visual Help?

See: **TABLEPLUS_CREATE_DB_VISUAL.md**

---

## That's It!

You're 90% done. Just follow the 7 steps above.
