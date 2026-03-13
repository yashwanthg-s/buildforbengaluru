# Gemini Human Image Rejection - Quick Reference

## Setup (3 Steps)

### 1. Get API Key
```
https://aistudio.google.com/app/apikey
→ Create API Key
→ Copy key
```

### 2. Add to backend/.env
```env
GOOGLE_GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash
```

### 3. Restart Backend
```bash
cd backend
npm start
```

## How It Works

```
Image → Gemini API → Human? → BLOCKED ❌
                  → Civic? → ACCEPTED ✓
```

## Testing

| Test | Input | Expected |
|------|-------|----------|
| Selfie | Face photo | ❌ Error |
| Group | Multiple people | ❌ Error |
| Pothole | Road damage | ✓ Success |
| Garbage | Litter | ✓ Success |
| Fire | Smoke/flames | ✓ Success |

## Error Messages

### Human Detected
```
❌ Image contains human. Please upload an image of the issue/location, not people.
```

### Civic Issue Accepted
```
✓ Complaint submitted successfully! ID: 123
```

## Logs

### Human Detected
```
Human detected in image: 0.95
```

### Civic Issue
```
Gemini Analysis: {
  category: 'infrastructure',
  priority: 'medium',
  is_blocked: false
}
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API key error | Check key in backend/.env |
| Still accepting humans | Restart backend |
| Timeout | Check internet |
| Rate limit | Wait or upgrade plan |

## Files Changed

- `backend/services/geminiVisionService.js` - Added analyzeComplaintImage()
- `backend/controllers/complaintController.js` - Updated createComplaint()
- `backend/.env` - Added API key config

## Cost

- Free: 15 requests/minute
- Paid: $0.001-0.005 per image
- 1000 images: $1-5

## Status

✅ Ready to deploy
✅ All tests passing
✅ Documentation complete

