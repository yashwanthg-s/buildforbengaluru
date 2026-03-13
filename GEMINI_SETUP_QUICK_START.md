# Google Gemini Vision API - Quick Start Guide

## 5-Minute Setup

### Step 1: Get API Key (2 minutes)

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Step 2: Configure Backend (1 minute)

Edit `backend/.env`:

```bash
GOOGLE_GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```

### Step 3: Install & Start (2 minutes)

```bash
cd backend
npm install axios
npm start
```

## Testing

### Test 1: Valid Image

```bash
# Capture image of pothole/garbage/damage
# Expected: ✓ Image Validated, category auto-filled
```

### Test 2: Invalid Image

```bash
# Capture selfie
# Expected: ❌ Invalid image error, photo cleared
```

## How It Works

```
User captures photo
    ↓
Sent to Google Gemini Vision API
    ↓
Gemini analyzes: civic issue or fake?
    ↓
If civic issue → Accept, auto-fill category
If fake → Reject, show error
```

## Features

✅ Real-time validation
✅ Detects fire, pothole, garbage, accidents, etc.
✅ Rejects selfies, group photos, unrelated images
✅ Auto-fills category and priority
✅ Clear user feedback

## API Response

**Valid**:
```json
{
  "valid": true,
  "detected_issue": "pothole",
  "category": "infrastructure",
  "priority": "medium",
  "confidence": 0.92
}
```

**Invalid**:
```json
{
  "valid": false,
  "message": "Invalid image. Please capture a photo showing the civic issue.",
  "reason": "human selfie"
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Image validation failed" | Check API key, internet connection |
| Validation takes too long | Check network speed, API status |
| False positives | Ensure image quality, try different angle |
| False negatives | Ensure person is clearly visible |

## Files

- `backend/services/geminiVisionService.js` - Validation service
- `backend/controllers/complaintController.js` - Validation endpoint
- `backend/routes/complaints.js` - Validation route
- `frontend/src/components/ComplaintForm.jsx` - Frontend integration

## Next Steps

1. Get API key from Google AI Studio
2. Update `.env` file
3. Start backend
4. Test with images
5. Deploy to production

Done! Your image validation is now live.
