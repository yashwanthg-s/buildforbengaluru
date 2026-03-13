# Geo-Tagged Complaint System - Setup Guide

## Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- MySQL 5.7+
- Git

## Project Structure

```
complaint-system/
├── frontend/          # React.js application
├── backend/           # Node.js Express server
├── ai-service/        # Python FastAPI service
├── database/          # MySQL schema
└── docs/              # Documentation
```

## 1. Database Setup

### Create MySQL Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE complaint_system;
USE complaint_system;
```

### Import Schema

```bash
mysql -u root -p complaint_system < database/schema.sql
```

## 2. Backend Setup

### Install Dependencies

```bash
cd backend
npm install
```

### Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=complaint_system

AI_SERVICE_URL=http://localhost:8000
```

### Start Backend Server

```bash
npm run dev
```

Server runs on `http://localhost:5000`

## 3. AI Service Setup

### Install Python Dependencies

```bash
cd ai-service
pip install -r requirements.txt
```

### Configure Environment

```bash
cp .env.example .env
```

### Start AI Service

```bash
python main.py
```

Service runs on `http://localhost:8000`

## 4. Frontend Setup

### Install Dependencies

```bash
cd frontend
npm install
```

### Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### Start Development Server

```bash
npm run dev
```

Application runs on `http://localhost:5173`

## 5. Testing the System

### Citizen Workflow

1. Navigate to `http://localhost:5173`
2. Click "👤 Citizen" tab
3. Fill complaint form:
   - Title: "Pothole on Main Street"
   - Description: "Large pothole causing accidents"
   - Category: Infrastructure
   - Priority: High
4. Click "📷 Open Camera" to capture live photo
5. Click "📍 Capture Location" to get GPS coordinates
6. Click "✓ Submit Complaint"

### Officer Workflow

1. Click "👮 Officer" tab
2. View all submitted complaints
3. Filter by status, category, or priority
4. Click complaint to view details
5. Click "🗺️ View on Google Maps" to see location
6. Update status and add message
7. Click "✓ Update Status"

## 6. API Endpoints

### Complaints

- `POST /api/complaints` - Submit new complaint
- `GET /api/complaints` - Get all complaints (with filters)
- `GET /api/complaints/:id` - Get specific complaint
- `PATCH /api/complaints/:id/status` - Update complaint status
- `DELETE /api/complaints/:id` - Delete complaint

### AI Service

- `POST /categorize` - Categorize complaint
- `POST /analyze` - Analyze priority
- `GET /health` - Health check

## 7. Security Considerations

### Frontend
- Live camera capture only (no gallery uploads)
- GPS location required
- Automatic timestamp (user cannot edit)
- Form validation before submission

### Backend
- File upload validation (images only, 10MB limit)
- Coordinate validation (valid lat/lng ranges)
- CORS configured for frontend origin
- Input sanitization

### Database
- Prepared statements (prevent SQL injection)
- Indexed location fields for fast queries
- Audit trail via complaint_updates table

## 8. Deployment

### Production Build

Frontend:
```bash
cd frontend
npm run build
```

Backend:
```bash
cd backend
npm install --production
NODE_ENV=production node server.js
```

AI Service:
```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Environment Variables

Set production environment variables:
- Database credentials
- Frontend URL
- AI service URL
- Node environment

## 9. Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure HTTPS in production
- Test with different browsers

### Location Not Detected
- Check browser geolocation permissions
- Ensure device has GPS/location services
- Test with different locations

### Database Connection Error
- Verify MySQL is running
- Check credentials in .env
- Ensure database exists

### AI Service Not Responding
- Verify Python service is running
- Check port 8000 is available
- Review service logs

## 10. Features

✅ Live camera capture (no gallery uploads)
✅ Automatic GPS location capture
✅ Automatic date/time recording
✅ AI-powered complaint categorization
✅ Officer dashboard with filtering
✅ Google Maps integration
✅ Geo-tagged evidence storage
✅ Complaint status tracking
✅ Mobile responsive design
