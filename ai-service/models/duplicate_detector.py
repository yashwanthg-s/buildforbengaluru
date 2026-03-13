import hashlib
from typing import Dict, List, Tuple
import re

class DuplicateDetector:
    """
    AI-based duplicate complaint detection using:
    - Text similarity (keywords)
    - Location proximity (GPS)
    - Category matching
    """
    
    # Distance threshold in kilometers
    LOCATION_THRESHOLD_KM = 0.5  # 500 meters
    
    # Similarity threshold (0.0 to 1.0)
    # Lowered to 0.6 (60%) to make duplicate detection more sensitive
    SIMILARITY_THRESHOLD = 0.6
    
    def __init__(self):
        # Common words to ignore
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'been', 'be',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
            'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
        }
    
    def extract_keywords(self, text: str) -> List[str]:
        """
        Extract meaningful keywords from complaint text
        """
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        
        # Split into words
        words = text.split()
        
        # Filter out stop words and short words
        keywords = [
            word for word in words 
            if word not in self.stop_words and len(word) > 3
        ]
        
        return keywords
    
    def calculate_text_similarity(self, text1: str, text2: str) -> float:
        """
        Calculate similarity between two texts using keyword overlap
        """
        keywords1 = set(self.extract_keywords(text1))
        keywords2 = set(self.extract_keywords(text2))
        
        if not keywords1 or not keywords2:
            return 0.0
        
        # Jaccard similarity: intersection / union
        intersection = len(keywords1 & keywords2)
        union = len(keywords1 | keywords2)
        
        return intersection / union if union > 0 else 0.0
    
    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate distance between two GPS coordinates in kilometers
        Using Haversine formula
        """
        from math import radians, sin, cos, sqrt, atan2
        
        # Earth radius in kilometers
        R = 6371.0
        
        lat1_rad = radians(lat1)
        lon1_rad = radians(lon1)
        lat2_rad = radians(lat2)
        lon2_rad = radians(lon2)
        
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        distance = R * c
        return distance
    
    def generate_cluster_hash(self, category: str, lat: float, lon: float, keywords: List[str]) -> str:
        """
        Generate a hash for complaint clustering
        Similar complaints will have similar hashes
        """
        # Round coordinates to 3 decimal places (~100m precision)
        lat_rounded = round(lat, 3)
        lon_rounded = round(lon, 3)
        
        # Sort keywords for consistency
        keywords_sorted = sorted(keywords[:5])  # Top 5 keywords
        
        # Create hash string
        hash_string = f"{category}_{lat_rounded}_{lon_rounded}_{'_'.join(keywords_sorted)}"
        
        # Generate MD5 hash
        return hashlib.md5(hash_string.encode()).hexdigest()
    
    def check_duplicate(
        self, 
        title: str, 
        description: str, 
        category: str,
        latitude: float,
        longitude: float,
        existing_complaints: List[Dict]
    ) -> Dict:
        """
        Check if complaint is duplicate of existing complaints
        
        Returns:
        {
            'is_duplicate': bool,
            'similar_complaints': List[Dict],
            'cluster_hash': str,
            'similarity_score': float,
            'message': str
        }
        """
        print(f"\n=== Duplicate Detection ===")
        print(f"New complaint: {title}")
        print(f"Category: {category}, Location: ({latitude}, {longitude})")
        print(f"Checking against {len(existing_complaints)} existing complaints")
        
        new_text = f"{title} {description}"
        new_keywords = self.extract_keywords(new_text)
        print(f"Keywords extracted: {new_keywords[:10]}")
        
        similar_complaints = []
        max_similarity = 0.0
        
        for i, complaint in enumerate(existing_complaints):
            print(f"\n  Comparing with complaint #{complaint['id']}:")
            print(f"    Title: {complaint['title']}")
            
            # Check category match
            if complaint['category'] != category:
                print(f"    ✗ Category mismatch: {complaint['category']} != {category}")
                continue
            print(f"    ✓ Category match: {category}")
            
            # Check location proximity
            distance = self.calculate_distance(
                latitude, longitude,
                float(complaint['latitude']), float(complaint['longitude'])
            )
            print(f"    Distance: {distance:.3f} km")
            
            if distance > self.LOCATION_THRESHOLD_KM:
                print(f"    ✗ Too far (threshold: {self.LOCATION_THRESHOLD_KM} km)")
                continue
            print(f"    ✓ Within range")
            
            # Check text similarity
            existing_text = f"{complaint['title']} {complaint['description']}"
            similarity = self.calculate_text_similarity(new_text, existing_text)
            print(f"    Similarity: {similarity:.2%} (threshold: {self.SIMILARITY_THRESHOLD:.2%})")
            
            if similarity >= self.SIMILARITY_THRESHOLD:
                print(f"    ✓ DUPLICATE FOUND!")
                similar_complaints.append({
                    'id': complaint['id'],
                    'title': complaint['title'],
                    'similarity': similarity,
                    'distance_km': distance,
                    'created_at': complaint.get('created_at', '')
                })
                max_similarity = max(max_similarity, similarity)
            else:
                print(f"    ✗ Not similar enough")
        
        # Generate cluster hash
        cluster_hash = self.generate_cluster_hash(category, latitude, longitude, new_keywords)
        
        is_duplicate = len(similar_complaints) > 0
        
        # Generate message
        if is_duplicate:
            count = len(similar_complaints)
            message = f"⚠️ {count} other citizen{'s have' if count > 1 else ' has'} already reported a similar issue in this area. Your complaint has been added to the same case for faster resolution."
            print(f"\n✓ RESULT: Duplicate detected ({count} similar complaints)")
        else:
            message = "✓ This is a new complaint. Thank you for reporting!"
            print(f"\n✓ RESULT: No duplicates found")
        
        return {
            'is_duplicate': is_duplicate,
            'similar_complaints': similar_complaints,
            'cluster_hash': cluster_hash,
            'similarity_score': max_similarity,
            'message': message,
            'keywords': new_keywords[:10]  # Top 10 keywords
        }
    
    def get_cluster_summary(self, complaints: List[Dict]) -> Dict:
        """
        Generate summary for a cluster of complaints
        """
        if not complaints:
            return {}
        
        # Extract common keywords
        all_keywords = []
        for complaint in complaints:
            text = f"{complaint['title']} {complaint['description']}"
            all_keywords.extend(self.extract_keywords(text))
        
        # Count keyword frequency
        keyword_freq = {}
        for keyword in all_keywords:
            keyword_freq[keyword] = keyword_freq.get(keyword, 0) + 1
        
        # Get top keywords
        top_keywords = sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Calculate average location
        avg_lat = sum(float(c['latitude']) for c in complaints) / len(complaints)
        avg_lon = sum(float(c['longitude']) for c in complaints) / len(complaints)
        
        return {
            'complaint_count': len(complaints),
            'top_keywords': [kw[0] for kw in top_keywords],
            'avg_location': {'latitude': avg_lat, 'longitude': avg_lon},
            'category': complaints[0]['category'],
            'first_reported': min(c.get('created_at', '') for c in complaints)
        }
