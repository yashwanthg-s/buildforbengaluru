# Create Database - Simple Steps

## In TablePlus

### Step 1: Open SQL Editor
- Click **"SQL"** tab

### Step 2: Copy This Command
```sql
CREATE DATABASE complaint_system;
```

### Step 3: Paste & Execute
- Paste the command in SQL editor
- Press `Cmd+Enter` (Mac) or `Ctrl+Enter` (Windows)
- Wait for: ✅ Query executed successfully

### Step 4: Create Tables
- Copy all content from `database/schema.sql`
- Paste in SQL editor
- Press `Cmd+Enter` or `Ctrl+Enter`
- Wait for: ✅ Query executed successfully

### Step 5: Verify
- Refresh connection (Cmd+R or Ctrl+R)
- You should see 5 tables:
  - ✅ complaints
  - ✅ users
  - ✅ complaint_updates
  - ✅ audit_logs
  - ✅ complaint_stats

---

## Done! ✅

Your database is ready to use.

Next: Start the servers
- Backend: `npm run dev`
- AI Service: `python main.py`
- Frontend: `npm run dev`
