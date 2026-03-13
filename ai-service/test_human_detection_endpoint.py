#!/usr/bin/env python3
"""
Test script for the /detect-human endpoint
Tests human detection with sample images
"""

import requests
import sys
from pathlib import Path

# Test configuration
AI_SERVICE_URL = "http://localhost:8000"
ENDPOINT = f"{AI_SERVICE_URL}/detect-human"

def test_endpoint_with_file(image_path):
    """Test the endpoint with a real image file"""
    if not Path(image_path).exists():
        print(f"❌ Image file not found: {image_path}")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'image': f}
            print(f"\n📤 Testing with: {image_path}")
            print(f"📍 Endpoint: {ENDPOINT}")
            
            response = requests.post(ENDPOINT, files=files, timeout=10)
            
            print(f"✓ Status Code: {response.status_code}")
            print(f"✓ Response: {response.json()}")
            
            return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to {AI_SERVICE_URL}")
        print("   Make sure the AI service is running: python ai-service/main.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_endpoint_health():
    """Test if the endpoint is accessible"""
    try:
        print(f"\n🔍 Checking if AI service is running...")
        response = requests.get(f"{AI_SERVICE_URL}/health", timeout=5)
        if response.status_code == 200:
            print(f"✓ AI service is running: {response.json()}")
            return True
        else:
            print(f"❌ AI service returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to {AI_SERVICE_URL}")
        print("   Make sure the AI service is running: python ai-service/main.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Testing /detect-human Endpoint")
    print("=" * 60)
    
    # Check if service is running
    if not test_endpoint_health():
        sys.exit(1)
    
    # Test with uploaded images if they exist
    uploads_dir = Path("../backend/uploads")
    if uploads_dir.exists():
        image_files = list(uploads_dir.glob("*.jpg"))[:3]  # Test first 3 images
        if image_files:
            print(f"\n📁 Found {len(image_files)} test images in {uploads_dir}")
            for img in image_files:
                test_endpoint_with_file(str(img))
        else:
            print(f"\n⚠️  No images found in {uploads_dir}")
    else:
        print(f"\n⚠️  Uploads directory not found: {uploads_dir}")
    
    print("\n" + "=" * 60)
    print("Test Complete!")
    print("=" * 60)
