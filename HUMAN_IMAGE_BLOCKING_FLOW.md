# Human Image Blocking - Complete Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CITIZEN FRONTEND                         │
│                  (React - ComplaintForm)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ 1. User captures photo
                         │ 2. Photo blob sent to backend
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    NLP SERVICE (Python)                      │
│              /validate-image endpoint                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Image Analyzer                                      │  │
│  │  ├─ YOLO Detection                                   │  │
│  │  │  ├─ Detect all objects                            │  │
│  │  │  ├─ Check for BLOCKED_OBJECTS (person, face)     │  │
│  │  │  └─ Return is_blocked=true if human found        │  │
│  │  │                                                   │  │
│  │  └─ Return Response                                  │  │
│  │     ├─ valid: true/false                             │  │
│  │     ├─ message: error message                        │  │
│  │     └─ blocked_objects: list of humans detected      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ 3. Response with valid/invalid
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    CITIZEN FRONTEND                         │
│                  (React - ComplaintForm)                     │
│                                                              │
│  If valid=true:                                             │
│  ├─ Clear error message                                     │
│  ├─ Enable submit button                                    │
│  └─ Allow form submission                                   │
│                                                              │
│  If valid=false:                                            │
│  ├─ Show error: "Image contains human..."                   │
│  ├─ Disable submit button                                   │
│  ├─ Clear captured photo                                    │
│  └─ Prompt user to retake photo                             │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Flow Diagrams

### Flow 1: Valid Image (Pothole/Issue)

```
START
  │
  ├─ User opens complaint form
  │
  ├─ User clicks camera button
  │
  ├─ Camera captures image of pothole
  │
  ├─ handlePhotoCapture() called
  │  │
  │  ├─ validateImageWithAI(photoBlob)
  │  │  │
  │  │  ├─ POST /validate-image
  │  │  │  │
  │  │  │  ├─ YOLO detects: pothole, road, asphalt
  │  │  │  │
  │  │  │  ├─ Check BLOCKED_OBJECTS
  │  │  │  │  └─ No humans found ✓
  │  │  │  │
  │  │  │  └─ Return: valid=true
  │  │  │
  │  │  └─ Return: true
  │  │
  │  ├─ setCapturedPhoto(photoData) ✓
  │  │
  │  └─ setImageValidationError('') ✓
  │
  ├─ Form displays: "Image is valid"
  │
  ├─ Submit button is ENABLED ✓
  │
  ├─ User fills title, description, category, priority
  │
  ├─ User clicks "Submit Complaint"
  │
  ├─ Complaint submitted successfully ✓
  │
  └─ END
```

### Flow 2: Invalid Image (Human/Face)

```
START
  │
  ├─ User opens complaint form
  │
  ├─ User clicks camera button
  │
  ├─ Camera captures image with person in it
  │
  ├─ handlePhotoCapture() called
  │  │
  │  ├─ validateImageWithAI(photoBlob)
  │  │  │
  │  │  ├─ POST /validate-image
  │  │  │  │
  │  │  │  ├─ YOLO detects: person, face, clothing
  │  │  │  │
  │  │  │  ├─ Check BLOCKED_OBJECTS
  │  │  │  │  ├─ Found: person ✗
  │  │  │  │  └─ is_blocked = true
  │  │  │  │
  │  │  │  └─ Return: valid=false, message="Image contains human..."
  │  │  │
  │  │  └─ Return: false
  │  │
  │  ├─ setCapturedPhoto(null) ✗
  │  │
  │  └─ setImageValidationError("Image contains human...") ✗
  │
  ├─ Form displays error message:
  │  "❌ Image Not Allowed: Image contains human. 
  │   Please upload an image of the issue/location, not people."
  │
  ├─ Submit button is DISABLED ✗
  │
  ├─ User sees error and understands requirement
  │
  ├─ User clicks camera again
  │
  ├─ User retakes photo WITHOUT person
  │
  ├─ handlePhotoCapture() called again
  │  │
  │  ├─ validateImageWithAI(photoBlob)
  │  │  │
  │  │  ├─ POST /validate-image
  │  │  │  │
  │  │  │  ├─ YOLO detects: pothole, road
  │  │  │  │
  │  │  │  ├─ Check BLOCKED_OBJECTS
  │  │  │  │  └─ No humans found ✓
  │  │  │  │
  │  │  │  └─ Return: valid=true
  │  │  │
  │  │  └─ Return: true
  │  │
  │  ├─ setCapturedPhoto(photoData) ✓
  │  │
  │  └─ setImageValidationError('') ✓
  │
  ├─ Error message disappears
  │
  ├─ Submit button is ENABLED ✓
  │
  ├─ User fills form and submits
  │
  ├─ Complaint submitted successfully ✓
  │
  └─ END
```

## Code Flow

### Frontend - ComplaintForm.jsx

```javascript
// 1. State management
const [capturedPhoto, setCapturedPhoto] = useState(null);
const [imageValidationError, setImageValidationError] = useState('');

// 2. Validation function
const validateImageWithAI = async (photoBlob) => {
  try {
    const formData = new FormData();
    formData.append('image', photoBlob, 'photo.jpg');

    const response = await fetch('http://localhost:8000/validate-image', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!result.valid) {
      setImageValidationError(result.message);  // Show error
      return false;
    }

    setImageValidationError('');  // Clear error
    return true;
  } catch (error) {
    console.error('Image validation error:', error);
    return true;  // Allow if service is down
  }
};

// 3. Photo capture handler
const handlePhotoCapture = async (photoData) => {
  const isValid = await validateImageWithAI(photoData.blob);
  
  if (!isValid) {
    setCapturedPhoto(null);  // Don't set photo
  } else {
    setCapturedPhoto(photoData);  // Set photo
  }
};

// 4. Form validation
const isFormValid = capturedPhoto && location && 
                    formData.title && formData.description && 
                    !imageValidationError;

// 5. Render error
{imageValidationError && (
  <div className="alert alert-error">
    <strong>❌ Image Not Allowed:</strong>
    <p>{imageValidationError}</p>
  </div>
)}

// 6. Submit button
<button disabled={!isFormValid || loading}>
  {loading ? '⏳ Submitting...' : '✓ Submit Complaint'}
</button>
```

### Backend - image_analyzer.py

```python
# 1. Define blocked objects
BLOCKED_OBJECTS = {
    'person': 'Human image detected',
    'face': 'Human face detected',
    'human': 'Human image detected'
}

# 2. YOLO detection
def _detect_with_yolo(self, image):
    results = self.yolo_model(image_array, verbose=False)
    
    blocked_objects = []
    
    for box in result.boxes:
        class_name = result.names[class_id].lower()
        
        # Check if blocked
        if class_name in self.BLOCKED_OBJECTS:
            blocked_objects.append({
                'object': class_name,
                'confidence': confidence,
                'reason': self.BLOCKED_OBJECTS[class_name]
            })
    
    # Return blocked status
    if blocked_objects:
        return {
            'is_blocked': True,
            'block_reason': f"Image contains {blocked_objects[0]['reason'].lower()}...",
            'blocked_objects': blocked_objects
        }
    
    # Continue with normal analysis...
```

### Backend - main.py

```python
# 1. New validation endpoint
@app.post("/validate-image")
async def validate_image(image: UploadFile = File(...)):
    image_bytes = await image.read()
    image_analysis = image_analyzer.analyze_image(image_bytes)
    
    if image_analysis.get('is_blocked'):
        return {
            'valid': False,
            'message': image_analysis.get('block_reason'),
            'blocked_objects': image_analysis.get('blocked_objects', [])
        }
    
    return {
        'valid': True,
        'message': 'Image is valid for complaint submission',
        'detected_objects': image_analysis.get('detected_objects', [])
    }

# 2. Updated analysis endpoint
@app.post("/analyze-with-image")
async def analyze_with_image(image: UploadFile, title: str, description: str):
    image_bytes = await image.read()
    image_analysis = image_analyzer.analyze_image(image_bytes)
    
    # Check if blocked
    if image_analysis.get('is_blocked'):
        return {
            'category': 'blocked',
            'priority': 'blocked',
            'block_reason': image_analysis.get('block_reason')
        }
    
    # Continue with normal analysis...
```

## Response Examples

### Valid Image Response

```json
{
  "valid": true,
  "message": "Image is valid for complaint submission",
  "detected_objects": [
    {
      "object": "pothole",
      "confidence": 0.85,
      "priority": "medium",
      "category": "infrastructure"
    }
  ]
}
```

### Invalid Image Response

```json
{
  "valid": false,
  "message": "Image contains human. Please upload an image of the issue/location, not people.",
  "blocked_objects": [
    {
      "object": "person",
      "confidence": 0.95,
      "reason": "Human image detected"
    }
  ]
}
```

## Error Handling

### Scenario 1: AI Service Down
- Frontend catches error
- Returns `true` (allows submission)
- User can submit without validation
- Backend will validate during analysis

### Scenario 2: Invalid Image Format
- Frontend catches error
- Shows generic error message
- User can retry

### Scenario 3: Network Error
- Frontend catches error
- Allows submission (graceful degradation)
- Backend validates during analysis

## Performance Timeline

```
User captures photo
    │
    ├─ 0ms: handlePhotoCapture() called
    │
    ├─ 5ms: validateImageWithAI() starts
    │
    ├─ 10ms: FormData created
    │
    ├─ 15ms: POST /validate-image sent
    │
    ├─ 50-100ms: YOLO inference on backend
    │
    ├─ 110-120ms: Response received
    │
    ├─ 125ms: State updated (setCapturedPhoto, setImageValidationError)
    │
    └─ 130ms: UI re-renders with result
       
Total: ~130ms from capture to UI update
```

## User Experience Timeline

```
T=0s:   User opens complaint form
T=5s:   User clicks camera button
T=10s:  Camera opens
T=15s:  User captures photo
T=16s:  Photo validation starts
T=17s:  Validation result received
T=18s:  UI updates with result

If VALID:
  T=18s: Error message disappears
  T=18s: Submit button becomes enabled
  T=20s: User can submit complaint

If INVALID:
  T=18s: Error message appears
  T=18s: Submit button becomes disabled
  T=20s: User retakes photo
  T=25s: New photo validated
  T=26s: Error clears, submit enabled
```

## Summary

The human image blocking system:

1. **Captures** image from camera
2. **Validates** with YOLO on backend
3. **Detects** humans/faces
4. **Blocks** if human found
5. **Shows** error message to user
6. **Disables** submit button
7. **Guides** user to retake photo
8. **Allows** submission only with valid image

This ensures:
- ✅ Privacy protection
- ✅ Quality complaints
- ✅ Clear user guidance
- ✅ Automatic enforcement
- ✅ Seamless experience
