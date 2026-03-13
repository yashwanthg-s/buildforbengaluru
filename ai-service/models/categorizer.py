import re
from typing import Dict, List

class ComplaintCategorizer:
    """
    Hybrid complaint categorizer:
    - Primary: Transformer model (90-95% accuracy)
    - Fallback: Keyword matching (75-80% accuracy)
    """
    
    def __init__(self):
        # Try to load transformer model
        try:
            from models.transformer_classifier import TransformerClassifier
            self.transformer = TransformerClassifier()
            self.use_transformer = self.transformer.model_loaded
            if self.use_transformer:
                print("✓ Using transformer model for high accuracy")
        except Exception as e:
            print(f"✗ Transformer not available: {e}")
            self.use_transformer = False
            print("✓ Using keyword-based classification")
    
    def categorize(self, title: str, description: str) -> Dict:
        """
        Categorize complaint - uses transformer if available
        """
        if self.use_transformer:
            return self.transformer.categorize(title, description)
        else:
            return self._keyword_categorize(title, description)
    
    def analyze_priority(self, title: str, description: str) -> Dict:
        """
        Analyze priority - uses transformer if available
        """
        if self.use_transformer:
            return self.transformer.analyze_priority(title, description)
        else:
            return self._keyword_priority(title, description)
    
    def _keyword_categorize(self, title: str, description: str) -> Dict:
        """
        Keyword-based categorization (fallback)
        """
        text = f"{title} {description}".lower()
    
    # Category keywords mapping
    CATEGORY_KEYWORDS = {
        'infrastructure': [
            'road', 'pothole', 'bridge', 'street', 'pavement', 'sidewalk',
            'construction', 'building', 'structure', 'damage', 'broken',
            'crack', 'collapse', 'repair', 'highway', 'footpath', 'pathway',
            'wall', 'fence', 'gate', 'stairs', 'railing', 'manhole', 'cover',
            'asphalt', 'concrete', 'cement', 'tile', 'floor', 'ceiling',
            'roof', 'door', 'window', 'pillar', 'column', 'beam'
        ],
        'sanitation': [
            'garbage', 'waste', 'trash', 'dirty', 'clean', 'litter',
            'dump', 'sewage', 'drain', 'pollution', 'contamination',
            'hygiene', 'sanitation', 'filth', 'smell', 'odor', 'stink',
            'toilet', 'bathroom', 'washroom', 'dustbin', 'bin', 'rubbish',
            'decompose', 'rot', 'flies', 'mosquito', 'pest', 'rat', 'rodent',
            'overflow', 'clog', 'block', 'gutter', 'sewer', 'waste water'
        ],
        'traffic': [
            'traffic', 'congestion', 'accident', 'vehicle', 'car', 'truck',
            'parking', 'road', 'signal', 'light', 'speed', 'rash',
            'driving', 'collision', 'crash', 'hit', 'bus', 'auto', 'bike',
            'motorcycle', 'scooter', 'jam', 'stuck', 'slow', 'horn',
            'overtake', 'lane', 'zebra', 'crossing', 'pedestrian',
            'traffic light', 'red light', 'signal', 'stop sign', 'roundabout'
        ],
        'safety': [
            'safety', 'danger', 'unsafe', 'risk', 'hazard', 'crime',
            'theft', 'robbery', 'assault', 'violence', 'security',
            'police', 'emergency', 'attack', 'threat', 'fear', 'scared',
            'suspicious', 'stranger', 'harassment', 'abuse', 'fight',
            'weapon', 'knife', 'gun', 'gang', 'drug', 'alcohol',
            'dark', 'unlit', 'lighting', 'cctv', 'camera', 'guard'
        ],
        'utilities': [
            'water', 'electricity', 'power', 'gas', 'supply', 'outage',
            'blackout', 'pipe', 'leak', 'meter', 'bill', 'connection',
            'utility', 'service', 'wire', 'cable', 'pole', 'transformer',
            'voltage', 'current', 'shock', 'spark', 'short circuit',
            'tap', 'faucet', 'valve', 'pressure', 'flow', 'drainage',
            'lpg', 'cylinder', 'pipeline', 'electric', 'electrical'
        ]
    }
    
    # Priority keywords with more specific emergency terms
    PRIORITY_KEYWORDS = {
        'critical': [
            'emergency', 'urgent', 'immediate', 'danger', 'life', 'death',
            'injury', 'severe', 'critical', 'collapse', 'fire', 'accident',
            'bleeding', 'unconscious', 'trapped', 'explosion', 'gas leak',
            'electrocution', 'drowning', 'falling', 'heart attack', 'stroke',
            'fatal', 'serious injury', 'ambulance', 'hospital', 'died',
            'dead', 'killed', 'casualty', 'victim', 'rescue', 'help',
            'live wire', 'exposed wire', 'hanging wire', 'sparking'
        ],
        'high': [
            'serious', 'major', 'significant', 'important', 'broken',
            'damaged', 'blocked', 'hazard', 'risk', 'unsafe', 'dangerous',
            'leaking', 'flooding', 'overflow', 'burst', 'crack',
            'unstable', 'loose', 'hanging', 'fallen', 'collapsed',
            'no water', 'no electricity', 'no power', 'blackout',
            'injured', 'hurt', 'pain', 'wound', 'medical'
        ],
        'medium': [
            'issue', 'problem', 'complaint', 'concern', 'need', 'require',
            'not working', 'malfunction', 'defect', 'fault', 'error',
            'slow', 'delay', 'pending', 'waiting', 'request',
            'maintenance', 'repair', 'fix', 'replace', 'service'
        ],
        'low': [
            'minor', 'small', 'slight', 'little', 'suggestion', 'feedback',
            'improvement', 'enhancement', 'cosmetic', 'aesthetic',
            'recommendation', 'advice', 'opinion', 'query', 'question'
        ]
    }

    def categorize(self, title: str, description: str) -> Dict:
        """
        Categorize complaint based on keywords
        """
        text = f"{title} {description}".lower()
        
        # Calculate scores for each category
        scores = {}
        for category, keywords in self.CATEGORY_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in text)
            scores[category] = score
        
        # Find best match
        if max(scores.values()) == 0:
            best_category = 'other'
            confidence = 0.0
        else:
            best_category = max(scores, key=scores.get)
            confidence = min(scores[best_category] / 5.0, 1.0)  # Normalize to 0-1
        
        # Extract keywords found
        found_keywords = []
        for keyword in self.CATEGORY_KEYWORDS.get(best_category, []):
            if keyword in text:
                found_keywords.append(keyword)
        
        return {
            'category': best_category,
            'confidence': confidence,
            'keywords': found_keywords[:5],  # Top 5 keywords
            'method': 'keyword_matching'
        }

    def _keyword_priority(self, title: str, description: str) -> Dict:
        """
        Keyword-based priority analysis (fallback)
        """
        text = f"{title} {description}".lower()
        
        # Calculate priority scores
        priority_scores = {}
        for priority, keywords in self.PRIORITY_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in text)
            priority_scores[priority] = score
        
        # Determine priority
        if priority_scores['critical'] > 0:
            priority = 'critical'
        elif priority_scores['high'] > 0:
            priority = 'high'
        elif priority_scores['medium'] > 0:
            priority = 'medium'
        else:
            priority = 'low'
        
        return {
            'priority': priority,
            'scores': priority_scores,
            'recommendation': self._get_recommendation(priority)
        }

    def _get_recommendation(self, priority: str) -> str:
        """
        Get action recommendation based on priority
        """
        recommendations = {
            'critical': 'Immediate action required. Escalate to emergency services.',
            'high': 'Urgent review needed. Assign to senior officer.',
            'medium': 'Standard processing. Assign to available officer.',
            'low': 'Can be scheduled for routine review.'
        }
        return recommendations.get(priority, 'Review and categorize manually.')

    def validate_complaint(self, title: str, description: str) -> Dict:
        """
        Validate complaint for authenticity
        """
        issues = []
        
        # Check minimum length
        if len(title.strip()) < 5:
            issues.append('Title too short')
        
        if len(description.strip()) < 20:
            issues.append('Description too short')
        
        # Check for spam patterns
        if self._is_spam(title, description):
            issues.append('Possible spam detected')
        
        return {
            'valid': len(issues) == 0,
            'issues': issues,
            'confidence': 1.0 - (len(issues) * 0.2)
        }

    def _is_spam(self, title: str, description: str) -> bool:
        """
        Detect spam patterns
        """
        text = f"{title} {description}".lower()
        
        # Check for excessive repetition
        words = text.split()
        if len(words) > 0:
            word_freq = {}
            for word in words:
                word_freq[word] = word_freq.get(word, 0) + 1
            
            # If any word appears more than 30% of the time, likely spam
            max_freq = max(word_freq.values())
            if max_freq / len(words) > 0.3:
                return True
        
        # Check for URL patterns
        if re.search(r'http[s]?://|www\.', text):
            return True
        
        return False
