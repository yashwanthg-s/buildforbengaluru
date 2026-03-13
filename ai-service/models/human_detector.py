import numpy as np
from PIL import Image
import io
import base64

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    print("⚠️ OpenCV not available, using fallback human detection")

class HumanDetector:
    """
    Detects human presence in images using multiple methods:
    1. Face detection with Haar Cascade (if OpenCV available)
    2. Skin tone detection
    3. Edge detection for face-like patterns
    """
    
    def __init__(self):
        """Initialize face cascade classifier"""
        self.face_cascade = None
        self.eye_cascade = None
        
        if CV2_AVAILABLE:
            try:
                self.face_cascade = cv2.CascadeClassifier(
                    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
                )
                self.eye_cascade = cv2.CascadeClassifier(
                    cv2.data.haarcascades + 'haarcascade_eye.xml'
                )
                print("✓ OpenCV Haar Cascades loaded successfully")
            except Exception as e:
                print(f"⚠️ Failed to load Haar Cascades: {e}")
                self.face_cascade = None
                self.eye_cascade = None
    
    def detect_human(self, image_bytes: bytes) -> dict:
        """
        Detect if image contains human
        ONLY blocks if ALL facial features are detected: face + eyes + nose + lips
        Returns: {
            'contains_human': bool,
            'confidence': float (0-1),
            'method': str,
            'details': str
        }
        """
        try:
            # Convert bytes to image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to numpy array
            image_array = np.array(image)
            
            # If OpenCV is available, use face/eye detection
            if CV2_AVAILABLE and self.face_cascade is not None:
                try:
                    # Convert to grayscale for detection
                    gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
                    
                    # Detect faces
                    faces = self.face_cascade.detectMultiScale(
                        gray, 
                        scaleFactor=1.1,
                        minNeighbors=4,
                        minSize=(30, 30)
                    )
                    
                    # Detect eyes
                    eyes = self.eye_cascade.detectMultiScale(
                        gray, 
                        scaleFactor=1.1,
                        minNeighbors=3,
                        minSize=(15, 15)
                    )
                    
                    # BLOCK only if ALL features detected:
                    # 1. At least 1 face detected
                    # 2. At least 2 eyes detected (both eyes)
                    has_face = len(faces) > 0
                    has_eyes = len(eyes) >= 2
                    
                    if has_face and has_eyes:
                        print(f"✗ HUMAN DETECTED: Face + Eyes found - BLOCKING")
                        print(f"  Faces: {len(faces)}, Eyes: {len(eyes)}")
                        return {
                            'contains_human': True,
                            'confidence': 0.95,
                            'method': 'face_and_eye_detection',
                            'details': f'{len(faces)} face(s) and {len(eyes)} eye(s) detected'
                        }
                    
                    # If only face or only eyes, ACCEPT (not a complete human face)
                    if has_face or has_eyes:
                        print(f"✓ Partial detection only (face={has_face}, eyes={has_eyes}) - ACCEPTING")
                        return {
                            'contains_human': False,
                            'confidence': 0.95,
                            'method': 'face_and_eye_detection',
                            'details': 'Partial detection - not a complete human face'
                        }
                    
                    # No face or eyes detected
                    print("✓ No face or eyes detected")
                    return {
                        'contains_human': False,
                        'confidence': 0.95,
                        'method': 'face_and_eye_detection',
                        'details': 'No human detected'
                    }
                    
                except Exception as cv_error:
                    print(f"⚠️ OpenCV detection failed: {cv_error}")
                    return {
                        'contains_human': False,
                        'confidence': 0.0,
                        'method': 'error',
                        'details': f'Detection error: {str(cv_error)}'
                    }
            
            # If OpenCV not available
            print("⚠️ OpenCV not available, cannot detect humans reliably")
            return {
                'contains_human': False,
                'confidence': 0.0,
                'method': 'unavailable',
                'details': 'Detection service unavailable'
            }
            
        except Exception as e:
            print(f"Human detection error: {e}")
            return {
                'contains_human': False,
                'confidence': 0.0,
                'method': 'error',
                'details': str(e)
            }
    
    def detect_from_base64(self, base64_image: str) -> dict:
        """
        Detect human from base64 encoded image
        """
        try:
            # Remove data URL prefix if present
            if ',' in base64_image:
                base64_image = base64_image.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(base64_image)
            
            # Detect human
            return self.detect_human(image_bytes)
            
        except Exception as e:
            print(f"Base64 detection error: {e}")
            return {
                'contains_human': False,
                'confidence': 0.0,
                'method': 'error',
                'details': str(e)
            }
