"""
NLP Processing Module
Handles text analysis, keyword extraction, and complaint classification
"""

from typing import Dict, List, Tuple
import re
from collections import Counter


class NLPProcessor:
    """
    Natural Language Processing for complaint analysis
    - Text preprocessing
    - Keyword extraction
    - Sentiment analysis
    - Category classification
    """
    
    def __init__(self):
        """Initialize NLP processor"""
        self.stop_words = self._get_stop_words()
        
    def _get_stop_words(self) -> set:
        """Common English stop words"""
        return {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
            'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
            'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
            'what', 'which', 'who', 'when', 'where', 'why', 'how'
        }
    
    def preprocess_text(self, text: str) -> str:
        """
        Preprocess text for analysis
        - Convert to lowercase
        - Remove special characters
        - Remove extra whitespace
        """
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http[s]?://\S+', '', text)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove special characters but keep spaces and basic punctuation
        text = re.sub(r'[^a-z0-9\s\.\,\!\?]', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def tokenize(self, text: str) -> List[str]:
        """
        Tokenize text into words
        """
        if not text:
            return []
        
        # Split by whitespace and punctuation
        tokens = re.findall(r'\b\w+\b', text.lower())
        return tokens
    
    def extract_keywords(self, text: str, top_n: int = 10) -> List[str]:
        """
        Extract important keywords from text
        Removes stop words and returns most frequent terms
        """
        if not text:
            return []
        
        tokens = self.tokenize(text)
        
        # Remove stop words
        keywords = [t for t in tokens if t not in self.stop_words and len(t) > 2]
        
        # Count frequency
        freq = Counter(keywords)
        
        # Return top N keywords
        return [word for word, _ in freq.most_common(top_n)]
    
    def extract_phrases(self, text: str, phrase_length: int = 2) -> List[str]:
        """
        Extract multi-word phrases from text
        """
        if not text:
            return []
        
        tokens = self.tokenize(text)
        phrases = []
        
        for i in range(len(tokens) - phrase_length + 1):
            phrase = ' '.join(tokens[i:i + phrase_length])
            # Skip if phrase contains only stop words
            if not all(word in self.stop_words for word in phrase.split()):
                phrases.append(phrase)
        
        # Return most common phrases
        freq = Counter(phrases)
        return [phrase for phrase, _ in freq.most_common(5)]
    
    def calculate_text_length_score(self, text: str) -> float:
        """
        Calculate score based on text length
        Longer, more detailed complaints are more credible
        """
        if not text:
            return 0.0
        
        word_count = len(self.tokenize(text))
        
        # Scoring: 0-50 words = 0.3, 50-100 = 0.6, 100+ = 1.0
        if word_count < 50:
            return 0.3
        elif word_count < 100:
            return 0.6
        else:
            return 1.0
    
    def calculate_urgency_score(self, text: str) -> float:
        """
        Calculate urgency based on language patterns
        """
        if not text:
            return 0.0
        
        text_lower = text.lower()
        urgency_score = 0.0
        
        # Exclamation marks indicate urgency
        urgency_score += text.count('!') * 0.1
        
        # All caps words indicate urgency
        caps_words = len(re.findall(r'\b[A-Z]{2,}\b', text))
        urgency_score += min(caps_words * 0.05, 0.3)
        
        # Urgent keywords
        urgent_keywords = ['urgent', 'immediate', 'emergency', 'critical', 'asap', 'now', 'help', 'please']
        for keyword in urgent_keywords:
            if keyword in text_lower:
                urgency_score += 0.1
        
        return min(urgency_score, 1.0)
    
    def calculate_sentiment_score(self, text: str) -> Dict[str, float]:
        """
        Simple sentiment analysis
        Returns: {'positive': float, 'negative': float, 'neutral': float}
        """
        if not text:
            return {'positive': 0.0, 'negative': 0.0, 'neutral': 1.0}
        
        text_lower = text.lower()
        
        positive_words = [
            'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
            'perfect', 'beautiful', 'happy', 'satisfied', 'pleased', 'thank'
        ]
        
        negative_words = [
            'bad', 'terrible', 'awful', 'horrible', 'poor', 'worst', 'angry',
            'frustrated', 'disappointed', 'upset', 'sad', 'hate', 'disgusted',
            'problem', 'issue', 'broken', 'damaged', 'dirty', 'dangerous'
        ]
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        total = positive_count + negative_count
        
        if total == 0:
            return {'positive': 0.0, 'negative': 0.0, 'neutral': 1.0}
        
        return {
            'positive': positive_count / total,
            'negative': negative_count / total,
            'neutral': 1.0 - (positive_count + negative_count) / total
        }
    
    def find_entities(self, text: str) -> Dict[str, List[str]]:
        """
        Extract named entities and important terms
        """
        if not text:
            return {'locations': [], 'numbers': [], 'times': []}
        
        entities = {
            'locations': [],
            'numbers': [],
            'times': []
        }
        
        # Find numbers (addresses, phone numbers, etc.)
        numbers = re.findall(r'\b\d+(?:\.\d+)?\b', text)
        entities['numbers'] = list(set(numbers))[:5]
        
        # Find time references
        time_patterns = [
            r'\b(?:morning|afternoon|evening|night|today|tomorrow|yesterday)\b',
            r'\b\d{1,2}(?:am|pm|AM|PM)\b',
            r'\b\d{1,2}:\d{2}\b'
        ]
        for pattern in time_patterns:
            times = re.findall(pattern, text, re.IGNORECASE)
            entities['times'].extend(times)
        
        entities['times'] = list(set(entities['times']))[:5]
        
        return entities
    
    def analyze_text_quality(self, text: str) -> Dict[str, float]:
        """
        Analyze overall quality of complaint text
        """
        if not text:
            return {
                'length_score': 0.0,
                'urgency_score': 0.0,
                'detail_score': 0.0,
                'overall_quality': 0.0
            }
        
        length_score = self.calculate_text_length_score(text)
        urgency_score = self.calculate_urgency_score(text)
        
        # Detail score based on keyword variety
        keywords = self.extract_keywords(text)
        detail_score = min(len(keywords) / 10.0, 1.0)
        
        # Overall quality is average of all scores
        overall_quality = (length_score + urgency_score + detail_score) / 3.0
        
        return {
            'length_score': round(length_score, 2),
            'urgency_score': round(urgency_score, 2),
            'detail_score': round(detail_score, 2),
            'overall_quality': round(overall_quality, 2)
        }
    
    def compare_texts(self, text1: str, text2: str) -> float:
        """
        Calculate similarity between two texts (0.0 - 1.0)
        Uses simple keyword overlap method
        """
        if not text1 or not text2:
            return 0.0
        
        keywords1 = set(self.extract_keywords(text1))
        keywords2 = set(self.extract_keywords(text2))
        
        if len(keywords1) == 0 or len(keywords2) == 0:
            return 0.0
        
        # Jaccard similarity
        intersection = len(keywords1 & keywords2)
        union = len(keywords1 | keywords2)
        
        return intersection / union if union > 0 else 0.0
    
    def get_text_summary(self, text: str, max_length: int = 100) -> str:
        """
        Generate a summary of the text
        """
        if not text:
            return ""
        
        if len(text) <= max_length:
            return text
        
        # Find sentence boundaries
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        summary = ""
        for sentence in sentences:
            if len(summary) + len(sentence) <= max_length:
                summary += sentence + ". "
            else:
                break
        
        return summary.strip()
