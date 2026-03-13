# MySQL Setup Guide - Fix Connection Error

## Error: "Can't connect to MySQL server on 'localhost' (10061)"

This error means **MySQL is not running**. Let's fix it.

---

## Windows Setup

### Option 1: Using MySQL Installer (Recommended)

1. **Download MySQL**
   - Go to: https://dev.mysql.com/downloads/mysql/
   - Download MySQL Community Server (latest version)
   - Run the installer

2. **Install MySQL**
   - Follow the installer steps
   - Choose "Server only" or "Full"
   - Configure MySQL Server:
     - Port: `3306` (default)
     - MySQL Root Password: (set a password or leave empty)
     - Windows Service: Check "Configure MySQL Server as a Windows Service"

3. **Start MySQL Service**
   - Open Services (search "services.msc")
   - Find "MySQL80" (or your version)
   - Right-click → "Start"
   - Status should show "Running"

### Option 2: Using Homebrew (Mac)

```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MySQL
brew install mysql

# Start MySQL
brew services start mysql

# Verify running
brew services list
```

### Option 3: Using Docker (All Platforms)

```bash
# Pull MySQL image
docker pull mysql:8.0

# Run MySQL container
docker run --name mysql-complaint \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=complaint_system \
  -p 3306:3306 \
  -d mysql:8.0

# Verify running
docker ps
```

---

## Verify MySQL is Running

### Windows
1. Open Services (search "services.msc")
2. Look for "MySQL80" or similar
3. Status should show "Running"
4. If not, right-click → "Start"

### Mac
```bash
brew services list
# Should show: mysql started
```

### Linux
```bash
sudo systemctl status mysql
# Should show: active (running)
```

### All Platforms - Test Connection
```bash
# Try to connect
mysql -u root -p

# If successful, you'll see:
# mysql>

# Type: exit
# To quit
```

---

## Update TablePlus Connection

After MySQL is running:

1. **In TablePlus**, click "Test" again
2. Should now show ✅ **Connection successful**
3. If still fails, check:
   - Host: `localhost` (correct)
   - Port: `3306` (correct)
   - User: `root` (correct)
   - Password: (check if you set one during install)

---

## If You Set a MySQL Password

If you set a password during MySQL installation:

1. **In TablePlus**, enter the password in the "Password" field
2. **In backend/.env**, update:
   ```env
   DB_PASSWORD=your_mysql_password
   ```

---

## Create Database

After MySQL is running:

### Option 1: Using TablePlus
1. Click "Test" → Should succeed
2. Click "Connect"
3. Click "SQL" tab
4. Paste:
   ```sql
   CREATE DATABASE complaint_system;
   ```
5. Press `Cmd+Enter` (Mac) or `Ctrl+Enter` (Windows)

### Option 2: Using Terminal
```bash
mysql -u root -p
# Enter password (or press Enter if no password)

# Then type:
CREATE DATABASE complaint_system;
EXIT;
```

---

## Import Database Schema

After database is created:

### In TablePlus
1. Right-click connection → "Import"
2. Select `database/schema.sql`
3. Click "Import"
4. Wait for completion

### Or Using Terminal
```bash
mysql -u root -p complaint_system < database/schema.sql
```

---

## Troubleshooting

### MySQL Won't Start

**Windows:**
1. Open Services (services.msc)
2. Right-click MySQL service
3. Click "Properties"
4. Check "Startup type" is "Automatic"
5. Click "Start"

**Mac:**
```bash
# Check if running
brew services list

# Start if not running
brew services start mysql

# Restart if having issues
brew services restart mysql
```

**Docker:**
```bash
# Check if container running
docker ps

# Start if not running
docker start mysql-complaint

# View logs
docker logs mysql-complaint
```

### Port Already in Use

If port 3306 is already in use:

**Windows:**
```powershell
# Find process using port 3306
netstat -ano | findstr :3306

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Find process using port 3306
lsof -i :3306

# Kill process
kill -9 <PID>
```

### Wrong Password

If you forgot your MySQL password:

**Windows:**
1. Stop MySQL service
2. Start MySQL without password:
   ```
   mysqld --skip-grant-tables
   ```
3. Connect without password:
   ```
   mysql -u root
   ```
4. Reset password:
   ```sql
   FLUSH PRIVILEGES;
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
   ```

---

## Quick Checklist

- [ ] MySQL installed
- [ ] MySQL service running
- [ ] Can connect with: `mysql -u root -p`
- [ ] Database created: `complaint_system`
- [ ] Schema imported: `database/schema.sql`
- [ ] TablePlus connection successful
- [ ] 3 tables visible in TablePlus

---

## Next Steps

1. ✅ Get MySQL running
2. ✅ Create database
3. ✅ Import schema
4. ✅ Test TablePlus connection
5. Start backend: `npm run dev`
6. Start frontend: `npm run dev`
7. Test application

---

## MySQL Installation Links

- **Windows:** https://dev.mysql.com/downloads/mysql/
- **Mac (Homebrew):** `brew install mysql`
- **Docker:** `docker pull mysql:8.0`
- **Linux:** `sudo apt install mysql-server`

---

## Support

If still having issues:
1. Check MySQL is running
2. Verify port 3306 is available
3. Check credentials (user: root)
4. Review MySQL error logs
5. Try Docker option as alternative
