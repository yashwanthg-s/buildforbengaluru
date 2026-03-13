# Fix: "No database selected" Error

## The Problem
```
Query 5: No database selected
```

**Cause:** The SQL script didn't select the database before creating tables.

**Solution:** Already fixed! ✅

---

## What Changed

The `database/schema.sql` now includes:

```sql
CREATE DATABASE IF NOT EXISTS complaint_system;
USE complaint_system;
```

This automatically:
1. Creates the database if it doesn't exist
2. Selects it for all following queries

---

## What To Do Now

### In TablePlus

1. **Copy all content** from `database/schema.sql`
2. **Paste** in SQL editor
3. **Execute** (Cmd+Enter or Ctrl+Enter)
4. **Wait** for all queries to complete

You should see:
```
✅ Query 1: Query executed successfully
✅ Query 2: Query executed successfully
✅ Query 3: Query executed successfully
✅ Query 4: Query executed successfully
✅ Query 5: Query executed successfully
✅ Query 6: Query executed successfully
```

---

## Verify Success

After execution, you should see 5 tables:
- ✅ complaints
- ✅ users
- ✅ complaint_updates
- ✅ audit_logs
- ✅ complaint_stats

---

## Done! 🎉

Your database is now fully set up and ready to use.

Next steps:
1. Start backend: `npm run dev`
2. Start AI service: `python main.py`
3. Start frontend: `npm run dev`
4. Test at http://localhost:5173
