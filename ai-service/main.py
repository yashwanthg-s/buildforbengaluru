from fastapi import FastAPI, HTTPException, File, UploadFile, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
from models.categorizer import ComplaintCategorizer
from models.image_analyzer import ImageAnalyzer
from models.duplicate_detector import DuplicateDetector
from models.emergency_detector import EmergencyDetector
from models.human_detector import HumanDetector

load_dotenv()

app = FastAPI(title="Complaint AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class ImageRequest(BaseModel):
    image: str  # base64 encoded image

# Initialize analyzers
categorizer = ComplaintCategorizer()
image_analyzer = ImageAnalyzer()
duplicate_detector = DuplicateDetector()
emergency_detector = EmergencyDetector()
human_detector = HumanDetector()

# Request/Response models
class ComplaintRequest(BaseModel):
    title: str
    description: str

class ComplaintResponse(BaseModel):
    category: str
    confidence: float
    keywords: list

class AnalysisResponse(BaseModel):
    category: str
    priority: str
    confidence: float
    image_indicators: list
    detected_objects: list
    text_keywords: list
    analysis_method: str
    detection_confidence: float
    block_reason: Optional[str] = None

class EmergencyAnalysisRequest(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    priority: Optional[str] = None
    image_detection: Optional[str] = None

class EmergencyAnalysisResponse(BaseModel):
    category: str
    priority: str
    emergency: bool
    confidence: float
    emergency_keywords: List[str]
    reasoning: str
    score: int

class ExistingComplaint(BaseModel):
    id: int
    title: str
    description: str
    category: str
    latitude: float
    longitude: float
    created_at: Optional[str] = None

class DuplicateCheckRequest(BaseModel):
    title: str
    description: str
    category: str
    latitude: float
    longitude: float
    existing_complaints: List[ExistingComplaint]

@app.get("/health")
async def health_check():
    return {"status": "OK", "service": "complaint-ai"}

@app.post("/categorize", response_model=ComplaintResponse)
async def categorize_complaint(request: ComplaintRequest):
    """
    Categorize a complaint based on title and description
    """
    try:
        result = categorizer.categorize(
            title=request.title,
            description=request.description
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
async def analyze_complaint(request: ComplaintRequest):
    """
    Analyze complaint for priority and urgency
    """
    try:
        analysis = categorizer.analyze_priority(
            title=request.title,
            description=request.description
        )
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/validate-image")
async def validate_image(image: UploadFile = File(...)):
    """
    Validate image before complaint submission
    Checks if image contains humans or other blocked content
    
    Returns:
    {
        "valid": true,
        "message": "Image is valid for complaint submission"
    }
    
    Or if blocked:
    {
        "valid": false,
        "message": "Image contains human. Please upload an image of the issue/location, not people."
    }
    """
    try:
        # Read image
        image_bytes = await image.read()
        
        # Analyze image
        image_analysis = image_analyzer.analyze_image(image_bytes)
        
        # Check if blocked
        if image_analysis.get('is_blocked'):
            return {
                'valid': False,
                'message': image_analysis.get('block_reason', 'Image contains blocked content'),
                'blocked_objects': image_analysis.get('blocked_objects', [])
            }
        
        return {
            'valid': True,
            'message': 'Image is valid for complaint submission',
            'detected_objects': image_analysis.get('detected_objects', [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-with-image", response_model=AnalysisResponse)
async def analyze_with_image(
    image: UploadFile = File(...),
    title: str = "",
    description: str = ""
):
    """
    Analyze complaint with image, title, and description
    Uses YOLO object detection for real-world object identification
    Falls back to color analysis if YOLO unavailable
    
    Blocks images containing humans and returns error message
    
    Returns:
    {
        "category": "Fire Emergency",
        "priority": "Critical",
        "confidence": 0.95,
        "image_indicators": ["fire", "smoke"],
        "detected_objects": [...],
        "text_keywords": ["fire", "flames"],
        "analysis_method": "combined_yolo_text",
        "detection_confidence": 0.90
    }
    
    Or if blocked:
    {
        "category": "blocked",
        "priority": "blocked",
        "confidence": 0.0,
        "image_indicators": [],
        "detected_objects": [],
        "text_keywords": [],
        "analysis_method": "blocked",
        "detection_confidence": 0.0,
        "block_reason": "Image contains human. Please upload an image of the issue/location, not people."
    }
    """
    try:
        # Read image
        image_bytes = await image.read()
        
        # Step 1: Analyze image with YOLO or color analysis
        image_analysis = image_analyzer.analyze_image(image_bytes)
        
        # Check if image is blocked
        if image_analysis.get('is_blocked'):
            return {
                'category': 'blocked',
                'priority': 'blocked',
                'confidence': 0.0,
                'image_indicators': [],
                'detected_objects': [],
                'text_keywords': [],
                'analysis_method': 'blocked',
                'detection_confidence': 0.0,
                'block_reason': image_analysis.get('block_reason', 'Image contains blocked content')
            }
        
        # Step 2: Analyze text
        text_category = categorizer.categorize(title=title, description=description)
        text_priority = categorizer.analyze_priority(title=title, description=description)
        
        text_analysis = {
            'category': text_category['category'],
            'confidence': text_category['confidence'],
            'keywords': text_category['keywords'],
            'priority': text_priority['priority']
        }
        
        # Step 3: Combine analyses
        final_analysis = image_analyzer.get_analysis_summary(image_analysis, text_analysis)
        
        return final_analysis
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/check-duplicate")
async def check_duplicate(request: DuplicateCheckRequest):
    """
    Check if complaint is duplicate of existing complaints
    Uses AI to detect similar complaints in same location
    """
    try:
        # Convert existing complaints to dict format
        existing = [complaint.dict() for complaint in request.existing_complaints]
        
        # Check for duplicates
        result = duplicate_detector.check_duplicate(
            title=request.title,
            description=request.description,
            category=request.category,
            latitude=request.latitude,
            longitude=request.longitude,
            existing_complaints=existing
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-complaint", response_model=EmergencyAnalysisResponse)
async def analyze_complaint(request: EmergencyAnalysisRequest):
    """
    Comprehensive complaint analysis endpoint
    Detects emergency status, priority, and category
    
    Scoring system:
    - Title emergency keyword: +3
    - Description emergency keyword: +3
    - Image detection (fire/smoke/accident): +4
    - User priority High: +2
    - Score >= 6: Emergency
    
    Returns:
    {
        "category": "Fire Emergency",
        "priority": "Critical",
        "emergency": true,
        "confidence": 0.95,
        "emergency_keywords": ["fire", "flames"],
        "reasoning": "Title contains emergency keywords: fire, flames | Image detection indicates emergency: fire",
        "score": 10
    }
    """
    try:
        # Perform emergency detection
        result = emergency_detector.detect_emergency(
            title=request.title,
            description=request.description,
            category=request.category,
            priority=request.priority,
            image_detection=request.image_detection
        )
        
        return EmergencyAnalysisResponse(
            category=result['category'],
            priority=result['priority'],
            emergency=result['emergency'],
            confidence=result['confidence'],
            emergency_keywords=result['emergency_keywords'],
            reasoning=result['reasoning'],
            score=result['score']
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-emergency")
async def detect_emergency(request: EmergencyAnalysisRequest):
    """
    Quick emergency detection endpoint
    Returns only emergency flag and confidence
    """
    try:
        result = emergency_detector.detect_emergency(
            title=request.title,
            description=request.description,
            category=request.category,
            priority=request.priority,
            image_detection=request.image_detection
        )
        
        return {
            'emergency': result['emergency'],
            'confidence': result['confidence'],
            'score': result['score'],
            'priority': result['priority'],
            'keywords': result['emergency_keywords']
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch-analyze")
async def batch_analyze(complaints: List[EmergencyAnalysisRequest]):
    """
    Analyze multiple complaints in batch
    Returns sorted by emergency score (highest first)
    """
    try:
        complaint_dicts = [
            {
                'title': c.title,
                'description': c.description,
                'category': c.category,
                'priority': c.priority,
                'image_detection': c.image_detection
            }
            for c in complaints
        ]
        
        results = emergency_detector.batch_detect(complaint_dicts)
        
        return {
            'total': len(results),
            'emergency_count': sum(1 for r in results if r['emergency']),
            'complaints': results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-human")
@app.post("/detect-human")
async def detect_human(request: ImageRequest):
    """
    Detect if image contains human using face detection
    
    Request body: {"image": "base64_string"}
    
    Returns:
    {
        "contains_human": true/false,
        "confidence": 0.0-1.0,
        "method": "face_detection/eye_detection/...",
        "details": "description of detection"
    }
    """
    try:
        if not request.image:
            raise HTTPException(status_code=400, detail="No image provided")
        
        # Detect human from base64
        result = human_detector.detect_from_base64(request.image)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
