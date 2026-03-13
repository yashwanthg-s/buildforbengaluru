# Test Human Image Rejection

## Quick Test (2 minutes)

### Test 1: Human Portrait (Should FAIL)

1. Open http://localhost:5173
2. Go to complaint form
3. **Capture selfie/portrait**
4. Fill:
   - Title: "Test"
   - Description: "Testing"
5. Capture location
6. Click "Submit Complaint"

**Expected**:
```
❌ Error: "Image appears to be a portrait..."
Complaint: NOT saved
```

### Test 2: Pothole (Should PASS)

1. Open complaint form
2. **Capture pothole photo**
3. Fill:
   - Title: "Pothole on Main Street"
   - Description: "Large pothole causing traffic issues"
4. Capture location
5. Click "Submit Complaint"

**Expected**:
```
✓ Complaint submitted successfully! ID: 123
Complaint: Saved
```

## Why It Works

- **Human portrait**: Large file + no civic keywords = BLOCKED
- **Pothole**: Large file + civic keywords = ACCEPTED

## Civic Keywords

Use these in title/description:
- pothole
- garbage
- fire
- water
- leak
- damage
- broken
- accident
- traffic
- infrastructure
- road
- street
- hole
- debris
- litter
- smoke

## Results

✅ Human images blocked
✅ Civic issues accepted
✅ Works without API key

