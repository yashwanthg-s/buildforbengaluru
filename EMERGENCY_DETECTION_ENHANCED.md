# Emergency Detection - Enhanced with AI

## What's New

The "Detect Emergency Using AI" feature has been significantly enhanced to provide intelligent prioritization of complaints.

## Key Features

### 1. **Unassigned Complaints Only**
- Only analyzes complaints with status = 'submitted'
- Excludes already assigned complaints (under_review, resolved, rejected)
- Focuses admin attention on new complaints that need action

### 2. **Intelligent Urgency Scoring**
The AI calculates an urgency score (0-100) based on:

- **Priority Level (40 points max)**
  - Critical: 40 points
  - High: 30 points
  - Medium: 20 points
  - Low: 10 points

- **AI Confidence (20 points max)**
  - Based on transformer model's confidence in categorization
  - Higher confidence = more reliable urgency assessment

- **Keyword Analysis (30 points max)**
  - Detects emergency keywords: fire, accident, emergency, urgent, danger, critical, immediate, injured, death
  - Each urgent keyword adds 10 points (max 30)

- **Recency (10 points max)**
  - < 1 hour old: 10 points
  - < 6 hours old: 7 points
  - < 24 hours old: 5 points
  - < 72 hours old: 2 points

### 3. **Keyword Extraction**
Automatically extracts and displays important keywords from complaint descriptions:

**Emergency Keywords:**
- fire, accident, emergency, urgent, danger, critical, immediate
- injured, death, bleeding, explosion, collapse, flood
- gas leak, electric shock, attack, violence, robbery, theft

**Problem Keywords:**
- broken, damaged, leaking, overflow, blocked, stuck, not working
- malfunctioning, hazard, unsafe, dangerous, pothole, crack
- garbage, waste, sewage, water, electricity, power cut, outage
- traffic, signal, light, road, street, bridge, building

### 4. **Smart Sorting**
Complaints are sorted by:
1. **Urgency Score** (highest first)
2. **Priority Level** (critical > high > medium > low)
3. **Date** (newest first)

This ensures the most critical complaints appear at the top.

## UI Enhancements

### Urgency Score Badge
- Displayed as 🔥 score (e.g., "🔥 85")
- Red gradient background
- Visible at a glance in complaint header

### Keywords Display
- Blue section showing "🔑 Key Issues:"
- Up to 5 most important keywords
- Purple gradient tags
- Helps admin quickly understand the problem

### Example Display
```
┌─────────────────────────────────────┐
│ CRITICAL  #123  🔥 92               │
├─────────────────────────────────────┤
│ [Image]                             │
│                                     │
│ Fire accident on Main Street       │
│ Large fire broke out causing...    │
│                                     │
│ 🔑 Key Issues:                      │
│ [fire] [accident] [emergency]       │
│ [danger] [immediate]                │
│                                     │
│ 📍 Location: 12.9716, 77.5946       │
│ 📅 Date: 2026-03-12 14:30:00        │
│ 🏷️ Category: safety                 │
│ 🤖 AI Confidence: 95%               │
│                                     │
│ [🗺️ View Location] [🚨 Assign]      │
└─────────────────────────────────────┘
```

## How It Works

### Backend Process

1. **Fetch Unassigned Complaints**
   ```sql
   SELECT * FROM complaints 
   WHERE status = 'submitted'
   ORDER BY priority, created_at DESC
   ```

2. **AI Analysis**
   - Send each complaint to AI service
   - Get priority recommendation
   - Extract keywords from description

3. **Calculate Urgency Score**
   - Combine priority, AI confidence, keywords, recency
   - Score range: 0-100

4. **Sort by Urgency**
   - Highest urgency score first
   - Break ties with priority level
   - Then by date

5. **Return to Frontend**
   - Include urgency_score
   - Include keywords array
   - Include AI confidence

### Frontend Display

1. **Click "Detect Emergency Using AI"**
2. **Loading state** shows "🤖 Analyzing..."
3. **Results displayed** in grid format
4. **Each card shows:**
   - Priority badge (color-coded)
   - Urgency score (🔥 badge)
   - Image
   - Title and description
   - Keywords section
   - Location, date, category
   - AI confidence
   - Action buttons

## Example Scenarios

### Scenario 1: Fire Emergency
**Input:**
- Title: "Fire accident on Main Street"
- Description: "Large fire broke out near the market causing immediate danger to residents"
- Priority: Critical (AI detected)

**Urgency Score Calculation:**
- Priority (critical): 40 points
- Keywords (fire, accident, emergency, immediate, danger): 30 points
- AI Confidence (95%): 19 points
- Recency (30 mins ago): 10 points
- **Total: 99 points** ⭐ Top priority!

**Keywords Extracted:**
- fire
- accident
- emergency
- immediate
- danger

### Scenario 2: Pothole Issue
**Input:**
- Title: "Large pothole on road"
- Description: "There is a big pothole causing traffic problems"
- Priority: Medium (AI detected)

**Urgency Score Calculation:**
- Priority (medium): 20 points
- Keywords (pothole, traffic): 0 points (not urgent)
- AI Confidence (80%): 16 points
- Recency (2 hours ago): 7 points
- **Total: 43 points** - Lower priority

**Keywords Extracted:**
- pothole
- road
- traffic
- causing

### Scenario 3: Garbage Collection
**Input:**
- Title: "Garbage not collected"
- Description: "Waste has been piling up for 3 days"
- Priority: Low (AI detected)

**Urgency Score Calculation:**
- Priority (low): 10 points
- Keywords (garbage, waste): 0 points
- AI Confidence (75%): 15 points
- Recency (1 day ago): 5 points
- **Total: 30 points** - Lowest priority

**Keywords Extracted:**
- garbage
- waste
- piling

## Testing the Feature

### Step 1: Create Test Complaints

Submit these complaints to test the urgency scoring:

**High Urgency:**
```
Title: Fire emergency near school
Description: Large fire accident causing immediate danger to children and residents. Emergency response needed urgently.
```

**Medium Urgency:**
```
Title: Broken water pipe
Description: Water pipe leaking on the road causing traffic issues
```

**Low Urgency:**
```
Title: Street light not working
Description: The street light has been off for 2 days
```

### Step 2: Click "Detect Emergency Using AI"

Watch the backend console for logs:
```
🚨 Detecting emergency complaints...
Found 3 unassigned complaints to analyze
✓ Analyzed 3 complaints, sorted by urgency
```

### Step 3: Verify Sorting

Complaints should appear in order:
1. Fire emergency (urgency: ~95)
2. Broken water pipe (urgency: ~45)
3. Street light (urgency: ~25)

### Step 4: Check Keywords

Each complaint should show relevant keywords:
- Fire: [fire, emergency, accident, immediate, danger]
- Water pipe: [broken, water, pipe, leaking, traffic]
- Street light: [street, light, working]

## Backend Logs

When emergency detection runs, you'll see:
```
🚨 Detecting emergency complaints...
Found 15 unassigned complaints to analyze

Analyzing complaint #123: Fire emergency near school
  Priority: critical (40 pts)
  Keywords: fire, emergency, accident, immediate, danger (30 pts)
  AI Confidence: 95% (19 pts)
  Recency: 0.5 hours (10 pts)
  Urgency Score: 99

Analyzing complaint #124: Broken water pipe
  Priority: medium (20 pts)
  Keywords: broken, water, pipe, leaking (0 pts)
  AI Confidence: 80% (16 pts)
  Recency: 2 hours (7 pts)
  Urgency Score: 43

✓ Analyzed 15 complaints, sorted by urgency
```

## Files Modified

1. **backend/controllers/adminController.js**
   - Added `extractKeywords()` function
   - Added `calculateUrgencyScore()` function
   - Enhanced `getEmergencyComplaints()` to use new logic

2. **backend/models/Complaint.js**
   - Added `getUnassignedComplaints()` method

3. **frontend/src/components/AdminDashboard.jsx**
   - Added urgency score display
   - Added keywords section
   - Removed frontend filtering (now done in backend)

4. **frontend/src/styles/AdminDashboard.css**
   - Added `.urgency-score` styles
   - Added `.keywords-section` styles
   - Added `.keyword-tag` styles

## Benefits

1. **Faster Response**: Most urgent complaints appear first
2. **Better Context**: Keywords help understand the issue quickly
3. **Data-Driven**: AI-powered scoring removes human bias
4. **Efficient**: Only shows unassigned complaints
5. **Transparent**: Urgency score shows why complaint is prioritized

## Future Enhancements

Potential improvements:
- Add location-based clustering (multiple emergencies in same area)
- Include time-of-day factors (night emergencies more urgent)
- Learn from historical data (which complaints get resolved fastest)
- Add manual urgency override for admins
- Show urgency trend (increasing/decreasing over time)

---

**Status**: ✅ Enhanced emergency detection implemented
**Ready to use**: Yes - click "Detect Emergency Using AI" button
