# System Architecture - Human Image Rejection

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ComplaintForm Component                                  │  │
│  │                                                          │  │
│  │ 1. Camera Capture                                        │  │
│  │    - Take photo                                          │  │
│  │    - Accept immediately (no validation)                  │  │
│  │                                                          │  │
│  │ 2. Form Fields                                           │  │
│  │    - Title, Description, Category, Priority             │  │
│  │    - Location (GPS)                                      │  │
│  │                                                          │  │
│  │ 3. Submit Button                                         │  │
│  │    - Send to backend                                     │  │
│  │    - Handle errors                                       │  │
│  │                                                          │  │
│  │ 4. Error Display                                         │  │
│  │    - Show blocked image errors                           │  │
│  │    - Show success messages                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ POST /api/complaints
                         │ (image + form data)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ComplaintController.createComplaint()                    │  │
│  │                                                          │  │
│  │ 1. Validate request                                      │  │
│  │    - Check required fields                               │  │
│  │    - Validate coordinates                                │  │
│  │                                                          │  │
│  │ 2. Save image to disk                                    │  │
│  │    - Store in /uploads folder                            │  │
│  │                                                          │  │
│  │ 3. Send to NLP Service                                   │  │
│  │    - POST /analyze-with-image                            │  │
│  │    - Include image + title + description                 │  │
│  │                                                          │  │
│  │ 4. Check response                                        │  │
│  │    - If category === 'blocked'                           │  │
│  │      → Return 400 error                                  │  │
│  │    - Else                                                │  │
│  │      → Save to database                                  │  │
│  │      → Return 201 success                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ POST /analyze-with-image
                         │ (image + text)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  NLP SERVICE (Python/FastAPI)                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ImageAnalyzer.analyze_image()                            │  │
│  │                                                          │  │
│  │ ┌─────────────────────────────────────────────────────┐  │  │
│  │ │ LAYER 1: YOLO Detection (Primary)                  │  │  │
│  │ │                                                     │  │  │
│  │ │ 1. Load YOLOv8 model                                │  │  │
│  │ │ 2. Run inference (conf=0.3)                         │  │  │
│  │ │ 3. Check for "person" class                         │  │  │
│  │ │                                                     │  │  │
│  │ │ If person detected:                                 │  │  │
│  │ │   → Return {is_blocked: true}                       │  │  │
│  │ │   → Return block_reason                             │  │  │
│  │ │                                                     │  │  │
│  │ │ Else:                                               │  │  │
│  │ │   → Continue to Layer 2                             │  │  │
│  │ └─────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │ ┌─────────────────────────────────────────────────────┐  │  │
│  │ │ LAYER 2: Skin Tone Detection (Fallback)            │  │  │
│  │ │                                                     │  │  │
│  │ │ 1. Extract pixel colors                             │  │  │
│  │ │ 2. Count skin-colored pixels                        │  │  │
│  │ │    - R > 95 AND G > 40 AND B > 20                   │  │  │
│  │ │    - R > G AND R > B AND |R-G| > 15                 │  │  │
│  │ │ 3. Calculate skin_ratio                             │  │  │
│  │ │                                                     │  │  │
│  │ │ If skin_ratio > 0.3 (30%):                          │  │  │
│  │ │   → Return {is_blocked: true}                       │  │  │
│  │ │   → Return block_reason                             │  │  │
│  │ │                                                     │  │  │
│  │ │ Else:                                               │  │  │
│  │ │   → Continue to Layer 3                             │  │  │
│  │ └─────────────────────────────────────────────────────┘  │  │
│  │                                                          │  │
│  │ ┌─────────────────────────────────────────────────────┐  │  │
│  │ │ LAYER 3: Civic Issue Detection                      │  │  │
│  │ │                                                     │  │  │
│  │ │ 1. Analyze colors and patterns                       │  │  │
│  │ │ 2. Detect emergency objects                          │  │  │
│  │ │ 3. Analyze text (title + description)                │  │  │
│  │ │ 4. Combine results                                   │  │  │
│  │ │                                                     │  │  │
│  │ │ Return:                                              │  │  │
│  │ │   - category (infrastructure, sanitation, etc.)      │  │  │
│  │ │   - priority (critical, high, medium, low)           │  │  │
│  │ │   - confidence score                                 │  │  │
│  │ │   - is_blocked: false                                │  │  │
│  │ └─────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ Response:
                         │ {
                         │   category: 'blocked' or 'infrastructure',
                         │   is_blocked: true/false,
                         │   block_reason: '...',
                         │   priority: '...',
                         │   confidence: 0.95
                         │ }
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ComplaintController.createComplaint() (continued)        │  │
│  │                                                          │  │
│  │ Check response:                                          │  │
│  │                                                          │  │
│  │ If category === 'blocked':                               │  │
│  │   ├─ Log: "Image blocked by AI"                          │  │
│  │   ├─ Delete uploaded image                               │  │
│  │   └─ Return 400 error                                    │  │
│  │       {                                                  │  │
│  │         success: false,                                  │  │
│  │         message: block_reason,                           │  │
│  │         blocked: true                                    │  │
│  │       }                                                  │  │
│  │                                                          │  │
│  │ Else:                                                    │  │
│  │   ├─ Save complaint to database                          │  │
│  │   ├─ Check for duplicates                                │  │
│  │   ├─ Create officer assignment                           │  │
│  │   └─ Return 201 success                                  │  │
│  │       {                                                  │  │
│  │         success: true,                                  │  │
│  │         id: complaint_id,                                │  │
│  │         message: "Complaint submitted successfully"      │  │
│  │       }                                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ Response (400 or 201)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ComplaintForm.handleSubmit() (error handling)            │  │
│  │                                                          │  │
│  │ If response.ok (201):                                    │  │
│  │   ├─ Show success message                                │  │
│  │   ├─ Display complaint ID                                │  │
│  │   ├─ Reset form                                          │  │
│  │   └─ Clear photo                                         │  │
│  │                                                          │  │
│  │ If !response.ok (400):                                   │  │
│  │   ├─ Get error message                                   │  │
│  │   ├─ Check if contains "human" or "blocked"              │  │
│  │   ├─ Show in imageValidationError (red box)              │  │
│  │   ├─ Keep form data                                      │  │
│  │   └─ Allow photo retake                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER ACTION                              │
│                                                                 │
│  1. Capture photo with camera                                   │
│  2. Fill complaint form                                         │
│  3. Click "Submit Complaint"                                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND PROCESSING                          │
│                                                                 │
│  - Validate form fields                                         │
│  - Create FormData with image and fields                        │
│  - Send POST request to backend                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND PROCESSING                           │
│                                                                 │
│  - Receive request                                              │
│  - Validate fields                                              │
│  - Save image to disk                                           │
│  - Create FormData with image + text                            │
│  - Send to NLP service                                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NLP SERVICE PROCESSING                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ YOLO Detection                                          │   │
│  │ - Load model                                            │   │
│  │ - Run inference                                         │   │
│  │ - Check for person class                                │   │
│  │ - If found: BLOCKED                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                       │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Skin Tone Detection (if not blocked)                    │   │
│  │ - Extract pixels                                        │   │
│  │ - Count skin tones                                      │   │
│  │ - Calculate ratio                                       │   │
│  │ - If >30%: BLOCKED                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                       │
│                         ▼                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Civic Issue Detection (if not blocked)                  │   │
│  │ - Analyze colors                                        │   │
│  │ - Detect objects                                        │   │
│  │ - Analyze text                                          │   │
│  │ - Return category & priority                            │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND PROCESSING                           │
│                                                                 │
│  - Receive response from NLP service                            │
│  - Check if category === 'blocked'                              │
│                                                                 │
│  If blocked:                                                    │
│    - Return 400 error with block_reason                         │
│                                                                 │
│  If not blocked:                                                │
│    - Save to database                                           │
│    - Check for duplicates                                       │
│    - Create officer assignment                                  │
│    - Return 201 success with complaint ID                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND PROCESSING                          │
│                                                                 │
│  If error (400):                                                │
│    - Show error message in red box                              │
│    - Allow photo retake                                         │
│    - Keep form data                                             │
│                                                                 │
│  If success (201):                                              │
│    - Show success message                                       │
│    - Display complaint ID                                       │
│    - Reset form                                                 │
│    - Clear photo                                                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                        USER SEES                                │
│                                                                 │
│  If human image:                                                │
│    ❌ "Image contains human. Please upload an image of the      │
│       issue/location, not people."                              │
│                                                                 │
│  If civic issue:                                                │
│    ✓ "Complaint submitted successfully! ID: 123"               │
└─────────────────────────────────────────────────────────────────┘
```

## Detection Decision Tree

```
                    Image Received
                         │
                         ▼
                  ┌──────────────┐
                  │ YOLO Detect? │
                  └──────┬───────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
        YES: Person              NO: Continue
        BLOCKED ✗                    │
                                     ▼
                            ┌──────────────────┐
                            │ Skin Tone >30%?  │
                            └──────┬───────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
                YES: Skin              NO: Continue
                BLOCKED ✗                  │
                                           ▼
                                  ┌──────────────────┐
                                  │ Civic Issue?     │
                                  └──────┬───────────┘
                                         │
                          ┌──────────────┴──────────────┐
                          │                             │
                          ▼                             ▼
                      YES: Accept              NO: Accept
                      SAVED ✓                  (Other) ✓
```

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ComplaintForm                                            │  │
│  │ ├─ CameraCapture (photo)                                 │  │
│  │ ├─ LocationDisplay (GPS)                                 │  │
│  │ ├─ Form fields (title, description, etc.)                │  │
│  │ └─ Error/Success messages                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                       │
│                         │ complaintService.submitComplaint()    │
│                         │                                       │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ComplaintController                                      │  │
│  │ ├─ createComplaint()                                     │  │
│  │ │  ├─ Validate request                                   │  │
│  │ │  ├─ Save image                                         │  │
│  │ │  ├─ Call NLP service                                   │  │
│  │ │  ├─ Check blocked status                               │  │
│  │ │  └─ Save to database or return error                   │  │
│  │ └─ Other methods...                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                       │
│                         │ axios.post(/analyze-with-image)       │
│                         │                                       │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NLP SERVICE LAYER                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ImageAnalyzer                                            │  │
│  │ ├─ analyze_image()                                       │  │
│  │ │  ├─ _detect_with_yolo()                                │  │
│  │ │  ├─ _extract_features()                                │  │
│  │ │  ├─ _analyze_patterns()                                │  │
│  │ │  └─ get_analysis_summary()                             │  │
│  │ └─ Other methods...                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                       │
│                         │ Return analysis result                │
│                         │                                       │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND LAYER                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ComplaintController (continued)                          │  │
│  │ ├─ Check if blocked                                      │  │
│  │ ├─ Save to database or return error                      │  │
│  │ └─ Return response                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                       │
│                         │ Return 400 or 201                     │
│                         │                                       │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ComplaintForm (error handling)                           │  │
│  │ ├─ If error: show error message                          │  │
│  │ ├─ If success: show success message                      │  │
│  │ └─ Update UI accordingly                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
Frontend State:
├─ formData (title, description, category, priority)
├─ capturedPhoto (blob, preview)
├─ location (latitude, longitude)
├─ errors (validation errors)
├─ loading (submission in progress)
├─ imageValidationError (blocked image error)
├─ successMessage (submission success)
└─ duplicateInfo (duplicate detection)

Backend State:
├─ Request validation
├─ Image file path
├─ NLP service response
├─ Database transaction
└─ Response status

NLP Service State:
├─ Image bytes
├─ YOLO model
├─ Detection results
├─ Skin tone analysis
├─ Civic issue detection
└─ Final analysis result
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                              │
└─────────────────────────────────────────────────────────────────┘

1. Human Image Detected (YOLO)
   ├─ NLP returns: category = 'blocked'
   ├─ Backend returns: 400 error
   ├─ Frontend shows: imageValidationError
   └─ User action: Retake photo

2. Human Image Detected (Skin Tone)
   ├─ NLP returns: category = 'blocked'
   ├─ Backend returns: 400 error
   ├─ Frontend shows: imageValidationError
   └─ User action: Retake photo

3. Invalid Form Data
   ├─ Frontend validation fails
   ├─ Shows: errors.title, errors.description, etc.
   └─ User action: Fix form

4. Network Error
   ├─ Frontend catch block
   ├─ Shows: general error message
   └─ User action: Retry

5. Database Error
   ├─ Backend catch block
   ├─ Returns: 500 error
   ├─ Frontend shows: general error message
   └─ User action: Retry

6. NLP Service Down
   ├─ Backend catch block
   ├─ Falls back to text-only analysis
   ├─ Continues with submission
   └─ User action: None (transparent)
```

