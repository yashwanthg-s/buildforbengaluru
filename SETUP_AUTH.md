# Quick Setup for Authentication System

## Step-by-Step Setup

### 1. Install Backend Dependency

Open terminal in backend folder:

```bash
cd backend
npm install bcryptjs
```

### 2. Update Database

Open TablePlus and run this SQL:

```sql
USE complaint_system;

-- Add username and password columns
ALTER TABLE users 
ADD COLUMN username VARCHAR(100) UNIQUE AFTER phone,
ADD COLUMN password VARCHAR(255) AFTER username,
ADD INDEX idx_username (username);
```

**OR** if you want to start fresh (will delete existing users):

```sql
USE complaint_system;

DROP TABLE IF EXISTS complaint_feedback;
DROP TABLE IF EXISTS complaint_updates;
DROP TABLE IF EXISTS complaint_escalations;
DROP TABLE IF EXISTS complaint_cluster_members;
DROP TABLE IF EXISTS complaint_clusters;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS users;

-- Then run the full schema.sql file
```

### 3. Restart Backend

```bash
cd backend
npm start
```

Expected output:
```
Server running on port 5000
Environment: development
SLA Monitor started - checking every 60 minutes
```

### 4. Restart Frontend

```bash
cd frontend
npm run dev
```

### 5. Test Login

Open http://localhost:5173

You should see the login page!

**Test Admin Login:**
- Role: Admin
- Username: admin
- Password: admin
- Click Login

**Test Officer Login:**
- Role: Officer
- Username: officer
- Password: officer
- Click Login

**Test Citizen Signup:**
- Click "Sign Up Here"
- Fill the form
- Click Sign Up

## Quick Test Commands

### Test Admin Login (API)
```bash
# This won't work for admin (hardcoded), but tests the endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

### Test Citizen Signup (API)
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "username": "testuser",
    "password": "password123"
  }'
```

### Test Citizen Login (API)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Login page appears when opening app
- [ ] Can select role (Citizen/Officer/Admin)
- [ ] Admin login works with admin/admin
- [ ] Officer login works with officer/officer
- [ ] Signup page accessible for citizens
- [ ] Can create new citizen account
- [ ] User info shows in header after login
- [ ] Logout button works
- [ ] Session persists after page refresh

## Common Issues

### bcryptjs not installed
```bash
cd backend
npm install bcryptjs
```

### Database column missing
```sql
ALTER TABLE users 
ADD COLUMN username VARCHAR(100) UNIQUE,
ADD COLUMN password VARCHAR(255);
```

### Port already in use
```bash
# Kill process on port 5000
npx kill-port 5000

# Or on Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Login page not showing
Clear browser cache and localStorage:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

---

**Ready to go!** 🚀

Login credentials:
- Admin: admin / admin
- Officer: officer / officer
- Citizens: Sign up to create account
