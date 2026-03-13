# Human Image Rejection Using Google Gemini API

## Overview

The system now uses **Google Gemini Vision API** to analyze images and detect human content. This is simpler, more reliable, and doesn't require local models.

## How It Works

```
User captures photo
    ↓
User fills form and clicks Submit
    ↓
Backend receives complaint
    ↓
Backend sends image to Google Gemini API
    ↓
Gemini analyzes image:
  1. Detects if human is present
  2. Detects civic issue (if no human)
    ↓
If human detected:
  ❌ Return error: "Image contains human..."
  ❌ Complaint NOT saved
  ❌ User sees error message
    ↓
If civic issue detected:
  ✓ Accept complaint
  ✓ Save to database
  ✓ Show success message
```

## Setup

### Step 1: Get Google Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the API key

### Step 2: Add API Key to Backend

Edit `backend/.env`:

```env
GOOGLE_GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```

Replace `your_api_key_here` with your actual API key.

### Step 3: Restart Backend

```bash
cd backend
npm start
```

## Code Changes

### Backend Service: `backend/services/geminiVisionService.js`

**New Method**: `analyzeComplaintImage(base64Image, title, description)`

This method:
1. Sends image to Google Gemini API
2. Asks Gemini to detect humans
3. Asks Gemini to detect civic issues
4. Returns analysis result with `is_blocked` flag

**Key Features**:
- Strict human detection
- Civic issue classification
- Category and priority detection
- Fallback if API unavailable

### Backend Controller: `backend/controllers/complaintController.js`

**Updated**: `createComplaint()` method

Changes:
1. Calls `geminiVisionService.analyzeComplaintImage()`
2. Checks if `is_blocked` is true
3. Returns 400 error if human detected
4. Saves complaint if civic issue detected

## Gemini Prompt

The system sends this prompt to Gemini:

```
Analyze this image STRICTLY for the following:

1. HUMAN DETECTION (MOST IMPORTANT):
   - Does the image contain ANY human (person, face, selfie, group photo)?
   - Even if partially visible or in background?
   - If YES, this is INVALID and must be BLOCKED

2. CIVIC ISSUE DETECTION (if no human):
   - Does it show a civic problem?
   - Examples: pothole, garbage, fire, water leak, damaged infrastructure, etc.

Respond ONLY in this JSON format:
{
  "contains_human": true/false,
  "human_confidence": 0.0-1.0,
  "civic_issue": "issue name or null",
  "civic_confidence": 0.0-1.0,
  "category": "safety/infrastructure/sanitation/traffic/utilities/other",
  "priority": "critical/high/medium/low",
  "description": "brief description"
}
```

## Testing

### Test 1: Human Selfie (Should Be REJECTED)

1. Open complaint form
2. Take selfie
3. Fill form
4. Click submit

**Expected**:
```
❌ Error: "Image contains human. Please upload an image of the issue/location, not people."
Complaint: NOT saved
```

### Test 2: Pothole (Should Be ACCEPTED)

1. Open complaint form
2. Take photo of pothole
3. Fill form
4. Click submit

**Expected**:
```
✓ Complaint submitted successfully! ID: 123
Complaint: Saved
Category: Infrastructure
Priority: Medium
```

### Test 3: Group Photo (Should Be REJECTED)

1. Open complaint form
2. Take photo with multiple people
3. Fill form
4. Click submit

**Expected**:
```
❌ Error: "Image contains human..."
Complaint: NOT saved
```

### Test 4: Fire/Smoke (Should Be ACCEPTED)

1. Open complaint form
2. Take photo of fire or smoke
3. Fill form
4. Click submit

**Expected**:
```
✓ Complaint submitted successfully! ID: 124
Complaint: Saved
Category: Safety
Priority: Critical
```

## Error Messages

### When Human Detected
```
❌ Image contains human. Please upload an image of the issue/location, not people.
```

### When Civic Issue Detected
```
✓ Complaint submitted successfully! ID: 123
```

### When API Key Missing
```
Fallback: Image accepted (API key not configured)
```

## Advantages

✅ **No local models** - Uses cloud API
✅ **Highly accurate** - Google's AI is very good
✅ **Simple** - Just send image to API
✅ **Reliable** - Google maintains the service
✅ **Scalable** - Handles any image size
✅ **Fast** - API response in 1-2 seconds
✅ **Flexible** - Can adjust prompt easily

## Disadvantages

❌ **Requires API key** - Need Google account
❌ **API costs** - Google charges per request
❌ **Internet required** - Must connect to Google
❌ **Rate limits** - Google has usage limits
❌ **Latency** - Network delay added

## Pricing

Google Gemini API pricing (as of 2024):
- **Free tier**: 15 requests per minute
- **Paid**: $0.075 per 1M input tokens, $0.30 per 1M output tokens

For image analysis:
- Typical cost: $0.001-0.005 per image
- 1000 images: $1-5

## Troubleshooting

### Issue: "API key not configured"

**Fix**: Add API key to `backend/.env`:
```env
GOOGLE_GEMINI_API_KEY=your_key_here
```

### Issue: "API key invalid"

**Fix**: 
1. Check API key is correct
2. Verify key is enabled in Google Cloud
3. Check quota limits

### Issue: "Timeout"

**Fix**:
1. Check internet connection
2. Check Google API status
3. Increase timeout in code

### Issue: "Rate limit exceeded"

**Fix**:
1. Wait a few minutes
2. Upgrade to paid plan
3. Implement request queuing

### Issue: "Still accepting human images"

**Fix**:
1. Check API key is set
2. Check backend logs for Gemini response
3. Verify `contains_human` is being checked
4. Test with different image

## Logs to Check

### Backend Logs

When human detected:
```
Human detected in image: 0.95
```

When civic issue detected:
```
Gemini Analysis: {
  category: 'infrastructure',
  priority: 'medium',
  confidence: 0.85,
  is_blocked: false
}
```

When API error:
```
Gemini analysis error: Error message
```

## Configuration

### Model Selection

Current: `gemini-2.0-flash` (fast, good for images)

Other options:
- `gemini-1.5-pro` (more accurate, slower)
- `gemini-1.5-flash` (faster, less accurate)

To change, edit `backend/.env`:
```env
GEMINI_MODEL=gemini-1.5-pro
```

### Timeout

Current: 30 seconds

To change, edit `backend/services/geminiVisionService.js`:
```javascript
timeout: 30000  // milliseconds
```

## Deployment

### Step 1: Get API Key

Go to https://aistudio.google.com/app/apikey and create key

### Step 2: Update .env

```bash
cd backend
cp .env.example .env
# Edit .env and add API key
```

### Step 3: Restart Backend

```bash
npm start
```

### Step 4: Test

1. Open http://localhost:5173
2. Try human image (should fail)
3. Try civic issue (should pass)

## Monitoring

### Check API Usage

1. Go to https://console.cloud.google.com
2. Select your project
3. Go to APIs & Services > Quotas
4. Check Generative Language API usage

### Set Up Alerts

1. Go to Billing > Budgets and alerts
2. Set budget limit
3. Get email alerts when approaching limit

## Cost Optimization

### Reduce Costs

1. **Compress images** before sending
2. **Cache results** for duplicate images
3. **Batch requests** if possible
4. **Use flash model** instead of pro

### Monitor Costs

1. Check Google Cloud billing
2. Set budget alerts
3. Review usage patterns
4. Optimize prompts

## Summary

The Gemini-based solution is:
- ✅ Simple to implement
- ✅ Highly accurate
- ✅ No local models needed
- ✅ Easy to maintain
- ✅ Scalable
- ❌ Requires API key
- ❌ Has API costs
- ❌ Needs internet

This is the recommended approach for production use.

