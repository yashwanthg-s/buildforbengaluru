"""
Test script for emergency detection service
Run this to verify the NLP service is working correctly
"""

import requests
import json
from typing import Dict, List

# Service URL
BASE_URL = "http://localhost:8000"

# Test cases
TEST_CASES = [
    {
        "name": "Fire Emergency",
        "data": {
            "title": "Fire in apartment building",
            "description": "Smoke and flames coming from second floor, people trapped inside",
            "category": "Public Safety",
            "priority": "High",
            "image_detection": "fire"
        },
        "expected": {
            "emergency": True,
            "priority": "critical",
            "confidence_min": 0.85
        }
    },
    {
        "name": "Accident with Injury",
        "data": {
            "title": "Serious accident on highway",
            "description": "Multiple vehicles involved, people injured, ambulance called",
            "category": "Traffic",
            "priority": "High",
            "image_detection": "accident"
        },
        "expected": {
            "emergency": True,
            "priority": "critical",
            "confidence_min": 0.80
        }
    },
    {
        "name": "Gas Leak",
        "data": {
            "title": "Gas leak in residential area",
            "description": "Strong gas smell, people evacuating, fire department called",
            "category": "Utilities",
            "priority": "High",
            "image_detection": "gas"
        },
        "expected": {
            "emergency": True,
            "priority": "critical",
            "confidence_min": 0.80
        }
    },
    {
        "name": "Pothole on Road",
        "data": {
            "title": "Large pothole on Main Street",
            "description": "Deep pothole causing vehicle damage",
            "category": "Infrastructure",
            "priority": "Medium",
            "image_detection": "pothole"
        },
        "expected": {
            "emergency": False,
            "priority": "medium",
            "confidence_min": 0.50
        }
    },
    {
        "name": "Garbage Accumulation",
        "data": {
            "title": "Garbage not collected",
            "description": "Garbage piled up for days, causing bad smell",
            "category": "Sanitation",
            "priority": "Low",
            "image_detection": "garbage"
        },
        "expected": {
            "emergency": False,
            "priority": "low",
            "confidence_min": 0.50
        }
    },
    {
        "name": "Water Leak",
        "data": {
            "title": "Water leaking from main pipe",
            "description": "Water is leaking from the main water supply pipe",
            "category": "Utilities",
            "priority": "Medium",
            "image_detection": "water_leak"
        },
        "expected": {
            "emergency": True,
            "priority": "critical",
            "confidence_min": 0.50
        }
    },
    {
        "name": "Flooding",
        "data": {
            "title": "Flooding in residential area",
            "description": "Heavy rain causing flooding, water entering homes",
            "category": "Infrastructure",
            "priority": "High",
            "image_detection": "flooding"
        },
        "expected": {
            "emergency": True,
            "priority": "critical",
            "confidence_min": 0.75
        }
    },
    {
        "name": "Assault Report",
        "data": {
            "title": "Assault in public area",
            "description": "Person assaulted by group, injuries sustained",
            "category": "Public Safety",
            "priority": "High",
            "image_detection": None
        },
        "expected": {
            "emergency": True,
            "priority": "critical",
            "confidence_min": 0.80
        }
    },
    {
        "name": "Minor Issue",
        "data": {
            "title": "Street light not working",
            "description": "One street light is not working",
            "category": "Infrastructure",
            "priority": "Low",
            "image_detection": None
        },
        "expected": {
            "emergency": False,
            "priority": "low",
            "confidence_min": 0.40
        }
    }
]


def test_analyze_complaint():
    """Test /analyze-complaint endpoint"""
    print("\n" + "="*60)
    print("Testing /analyze-complaint endpoint")
    print("="*60)
    
    passed = 0
    failed = 0
    
    for test in TEST_CASES:
        print(f"\n📋 Test: {test['name']}")
        print(f"   Input: {test['data']['title']}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/analyze-complaint",
                json=test['data'],
                timeout=5
            )
            
            if response.status_code != 200:
                print(f"   ❌ FAILED: HTTP {response.status_code}")
                print(f"   Error: {response.text}")
                failed += 1
                continue
            
            result = response.json()
            
            # Verify response structure
            required_fields = ['category', 'priority', 'emergency', 'confidence', 'emergency_keywords', 'reasoning', 'score']
            missing_fields = [f for f in required_fields if f not in result]
            
            if missing_fields:
                print(f"   ❌ FAILED: Missing fields: {missing_fields}")
                failed += 1
                continue
            
            # Check expectations
            expected = test['expected']
            checks = []
            
            # Check emergency flag
            if result['emergency'] == expected['emergency']:
                checks.append(f"✓ Emergency: {result['emergency']}")
            else:
                checks.append(f"✗ Emergency: {result['emergency']} (expected {expected['emergency']})")
            
            # Check priority
            if result['priority'].lower() == expected['priority'].lower():
                checks.append(f"✓ Priority: {result['priority']}")
            else:
                checks.append(f"✗ Priority: {result['priority']} (expected {expected['priority']})")
            
            # Check confidence
            if result['confidence'] >= expected['confidence_min']:
                checks.append(f"✓ Confidence: {result['confidence']:.2f}")
            else:
                checks.append(f"✗ Confidence: {result['confidence']:.2f} (expected >= {expected['confidence_min']})")
            
            # Print checks
            for check in checks:
                print(f"   {check}")
            
            # Overall result
            if all('✓' in check for check in checks):
                print(f"   ✅ PASSED")
                passed += 1
            else:
                print(f"   ❌ FAILED")
                failed += 1
            
            # Print additional info
            print(f"   Score: {result['score']}")
            print(f"   Keywords: {', '.join(result['emergency_keywords'][:3])}")
            
        except requests.exceptions.ConnectionError:
            print(f"   ❌ FAILED: Cannot connect to service")
            print(f"   Make sure the service is running on {BASE_URL}")
            failed += 1
        except Exception as e:
            print(f"   ❌ FAILED: {str(e)}")
            failed += 1
    
    print("\n" + "="*60)
    print(f"Results: {passed} passed, {failed} failed out of {len(TEST_CASES)} tests")
    print("="*60)
    
    return passed, failed


def test_batch_analyze():
    """Test /batch-analyze endpoint"""
    print("\n" + "="*60)
    print("Testing /batch-analyze endpoint")
    print("="*60)
    
    batch_data = [test['data'] for test in TEST_CASES[:3]]
    
    try:
        response = requests.post(
            f"{BASE_URL}/batch-analyze",
            json=batch_data,
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ FAILED: HTTP {response.status_code}")
            print(f"Error: {response.text}")
            return False
        
        result = response.json()
        
        print(f"✓ Total complaints: {result['total']}")
        print(f"✓ Emergency count: {result['emergency_count']}")
        print(f"✓ Complaints analyzed: {len(result['complaints'])}")
        
        # Print summary
        for i, complaint in enumerate(result['complaints'], 1):
            status = "🚨 EMERGENCY" if complaint['emergency'] else "✓ Normal"
            print(f"  {i}. {status} - Score: {complaint['score']}, Priority: {complaint['priority']}")
        
        print("✅ PASSED")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_detect_emergency():
    """Test /detect-emergency endpoint"""
    print("\n" + "="*60)
    print("Testing /detect-emergency endpoint")
    print("="*60)
    
    test_data = {
        "title": "Fire in building",
        "description": "Flames and smoke visible",
        "category": "Public Safety",
        "priority": "High",
        "image_detection": "fire"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/detect-emergency",
            json=test_data,
            timeout=5
        )
        
        if response.status_code != 200:
            print(f"❌ FAILED: HTTP {response.status_code}")
            return False
        
        result = response.json()
        
        print(f"✓ Emergency: {result['emergency']}")
        print(f"✓ Confidence: {result['confidence']:.2f}")
        print(f"✓ Score: {result['score']}")
        print(f"✓ Priority: {result['priority']}")
        print(f"✓ Keywords: {', '.join(result['keywords'])}")
        
        print("✅ PASSED")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def test_health_check():
    """Test /health endpoint"""
    print("\n" + "="*60)
    print("Testing /health endpoint")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        
        if response.status_code != 200:
            print(f"❌ FAILED: HTTP {response.status_code}")
            return False
        
        result = response.json()
        print(f"✓ Status: {result['status']}")
        print(f"✓ Service: {result['service']}")
        print("✅ PASSED")
        return True
        
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
        return False


def main():
    """Run all tests"""
    print("\n" + "🚀 "*20)
    print("NLP Service Test Suite")
    print("🚀 "*20)
    
    # Test health check first
    if not test_health_check():
        print("\n❌ Service is not running!")
        print(f"Please start the service: python main.py")
        return
    
    # Run tests
    test_analyze_complaint()
    test_batch_analyze()
    test_detect_emergency()
    
    print("\n" + "✅ "*20)
    print("Test suite completed!")
    print("✅ "*20 + "\n")


if __name__ == "__main__":
    main()
