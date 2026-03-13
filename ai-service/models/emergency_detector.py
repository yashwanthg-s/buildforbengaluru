"""
Emergency Detection Module
Analyzes complaints to detect emergencies using multi-signal scoring system
"""

from typing import Dict, List, Tuple
import re


class EmergencyDetector:
    """
    Detects emergency situations in complaints using:
    - Title analysis
    - Description analysis
    - Image detection results
    - User priority
    - Emergency scoring system
    """
    
    # Emergency keywords with severity levels
    CRITICAL_EMERGENCY_KEYWORDS = [
        'fire', 'explosion', 'blast', 'bomb', 'gas leak', 'gas leakage',
        'electrocution', 'electric shock', 'live wire', 'exposed wire',
        'death', 'dead', 'died', 'killed', 'fatal', 'casualty',
        'trapped', 'stuck', 'buried', 'drowning', 'sinking',
        'collapse', 'collapsed', 'falling', 'crumbling',
        'heart attack', 'stroke', 'unconscious', 'not breathing',
        'severe bleeding', 'heavy bleeding', 'blood loss',
        'major accident', 'serious accident', 'multiple casualties'
    ]
    
    HIGH_EMERGENCY_KEYWORDS = [
        'accident', 'crash', 'collision', 'injured', 'injury', 'hurt',
        'burning', 'smoke', 'flames', 'sparking', 'sparks',
        'burst', 'overflow',
        'hanging', 'dangling', 'loose wire', 'broken wire',
        'chemical spill', 'toxic', 'poisonous', 'hazardous',
        'assault', 'attack', 'violence', 'robbery', 'theft',
        'child missing', 'kidnap', 'abduction',
        'building damage', 'structural damage', 'crack in building',
        'landslide', 'earthquake', 'natural disaster'
    ]
    
    MODERATE_EMERGENCY_KEYWORDS = [
        'urgent', 'immediate', 'emergency', 'danger', 'dangerous',
        'unsafe', 'hazard', 'risk', 'threat', 'critical',
        'serious', 'severe', 'major', 'significant',
        'broken', 'damaged', 'blocked', 'stuck',
        'no water', 'no electricity', 'no power', 'blackout',
        'medical', 'ambulance', 'hospital', 'doctor',
        'leaking', 'flooding'
    ]
    
    # Image detection emergency indicators
    EMERGENCY_IMAGE_LABELS = {
        'fire': 5,
        'smoke': 4,
        'flames': 5,
        'accident': 4,
        'crash': 4,
        'explosion': 5,
        'flooding': 3,
        'damage': 3,
        'injury': 4,
        'blood': 4,
        'wire': 3,
        'electric': 3,
        'gas': 4,
        'chemical': 4
    }
    
    # Category-based emergency indicators
    EMERGENCY_CATEGORIES = {
        'fire emergency': 5,
        'public safety': 4,
        'utilities': 3,
        'infrastructure': 2,
        'traffic': 3,
        'sanitation': 1
    }
    
    def __init__(self):
        """Initialize emergency detector"""
        self.emergency_threshold = 6  # Score >= 6 is emergency
        
    def detect_emergency(
        self,
        title: str,
        description: str,
        category: str = None,
        priority: str = None,
        image_detection: str = None
    ) -> Dict:
        """
        Main emergency detection method
        
        Scoring system:
        - Title emergency keyword: +3
        - Description emergency keyword: +3
        - Image detection (fire/smoke/accident): +4
        - User priority High: +2
        - Score >= 6: Emergency
        
        Returns:
            {
                'emergency': bool,
                'score': int,
                'confidence': float,
                'priority': str,
                'category': str,
                'emergency_keywords': list,
                'reasoning': str
            }
        """
        score = 0
        emergency_keywords = []
        reasoning_parts = []
        
        # 1. Analyze title for emergency keywords
        title_score, title_keywords = self._analyze_text_emergency(title, "title")
        score += title_score
        emergency_keywords.extend(title_keywords)
        if title_score > 0:
            reasoning_parts.append(f"Title contains emergency keywords: {', '.join(title_keywords)}")
        
        # 2. Analyze description for emergency keywords
        desc_score, desc_keywords = self._analyze_text_emergency(description, "description")
        score += desc_score
        emergency_keywords.extend(desc_keywords)
        if desc_score > 0:
            reasoning_parts.append(f"Description contains emergency keywords: {', '.join(desc_keywords)}")
        
        # 3. Analyze image detection result
        if image_detection:
            image_score = self._analyze_image_detection(image_detection)
            score += image_score
            if image_score > 0:
                reasoning_parts.append(f"Image detection indicates emergency: {image_detection}")
        
        # 4. Consider user priority
        if priority and priority.lower() in ['high', 'critical']:
            score += 2
            reasoning_parts.append(f"User marked as {priority} priority")
        
        # 5. Consider category
        if category:
            category_score = self.EMERGENCY_CATEGORIES.get(category.lower(), 0)
            if category_score >= 4:
                score += 1
                reasoning_parts.append(f"Category '{category}' indicates potential emergency")
        
        # Determine if emergency
        is_emergency = score >= self.emergency_threshold
        
        # Adjust priority based on emergency detection
        final_priority = self._determine_priority(score, priority, is_emergency)
        
        # Adjust category if fire/explosion detected
        final_category = self._adjust_category(category, emergency_keywords, image_detection)
        
        # Calculate confidence
        confidence = self._calculate_confidence(score, emergency_keywords, image_detection)
        
        # Build reasoning
        reasoning = " | ".join(reasoning_parts) if reasoning_parts else "No emergency indicators detected"
        
        return {
            'emergency': is_emergency,
            'score': score,
            'confidence': confidence,
            'priority': final_priority,
            'category': final_category,
            'emergency_keywords': list(set(emergency_keywords)),  # Remove duplicates
            'reasoning': reasoning,
            'threshold': self.emergency_threshold
        }
    
    def _analyze_text_emergency(self, text: str, source: str) -> Tuple[int, List[str]]:
        """
        Analyze text for emergency keywords
        Returns: (score, keywords_found)
        """
        if not text:
            return 0, []
        
        text_lower = text.lower()
        keywords_found = []
        score = 0
        
        # Check critical emergency keywords (highest priority)
        for keyword in self.CRITICAL_EMERGENCY_KEYWORDS:
            if keyword in text_lower:
                keywords_found.append(keyword)
                score = 3  # Maximum score for text
                break  # One critical keyword is enough
        
        # If no critical keywords, check high emergency keywords
        if score == 0:
            for keyword in self.HIGH_EMERGENCY_KEYWORDS:
                if keyword in text_lower:
                    keywords_found.append(keyword)
                    score = 3
                    break
        
        # If still no emergency, check moderate keywords
        if score == 0:
            for keyword in self.MODERATE_EMERGENCY_KEYWORDS:
                if keyword in text_lower:
                    keywords_found.append(keyword)
                    score = 2  # Lower score for moderate keywords
                    break
        
        return score, keywords_found[:3]  # Return top 3 keywords
    
    def _analyze_image_detection(self, image_detection: str) -> int:
        """
        Analyze image detection result for emergency indicators
        Returns: score (0-4)
        """
        if not image_detection:
            return 0
        
        image_lower = image_detection.lower()
        
        # Check for emergency image labels
        for label, score in self.EMERGENCY_IMAGE_LABELS.items():
            if label in image_lower:
                return 4  # Fixed score for emergency image detection
        
        return 0
    
    def _determine_priority(self, score: int, user_priority: str, is_emergency: bool) -> str:
        """
        Determine final priority based on emergency score
        """
        if is_emergency or score >= 8:
            return 'critical'
        elif score >= 6:
            return 'high'
        elif score >= 3:
            return 'medium'
        elif user_priority:
            return user_priority.lower()
        else:
            return 'low'
    
    def _adjust_category(self, category: str, keywords: List[str], image_detection: str) -> str:
        """
        Adjust category based on emergency keywords
        """
        # Check for fire-related emergencies
        fire_keywords = ['fire', 'flames', 'burning', 'smoke', 'explosion', 'blast']
        if any(kw in ' '.join(keywords).lower() for kw in fire_keywords):
            return 'fire emergency'
        
        if image_detection and any(label in image_detection.lower() for label in ['fire', 'smoke', 'flames']):
            return 'fire emergency'
        
        # Check for safety emergencies
        safety_keywords = ['accident', 'injury', 'attack', 'violence', 'robbery', 'assault']
        if any(kw in ' '.join(keywords).lower() for kw in safety_keywords):
            return 'public safety'
        
        # Check for utility emergencies
        utility_keywords = ['gas leak', 'electric', 'wire', 'electrocution', 'power']
        if any(kw in ' '.join(keywords).lower() for kw in utility_keywords):
            return 'utilities'
        
        # Return original category if no emergency category detected
        return category if category else 'other'
    
    def _calculate_confidence(self, score: int, keywords: List[str], image_detection: str) -> float:
        """
        Calculate confidence score (0.0 - 1.0)
        """
        confidence = 0.5  # Base confidence
        
        # Increase confidence based on score
        if score >= 8:
            confidence = 0.95
        elif score >= 6:
            confidence = 0.85
        elif score >= 4:
            confidence = 0.75
        elif score >= 2:
            confidence = 0.65
        
        # Boost confidence if multiple signals present
        signals = 0
        if keywords:
            signals += 1
        if image_detection:
            signals += 1
        if score > 0:
            signals += 1
        
        if signals >= 2:
            confidence = min(confidence + 0.05, 0.99)
        
        return round(confidence, 2)
    
    def get_emergency_summary(self, detection_result: Dict) -> str:
        """
        Generate human-readable emergency summary
        """
        if detection_result['emergency']:
            return (
                f"🚨 EMERGENCY DETECTED (Score: {detection_result['score']}/{detection_result['threshold']})\n"
                f"Priority: {detection_result['priority'].upper()}\n"
                f"Category: {detection_result['category']}\n"
                f"Confidence: {detection_result['confidence']*100:.0f}%\n"
                f"Keywords: {', '.join(detection_result['emergency_keywords'])}\n"
                f"Reasoning: {detection_result['reasoning']}"
            )
        else:
            return (
                f"✓ Normal complaint (Score: {detection_result['score']}/{detection_result['threshold']})\n"
                f"Priority: {detection_result['priority']}\n"
                f"Category: {detection_result['category']}"
            )
    
    def batch_detect(self, complaints: List[Dict]) -> List[Dict]:
        """
        Detect emergencies in batch of complaints
        """
        results = []
        for complaint in complaints:
            result = self.detect_emergency(
                title=complaint.get('title', ''),
                description=complaint.get('description', ''),
                category=complaint.get('category'),
                priority=complaint.get('priority'),
                image_detection=complaint.get('image_detection')
            )
            result['complaint_id'] = complaint.get('id')
            results.append(result)
        
        # Sort by emergency score (highest first)
        results.sort(key=lambda x: x['score'], reverse=True)
        return results
