# Authentication System - Complete Guide

## Overview

A complete authentication system with login and signup functionality for three user roles:
- **Citizen**: Can submit complaints and view their history
- **Officer**: Can manage assigned complaints
- **Admin**: Can view all complaints and assign to officers

## Features Implemented

### 1. Login Page
- Role-based login (Citizen, Officer, Admin)
- Hardcoded credentials for admin and officer
- Database authentication for citizens
- Beautiful gradient UI with animations
- Form validation and error handling

### 2. Signup Page (Citizens Only)
- Full registration form with validation
- Fields: Name, Email, Phone, Username, Password
- Password confirmation
- Email and username uniqueness check
- Automatic login after signup

### 3. Session Management
- User data stored in localStorage
- Persistent login across page refreshes
- Logout functionality
- User info displayed in header

### 4. Role-Based Navigation
- Citizens see: Submit Complaint, My History
- Officers see: Officer Dashboard
- Admins see: Admin Dashboard
- Logout button for all roles

### 5. Integrated History
- History feature now inside citizen dashboard
- Accessible via "My History" button
- Shows only logged-in user's complaints

## Credentials

### Admin
```
Username: admin
Password: admin
```

### Officer
```
Username: officer
Password: officer
```

### Citizens
- Must sign up to create account
- Or use existing database users

## Database Changes

### Updated Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  username VARCHAR(100) UNIQUE,      -- NEW
  password VARCHAR(255),              -- NEW (hashed)
  role ENUM('citizen', 'officer', 'admin') DEFAULT 'citizen',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),      -- NEW
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
);
```

## Setup Instructions

### Step 1: Update Database Schema

Run the updated schema in TablePlus or MySQL:

```sql
-- Add username and password columns to existing users table
ALTER TABLE users 
ADD COLUMN username VARCHAR(100) UNIQUE AFTER phone,
ADD COLUMN password VARCHAR(255) AFTER username,
ADD INDEX idx_username (username);
```

Or drop and recreate the table (will lose existing data):

```sql
DROP TABLE IF EXISTS users;
-- Then run the full CREATE TABLE statement from schema.sql
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install bcryptjs
```

This installs the password hashing library.

### Step 3: Restart Backend Server

```bash
cd backend
npm start
```

You should see:
```
Server running on port 5000
Environment: development
SLA Monitor started - checking every 60 minutes
```

### Step 4: Restart Frontend

```bash
cd frontend
npm run dev
```

### Step 5: Test the System

1. Open http://localhost:5173
2. You'll see the login page
3. Try logging in as admin or officer
4. Or click "Sign Up Here" to create a citizen account

## User Flow

### Citizen Flow

1. **First Time User**
   - Click "Sign Up Here"
   - Fill registration form
   - Submit → Automatically logged in
   - Redirected to Submit Complaint page

2. **Returning User**
   - Enter username and password
   - Select "Citizen" role
   - Click Login
   - Access Submit Complaint and My History

3. **Submit Complaint**
   - Fill complaint form
   - Capture photo and location
   - Submit → Complaint saved with user ID

4. **View History**
   - Click "My History" button
   - See all your complaints
   - Provide feedback on resolved complaints

5. **Logout**
   - Click "Logout" button
   - Redirected to login page

### Officer Flow

1. **Login**
   - Username: officer
   - Password: officer
   - Select "Officer" role
   - Click Login

2. **Dashboard**
   - See assigned complaints
   - Update complaint status
   - View complaint details

3. **Logout**
   - Click "Logout" button

### Admin Flow

1. **Login**
   - Username: admin
   - Password: admin
   - Select "Admin" role
   - Click Login

2. **Dashboard**
   - View all complaints
   - Click stat cards to filter
   - Use "Detect Emergency Using AI"
   - Assign complaints to officers
   - View feedback

3. **Logout**
   - Click "Logout" button

## API Endpoints

### POST /api/auth/signup
Create new citizen account

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": 3,
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "role": "citizen"
  }
}
```

### POST /api/auth/login
Login with username and password

**Request:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 3,
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "role": "citizen"
  }
}
```

## Security Features

### Password Hashing
- Passwords hashed using bcryptjs
- Salt rounds: 10
- Never stored in plain text

### Session Storage
- User data in localStorage
- No sensitive data stored (password excluded)
- Cleared on logout

### Input Validation
- Frontend validation for all fields
- Backend validation for required fields
- Email format validation
- Username uniqueness check
- Password length requirements (min 6 characters)

### Role-Based Access
- Admin and officer credentials hardcoded
- Citizens must register
- Each role sees only their authorized pages

## Files Created/Modified

### New Files
1. `frontend/src/components/Login.jsx` - Login component
2. `frontend/src/components/Signup.jsx` - Signup component
3. `frontend/src/styles/Login.css` - Login/Signup styles
4. `backend/controllers/authController.js` - Auth logic
5. `backend/routes/auth.js` - Auth routes

### Modified Files
1. `frontend/src/App.jsx` - Added auth state and routing
2. `frontend/src/App.css` - Updated header styles
3. `frontend/src/components/ComplaintForm.jsx` - Added userId prop
4. `frontend/src/components/CitizenHistory.jsx` - Added userId prop
5. `backend/server.js` - Added auth routes
6. `backend/package.json` - Added bcryptjs dependency
7. `database/schema.sql` - Added username and password fields

## Testing Checklist

### Login Tests
- [ ] Admin login with correct credentials
- [ ] Admin login with wrong credentials
- [ ] Officer login with correct credentials
- [ ] Officer login with wrong credentials
- [ ] Citizen login with existing account
- [ ] Citizen login with wrong password
- [ ] Citizen login with non-existent username

### Signup Tests
- [ ] Create new citizen account
- [ ] Signup with existing username (should fail)
- [ ] Signup with existing email (should fail)
- [ ] Signup with invalid email format
- [ ] Signup with short password (< 6 chars)
- [ ] Signup with mismatched passwords
- [ ] Signup with missing required fields

### Session Tests
- [ ] Login persists after page refresh
- [ ] Logout clears session
- [ ] User info displayed in header
- [ ] Role-based navigation works

### Integration Tests
- [ ] Citizen can submit complaint after login
- [ ] Citizen sees only their complaints in history
- [ ] Officer sees assigned complaints
- [ ] Admin sees all complaints
- [ ] Logout redirects to login page

## Troubleshooting

### Issue: "bcryptjs not found"
**Solution:**
```bash
cd backend
npm install bcryptjs
npm start
```

### Issue: "Column 'username' doesn't exist"
**Solution:** Update database schema
```sql
ALTER TABLE users 
ADD COLUMN username VARCHAR(100) UNIQUE AFTER phone,
ADD COLUMN password VARCHAR(255) AFTER username;
```

### Issue: "Cannot read property 'id' of null"
**Solution:** Make sure you're logged in. Check localStorage for user data.

### Issue: Login page not showing
**Solution:** Clear localStorage and refresh:
```javascript
localStorage.clear();
location.reload();
```

### Issue: "Username already exists"
**Solution:** Choose a different username or login with existing account.

## Future Enhancements

Potential improvements:
- JWT token-based authentication
- Password reset functionality
- Email verification
- Two-factor authentication
- Remember me checkbox
- Social login (Google, Facebook)
- Profile page for users
- Change password feature
- Admin user management panel

## Security Best Practices

1. **Never commit credentials** - Admin/officer passwords should be in .env
2. **Use HTTPS in production** - Encrypt data in transit
3. **Implement rate limiting** - Prevent brute force attacks
4. **Add CSRF protection** - Prevent cross-site request forgery
5. **Validate all inputs** - Both frontend and backend
6. **Use secure session storage** - Consider httpOnly cookies
7. **Implement password policies** - Minimum length, complexity
8. **Log authentication attempts** - Monitor for suspicious activity

---

**Status**: ✅ Complete authentication system implemented
**Ready to use**: Yes - login page appears on app load
**Default credentials**: admin/admin, officer/officer
