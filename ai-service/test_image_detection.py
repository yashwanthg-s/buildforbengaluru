"""
Test suite for enhanced image detection with YOLO
Tests both YOLO detection and fallback color analysis
"""

import requests
import json
from pathlib import Path
import io
from PIL import Image
import numpy as np

BASE_URL = "http://localhost:8000"

def create_test_image(color_name: str, width: int = 400, height: int = 400) -> bytes:
    """
    Create synthetic test images for different scenarios
    """
    img = Image.new('RGB', (width, height))
    pixels = img.load()
    
    if color_name == 'fire':
        # Red/orange image (simulates fire)
        for i in range(width):
            for j in range(height):
                pixels[i, j] = (255, int(100 + (i/width)*100), 0)
    
    elif color_name == 'smoke':
        # Gray/white image (simulates smoke)
        for i in range(width):
            for j in range(height):
                gray = int(150 + (i/width)*50)
                pixels[i, j] = (gray, gray, gray)
    
    elif color_name == 'water':
        # Blue image (simulates water/flooding)
        for i in range(width):
            for j in range(height):
                pixels[i, j] = (0, 100, 255)
    
    elif color_name == 'garbage':
        # Brown/green image (simulates garbage)
        for i in range(width):
            for j in range(height):
                pixels[i, j] = (139, 100, 50)
    
    elif color_name == 'normal':
        # Gray image (normal situation)
        for i in range(width):
            for j in range(height):
                pixels[i, j] = (128, 128, 128)
    
    # Convert to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    return img_bytes.getvalue()

def test_health():
    """Test health endpoint"""
    print("\n" + "="*60)
    print("Testing /health endpoint")
    print("="*60)
    
    response = requests.get(f"{BASE_URL}/health")
    data = response.json()
    
    print(f"✓ Status: {data['status']}")
    print(f"✓ Service: {data['service']}")
    print("✅ PASSED")

def test_image_analysis_fire():
    """Test image analysis with fire-like image"""
    print("\n" + "="*60)
    print("Testing /analyze-with-image - Fire Detection")
    print("="*60)
    
    image_bytes = create_test_image('fire')
    
    files = {
        'image': ('fire_test.png', image_bytes, 'image/png')
    }
    data = {
        'title': 'Fire in apartment building',
        'description': 'Smoke and flames coming from second floor'
    }
    
    response = requests.post(f"{BASE_URL}/analyze-with-image", files=files, data=data)
    result = response.json()
    
    print(f"Category: {result['category']}")
    print(f"Priority: {result['priority']}")
    print(f"Confidence: {result['confidence']:.2f}")
    print(f"Detection Method: {result['analysis_method']}")
    print(f"Image Indicators: {result['image_indicators']}")
    print(f"Detected Objects: {result['detected_objects']}")
    print(f"Text Keywords: {result['text_keywords']}")
    
    # Verify results
    assert result['priority'].lower() in ['critical', 'high'], "Fire should be critical/high priority"
    assert result['confidence'] > 0.5, "Confidence should be > 0.5"
    
    print("✅ PASSED")

def test_image_analysis_water():
    """Test image analysis with water-like image"""
    print("\n" + "="*60)
    print("Testing /analyze-with-image - Water/Flooding Detection")
    print("="*60)
    
    image_bytes = create_test_image('water')
    
    files = {
        'image': ('water_test.png', image_bytes, 'image/png')
    }
    data = {
        'title': 'Flooding in residential area',
        'description': 'Water overflowing from main pipe'
    }
    
    response = requests.post(f"{BASE_URL}/analyze-with-image", files=files, data=data)
    result = response.json()
    
    print(f"Category: {result['category']}")
    print(f"Priority: {result['priority']}")
    print(f"Confidence: {result['confidence']:.2f}")
    print(f"Detection Method: {result['analysis_method']}")
    print(f"Image Indicators: {result['image_indicators']}")
    
    assert result['confidence'] > 0.3, "Confidence should be > 0.3"
    
    print("✅ PASSED")

def test_image_analysis_garbage():
    """Test image analysis with garbage-like image"""
    print("\n" + "="*60)
    print("Testing /analyze-with-image - Garbage Detection")
    print("="*60)
    
    image_bytes = create_test_image('garbage')
    
    files = {
        'image': ('garbage_test.png', image_bytes, 'image/png')
    }
    data = {
        'title': 'Garbage not collected',
        'description': 'Trash piled up on street'
    }
    
    response = requests.post(f"{BASE_URL}/analyze-with-image", files=files, data=data)
    result = response.json()
    
    print(f"Category: {result['category']}")
    print(f"Priority: {result['priority']}")
    print(f"Confidence: {result['confidence']:.2f}")
    print(f"Detection Method: {result['analysis_method']}")
    
    assert result['priority'].lower() in ['low', 'medium'], "Garbage should be low/medium priority"
    
    print("✅ PASSED")

def test_image_analysis_normal():
    """Test image analysis with normal image"""
    print("\n" + "="*60)
    print("Testing /analyze-with-image - Normal Situation")
    print("="*60)
    
    image_bytes = create_test_image('normal')
    
    files = {
        'image': ('normal_test.png', image_bytes, 'image/png')
    }
    data = {
        'title': 'Street light not working',
        'description': 'Light on Main Street is broken'
    }
    
    response = requests.post(f"{BASE_URL}/analyze-with-image", files=files, data=data)
    result = response.json()
    
    print(f"Category: {result['category']}")
    print(f"Priority: {result['priority']}")
    print(f"Confidence: {result['confidence']:.2f}")
    print(f"Detection Method: {result['analysis_method']}")
    
    print("✅ PASSED")

def test_emergency_detection_with_image():
    """Test emergency detection endpoint"""
    print("\n" + "="*60)
    print("Testing /detect-emergency endpoint")
    print("="*60)
    
    payload = {
        'title': 'Fire in apartment building',
        'description': 'Smoke and flames coming from second floor',
        'category': 'Public Safety',
        'priority': 'High',
        'image_detection': 'fire'
    }
    
    response = requests.post(f"{BASE_URL}/detect-emergency", json=payload)
    result = response.json()
    
    print(f"Emergency: {result['emergency']}")
    print(f"Confidence: {result['confidence']:.2f}")
    print(f"Priority: {result['priority']}")
    print(f"Score: {result['score']}")
    print(f"Keywords: {result['keywords']}")
    
    assert result['emergency'] == True, "Should detect as emergency"
    assert result['confidence'] > 0.8, "Confidence should be high"
    
    print("✅ PASSED")

def test_batch_analysis():
    """Test batch analysis endpoint"""
    print("\n" + "="*60)
    print("Testing /batch-analyze endpoint")
    print("="*60)
    
    complaints = [
        {
            'title': 'Fire in apartment building',
            'description': 'Smoke and flames coming from second floor',
            'category': 'Public Safety',
            'priority': 'High',
            'image_detection': 'fire'
        },
        {
            'title': 'Flooding in residential area',
            'description': 'Water overflowing from main pipe',
            'category': 'Utilities',
            'priority': 'High',
            'image_detection': 'water'
        },
        {
            'title': 'Garbage not collected',
            'description': 'Trash piled up on street',
            'category': 'Sanitation',
            'priority': 'Low',
            'image_detection': 'garbage'
        }
    ]
    
    response = requests.post(f"{BASE_URL}/batch-analyze", json=complaints)
    result = response.json()
    
    print(f"Total complaints: {result['total']}")
    print(f"Emergency count: {result['emergency_count']}")
    print(f"Complaints analyzed: {len(result['complaints'])}")
    
    for i, complaint in enumerate(result['complaints'], 1):
        status = "🚨 EMERGENCY" if complaint['emergency'] else "✓ NORMAL"
        print(f"{i}. {status} - Score: {complaint['score']}, Priority: {complaint['priority']}")
    
    assert result['total'] == 3, "Should analyze 3 complaints"
    assert result['emergency_count'] >= 2, "Should detect at least 2 emergencies"
    
    print("✅ PASSED")

def run_all_tests():
    """Run all tests"""
    print("\n" + "🚀 "*20)
    print("Image Detection Test Suite")
    print("🚀 "*20)
    
    tests = [
        test_health,
        test_image_analysis_fire,
        test_image_analysis_water,
        test_image_analysis_garbage,
        test_image_analysis_normal,
        test_emergency_detection_with_image,
        test_batch_analysis
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"❌ FAILED: {str(e)}")
            failed += 1
    
    print("\n" + "="*60)
    print(f"Results: {passed} passed, {failed} failed out of {len(tests)} tests")
    print("="*60)
    
    if failed == 0:
        print("✅ "*20)
        print("All tests passed!")
        print("✅ "*20)
    else:
        print(f"⚠️  {failed} test(s) failed")

if __name__ == "__main__":
    try:
        run_all_tests()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to NLP service")
        print("Make sure the service is running: python main.py")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
