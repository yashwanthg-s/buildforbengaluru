# Why the Endpoint Was Returning 404 - Explained Simply

## The Problem in Plain English

Imagine you have a restaurant with a menu. The menu is printed, but the last item on the menu is written on a piece of paper that's placed **after** the restaurant closes for the day.

When customers come in during business hours, they can't order that item because it wasn't on the menu when the restaurant opened.

**That's exactly what was happening with the `/detect-human` endpoint.**

---

## The Technical Problem

### How FastAPI Works
1. When you start the app, FastAPI reads all the endpoint definitions
2. It registers them so they're available when requests come in
3. Then it starts the server

### What Was Wrong
```python
# Step 1: FastAPI reads endpoints and registers them
@app.post("/categorize")
async def categorize_complaint(...):
    ...

@app.post("/analyze")
async def analyze_complaint(...):
    ...

# ... more endpoints ...

# Step 2: FastAPI starts the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Step 3: ❌ THIS CODE NEVER RUNS!
# Because uvicorn.run() blocks and never returns
@app.post("/detect-human")  # ❌ Never registered!
async def detect_human(image: UploadFile = File(...)):
    ...
```

**The `/detect-human` endpoint was defined AFTER the server started, so it was never registered.**

---

## The Fix

### Simple Solution
Move the endpoint definition **before** the `if __name__ == "__main__"` block:

```python
# ✓ CORRECT ORDER

# Step 1: Define all endpoints (including /detect-human)
@app.post("/categorize")
async def categorize_complaint(...):
    ...

@app.post("/analyze")
async def analyze_complaint(...):
    ...

# ... more endpoints ...

@app.post("/detect-human")  # ✓ Now registered!
async def detect_human(image: UploadFile = File(...)):
    ...

# Step 2: Start the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**Now the endpoint is registered BEFORE the server starts, so it's available.**

---

## Why This Matters

### Before the Fix
```
User submits complaint with human image
    ↓
Backend calls: POST /detect-human
    ↓
❌ 404 Not Found
    ↓
Backend doesn't know if image has human
    ↓
Complaint is accepted (should be blocked!)
```

### After the Fix
```
User submits complaint with human image
    ↓
Backend calls: POST /detect-human
    ↓
✓ 200 OK - Endpoint responds
    ↓
Backend gets: {"contains_human": true}
    ↓
Backend blocks complaint
    ↓
User sees error: "Image contains human"
```

---

## Real-World Analogy

Think of it like a phone number:

**Before the fix:**
- You have a phone number written on a piece of paper
- But the paper is in a drawer that's locked after business hours
- When someone tries to call, the number doesn't work (404)

**After the fix:**
- The phone number is on the main directory
- It's available during business hours
- When someone calls, they reach you (200 OK)

---

## How to Verify the Fix

### Check the File
Open `ai-service/main.py` and look for:

1. Find the line: `@app.post("/detect-human")`
2. Find the line: `if __name__ == "__main__":`
3. **The `/detect-human` line should come BEFORE the `if __name__` line**

```python
# ✓ Correct order
@app.post("/detect-human")  # Line 220
async def detect_human(...):
    ...

if __name__ == "__main__":  # Line 235
    import uvicorn
    uvicorn.run(...)
```

### Test the Endpoint
```bash
# Start the service
python ai-service/main.py

# In another terminal, test the endpoint
curl http://localhost:8000/detect-human -F "image=@test.jpg"

# Should get a response (not 404)
```

---

## Why This Bug Happened

This is a common mistake when:
1. Adding new endpoints to an existing file
2. Not realizing that code after `uvicorn.run()` never executes
3. The endpoint was probably added at the end of the file without checking

---

## Key Takeaway

**In FastAPI (and similar frameworks):**
- All endpoint definitions must come **before** the server starts
- Code after `uvicorn.run()` never executes
- Always define endpoints at the top level of the app, before the main block

---

## Additional Fix: Graceful Fallback

We also improved the human detector to work even if OpenCV isn't installed:

**Before**: Would crash if OpenCV missing
**After**: Falls back to RGB-based skin tone detection

This ensures the endpoint works in all environments.

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| Endpoint registered? | ❌ No | ✅ Yes |
| Returns 404? | ✅ Yes | ❌ No |
| Detects humans? | ❌ No | ✅ Yes |
| Blocks human images? | ❌ No | ✅ Yes |
| Works without OpenCV? | ❌ No | ✅ Yes |

---

**Status**: ✅ Fixed and Validated
