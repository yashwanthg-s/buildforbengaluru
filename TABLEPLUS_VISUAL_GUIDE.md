# TablePlus Visual Setup Guide

## Step-by-Step with Screenshots Description

### Step 1: Open TablePlus

```
┌─────────────────────────────────────┐
│         TablePlus Application       │
│                                     │
│  [Create] [+] [Settings] [Help]    │
│                                     │
│  Connections:                       │
│  ├─ (empty - no connections yet)   │
│                                     │
└─────────────────────────────────────┘
```

**Action:** Click the **"+"** button or **"Create"** button

---

### Step 2: Select MySQL

```
┌─────────────────────────────────────┐
│      Choose Database Type           │
│                                     │
│  ☐ PostgreSQL                       │
│  ☐ MySQL          ← SELECT THIS     │
│  ☐ MariaDB                          │
│  ☐ Redis                            │
│  ☐ MongoDB                          │
│  ☐ SQLite                           │
│                                     │
│  [Cancel]  [Create]                 │
└─────────────────────────────────────┘
```

**Action:** Click **MySQL** then **"Create"**

---

### Step 3: Enter Connection Details

```
┌──────────────────────────────────────────┐
│     New MySQL Connection                 │
│                                          │
│  Name:        [complaint_system      ]   │
│  Host:        [localhost             ]   │
│  Port:        [3306                  ]   │
│  User:        [root                  ]   │
│  Password:    [                      ]   │
│  Database:    [complaint_system      ]   │
│                                          │
│  ☐ Use SSH Tunnel                        │
│  ☐ Use SSL                               │
│                                          │
│  [Test]  [Cancel]  [Save]                │
└──────────────────────────────────────────┘
```

**Fill in:**
- Name: `complaint_system`
- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: (leave empty)
- Database: `complaint_system`

---

### Step 4: Test Connection

```
┌──────────────────────────────────────────┐
│     New MySQL Connection                 │
│                                          │
│  Name:        [complaint_system      ]   │
│  Host:        [localhost             ]   │
│  Port:        [3306                  ]   │
│  User:        [root                  ]   │
│  Password:    [                      ]   │
│  Database:    [complaint_system      ]   │
│                                          │
│  [Test]  [Cancel]  [Save]                │
│   ↓                                       │
│  ✅ Connection successful!               │
│                                          │
└──────────────────────────────────────────┘
```

**Action:** Click **"Test"** button

**Expected:** Green checkmark with "Connection successful!"

---

### Step 5: Save Connection

```
┌──────────────────────────────────────────┐
│     New MySQL Connection                 │
│                                          │
│  Name:        [complaint_system      ]   │
│  Host:        [localhost             ]   │
│  Port:        [3306                  ]   │
│  User:        [root                  ]   │
│  Password:    [                      ]   │
│  Database:    [complaint_system      ]   │
│                                          │
│  ✅ Connection successful!               │
│                                          │
│  [Test]  [Cancel]  [Save]                │
│                        ↓                  │
│                   Click here              │
└──────────────────────────────────────────┘
```

**Action:** Click **"Save"** button

---

### Step 6: Connection Saved

```
┌─────────────────────────────────────┐
│         TablePlus Application       │
│                                     │
│  [Create] [+] [Settings] [Help]    │
│                                     │
│  Connections:                       │
│  ├─ 🟢 complaint_system             │
│     ├─ Tables                       │
│     ├─ Views                        │
│     └─ Functions                    │
│                                     │
└─────────────────────────────────────┘
```

**Result:** Connection appears in sidebar with green dot (connected)

---

## Step 7: Import Database Schema

### Option A: Using Import Button

```
┌─────────────────────────────────────┐
│  🟢 complaint_system                │
│  ├─ Tables                          │
│  ├─ Views                           │
│  └─ Functions                       │
│                                     │
│  Right-click → [Import]             │
│                                     │
│  Select: database/schema.sql        │
│  Click: [Import]                    │
│                                     │
│  ✅ Import successful!              │
└─────────────────────────────────────┘
```

### Option B: Using SQL Editor

```
┌──────────────────────────────────────────┐
│  🟢 complaint_system                     │
│                                          │
│  [Structure] [SQL] [Data]                │
│                      ↓                    │
│  ┌──────────────────────────────────┐   │
│  │ SQL Editor                       │   │
│  │                                  │   │
│  │ CREATE TABLE complaints (        │   │
│  │   id INT PRIMARY KEY AUTO_INC... │   │
│  │   ...                            │   │
│  │ );                               │   │
│  │                                  │   │
│  │ [Execute] [Format] [Save]        │   │
│  │    ↓                              │   │
│  │ ✅ Query executed successfully   │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

---

## Step 8: Verify Tables Created

```
┌─────────────────────────────────────┐
│  🟢 complaint_system                │
│  ├─ Tables                          │
│  │  ├─ ✅ complaints                │
│  │  ├─ ✅ users                     │
│  │  └─ ✅ complaint_updates         │
│  ├─ Views                           │
│  └─ Functions                       │
│                                     │
│  All 3 tables created successfully! │
└─────────────────────────────────────┘
```

**Expected:** Three tables visible in sidebar

---

## Step 9: View Table Structure

```
┌──────────────────────────────────────────┐
│  complaints table                        │
│                                          │
│  [Structure] [Data] [Indexes]            │
│       ↓                                   │
│  ┌──────────────────────────────────┐   │
│  │ Column Name    │ Type    │ Null  │   │
│  ├────────────────┼─────────┼───────┤   │
│  │ id             │ INT     │ NO    │   │
│  │ user_id        │ INT     │ NO    │   │
│  │ title          │ VARCHAR │ NO    │   │
│  │ description    │ TEXT    │ NO    │   │
│  │ image_path     │ VARCHAR │ NO    │   │
│  │ latitude       │ DECIMAL │ NO    │   │
│  │ longitude      │ DECIMAL │ NO    │   │
│  │ date           │ DATE    │ NO    │   │
│  │ time           │ TIME    │ NO    │   │
│  │ category       │ VARCHAR │ YES   │   │
│  │ priority       │ ENUM    │ YES   │   │
│  │ status         │ ENUM    │ YES   │   │
│  │ created_at     │ TIMESTAMP│ NO   │   │
│  │ updated_at     │ TIMESTAMP│ NO   │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

**Action:** Click on `complaints` table → Click **"Structure"** tab

---

## Step 10: Check Indexes

```
┌──────────────────────────────────────────┐
│  complaints table                        │
│                                          │
│  [Structure] [Data] [Indexes]            │
│                        ↓                  │
│  ┌──────────────────────────────────┐   │
│  │ Index Name      │ Columns        │   │
│  ├─────────────────┼────────────────┤   │
│  │ PRIMARY         │ id             │   │
│  │ idx_user_id     │ user_id        │   │
│  │ idx_status      │ status         │   │
│  │ idx_category    │ category       │   │
│  │ idx_location    │ latitude, lng  │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

**Action:** Click **"Indexes"** tab

**Expected:** 5 indexes visible

---

## Step 11: Test with Sample Query

```
┌──────────────────────────────────────────┐
│  SQL Editor                              │
│                                          │
│  SELECT * FROM complaints;               │
│                                          │
│  [Execute]                               │
│       ↓                                   │
│  ┌──────────────────────────────────┐   │
│  │ (No results - table is empty)    │   │
│  │                                  │   │
│  │ ✅ Query executed successfully   │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

**Action:** 
1. Click **"SQL"** tab
2. Type: `SELECT * FROM complaints;`
3. Click **"Execute"** or press `Cmd+Enter`

**Expected:** Query executes successfully (empty result is OK)

---

## Complete Setup Checklist

```
✅ Step 1:  Open TablePlus
✅ Step 2:  Select MySQL
✅ Step 3:  Enter connection details
✅ Step 4:  Test connection (green checkmark)
✅ Step 5:  Save connection
✅ Step 6:  Connection appears in sidebar
✅ Step 7:  Import database schema
✅ Step 8:  Verify 3 tables created
✅ Step 9:  View table structure
✅ Step 10: Check indexes
✅ Step 11: Test with sample query

🎉 Database Setup Complete!
```

---

## Connection Details Reference

```
┌─────────────────────────────────────┐
│  Connection Information             │
├─────────────────────────────────────┤
│  Name:     complaint_system         │
│  Host:     localhost                │
│  Port:     3306                     │
│  User:     root                     │
│  Password: (empty)                  │
│  Database: complaint_system         │
└─────────────────────────────────────┘
```

---

## Next Steps After Setup

```
1. ✅ TablePlus connection ready
   ↓
2. Start Backend Server
   npm run dev
   ↓
3. Start Frontend
   npm run dev
   ↓
4. Test Application
   http://localhost:5173
   ↓
5. Submit Test Complaint
   ↓
6. View in TablePlus
   SELECT * FROM complaints;
```

---

## Keyboard Shortcuts Cheat Sheet

```
┌──────────────────────────────────────┐
│  Mac                 │  Windows       │
├──────────────────────┼────────────────┤
│ Cmd+Enter            │ Ctrl+Enter     │
│ Execute Query        │ Execute Query  │
├──────────────────────┼────────────────┤
│ Cmd+T                │ Ctrl+T         │
│ New Query Tab        │ New Query Tab  │
├──────────────────────┼────────────────┤
│ Cmd+Shift+F          │ Ctrl+Shift+F   │
│ Format SQL           │ Format SQL     │
├──────────────────────┼────────────────┤
│ Cmd+F                │ Ctrl+F         │
│ Search               │ Search         │
└──────────────────────┴────────────────┘
```

---

## Troubleshooting Visual Guide

### Connection Failed

```
❌ Connection refused

Possible causes:
1. MySQL not running
2. Wrong host/port
3. Wrong credentials

Solutions:
✓ Check MySQL is running
✓ Verify host: localhost
✓ Verify port: 3306
✓ Verify user: root
```

### Database Not Found

```
❌ Unknown database 'complaint_system'

Solution:
1. Open SQL editor
2. Run: CREATE DATABASE complaint_system;
3. Then import schema
```

### Import Failed

```
❌ Error importing file

Solutions:
1. Try SQL editor method
2. Check file path
3. Verify file permissions
4. Check for syntax errors
```

---

## You're All Set! 🎉

Your TablePlus connection is ready to use with the complaint system database.

**Next:** Start the backend and frontend servers to begin testing!
