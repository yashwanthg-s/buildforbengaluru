# Run Frontend & Backend - Step by Step

## Terminal 1: Backend Server

```bash
# Navigate to backend folder
cd backend

# Install dependencies (first time only)
npm install

# Start backend server
npm run dev
```

**Expected output:**
```
Server running on port 5000
```

**Access:** http://localhost:5000/health

---

## Terminal 2: Frontend Server

```bash
# Open NEW terminal window/tab

# Navigate to frontend folder
cd frontend

# Install dependencies (first time only)
npm install

# Start frontend server
npm run dev
```

**Expected output:**
```
Local: http://localhost:5173
```

**Access:** http://localhost:5173

---

## Terminal 3: AI Service (Optional but Recommended)

```bash
# Open NEW terminal window/tab

# Navigate to ai-service folder
cd ai-service

# Install dependencies (first time only)
pip install -r requirements.txt

# Start AI service
python main.py
```

**Expected output:**
```
Uvicorn running on http://0.0.0.0:8000
```

**Access:** http://localhost:8000/health

---

## Quick Summary

| Service | Command | Port | URL |
|---------|---------|------|-----|
| Backend | `cd backend && npm run dev` | 5000 | http://localhost:5000 |
| Frontend | `cd frontend && npm run dev` | 5173 | http://localhost:5173 |
| AI Service | `cd ai-service && python main.py` | 8000 | http://localhost:8000 |

---

## First Time Setup

Run these commands ONCE in each folder:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install

# AI Service
cd ai-service
pip install -r requirements.txt
```

---

## After Setup

Just run:
- Backend: `npm run dev` (in backend folder)
- Frontend: `npm run dev` (in frontend folder)
- AI Service: `python main.py` (in ai-service folder)

---

## Test the System

1. Open http://localhost:5173
2. Click "👤 Citizen"
3. Submit a test complaint
4. Check TablePlus for data

---

## Troubleshooting

### Backend won't start
- Check MySQL is running
- Check port 5000 is available
- Check `.env` file has correct database credentials

### Frontend won't start
- Check Node.js is installed: `node --version`
- Check port 5173 is available
- Delete `node_modules` and run `npm install` again

### AI Service won't start
- Check Python is installed: `python --version`
- Check pip is installed: `pip --version`
- Check port 8000 is available

---

## Keep All 3 Running

For full functionality, keep all three terminals open:
- Terminal 1: Backend
- Terminal 2: Frontend
- Terminal 3: AI Service

Then access: http://localhost:5173
