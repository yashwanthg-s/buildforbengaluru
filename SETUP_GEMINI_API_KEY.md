# Setup Google Gemini API Key

## Current Status

✅ System is working in **TEST MODE** (without API key)
⚠️ Human image detection is **DISABLED** (needs API key)

## To Enable Human Image Detection

### Step 1: Get API Key (2 minutes)

1. Go to: **https://aistudio.google.com/app/apikey**
2. Click **"Create API Key"**
3. Copy the API key

### Step 2: Add to backend/.env

Edit `backend/.env` file:

```env
GOOGLE_GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual API key.

**Example**:
```env
GOOGLE_GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Restart Backend

```bash
cd backend
npm start
```

## Testing

### Before API Key (Current)
- ✓ Can submit any image
- ❌ Human images NOT blocked
- ⚠️ Test mode only

### After API Key
- ✓ Can submit civic issue images
- ❌ Human images BLOCKED
- ✓ Production ready

## Test Cases

### Test 1: Submit Selfie (After API Key)
1. Fill form
2. Capture selfie
3. Click submit
4. **Expected**: ❌ Error "Image contains human..."

### Test 2: Submit Pothole (After API Key)
1. Fill form
2. Capture pothole photo
3. Click submit
4. **Expected**: ✓ Success "Complaint submitted!"

### Test 3: Submit Garbage (After API Key)
1. Fill form
2. Capture garbage photo
3. Click submit
4. **Expected**: ✓ Success "Complaint submitted!"

## Cost

- **Free tier**: 15 requests/minute
- **Paid**: ~$0.001-0.005 per image
- **1000 images**: $1-5

## Troubleshooting

### Issue: "Image validation service not configured"

**Status**: This is normal in test mode
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
3. Check backend logs for "Human detected"

## Files to Edit

```
backend/.env
```

Add this line:
```
GOOGLE_GEMINI_API_KEY=your_key_here
```

## Summary

✅ System works in test mode (no API key needed)
✅ Can submit any images for testing
⚠️ Human image detection disabled
✅ Add API key to enable human image blocking
✅ Takes 2 minutes to setup

