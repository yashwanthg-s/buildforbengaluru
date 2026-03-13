# Geo-Tagged Complaint System - Project Structure

## Directory Layout
```
complaint-system/
├── frontend/                 # React.js application
│   ├── src/
│   │   ├── components/
│   │   │   ├── CameraCapture.jsx
│   │   │   ├── ComplaintForm.jsx
│   │   │   ├── OfficerDashboard.jsx
│   │   │   └── LocationDisplay.jsx
│   │   ├── services/
│   │   │   ├── cameraService.js
│   │   │   ├── locationService.js
│   │   │   └── complaintService.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Node.js Express server
│   ├── routes/
│   │   └── complaints.js
│   ├── controllers/
│   │   └── complaintController.js
│   ├── models/
│   │   └── Complaint.js
│   ├── middleware/
│   │   └── upload.js
│   ├── config/
│   │   └── database.js
│   ├── server.js
│   └── package.json
├── ai-service/               # Python FastAPI service
│   ├── main.py
│   ├── requirements.txt
│   └── models/
│       └── categorizer.py
└── database/
    └── schema.sql
```
