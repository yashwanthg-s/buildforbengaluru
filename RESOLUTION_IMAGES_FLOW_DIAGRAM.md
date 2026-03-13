# Resolution Images - Flow Diagram

## Complete Flow: Officer Resolving a Complaint

```
┌─────────────────────────────────────────────────────────────────────┐
│                         OFFICER DASHBOARD                           │
│                                                                     │
│  1. Officer selects complaint from list                            │
│  2. Clicks "Update Status" → "Resolved"                            │
│  3. Clicks "Upload Resolution Images"                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RESOLUTION UPLOAD FORM                           │
│                                                                     │
│  Step 1️⃣: Upload BEFORE image (issue before work)                  │
│  Step 2️⃣: Upload AFTER image (issue after work)                    │
│  Step 3️⃣: Add optional work notes                                  │
│                                                                     │
│  [Upload Before] [Upload After] [Add Notes]                        │
│                                                                     │
│  Progress: ✓ Before  ✓ After  ○ Notes                              │
│                                                                     │
│  [Submit Resolution] [Cancel]                                      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND PROCESSING                              │
│                                                                     │
│  1. Convert images to base64 (FileReader API)                      │
│  2. Create JSON payload:                                           │
│     {                                                              │
│       officer_id: 2,                                               │
│       before_image: "data:image/jpeg;base64,...",                  │
│       after_image: "data:image/jpeg;base64,...",                   │
│       resolution_notes: "Fixed the pothole"                        │
│     }                                                              │
│  3. Send POST request to backend                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
        ┌─────────────────────────────────────────────────┐
        │  POST /api/complaints/:id/resolve               │
        │  Content-Type: application/json                 │
        │  Body: { officer_id, before_image, after_image, │
        │          resolution_notes }                     │
        └─────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND PROCESSING                               │
│                                                                     │
│  complaintController.resolveComplaint()                            │
│                                                                     │
│  1. Validate inputs (officer_id, images required)                  │
│  2. Check complaint exists                                         │
│  3. Save before image to disk                                      │
│     └─ saveResolutionImage(before_image, id, 'before')             │
│        ├─ Decode base64 to buffer                                  │
│        ├─ Create filename: resolution-1-before-*.jpg               │
│        ├─ Save to backend/uploads/                                 │
│        └─ Return path: /uploads/resolution-1-before-*.jpg          │
│  4. Save after image to disk                                       │
│     └─ saveResolutionImage(after_image, id, 'after')               │
│        ├─ Decode base64 to buffer                                  │
│        ├─ Create filename: resolution-1-after-*.jpg                │
│        ├─ Save to backend/uploads/                                 │
│        └─ Return path: /uploads/resolution-1-after-*.jpg           │
│  5. Save resolution to database                                    │
│     └─ Complaint.addResolution(...)                                │
│        ├─ INSERT into complaint_resolutions table                  │
│        │  (complaint_id, officer_id, before_image_path,            │
│        │   after_image_path, resolution_notes)                     │
│        └─ UPDATE complaints table                                  │
│           (status='resolved', resolution_id, resolved_by,          │
│            resolved_at)                                            │
│  6. Return success response with image paths                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE UPDATES                                 │
│                                                                     │
│  complaint_resolutions table:                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ id │ complaint_id │ officer_id │ before_image_path │ ...   │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ 1  │ 1            │ 2          │ /uploads/resol... │ ...   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  complaints table (updated):                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ id │ title │ status    │ resolution_id │ resolved_by │ ...  │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ 1  │ ...   │ resolved  │ 1             │ 2           │ ...  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  File system:                                                      │
│  backend/uploads/                                                  │
│  ├─ resolution-1-before-1234567890-123456789.jpg                   │
│  └─ resolution-1-after-1234567890-123456789.jpg                    │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND RESPONSE                                │
│                                                                     │
│  {                                                                 │
│    "success": true,                                                │
│    "message": "Complaint resolved successfully",                   │
│    "resolution_id": 1,                                             │
│    "before_image_path": "/uploads/resolution-1-before-*.jpg",      │
│    "after_image_path": "/uploads/resolution-1-after-*.jpg"         │
│  }                                                                 │
│                                                                     │
│  Alert: "Complaint resolved successfully!"                         │
│  Refresh complaints list                                           │
│  Clear form                                                        │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CITIZEN VIEW                                     │
│                                                                     │
│  Citizen logs in and views their complaint history                 │
│                                                                     │
│  Complaint: "Pothole on Main Street"                               │
│  Status: ✓ RESOLVED                                                │
│                                                                     │
│  Resolution Details:                                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ BEFORE WORK                    │ AFTER WORK                 │   │
│  │ [Image showing pothole]        │ [Image showing fixed road] │   │
│  │                                │                            │   │
│  │ Resolved by: Officer John      │ Date: 2024-01-15          │   │
│  │ Notes: Fixed pothole with      │                            │   │
│  │        asphalt, smoothed edges │                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ADMIN VIEW                                       │
│                                                                     │
│  Admin logs in and reviews resolved complaints                     │
│                                                                     │
│  Resolved Complaints:                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Complaint │ Officer │ Before Image │ After Image │ Status  │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │ Pothole   │ John    │ [Thumbnail]  │ [Thumbnail] │ ✓ Done  │   │
│  │ Broken    │ Sarah   │ [Thumbnail]  │ [Thumbnail] │ ✓ Done  │   │
│  │ Light     │         │              │             │         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Click to view full resolution details and images                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Image Saving

```
┌──────────────────────────────────────────────────────────────────┐
│ Frontend: Image File (File object)                               │
│ Size: ~2-5 MB                                                    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ FileReader.readAsDataURL()                                       │
│ Converts to: data:image/jpeg;base64,/9j/4AAQSkZJRg...           │
│ Size: ~3-7 MB (33% larger due to base64 encoding)                │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ JSON Payload                                                     │
│ {                                                                │
│   officer_id: 2,                                                 │
│   before_image: "data:image/jpeg;base64,...",                    │
│   after_image: "data:image/jpeg;base64,...",                     │
│   resolution_notes: "..."                                        │
│ }                                                                │
│ Size: ~6-14 MB                                                   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ HTTP POST Request                                                │
│ POST /api/complaints/1/resolve                                   │
│ Content-Type: application/json                                   │
│ Body: JSON payload (~6-14 MB)                                    │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ Backend: saveResolutionImage()                                   │
│                                                                  │
│ 1. Extract base64 string                                         │
│    "data:image/jpeg;base64,/9j/4AAQSkZJRg..." → "/9j/4AAQSkZJRg..."
│                                                                  │
│ 2. Decode base64 to Buffer                                       │
│    Buffer.from(base64String, 'base64')                           │
│    Size: ~2-5 MB (back to original)                              │
│                                                                  │
│ 3. Create filename                                               │
│    "resolution-1-before-1234567890-123456789.jpg"                │
│                                                                  │
│ 4. Write to disk                                                 │
│    fs.writeFileSync(filepath, buffer)                            │
│    Location: backend/uploads/resolution-1-before-*.jpg           │
│                                                                  │
│ 5. Return database path                                          │
│    "/uploads/resolution-1-before-1234567890-123456789.jpg"       │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ Database: complaint_resolutions                                  │
│                                                                  │
│ INSERT INTO complaint_resolutions                                │
│ (complaint_id, officer_id, before_image_path, after_image_path)  │
│ VALUES (1, 2, '/uploads/resolution-1-before-*.jpg',              │
│         '/uploads/resolution-1-after-*.jpg')                     │
│                                                                  │
│ Stores: Path to image file (not the image itself)                │
│ Size: ~100 bytes per record                                      │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ File System: backend/uploads/                                    │
│                                                                  │
│ resolution-1-before-1234567890-123456789.jpg (2-5 MB)            │
│ resolution-1-after-1234567890-123456789.jpg (2-5 MB)             │
│                                                                  │
│ Total disk usage: ~4-10 MB per resolution                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                    complaint_resolutions                         │
├─────────────────────────────────────────────────────────────────┤
│ id (INT, PK, AUTO_INCREMENT)                                    │
│ complaint_id (INT, FK → complaints.id)                          │
│ officer_id (INT, FK → users.id)                                 │
│ before_image_path (VARCHAR 500)                                 │
│ after_image_path (VARCHAR 500)                                  │
│ resolution_notes (TEXT)                                         │
│ resolved_at (TIMESTAMP)                                         │
│ created_at (TIMESTAMP)                                          │
│                                                                 │
│ Indexes:                                                        │
│ - idx_complaint_id (complaint_id)                               │
│ - idx_officer_id (officer_id)                                   │
│ - idx_resolved_at (resolved_at)                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    complaints (updated)                          │
├─────────────────────────────────────────────────────────────────┤
│ id (INT, PK)                                                    │
│ user_id (INT, FK)                                               │
│ title (VARCHAR 255)                                             │
│ description (TEXT)                                              │
│ image_path (VARCHAR 500)                                        │
│ latitude (DECIMAL)                                              │
│ longitude (DECIMAL)                                             │
│ date (DATE)                                                     │
│ time (TIME)                                                     │
│ category (VARCHAR 100)                                          │
│ priority (ENUM)                                                 │
│ status (ENUM)                                                   │
│ resolution_id (INT, FK → complaint_resolutions.id) ← NEW        │
│ resolved_by (INT, FK → users.id) ← NEW                          │
│ resolved_at (TIMESTAMP) ← NEW                                   │
│ created_at (TIMESTAMP)                                          │
│ updated_at (TIMESTAMP)                                          │
│                                                                 │
│ Indexes:                                                        │
│ - idx_resolution_id (resolution_id) ← NEW                       │
│ - idx_resolved_by (resolved_by) ← NEW                           │
│ - idx_resolved_at (resolved_at) ← NEW                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Request/Response

```
REQUEST:
┌─────────────────────────────────────────────────────────────────┐
│ POST /api/complaints/1/resolve HTTP/1.1                         │
│ Host: localhost:5000                                            │
│ Content-Type: application/json                                  │
│ Content-Length: 6847293                                         │
│                                                                 │
│ {                                                               │
│   "officer_id": 2,                                              │
│   "before_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",   │
│   "after_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",    │
│   "resolution_notes": "Fixed the pothole with asphalt"          │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘

RESPONSE:
┌─────────────────────────────────────────────────────────────────┐
│ HTTP/1.1 200 OK                                                 │
│ Content-Type: application/json                                  │
│ Content-Length: 234                                             │
│                                                                 │
│ {                                                               │
│   "success": true,                                              │
│   "message": "Complaint resolved successfully",                 │
│   "resolution_id": 1,                                           │
│   "before_image_path": "/uploads/resolution-1-before-1234567890-123456789.jpg",
│   "after_image_path": "/uploads/resolution-1-after-1234567890-123456789.jpg"
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction

```
┌──────────────────────────────────────────────────────────────────┐
│                      FRONTEND                                    │
│                                                                  │
│  OfficerDashboard.jsx                                            │
│  ├─ Displays list of assigned complaints                         │
│  ├─ Shows complaint details                                      │
│  ├─ Handles image upload                                         │
│  └─ Sends POST request to backend                                │
│                                                                  │
│  CitizenHistory.jsx                                              │
│  ├─ Displays citizen's complaints                                │
│  ├─ Shows resolution details (if resolved)                       │
│  └─ Displays before/after images                                 │
│                                                                  │
│  AdminDashboard.jsx                                              │
│  ├─ Displays all complaints                                      │
│  ├─ Shows resolved complaints section                            │
│  └─ Displays before/after images for review                      │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      BACKEND                                     │
│                                                                  │
│  complaintController.js                                          │
│  ├─ resolveComplaint() - Main handler                            │
│  └─ saveResolutionImage() - Saves images to disk                 │
│                                                                  │
│  Complaint.js (Model)                                            │
│  ├─ addResolution() - Saves to database                          │
│  └─ getResolution() - Retrieves resolution data                  │
│                                                                  │
│  complaints.js (Routes)                                          │
│  └─ POST /:id/resolve - Route handler                            │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      DATABASE                                    │
│                                                                  │
│  complaint_resolutions table                                     │
│  ├─ Stores resolution records                                    │
│  ├─ Links to complaints via complaint_id                         │
│  └─ Stores image paths (not images)                              │
│                                                                  │
│  complaints table                                                │
│  ├─ Updated with resolution_id                                   │
│  ├─ Updated with resolved_by                                     │
│  └─ Updated with resolved_at                                     │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      FILE SYSTEM                                 │
│                                                                  │
│  backend/uploads/                                                │
│  ├─ resolution-{id}-before-{timestamp}-{random}.jpg              │
│  └─ resolution-{id}-after-{timestamp}-{random}.jpg               │
└──────────────────────────────────────────────────────────────────┘
```

---

## Summary

The resolution images feature follows this flow:

1. **Officer** uploads before/after images through the UI
2. **Frontend** converts images to base64 and sends to backend
3. **Backend** receives images, saves them to disk, and stores paths in database
4. **Database** stores resolution record with image paths
5. **Citizen** views before/after images in their complaint history
6. **Admin** reviews resolutions with images in admin dashboard

All components work together to create a complete before/after documentation system for complaint resolutions.
