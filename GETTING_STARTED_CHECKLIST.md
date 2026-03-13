# Getting Started Checklist

## Phase 1: Database Setup with TablePlus ✅

### TablePlus Connection
- [ ] Open TablePlus application
- [ ] Click "+" → Select "MySQL"
- [ ] Enter connection details:
  - [ ] Name: `complaint_system`
  - [ ] Host: `localhost`
  - [ ] Port: `3306`
  - [ ] User: `root`
  - [ ] Password: (leave empty)
  - [ ] Database: `complaint_system`
- [ ] Click "Test" → Verify ✅ Connection successful
- [ ] Click "Save"

### Import Database Schema
- [ ] Right-click connection → "Import"
- [ ] Select `database/schema.sql`
- [ ] Click "Import"
- [ ] Wait for completion

### Verify Database
- [ ] Expand connection in sidebar
- [ ] Verify 3 tables exist:
  - [ ] ✅ complaints
  - [ ] ✅ users
  - [ ] ✅ complaint_updates
- [ ] Click on `complaints` table
- [ ] Click "Structure" tab
- [ ] Verify all columns present
- [ ] Click "Indexes" tab
- [ ] Verify 5 indexes created

### Test Database
- [ ] Click "SQL" tab
- [ ] Type: `SELECT * FROM complaints;`
- [ ] Press `Cmd+Enter` (Mac) or `Ctrl+Enter` (Windows)
- [ ] Verify query executes successfully

---

## Phase 2: Backend Setup ✅

### Install Dependencies
- [ ] Open terminal
- [ ] Navigate to `backend` folder
- [ ] Run: `npm install`
- [ ] Wait for completion

### Configure Environment
- [ ] Check `backend/.env` file exists
- [ ] Verify contents:
  ```
  NODE_ENV=development
  PORT=5000
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=root
  DB_PASSWORD=
  DB_NAME=complaint_system
  AI_SERVICE_URL=http://localhost:8000
  ```

### Start Backend Server
- [ ] In terminal, run: `npm run dev`
- [ ] Wait for message: "Server running on port 5000"
- [ ] Verify: http://localhost:5000/health returns `{"status":"OK"}`

---

## Phase 3: AI Service Setup ✅

### Install Dependencies
- [ ] Open new terminal
- [ ] Navigate to `ai-service` folder
- [ ] Run: `pip install -r requirements.txt`
- [ ] Wait for completion

### Start AI Service
- [ ] Run: `python main.py`
- [ ] Wait for message: "Uvicorn running on http://0.0.0.0:8000"
- [ ] Verify: http://localhost:8000/health returns `{"status":"OK"}`

---

## Phase 4: Frontend Setup ✅

### Install Dependencies
- [ ] Open new terminal
- [ ] Navigate to `frontend` folder
- [ ] Run: `npm install`
- [ ] Wait for completion

### Configure Environment
- [ ] Check `frontend/.env` file exists
- [ ] Verify contents:
  ```
  VITE_API_URL=http://localhost:5000/api
  ```

### Start Frontend Server
- [ ] Run: `npm run dev`
- [ ] Wait for message: "Local: http://localhost:5173"
- [ ] Browser should open automatically

---

## Phase 5: Test Application ✅

### Citizen Workflow
- [ ] Navigate to http://localhost:5173
- [ ] Click "👤 Citizen" tab
- [ ] Fill complaint form:
  - [ ] Title: "Test Pothole"
  - [ ] Description: "Large pothole on Main Street"
  - [ ] Category: "Infrastructure"
  - [ ] Priority: "High"
- [ ] Click "📷 Open Camera"
- [ ] Allow camera permission
- [ ] Click "📸 Capture Photo"
- [ ] Click "📍 Capture Location"
- [ ] Allow location permission
- [ ] Verify date/time auto-populated
- [ ] Click "✓ Submit Complaint"
- [ ] Verify success message

### Verify in TablePlus
- [ ] Switch to TablePlus
- [ ] Click on `complaints` table
- [ ] Click "Data" tab
- [ ] Verify new complaint appears:
  - [ ] ✅ Title: "Test Pothole"
  - [ ] ✅ Image path populated
  - [ ] ✅ Latitude/Longitude captured
  - [ ] ✅ Date/Time recorded
  - [ ] ✅ Status: "submitted"

### Officer Workflow
- [ ] In browser, click "👮 Officer" tab
- [ ] Verify complaint appears in list
- [ ] Click on complaint to view details
- [ ] Verify all information displayed:
  - [ ] ✅ Image visible
  - [ ] ✅ Location coordinates shown
  - [ ] ✅ Date/Time displayed
  - [ ] ✅ Description visible
- [ ] Click "🗺️ View on Google Maps"
- [ ] Verify Google Maps opens with location
- [ ] Change status to "under_review"
- [ ] Add message: "Officer assigned"
- [ ] Click "✓ Update Status"
- [ ] Verify status updated in list

### Verify Update in TablePlus
- [ ] Switch to TablePlus
- [ ] Click on `complaints` table
- [ ] Verify status changed to "under_review"
- [ ] Click on `complaint_updates` table
- [ ] Verify update record created

---

## Phase 6: API Testing ✅

### Test Endpoints
- [ ] Open Postman or use cURL
- [ ] Test GET /api/complaints
  - [ ] Should return list of complaints
- [ ] Test GET /api/complaints/1
  - [ ] Should return specific complaint
- [ ] Test PATCH /api/complaints/1/status
  - [ ] Should update status

### Test AI Service
- [ ] Test POST /categorize
  - [ ] Should return category
- [ ] Test POST /analyze
  - [ ] Should return priority

---

## Phase 7: Deployment Preparation ✅

### Build Frontend
- [ ] In frontend terminal, run: `npm run build`
- [ ] Verify `dist` folder created
- [ ] Check build size is reasonable

### Docker Setup (Optional)
- [ ] Verify `docker-compose.yml` exists
- [ ] Verify all Dockerfiles exist:
  - [ ] `frontend/Dockerfile`
  - [ ] `backend/Dockerfile`
  - [ ] `ai-service/Dockerfile`
- [ ] Test Docker build: `docker-compose build`

---

## Phase 8: Documentation Review ✅

### Read Documentation
- [ ] Read `README.md` - Project overview
- [ ] Read `SETUP.md` - Setup details
- [ ] Read `API_TESTING.md` - API examples
- [ ] Read `DEPLOYMENT.md` - Deployment guide
- [ ] Read `TABLEPLUS_SETUP.md` - TablePlus guide

### Understand Architecture
- [ ] Review `IMPLEMENTATION_SUMMARY.md`
- [ ] Review `project-structure.md`
- [ ] Understand file organization

---

## Troubleshooting Checklist

### If Backend Won't Start
- [ ] Check MySQL is running
- [ ] Verify database exists: `complaint_system`
- [ ] Check `.env` file has correct credentials
- [ ] Check port 5000 is available
- [ ] Review error logs

### If Frontend Won't Start
- [ ] Check Node.js is installed: `node --version`
- [ ] Check npm is installed: `npm --version`
- [ ] Delete `node_modules` and run `npm install` again
- [ ] Check port 5173 is available

### If AI Service Won't Start
- [ ] Check Python is installed: `python --version`
- [ ] Check pip is installed: `pip --version`
- [ ] Verify requirements installed: `pip list`
- [ ] Check port 8000 is available

### If Camera Not Working
- [ ] Check browser permissions
- [ ] Try different browser
- [ ] Check device has camera
- [ ] Use HTTPS in production

### If Location Not Detected
- [ ] Check browser permissions
- [ ] Enable location services on device
- [ ] Try different location
- [ ] Check GPS availability

---

## Success Indicators ✅

### Database
- ✅ TablePlus connection successful
- ✅ 3 tables created
- ✅ Indexes created
- ✅ Sample query executes

### Backend
- ✅ Server running on port 5000
- ✅ Health check returns OK
- ✅ API endpoints respond

### AI Service
- ✅ Service running on port 8000
- ✅ Health check returns OK
- ✅ Categorization works

### Frontend
- ✅ Application loads at http://localhost:5173
- ✅ Camera capture works
- ✅ Location capture works
- ✅ Form submission works

### Integration
- ✅ Complaint submitted successfully
- ✅ Data appears in TablePlus
- ✅ Officer dashboard shows complaint
- ✅ Status update works

---

## Next Steps After Completion

1. **Customize** - Modify categories, priorities, etc.
2. **Add Users** - Create user accounts in database
3. **Configure** - Adjust settings in `.env` files
4. **Deploy** - Follow DEPLOYMENT.md for production
5. **Monitor** - Setup logging and alerts
6. **Scale** - Add more features as needed

---

## Quick Reference

### Ports
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- AI Service: http://localhost:8000
- MySQL: localhost:3306

### Credentials
- MySQL User: `root`
- MySQL Password: (empty)
- MySQL Database: `complaint_system`

### Key Files
- Backend config: `backend/.env`
- Frontend config: `frontend/.env`
- Database schema: `database/schema.sql`
- Docker config: `docker-compose.yml`

### Commands
- Backend: `npm run dev`
- Frontend: `npm run dev`
- AI Service: `python main.py`
- Build Frontend: `npm run build`

---

## Support Resources

- **Quick Start:** QUICK_START.md
- **Setup Guide:** SETUP.md
- **API Testing:** API_TESTING.md
- **Deployment:** DEPLOYMENT.md
- **TablePlus:** TABLEPLUS_SETUP.md
- **Documentation Index:** INDEX.md

---

## Completion Status

```
Phase 1: Database Setup        [ ] → [ ] → [ ] → [ ]
Phase 2: Backend Setup         [ ] → [ ] → [ ]
Phase 3: AI Service Setup      [ ] → [ ]
Phase 4: Frontend Setup        [ ] → [ ] → [ ]
Phase 5: Test Application      [ ] → [ ] → [ ]
Phase 6: API Testing           [ ] → [ ]
Phase 7: Deployment Prep       [ ] → [ ] → [ ]
Phase 8: Documentation         [ ] → [ ]

🎉 All Complete!
```

---

**You're all set! Start building and testing your complaint system.** 🚀
