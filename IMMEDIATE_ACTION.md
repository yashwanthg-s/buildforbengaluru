# Immediate Action Required - MySQL Error

## Your Error
```
Can't connect to MySQL server on 'localhost' (10061)
```

**Cause:** MySQL is not running on your computer.

---

## 🚨 Quick Fix (Choose One - 2-5 minutes)

### Option 1: Windows - Start MySQL Service ⭐ FASTEST

1. Press `Windows Key + R`
2. Type: `services.msc`
3. Find "MySQL80" (or similar)
4. Right-click → "Start"
5. Wait for status to show "Running"
6. Go back to TablePlus and click "Test"

### Option 2: Mac - Start MySQL

```bash
brew services start mysql
```

Then test in TablePlus.

### Option 3: Use Docker (No MySQL Install Needed)

```bash
docker run --name mysql-complaint \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=complaint_system \
  -p 3306:3306 \
  -d mysql:8.0
```

Wait 10 seconds, then test in TablePlus.

### Option 4: Install MySQL First

**Windows:**
- Download: https://dev.mysql.com/downloads/mysql/
- Run installer
- Follow setup (choose "Configure as Windows Service")
- Start service

**Mac:**
```bash
brew install mysql
brew services start mysql
```

---

## After Fixing MySQL

1. **In TablePlus**, click "Test" button
2. Should see ✅ **Connection successful**
3. Click "Connect"
4. Click "SQL" tab
5. Paste and execute:
   ```sql
   CREATE DATABASE complaint_system;
   ```
6. Right-click connection → "Import"
7. Select `database/schema.sql`
8. Click "Import"

---

## Verify It Worked

In TablePlus, you should see:
- ✅ Connection shows green dot
- ✅ 3 tables visible:
  - complaints
  - users
  - complaint_updates

---

## Then Continue

1. Start backend: `npm run dev`
2. Start AI service: `python main.py`
3. Start frontend: `npm run dev`
4. Test at http://localhost:5173

---

## Need More Help?

- **Quick fix:** FIX_MYSQL_ERROR.md
- **Detailed setup:** MYSQL_SETUP.md
- **TablePlus guide:** TABLEPLUS_SETUP.md

---

## Status

- ❌ MySQL not running (FIX THIS FIRST)
- ⏳ Database setup (after MySQL is running)
- ⏳ Backend setup
- ⏳ Frontend setup
- ⏳ Testing

**👉 Start with Option 1, 2, 3, or 4 above!**
