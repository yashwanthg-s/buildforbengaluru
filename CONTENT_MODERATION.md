# Content Moderation System

## Overview

Automatic content filtering to prevent inappropriate complaints from being submitted. The system blocks complaints containing violence, harassment, personal attacks, or other inappropriate content.

## What Gets Blocked

### 1. Violence & Threats
- Keywords: kill, murder, assault, attack, beat, hit, punch, kick, stab, shoot, gun, knife, weapon, threat
- Example: "I want to attack someone" ❌ BLOCKED

### 2. Harassment & Abuse
- Keywords: harass, harassment, bully, bullying, abuse, abusive
- Example: "Someone is harassing me" ❌ BLOCKED (use police, not civic complaint system)

### 3. Sexual Content
- Keywords: rape, molest, sexual assault, sexual harassment, grope, inappropriate touch, indecent, obscene
- Example: "Inappropriate touching incident" ❌ BLOCKED

### 4. Personal Matters
- Patterns: "massage someone", "touching someone", "hurt someone", "follow someone"
- Example: "Someone is massaging people in the park" ❌ BLOCKED
- Example: "Following someone suspicious" ❌ BLOCKED

### 5. Hate Speech
- Keywords: hate, racist, racism, discrimination
- Example: "Racist behavior" ❌ BLOCKED

### 6. Drugs & Illegal Activities
- Keywords: drug deal, selling drugs, buy drugs, cocaine, heroin, meth
- Example: "Drug dealing in area" ❌ BLOCKED (use police)

### 7. Spam & Test Content
- Keywords: test, testing, fake complaint, dummy, sample
- Example: "Test complaint" ❌ BLOCKED
- Too short: Title < 5 chars or Description < 10 chars ❌ BLOCKED

## What's Allowed

### ✅ Legitimate Civic Complaints

**Infrastructure Issues:**
- "Large pothole on Main Street causing traffic problems"
- "Broken streetlight near park entrance"
- "Damaged sidewalk creating safety hazard"

**Sanitation Issues:**
- "Garbage not collected for 3 days"
- "Overflowing waste bins attracting pests"
- "Illegal dumping in vacant lot"

**Traffic Issues:**
- "Traffic signal not working at intersection"
- "Missing road signs causing confusion"
- "Dangerous road conditions after rain"

**Utilities:**
- "Water pipe leaking on road"
- "Power outage in neighborhood"
- "Streetlight broken for weeks"

**Safety (Infrastructure):**
- "Broken fence around construction site"
- "Unsafe playground equipment"
- "Fallen tree blocking road"

## How It Works

### Backend Process

1. **User submits complaint**
2. **Content filter checks title + description**
3. **If blocked:**
   - Returns error message
   - Logs attempt (for monitoring)
   - Complaint NOT saved to database
4. **If allowed:**
   - Proceeds with normal submission
   - AI analysis
   - Saves to database

### Code Flow

```javascript
// In complaintController.js
const contentCheck = contentFilter.checkContent(title, description);

if (contentCheck.isBlocked) {
  // Log the attempt
  contentFilter.logBlockedAttempt(userId, title, description, contentCheck.reason);
  
  // Return error to user
  return res.status(400).json({
    success: false,
    message: contentCheck.reason,
    blocked: true
  });
}

// Continue with normal submission...
```

## Error Messages

### Generic Message (Most Cases)
```
Your complaint contains inappropriate content and cannot be submitted. 
Please ensure your complaint is about legitimate civic issues only.
```

### Personal Matters Message
```
Your complaint appears to describe personal matters or inappropriate behavior. 
This system is for reporting civic infrastructure and public service issues only.
```

### Too Short Message
```
Please provide more details. Title must be at least 5 characters 
and description at least 10 characters.
```

## Examples

### ❌ Blocked Examples

**Example 1: Personal Harassment**
```
Title: "Someone harassing people"
Description: "A person is harassing citizens in the park"
Result: BLOCKED - Contains "harassing"
```

**Example 2: Violence**
```
Title: "Threatening behavior"
Description: "Someone threatened to attack me"
Result: BLOCKED - Contains "threatened" and "attack"
```

**Example 3: Personal Matter**
```
Title: "Inappropriate behavior"
Description: "Someone is massaging people without permission"
Result: BLOCKED - Matches pattern "massaging someone"
```

**Example 4: Test/Spam**
```
Title: "Test"
Description: "Testing the system"
Result: BLOCKED - Contains "test" and "testing"
```

### ✅ Allowed Examples

**Example 1: Infrastructure**
```
Title: "Broken streetlight"
Description: "The streetlight on Main Street has been broken for 2 weeks, creating safety concerns at night"
Result: ALLOWED - Legitimate civic issue
```

**Example 2: Sanitation**
```
Title: "Garbage collection missed"
Description: "Garbage has not been collected in our area for 5 days, causing health concerns"
Result: ALLOWED - Legitimate civic issue
```

**Example 3: Traffic**
```
Title: "Traffic signal malfunction"
Description: "The traffic light at 5th Avenue is stuck on red, causing major traffic congestion"
Result: ALLOWED - Legitimate civic issue
```

## Monitoring

### Backend Logs

Blocked attempts are logged to console:

```
🚫 BLOCKED COMPLAINT ATTEMPT: {
  userId: 3,
  title: 'Someone harassing people',
  description: 'A person is harassing citizens in the park...',
  reason: 'Your complaint contains inappropriate content...',
  timestamp: '2026-03-12T10:30:00.000Z'
}
```

### Admin Monitoring

Admins can monitor blocked attempts by checking backend logs. This helps identify:
- Misuse attempts
- Users who need education about system purpose
- Potential need for police intervention

## Configuration

### Adding New Blocked Keywords

Edit `backend/utils/contentFilter.js`:

```javascript
this.blockedKeywords = [
  // Add new keywords here
  'new_keyword',
  'another_keyword'
];
```

### Adding New Patterns

```javascript
this.suspiciousPatterns = [
  // Add new regex patterns here
  /\bnew\s+pattern\b/i
];
```

### Adjusting Thresholds

```javascript
// Minimum lengths
if (title.trim().length < 5 || description.trim().length < 10) {
  // Change 5 and 10 to different values
}
```

## Testing

### Test Blocked Content

Try submitting these (should be blocked):

1. Title: "Test complaint", Description: "Testing the system"
2. Title: "Someone harassing", Description: "Person harassing citizens"
3. Title: "Massage incident", Description: "Someone massaging people in park"

### Test Allowed Content

Try submitting these (should work):

1. Title: "Pothole on road", Description: "Large pothole causing traffic issues"
2. Title: "Broken streetlight", Description: "Streetlight not working for 2 weeks"
3. Title: "Garbage issue", Description: "Garbage not collected for 5 days"

## User Education

### What to Tell Users

**This system is for:**
- Infrastructure problems (roads, lights, buildings)
- Sanitation issues (garbage, cleanliness)
- Traffic problems (signals, signs, congestion)
- Utility issues (water, electricity, gas)
- Public facility problems (parks, playgrounds)

**This system is NOT for:**
- Personal disputes or conflicts
- Criminal activities (call police)
- Medical emergencies (call ambulance)
- Fire emergencies (call fire department)
- Personal harassment (call police)

## Files Created/Modified

1. **Created**: `backend/utils/contentFilter.js` - Content filtering logic
2. **Modified**: `backend/controllers/complaintController.js` - Added content check

## Status

✅ **Implemented** - Content moderation active
✅ **Logging** - Blocked attempts logged
✅ **User-friendly** - Clear error messages
✅ **Configurable** - Easy to add new keywords/patterns

---

**Result**: Inappropriate complaints like harassment, violence, or personal matters are now automatically blocked with clear error messages.
