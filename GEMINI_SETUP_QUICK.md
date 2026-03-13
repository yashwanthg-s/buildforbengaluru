# Quick Setup - Gemini Human Image Rejection

## 3 Steps to Enable

### Step 1: Get API Key (2 minutes)

1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Step 2: Add to Backend (1 minute)

Edit `backend/.env`:

```env
GOOGLE_GEMINI_API_KEY=paste_your_key_here
GEMINI_MODEL=gemini-2.0-flash
```

### Step 3: Restart Backend (1 minute)

```bash
cd backend
npm start
```

## Test It

1. Open http://localhost:5173
2. Go to complaint form
3. Take selfie → Should show error ❌
4. Take pothole photo → Should submit ✓

## Done!

Human images are now blocked using Google Gemini API.

