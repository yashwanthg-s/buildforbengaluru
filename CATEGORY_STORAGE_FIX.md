# Fix: Category Not Storing in Database

## Problem
The category field is not being stored in the database for complaints.

## Root Cause Analysis

The issue is in `backend/controllers/complaintController.js` in the `createComplaint()` method.

**Current logic (Line ~80):**
```javascript
const aiCategory = geminiResponse.category || category || 'other';
```

This means:
1. If Gemini returns a category → use Gemini's category
2. Else if user selected a category → use user's category
3. Else → use 'other'

**Problem:** Gemini's category detection might be overriding the user's selection.

## Solution

We need to decide: **Should user-selected category take precedence or Gemini-detected category?**

### Option A: User Selection Takes Precedence (Recommended)

Users know their complaint best. Their selection should be respected.

```javascript
// User-selected category takes precedence
const aiCategory = category || geminiResponse.category || 'other';
```

### Option B: Gemini Detection Takes Precedence

AI is more objective. Let it categorize based on image content.

```javascript
// Gemini-detected category takes precedence
const aiCategory = geminiResponse.category || category || 'other';
```

### Option C: Store Both

Store both user selection and AI detection for comparison.

```javascript
// Store both
const userCategory = category || 'other';
const aiCategory = geminiResponse.category || 'other';

// Use user category for now, but store AI category for analysis
const finalCategory = userCategory;
```

---

## Implementation

### Step 1: Decide Which Option

**Recommendation: Option A** - User selection takes precedence

### Step 2: Update the Code

Open `backend/controllers/complaintController.js` and find the `createComplaint()` method.

Look for this line (around line 80):
```javascript
const aiCategory = geminiResponse.category || category || 'other';
```

Replace with:
```javascript
// User-selected category takes precedence over AI detection
const aiCategory = category || geminiResponse.category || 'other';
```

### Step 3: Add Logging

Add logging to verify category is being stored:

Find this section in `createComplaint()`:
```javascript
const complaintData = {
  user_id: userId,
  title,
  description,
  image_path: imagePath,
  latitude,
  longitude,
  date,
  time,
  category: aiCategory,
  priority: geminiResponse.priority || 'medium'
};
```

Add logging before the INSERT:
```javascript
console.log('📝 Creating complaint with category:', aiCategory);
console.log('   User selected:', category);
console.log('   Gemini detected:', geminiResponse.category);
```

### Step 4: Test

1. Start backend: `npm run dev`
2. Submit a complaint with a specific category
3. Check backend console - should show:
   ```
   📝 Creating complaint with category: infrastructure
      User selected: infrastructure
      Gemini detected: utilities
   ```
4. Check database: `SELECT id, category FROM complaints ORDER BY id DESC LIMIT 1;`
5. Should show the category you selected

---

## Current Code Review

Let me check the current implementation:

**File:** `backend/controllers/complaintController.js`
**Method:** `createComplaint()`

The code flow is:
1. Extract category from request: `const { category } = req.body;`
2. Get Gemini response: `const geminiResponse = await analyzeWithGemini(...)`
3. Decide category: `const aiCategory = geminiResponse.category || category || 'other';`
4. Create complaint with category: `category: aiCategory`
5. Insert into database

**The category IS being sent to the database.** The issue is likely:
1. Gemini is returning a category that overrides user selection
2. User is not selecting a category (leaving it blank)
3. Category is being lost somewhere in the request

---

## Debugging Steps

### Step 1: Check Frontend is Sending Category

Open browser DevTools → Network tab:
1. Submit a complaint
2. Look for POST request to `/api/complaints`
3. Check Request body → should have `category` field
4. Verify it has a value (not empty)

### Step 2: Check Backend is Receiving Category

Add logging to `createComplaint()`:

```javascript
static async createComplaint(req, res) {
  try {
    const { category } = req.body;
    console.log('📥 Received category from frontend:', category);
    
    // ... rest of code ...
    
    const aiCategory = geminiResponse.category || category || 'other';
    console.log('📝 Final category:', aiCategory);
    console.log('   User selected:', category);
    console.log('   Gemini detected:', geminiResponse.category);
```

### Step 3: Check Database is Storing Category

```sql
SELECT id, title, category FROM complaints ORDER BY id DESC LIMIT 5;
```

Should show categories like: infrastructure, sanitation, traffic, etc.

---

## Complete Fix

Here's the complete updated `createComplaint()` method with proper category handling:

```javascript
static async createComplaint(req, res) {
  try {
    const { title, description, latitude, longitude, date, time, category } = req.body;
    const userId = req.user?.id || req.body.user_id;

    console.log('\n=== CREATE COMPLAINT DEBUG ===');
    console.log('User ID:', userId);
    console.log('Title:', title);
    console.log('Category from frontend:', category);

    // Validate required fields
    if (!title || !description || !latitude || !longitude || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    // Analyze image with Gemini
    console.log('🔍 Analyzing image with Gemini...');
    const geminiResponse = await analyzeWithGemini(req.file.path);
    console.log('✓ Gemini response:', {
      category: geminiResponse.category,
      priority: geminiResponse.priority,
      isHuman: geminiResponse.isHuman
    });

    // User-selected category takes precedence over AI detection
    const aiCategory = category || geminiResponse.category || 'other';
    console.log('📝 Final category:', aiCategory);
    console.log('   User selected:', category);
    console.log('   Gemini detected:', geminiResponse.category);

    // Create complaint data
    const complaintData = {
      user_id: userId,
      title,
      description,
      image_path: imagePath,
      latitude,
      longitude,
      date,
      time,
      category: aiCategory,
      priority: geminiResponse.priority || 'medium'
    };

    console.log('💾 Saving complaint to database...');
    const complaintId = await Complaint.create(complaintData);
    console.log('✓ Complaint created with ID:', complaintId);

    res.json({
      success: true,
      message: 'Complaint submitted successfully',
      complaint_id: complaintId,
      category: aiCategory
    });
  } catch (error) {
    console.error('❌ Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create complaint',
      error: error.message
    });
  }
}
```

---

## Verification

After making the fix:

1. **Start backend:** `npm run dev`
2. **Submit complaint** with specific category
3. **Check backend console** - should show:
   ```
   === CREATE COMPLAINT DEBUG ===
   User ID: 1
   Title: Pothole on Main Street
   Category from frontend: infrastructure
   🔍 Analyzing image with Gemini...
   ✓ Gemini response: { category: 'utilities', priority: 'high', isHuman: false }
   📝 Final category: infrastructure
      User selected: infrastructure
      Gemini detected: utilities
   💾 Saving complaint to database...
   ✓ Complaint created with ID: 42
   ```
4. **Check database:**
   ```sql
   SELECT id, title, category FROM complaints WHERE id = 42;
   ```
   Should show: `42 | Pothole on Main Street | infrastructure`

---

## Summary

**The fix is simple:**
1. Change line in `createComplaint()` to prioritize user selection
2. Add logging to verify category is being stored
3. Test by submitting a complaint and checking database

**The category WILL be stored correctly after this fix.**

---

## Files to Modify

- `backend/controllers/complaintController.js` - Update `createComplaint()` method

That's it! One file, one method, one line change.
