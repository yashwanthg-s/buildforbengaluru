# Run Human Detection Test - Step by Step

## The Fix
The `/detect-human` endpoint was returning 404 because it was defined after the `if __name__ == "__main__"` block. **It's now fixed.**

---

## Terminal 1: Start AI Service

```bash
cd ai-service
python main.py
```

**Wait for this output:**
```
✓ Transformer model loaded successfully!
✓ Using transformer model for high accuracy
INFO:     Started server process [16664]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

✅ **AI Service is now running and endpoint is registered**

---

## Terminal 2: Test the Endpoint

### Option A: Quick Health Check
```bash
curl http://localhost:8000/health
```

**Expected response:**
```json
{"status":"OK","service":"complaint-ai"}
```

### Option B: Test with Image File
```bash
# Test with a human image (should detect human)
curl -X POST http://localhost:8000/detect-human \
  -F "image=@backend/uploads/complaint-1773317496458-138739099.jpg"
```

**Expected response (if human detected):**
```json
{
  "contains_human": true,
  "confidence": 0.95,
  "method": "face_detection",
  "details": "1 face(s) detected"
}
```

**Expected response (if no human):**
```json
{
  "contains_human": false,
  "confidence": 0.95,
  "method": "all_methods",
  "details": "No human detected"
}
```

### Option C: Run Python Test Script
```bash
python ai-service/test_human_detection_endpoint.py
```

---

## Terminal 3: Test Full Flow (Frontend)

### Start Backend (if not running)
```bash
cd backend
npm start
```

### Start Frontend (if not running)
```bash
cd frontend
npm start
```

### Test in Browser
1. Open: `http://localhost:3000`
2. Go to "Submit Complaint"
3. Fill in form:
   - Title: "Pothole on Main Street"
   - Description: "Large pothole causing accidents"
   - Location: Click on map
   - Date/Time: Select current date/time
4. **Upload a human selfie/portrait**
5. Click "Submit"

**Expected Result:**
```
❌ Error: "Image contains human. Please upload an image of the issue/location, not people."
```

### Test with Valid Image
1. Same form
2. **Upload an image of an actual civic issue** (pothole, garbage, etc.)
3. Click "Submit"

**Expected Result:**
```
✅ Complaint submitted successfully! ID: 25
```

---

## Check Logs

### AI Service Logs (Terminal 1)
Look for:
```
✓ No human detected
✗ FACE DETECTED: 1 face(s) found
✗ SKIN TONE DETECTED: 25.3% of image
```

### Backend Logs (Terminal 3)
Look for:
```
Human detection response: { contains_human: true, ... }
❌ HUMAN DETECTED - BLOCKING COMPLAINT
```

---

## Validation Script

Run this to verify the fix:
```bash
python validate_fix.py
```

**Expected output:**
```
============================================================
Validating Human Detection Endpoint Fix
============================================================

1. Checking Python Syntax...
✓ ai-service/main.py - Syntax OK
✓ ai-service/models/human_detector.py - Syntax OK

2. Checking Endpoint Position...
✓ /detect-human endpoint is BEFORE if __name__ block

3. Checking Human Detector Fallback...
✓ CV2_AVAILABLE flag
✓ try/except for cv2 import
✓ RGB fallback detection
✓ Graceful error handling

============================================================
✓ All Checks Passed!
============================================================
```

---

## Troubleshooting

### Issue: Still getting 404
```bash
# Kill the AI service
# Ctrl+C in Terminal 1

# Restart it
cd ai-service
python main.py
```

### Issue: Connection refused
```bash
# Make sure AI service is running
# Check Terminal 1 for errors
# Verify port 8000 is not in use
netstat -ano | findstr :8000
```

### Issue: Human images still being accepted
```bash
# Check backend logs for detection response
# Verify endpoint is returning contains_human: true
# Check that backend is properly checking the response
```

### Issue: Slow detection
```bash
# First run loads the transformer model (~1 minute)
# Subsequent runs are much faster (~300ms)
# This is normal
```

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `python ai-service/main.py` | Start AI service |
| `curl http://localhost:8000/health` | Check if service is running |
| `curl -X POST http://localhost:8000/detect-human -F "image=@file.jpg"` | Test endpoint |
| `python ai-service/test_human_detection_endpoint.py` | Run test script |
| `python validate_fix.py` | Validate the fix |

---

## Expected Behavior

### ✅ Working Correctly
- [ ] AI service starts without errors
- [ ] `/detect-human` endpoint responds (no 404)
- [ ] Endpoint detects human images
- [ ] Backend blocks complaints with human images
- [ ] Frontend shows error message
- [ ] Civic issue images are accepted

### ❌ Not Working
- [ ] AI service crashes on startup
- [ ] `/detect-human` returns 404
- [ ] Endpoint doesn't detect humans
- [ ] Backend doesn't block human images
- [ ] Frontend doesn't show error
- [ ] Civic issue images are rejected

---

## Files to Check

If something isn't working, check these files:

1. **ai-service/main.py**
   - Line ~220: `/detect-human` endpoint should be BEFORE `if __name__` block

2. **ai-service/models/human_detector.py**
   - Should have `CV2_AVAILABLE` flag
   - Should have RGB fallback detection

3. **backend/services/geminiVisionService.js**
   - Should call `/detect-human` endpoint
   - Should check `contains_human` response

4. **backend/controllers/complaintController.js**
   - Should block if `is_blocked: true`
   - Should return error message

---

## Success Criteria

✅ **All of these should be true:**
1. AI service runs without errors
2. `/detect-human` endpoint is accessible (no 404)
3. Endpoint detects human faces
4. Backend blocks complaints with human images
5. Frontend shows error message to user
6. Civic issue images are accepted normally

---

**Status**: 🟢 Ready to Test

Run the commands above and verify all success criteria are met.
