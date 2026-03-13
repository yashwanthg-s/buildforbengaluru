# Quick Fix: MySQL Connection Error

## The Problem
```
Error: Can't connect to MySQL server on 'localhost' (10061)
```

**This means:** MySQL is not running on your computer.

---

## Quick Fix (Choose One)

### Fix 1: Windows - Start MySQL Service (2 minutes)

1. **Open Services**
   - Press `Windows Key + R`
   - Type: `services.msc`
   - Press Enter

2. **Find MySQL**
   - Look for "MySQL80" or "MySQL57" or similar
   - If you see it:
     - Right-click on it
     - Click "Start"
     - Wait for status to show "Running"

3. **Test in TablePlus**
   - Click "Test" button
   - Should now show ✅ Connection successful

---

### Fix 2: Mac - Start MySQL with Homebrew (2 minutes)

```bash
# Start MySQL
brew services start mysql

# Verify it's running
brew services list

# Should show: mysql started
```

Then test in TablePlus.

---

### Fix 3: Use Docker (5 minutes)

If MySQL is not installed, use Docker:

```bash
# Pull MySQL image
docker pull mysql:8.0

# Run MySQL
docker run --name mysql-complaint \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=complaint_system \
  -p 3306:3306 \
  -d mysql:8.0

# Wait 10 seconds for MySQL to start
# Then test in TablePlus
```

---

### Fix 4: Install MySQL (10 minutes)

If MySQL is not installed:

**Windows:**
1. Download: https://dev.mysql.com/downloads/mysql/
2. Run installer
3. Follow setup wizard
4. Choose "Configure MySQL Server as Windows Service"
5. Start the service

**Mac:**
```bash
brew install mysql
brew services start mysql
```

---

## After Fixing

1. **In TablePlus**, click "Test"
2. Should see ✅ **Connection successful**
3. Click "Connect"
4. Create database:
   ```sql
   CREATE DATABASE complaint_system;
   ```
5. Import schema:
   - Right-click → "Import"
   - Select `database/schema.sql`

---

## Verify MySQL is Running

### Windows
- Open Services (services.msc)
- Look for MySQL service
- Status should be "Running"

### Mac
```bash
brew services list
# Should show: mysql started
```

### All Platforms
```bash
mysql -u root -p
# If you can connect, MySQL is running
# Type: exit
```

---

## Still Not Working?

1. **Check port 3306 is available**
   ```bash
   # Windows
   netstat -ano | findstr :3306
   
   # Mac/Linux
   lsof -i :3306
   ```

2. **Check MySQL error logs**
   - Windows: `C:\ProgramData\MySQL\MySQL Server 8.0\Data\`
   - Mac: `/usr/local/var/mysql/`

3. **Try Docker instead**
   - Easiest option if having issues
   - See Fix 3 above

---

## Next Steps

1. ✅ Get MySQL running
2. ✅ Test connection in TablePlus
3. Create database
4. Import schema
5. Start backend: `npm run dev`
6. Start frontend: `npm run dev`

---

## Need Help?

See **MYSQL_SETUP.md** for detailed instructions.
