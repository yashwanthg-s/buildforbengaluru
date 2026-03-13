# TablePlus - Create Database (Visual Guide)

## Step 1: Error Dialog

```
┌─────────────────────────────────────┐
│  Driver Error                       │
│                                     │
│  Unknown database 'complaint_system'│
│                                     │
│  [OK]                               │
└─────────────────────────────────────┘
```

**Action:** Click **"OK"**

---

## Step 2: Connection Dialog

```
┌──────────────────────────────────────────┐
│  MySQL Connection                        │
│                                          │
│  Name:     complaint_system              │
│  Host:     localhost                     │
│  Port:     3306                          │
│  User:     root                          │
│                                          │
│  [Save]  [Test]  [Connect]               │
│                        ↓                  │
│                   Click here              │
└──────────────────────────────────────────┘
```

**Action:** Click **"Connect"** (even though database doesn't exist yet)

---

## Step 3: Connected to MySQL Server

```
┌──────────────────────────────────────────┐
│  complaint_system                        │
│                                          │
│  [Structure] [SQL] [Data]                │
│              ↓                            │
│         Click here                       │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ SQL Editor                       │   │
│  │                                  │   │
│  │ (empty - ready for SQL)          │   │
│  │                                  │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

**Action:** Click **"SQL"** tab

---

## Step 4: SQL Editor

```
┌──────────────────────────────────────────┐
│  SQL Editor                              │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ CREATE DATABASE complaint_system;│   │
│  │                                  │   │
│  │ (paste the SQL above)            │   │
│  │                                  │   │
│  │ [Execute] [Format] [Save]        │   │
│  │    ↓                              │   │
│  │ Click here                        │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

**Action:** 
1. Paste: `CREATE DATABASE complaint_system;`
2. Click **"Execute"** or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

---

## Step 5: Query Executed

```
┌──────────────────────────────────────────┐
│  SQL Editor                              │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ CREATE DATABASE complaint_system;│   │
│  │                                  │   │
│  │ ✅ Query executed successfully   │   │
│  │                                  │   │
│  │ [Execute] [Format] [Save]        │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

**Result:** Database created! ✅

---

## Step 6: Close and Reconnect

```
1. Close connection (click X)
   ↓
2. Connection disappears from sidebar
   ↓
3. Click "+" to create new connection
   ↓
4. Or double-click existing connection
   ↓
5. Click "Test"
   ↓
6. Should now show ✅ Connection successful
```

---

## Step 7: Verify Connection

```
┌──────────────────────────────────────────┐
│  MySQL Connection                        │
│                                          │
│  Name:     complaint_system              │
│  Host:     localhost                     │
│  Port:     3306                          │
│  User:     root                          │
│                                          │
│  [Test]                                  │
│    ↓                                      │
│  ✅ Connection successful!               │
│                                          │
│  [Save]  [Test]  [Connect]               │
└──────────────────────────────────────────┘
```

**Action:** Click **"Connect"**

---

## Step 8: Import Schema

```
┌──────────────────────────────────────────┐
│  complaint_system (connected)            │
│                                          │
│  Right-click on connection               │
│         ↓                                 │
│  [Import]                                │
│     ↓                                     │
│  Select: database/schema.sql             │
│     ↓                                     │
│  Click: [Import]                         │
│     ↓                                     │
│  ✅ Import successful!                   │
└──────────────────────────────────────────┘
```

---

## Step 9: Verify Tables Created

```
┌──────────────────────────────────────────┐
│  🟢 complaint_system                     │
│  ├─ Tables                               │
│  │  ├─ ✅ complaints                     │
│  │  ├─ ✅ users                          │
│  │  └─ ✅ complaint_updates              │
│  ├─ Views                                │
│  └─ Functions                            │
│                                          │
│  All 3 tables created successfully!      │
└──────────────────────────────────────────┘
```

**Result:** Database setup complete! ✅

---

## Complete Checklist

```
✅ Step 1: Click "OK" on error
✅ Step 2: Click "Connect"
✅ Step 3: Click "SQL" tab
✅ Step 4: Paste CREATE DATABASE command
✅ Step 5: Execute query
✅ Step 6: Reconnect to database
✅ Step 7: Verify connection successful
✅ Step 8: Import schema
✅ Step 9: Verify 3 tables created

🎉 Database Setup Complete!
```

---

## SQL Command to Copy

```sql
CREATE DATABASE complaint_system;
```

Just copy and paste this into the SQL editor in TablePlus.

---

## Next Steps

1. ✅ Create database
2. ✅ Import schema
3. Start backend: `npm run dev`
4. Start AI service: `python main.py`
5. Start frontend: `npm run dev`
6. Test at http://localhost:5173

---

## Keyboard Shortcuts

| Action | Mac | Windows |
|--------|-----|---------|
| Execute Query | `Cmd+Enter` | `Ctrl+Enter` |
| New Query | `Cmd+T` | `Ctrl+T` |

---

## Troubleshooting

### Query Didn't Execute?
- Make sure you're in the SQL tab
- Check the SQL is correct
- Try clicking "Execute" button instead of keyboard shortcut

### Still Getting Error?
- Close TablePlus completely
- Reopen TablePlus
- Try connecting again

### Can't See Tables After Import?
- Refresh: Press `Cmd+R` (Mac) or `Ctrl+R` (Windows)
- Or close and reopen connection

---

**You're almost there! Just a few more steps.** 🚀
