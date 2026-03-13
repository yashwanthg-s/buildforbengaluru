# ⚠️ REQUIRED: Google Gemini API Setup

## Problem

The system now **BLOCKS ALL IMAGES** by default until you configure the Google Gemini API key. This ensures human images cannot be submitted without proper validation.

## Solution: Add API Key (2 Minutes)

### Step 1: Get API Key

1. Go to: **https://aistudio.google.com/app/apikey**
2. Click **"Create API Key"**
3. Copy the API key

### Step 2: Add to backend/.env

Edit `backend/.env` and add your API key:

```env
GOOGLE_GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with the key you copied.

**Example**:
```env
GOOGLE_GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Restart Backend

```bash
cd backend
npm start
```

## Verification

### Check 1: Backend Logs

When backend starts, you should see:
```
✓ Server running on port 5000
```

### Check 2: Test with Selfie

1. Open http://localhost:5173
2. Go to complaint form
3. Take selfie
4. Fill form
5. Click submit

**Expected Result**:
```
❌ Error: "Image contains human. Please upload an image of the issue/location, not people."
```

### Check 3: Test with Pothole

1. Take photo of pothole
2. Fill form
3. Click submit

**Expected Result**:
```
✓ Complaint submitted successfully! ID: 123
```

## What Happens Without API Key

If you don't add the API key:

```
❌ All images are BLOCKED
❌ Error: "Image validation service not configured"
❌ No complaints can be submitted
```

This is intentional - it prevents human images from being accepted.

## API Key Location

Edit this file:
```
backend/.env
```

Add this line:
```
GOOGLE_GEMINI_API_KEY=your_key_here
```

## Troubleshooting

### Issue: "Image validation service not configured"

**Fix**: Add API key to backend/.env

### Issue: "API key invalid"

**Fix**: 
1. Go to https://aistudio.google.com/app/apikey
2. Create new key
3. Copy and paste to backend/.env
4. Restart backend

### Issue: "Still accepting human images"

**Fix**:
1. Check API key is in backend/.env
2. Restart backend
3. Check backend logs for errors

## Cost

- **Free tier**: 15 requests/minute
- **Paid**: ~$0.001-0.005 per image
- **1000 images**: $1-5

## Summary

✅ Get API key from Google
✅ Add to backend/.env
✅ Restart backend
✅ Test with selfie (should fail)
✅ Test with pothole (should pass)

**Without API key, NO images will be accepted.**

