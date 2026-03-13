#!/usr/bin/env python3
"""
Validate that the human detection endpoint fix is correct
"""

import ast
import sys

def check_file_syntax(filepath):
    """Check if Python file has valid syntax"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            ast.parse(f.read())
        print(f"✓ {filepath} - Syntax OK")
        return True
    except SyntaxError as e:
        print(f"✗ {filepath} - Syntax Error: {e}")
        return False

def check_endpoint_position(filepath):
    """Check if /detect-human endpoint is before if __name__ block"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find positions
        detect_human_pos = content.find('@app.post("/detect-human")')
        if_main_pos = content.find('if __name__ == "__main__"')
        
        if detect_human_pos == -1:
            print(f"✗ /detect-human endpoint not found in {filepath}")
            return False
        
        if if_main_pos == -1:
            print(f"✗ if __name__ block not found in {filepath}")
            return False
        
        if detect_human_pos < if_main_pos:
            print(f"✓ /detect-human endpoint is BEFORE if __name__ block")
            return True
        else:
            print(f"✗ /detect-human endpoint is AFTER if __name__ block (WRONG!)")
            return False
    except Exception as e:
        print(f"✗ Error checking {filepath}: {e}")
        return False

def check_human_detector_fallback(filepath):
    """Check if human detector has OpenCV fallback"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        checks = [
            ('CV2_AVAILABLE flag', 'CV2_AVAILABLE' in content),
            ('try/except for cv2 import', 'try:' in content and 'import cv2' in content),
            ('RGB fallback detection', 'r > 95' in content and 'g > 40' in content),
            ('Graceful error handling', 'except Exception as' in content),
        ]
        
        all_ok = True
        for check_name, result in checks:
            status = "✓" if result else "✗"
            print(f"{status} {check_name}")
            all_ok = all_ok and result
        
        return all_ok
    except Exception as e:
        print(f"✗ Error checking {filepath}: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Validating Human Detection Endpoint Fix")
    print("=" * 60)
    
    all_ok = True
    
    print("\n1. Checking Python Syntax...")
    all_ok = check_file_syntax('ai-service/main.py') and all_ok
    all_ok = check_file_syntax('ai-service/models/human_detector.py') and all_ok
    
    print("\n2. Checking Endpoint Position...")
    all_ok = check_endpoint_position('ai-service/main.py') and all_ok
    
    print("\n3. Checking Human Detector Fallback...")
    all_ok = check_human_detector_fallback('ai-service/models/human_detector.py') and all_ok
    
    print("\n" + "=" * 60)
    if all_ok:
        print("✓ All Checks Passed!")
        print("=" * 60)
        sys.exit(0)
    else:
        print("✗ Some Checks Failed!")
        print("=" * 60)
        sys.exit(1)
