from PIL import Image
import io
from typing import Dict, List
import numpy as np
import cv2
import os

# Try to import YOLO, fallback to basic analysis if not available
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False

class ImageAnalyzer:
    """
    Advanced image analysis for complaint categorization and priority detection
    Uses YOLO object detection for real-world object identification
    Falls back to color-based analysis if YOLO unavailable
    """
    
    # Emergency object classes detected by YOLO
    EMERGENCY_OBJECTS = {
        'fire': {'priority': 'critical', 'category': 'safety', 'score': 4},
        'smoke': {'priority': 'critical', 'category': 'safety', 'score': 4},
        'accident': {'priority': 'critical', 'category': 'traffic', 'score': 4},
        'car': {'priority': 'medium', 'category': 'traffic', 'score': 1},
        'truck': {'priority': 'medium', 'category': 'traffic', 'score': 1},
        'damage': {'priority': 'high', 'category': 'infrastructure', 'score': 3},
        'debris': {'priority': 'high', 'category': 'infrastructure', 'score': 2},
        'pothole': {'priority': 'medium', 'category': 'infrastructure', 'score': 2},
        'garbage': {'priority': 'low', 'category': 'sanitation', 'score': 1},
        'water': {'priority': 'high', 'category': 'utilities', 'score': 3},
        'flood': {'priority': 'critical', 'category': 'utilities', 'score': 4},
    }
    
    # Blocked objects (humans, faces, etc.)
    # YOLO v8 uses 'person' as the class name for humans
    BLOCKED_OBJECTS = {
        'person': 'Human image detected',
        'face': 'Human face detected',
        'human': 'Human image detected',
        'people': 'Human image detected'
    }
    
    # Color-based detection patterns (fallback)
    COLOR_PATTERNS = {
        'fire': {'red_threshold': 150, 'category': 'safety', 'priority': 'critical'},
        'water': {'blue_threshold': 100, 'category': 'utilities', 'priority': 'high'},
        'vegetation': {'green_threshold': 100, 'category': 'sanitation', 'priority': 'medium'},
        'dark': {'brightness_threshold': 50, 'category': 'utilities', 'priority': 'high'},
        'damage': {'contrast_threshold': 80, 'category': 'infrastructure', 'priority': 'high'}
    }
    
    def __init__(self):
        """Initialize YOLO model if available"""
        self.yolo_model = None
        self.use_yolo = YOLO_AVAILABLE
        
        if self.use_yolo:
            try:
                # Load YOLOv8 nano model (lightweight, fast)
                self.yolo_model = YOLO('yolov8n.pt')
                print("✓ YOLO model loaded successfully")
            except Exception as e:
                print(f"⚠ YOLO model loading failed: {e}. Falling back to color analysis.")
                self.use_yolo = False
    
    def analyze_image(self, image_bytes: bytes) -> Dict:
        """
        Analyze image to detect complaint type and severity
        Uses multiple methods to detect humans:
        1. Skin tone detection (fast)
        2. Face detection with Haar Cascade (accurate)
        3. YOLO detection (comprehensive)
        Blocks images containing humans
        """
        try:
            # Open image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize for processing
            image.thumbnail((800, 800))
            
            # FIRST: Check for human skin tones (fast)
            features = self._extract_features(image)
            
            if features['skin_ratio'] > 0.25:  # More than 25% skin tone
                print(f"⚠️ HIGH SKIN TONE DETECTED: {features['skin_ratio']:.1%}")
                return {
                    'detected_category': 'blocked',
                    'detected_priority': 'blocked',
                    'confidence': 0.0,
                    'visual_indicators': [],
                    'image_quality': features['quality'],
                    'detected_objects': [],
                    'blocked_objects': [{'object': 'person', 'confidence': 0.8, 'reason': 'Human image detected'}],
                    'detection_method': 'skin_tone_analysis',
                    'is_blocked': True,
                    'block_reason': 'Image contains human. Please upload an image of the issue/location, not people.'
                }
            
            # SECOND: Check for faces using Haar Cascade (accurate)
            if self._detect_faces_with_cascade(image):
                return {
                    'detected_category': 'blocked',
                    'detected_priority': 'blocked',
                    'confidence': 0.0,
                    'visual_indicators': [],
                    'image_quality': features['quality'],
                    'detected_objects': [],
                    'blocked_objects': [{'object': 'face', 'confidence': 0.9, 'reason': 'Human face detected'}],
                    'detection_method': 'face_cascade',
                    'is_blocked': True,
                    'block_reason': 'Image contains human. Please upload an image of the issue/location, not people.'
                }
            
            # THIRD: Try YOLO detection
            if self.use_yolo and self.yolo_model:
                yolo_results = self._detect_with_yolo(image)
                
                # Check if image is blocked (contains humans)
                if yolo_results.get('is_blocked'):
                    return yolo_results
                
                if yolo_results['detected_objects']:
                    return yolo_results
            
            # FOURTH: Civic issue detection
            analysis = self._analyze_patterns(features)
            
            return {
                'detected_category': analysis['category'],
                'detected_priority': analysis['priority'],
                'confidence': analysis['confidence'],
                'visual_indicators': analysis['indicators'],
                'image_quality': features['quality'],
                'detected_objects': [],
                'blocked_objects': [],
                'detection_method': 'color_analysis',
                'is_blocked': False
            }
            
        except Exception as e:
            print(f"Image analysis error: {e}")
            import traceback
            traceback.print_exc()
            return {
                'detected_category': 'other',
                'detected_priority': 'medium',
                'confidence': 0.0,
                'visual_indicators': [],
                'image_quality': 'unknown',
                'detected_objects': [],
                'blocked_objects': [],
                'detection_method': 'error',
                'is_blocked': False
            }
    
    def _detect_faces_with_cascade(self, image: Image.Image) -> bool:
        """
        Simple face detection using Haar Cascade
        Returns True if face detected
        """
        try:
            # Convert PIL to numpy array
            image_array = np.array(image)
            
            # Convert to grayscale
            gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
            
            # Load Haar Cascade classifier
            face_cascade = cv2.CascadeClassifier(
                cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            )
            
            # Detect faces
            faces = face_cascade.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) > 0:
                print(f"✗ FACE DETECTED: {len(faces)} face(s) found")
                return True
            
            return False
        except Exception as e:
            print(f"Face detection error: {e}")
            return False
    
    def _detect_with_yolo(self, image: Image.Image) -> Dict:
        """
        Detect objects using YOLO model
        Returns detected emergency objects and their confidence scores
        Also checks for blocked objects (humans)
        """
        try:
            # Convert PIL image to numpy array
            image_array = np.array(image)
            
            # Run YOLO inference
            results = self.yolo_model(image_array, verbose=False, conf=0.3)
            
            detected_objects = []
            blocked_objects = []
            emergency_score = 0
            category_scores = {
                'infrastructure': 0,
                'sanitation': 0,
                'traffic': 0,
                'safety': 0,
                'utilities': 0
            }
            priority_scores = {
                'critical': 0,
                'high': 0,
                'medium': 0,
                'low': 0
            }
            
            # Process detections
            if results and len(results) > 0:
                result = results[0]
                
                if result.boxes is not None and len(result.boxes) > 0:
                    for box in result.boxes:
                        # Get class name and confidence
                        class_id = int(box.cls[0])
                        confidence = float(box.conf[0])
                        class_name = result.names[class_id].lower()
                        
                        print(f"YOLO detected: {class_name} (confidence: {confidence:.2f})")
                        
                        # Check if it's a blocked object (human)
                        if class_name in self.BLOCKED_OBJECTS:
                            blocked_objects.append({
                                'object': class_name,
                                'confidence': confidence,
                                'reason': self.BLOCKED_OBJECTS[class_name]
                            })
                            print(f"⚠️ BLOCKED OBJECT DETECTED: {class_name}")
                        
                        # Check if it's an emergency object
                        elif class_name in self.EMERGENCY_OBJECTS:
                            obj_info = self.EMERGENCY_OBJECTS[class_name]
                            detected_objects.append({
                                'object': class_name,
                                'confidence': confidence,
                                'priority': obj_info['priority'],
                                'category': obj_info['category']
                            })
                            
                            # Update scores
                            emergency_score += obj_info['score'] * confidence
                            category_scores[obj_info['category']] += confidence
                            priority_scores[obj_info['priority']] += confidence
            
            # If human detected, return blocked status
            if blocked_objects:
                print(f"✗ IMAGE BLOCKED: {len(blocked_objects)} human(s) detected")
                return {
                    'detected_category': 'blocked',
                    'detected_priority': 'blocked',
                    'confidence': 0.0,
                    'visual_indicators': [],
                    'image_quality': 'good',
                    'detected_objects': [],
                    'blocked_objects': blocked_objects,
                    'detection_method': 'yolo',
                    'emergency_score': 0,
                    'is_blocked': True,
                    'block_reason': f"Image contains {blocked_objects[0]['reason'].lower()}. Please upload an image of the issue/location, not people."
                }
            
            # Determine best category and priority
            best_category = max(category_scores, key=category_scores.get)
            best_priority = max(priority_scores, key=priority_scores.get)
            
            # Calculate confidence
            detection_confidence = min(emergency_score / 10.0, 1.0) if detected_objects else 0.3
            
            # If no emergency objects detected, use medium priority
            if not detected_objects:
                best_priority = 'medium'
                best_category = 'other'
                detection_confidence = 0.3
            
            return {
                'detected_category': best_category,
                'detected_priority': best_priority,
                'confidence': detection_confidence,
                'visual_indicators': [obj['object'] for obj in detected_objects],
                'image_quality': 'good',
                'detected_objects': detected_objects,
                'blocked_objects': [],
                'detection_method': 'yolo',
                'emergency_score': emergency_score,
                'is_blocked': False
            }
            
        except Exception as e:
            print(f"YOLO detection error: {e}")
            return {
                'detected_objects': [],
                'blocked_objects': [],
                'detection_method': 'yolo_error',
                'is_blocked': False
            }
    
    def _extract_features(self, image: Image.Image) -> Dict:
        """
        Extract visual features from image (fallback method)
        Also checks for skin tones (human detection fallback)
        """
        # Get image dimensions
        width, height = image.size
        
        # Sample pixels for color analysis
        pixels = list(image.getdata())
        total_pixels = len(pixels)
        
        # Calculate average colors
        avg_red = sum(p[0] for p in pixels) / total_pixels
        avg_green = sum(p[1] for p in pixels) / total_pixels
        avg_blue = sum(p[2] for p in pixels) / total_pixels
        
        # Calculate brightness
        brightness = (avg_red + avg_green + avg_blue) / 3
        
        # Calculate color dominance
        red_dominant = avg_red > avg_green and avg_red > avg_blue
        green_dominant = avg_green > avg_red and avg_green > avg_blue
        blue_dominant = avg_blue > avg_red and avg_blue > avg_green
        
        # Calculate contrast (simplified)
        pixel_values = [sum(p) / 3 for p in pixels]
        min_val = min(pixel_values)
        max_val = max(pixel_values)
        contrast = max_val - min_val
        
        # Detect dark areas
        dark_pixels = sum(1 for p in pixels if sum(p) / 3 < 50)
        dark_ratio = dark_pixels / total_pixels
        
        # Detect bright areas
        bright_pixels = sum(1 for p in pixels if sum(p) / 3 > 200)
        bright_ratio = bright_pixels / total_pixels
        
        # Detect skin tones (human detection fallback)
        # Skin tone detection: R > 95, G > 40, B > 20, R > G, R > B, |R-G| > 15
        # Also detect lighter skin tones and darker skin tones
        skin_pixels = 0
        for p in pixels:
            if len(p) >= 3:
                r, g, b = p[0], p[1], p[2]
                # Standard skin tone detection
                if (r > 95 and g > 40 and b > 20 and 
                    r > g and r > b and abs(r - g) > 15):
                    skin_pixels += 1
                # Lighter skin tones (more red/pink)
                elif (r > 150 and g > 100 and b > 80 and r > g and r > b):
                    skin_pixels += 1
                # Darker skin tones (less bright but still warm)
                elif (r > 80 and g > 50 and b > 30 and r > g and r > b and abs(r - g) > 10):
                    skin_pixels += 1
        
        skin_ratio = skin_pixels / total_pixels if total_pixels > 0 else 0
        
        # Image quality assessment
        quality = 'good'
        if width < 400 or height < 400:
            quality = 'low'
        elif brightness < 30:
            quality = 'dark'
        elif brightness > 240:
            quality = 'overexposed'
        
        return {
            'avg_red': avg_red,
            'avg_green': avg_green,
            'avg_blue': avg_blue,
            'brightness': brightness,
            'contrast': contrast,
            'red_dominant': red_dominant,
            'green_dominant': green_dominant,
            'blue_dominant': blue_dominant,
            'dark_ratio': dark_ratio,
            'bright_ratio': bright_ratio,
            'skin_ratio': skin_ratio,
            'quality': quality,
            'dimensions': (width, height)
        }
    
    def _analyze_patterns(self, features: Dict) -> Dict:
        """
        Analyze features to determine category and priority (fallback)
        """
        indicators = []
        category_scores = {
            'infrastructure': 0,
            'sanitation': 0,
            'traffic': 0,
            'safety': 0,
            'utilities': 0
        }
        priority_scores = {
            'critical': 0,
            'high': 0,
            'medium': 0,
            'low': 0
        }
        
        # Fire/Emergency detection (red + bright)
        if features['red_dominant'] and features['bright_ratio'] > 0.1:
            category_scores['safety'] += 3
            priority_scores['critical'] += 3
            indicators.append('fire_detected')
        
        # Dark/Unlit area detection
        if features['dark_ratio'] > 0.6 or features['brightness'] < 50:
            category_scores['utilities'] += 2
            category_scores['safety'] += 1
            priority_scores['high'] += 2
            indicators.append('dark_area')
        
        # Water/Flooding detection
        if features['blue_dominant'] and features['avg_blue'] > 120:
            category_scores['utilities'] += 2
            category_scores['sanitation'] += 1
            priority_scores['high'] += 2
            indicators.append('water_detected')
        
        # Vegetation/Garbage detection
        if features['green_dominant']:
            category_scores['sanitation'] += 2
            priority_scores['medium'] += 1
            indicators.append('vegetation_detected')
        
        # High contrast (potential damage)
        if features['contrast'] > 150:
            category_scores['infrastructure'] += 2
            category_scores['traffic'] += 1
            priority_scores['high'] += 1
            indicators.append('high_contrast')
        
        # Road/Infrastructure (gray tones)
        rgb_diff = abs(features['avg_red'] - features['avg_green']) + \
                   abs(features['avg_green'] - features['avg_blue']) + \
                   abs(features['avg_blue'] - features['avg_red'])
        if rgb_diff < 30:
            category_scores['infrastructure'] += 1
            category_scores['traffic'] += 1
            indicators.append('gray_tones')
        
        # Determine best category
        best_category = max(category_scores, key=category_scores.get)
        category_confidence = category_scores[best_category] / 10.0
        
        # Determine best priority
        best_priority = max(priority_scores, key=priority_scores.get)
        priority_confidence = priority_scores[best_priority] / 10.0
        
        # Overall confidence
        confidence = (category_confidence + priority_confidence) / 2
        
        # Default to medium if no strong indicators
        if confidence < 0.2:
            best_category = 'other'
            best_priority = 'medium'
            confidence = 0.3
        
        return {
            'category': best_category,
            'priority': best_priority,
            'confidence': min(confidence, 1.0),
            'indicators': indicators,
            'category_scores': category_scores,
            'priority_scores': priority_scores
        }
    
    def get_analysis_summary(self, image_analysis: Dict, text_analysis: Dict) -> Dict:
        """
        Combine image and text analysis for final decision
        YOLO detection has higher weight when confidence is high
        """
        # Determine weights based on detection method
        if image_analysis.get('detection_method') == 'yolo' and image_analysis['confidence'] > 0.6:
            # YOLO detection is reliable - weight it more
            image_weight = 0.6
            text_weight = 0.4
        else:
            # Color analysis is less reliable - trust text more
            image_weight = 0.3
            text_weight = 0.7
        
        # Combine category scores
        final_category = text_analysis['category']
        if image_analysis['confidence'] > 0.5:
            if image_analysis['detected_category'] == text_analysis['category']:
                confidence = 0.95
            else:
                confidence = 0.7
        else:
            confidence = text_analysis['confidence']
        
        # Combine priority (take highest severity)
        priority_order = {'critical': 4, 'high': 3, 'medium': 2, 'low': 1}
        image_priority_score = priority_order.get(image_analysis['detected_priority'], 2)
        text_priority_score = priority_order.get(text_analysis.get('priority', 'medium'), 2)
        
        final_priority_score = max(image_priority_score, text_priority_score)
        final_priority = [k for k, v in priority_order.items() if v == final_priority_score][0]
        
        return {
            'category': final_category,
            'priority': final_priority,
            'confidence': confidence,
            'image_indicators': image_analysis.get('visual_indicators', []),
            'detected_objects': image_analysis.get('detected_objects', []),
            'text_keywords': text_analysis.get('keywords', []),
            'analysis_method': f"combined_{image_analysis.get('detection_method', 'unknown')}_text",
            'detection_confidence': image_analysis['confidence']
        }
