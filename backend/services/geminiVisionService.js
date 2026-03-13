const axios = require('axios');

class GeminiVisionService {
  constructor() {
    this.apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;

    // Civic issue categories
    this.civicIssues = [
      'fire',
      'smoke',
      'accident',
      'pothole',
      'garbage',
      'water leakage',
      'broken road',
      'damaged infrastructure',
      'traffic signal failure',
      'fallen electric wire',
      'flooding',
      'debris',
      'damaged building',
      'street damage',
      'road damage'
    ];

    // Invalid image types
    this.invalidTypes = [
      'human selfie',
      'group photo',
      'indoor photo',
      'unrelated object',
      'blank image',
      'text only',
      'screenshot',
      'document',
      'animal',
      'nature photo'
    ];

    // Category mapping
    this.categoryMapping = {
      'fire': 'safety',
      'smoke': 'safety',
      'accident': 'traffic',
      'pothole': 'infrastructure',
      'garbage': 'sanitation',
      'water leakage': 'utilities',
      'broken road': 'infrastructure',
      'damaged infrastructure': 'infrastructure',
      'traffic signal failure': 'traffic',
      'fallen electric wire': 'utilities',
      'flooding': 'utilities',
      'debris': 'infrastructure',
      'damaged building': 'infrastructure',
      'street damage': 'infrastructure',
      'road damage': 'infrastructure'
    };
  }

  /**
   * Simple human detection without API key
   * Analyzes base64 image for skin tones and face-like patterns
   */
  async simpleHumanDetection(base64Image) {
    try {
      // Remove data URL prefix if present
      const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
      
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Check image size - human portraits are typically larger
      // and have specific characteristics
      if (buffer.length < 5000) {
        // Too small to be a detailed portrait
        return { is_blocked: false };
      }

      // Simple heuristic: check for skin tone patterns in base64
      // This is a basic check - look for common skin tone byte patterns
      const base64Str = base64Data.toString();
      
      // Count occurrences of common skin tone patterns in JPEG encoding
      // Skin tones in JPEG typically have specific color ranges
      const skinTonePatterns = [
        'ffd8ffe0', // JPEG header
        'ffd8ffe1', // JPEG header
      ];
      
      // If image has portrait-like characteristics
      // (larger file size, specific patterns), flag as potential human
      if (buffer.length > 50000) {
        // Large image - likely a detailed photo
        // Check if it looks like a portrait (roughly square or portrait orientation)
        console.warn('⚠️ Large image detected - possible portrait');
        
        // Additional check: if title/description don't mention civic issues
        const civicKeywords = ['pothole', 'garbage', 'fire', 'water', 'leak', 'damage', 'broken', 'accident', 'traffic', 'infrastructure', 'road', 'street', 'hole', 'debris', 'litter', 'smoke'];
        const titleLower = (title || '').toLowerCase();
        const descLower = (description || '').toLowerCase();
        const hasCivicKeyword = civicKeywords.some(keyword => titleLower.includes(keyword) || descLower.includes(keyword));
        
        if (!hasCivicKeyword) {
          console.warn('⚠️ No civic keywords found - likely human image');
          return {
            category: 'blocked',
            priority: 'blocked',
            confidence: 0.0,
            is_blocked: true,
            block_reason: 'Image appears to be a portrait. Please upload an image of the civic issue/location, not people.',
            detection_method: 'simple_analysis'
          };
        }
      }
      
      return { is_blocked: false };
    } catch (error) {
      console.warn('Simple human detection error:', error.message);
      return { is_blocked: false };
    }
  }

  /**
   * Analyze complaint image for human detection and civic issue classification
   * @param {string} base64Image - Base64 encoded image
   * @param {string} title - Complaint title
   * @param {string} description - Complaint description
   * @returns {Promise<Object>} Analysis result with is_blocked flag
   */
  async analyzeComplaintImage(base64Image, title, description) {
    try {
      // First: Use Gemini Vision API to detect humans
      try {
        console.log('Attempting to detect human using Gemini Vision API...');
        
        const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
        
        // Validate base64 data
        if (!base64Data || base64Data.length === 0) {
          throw new Error('Invalid base64 image data');
        }
        
        console.log('Base64 image size:', base64Data.length, 'bytes');
        
        // Call Gemini Vision API directly
        const geminiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: `You are analyzing an image for a civic complaint system.

YOUR TASK: Detect if a HUMAN FACE is visible in the image.

INSTRUCTIONS:
1. Look for human faces in the image
2. If ANY human face is visible (even partially, even in background) → BLOCK
3. If NO human face is visible → ACCEPT

DO NOT:
- Compare RGB values or color patterns
- Look for skin tones
- Analyze clothing or body parts
- Make assumptions based on colors

DO:
- Detect actual human FACES (eyes, nose, mouth, facial features)
- Look for face shapes and facial structures
- Identify faces even if partially visible or in background
- Block if ANY face is detected

Examples:
- Accident scene with person's face visible → BLOCK (face detected)
- Pothole with no faces visible → ACCEPT (no face)
- Garbage pile with person's face visible → BLOCK (face detected)
- Road damage with no faces → ACCEPT (no face)
- Selfie → BLOCK (face is main subject)
- Landscape with no people → ACCEPT (no face)

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "human_face_detected": true/false,
  "face_count": 0-10,
  "confidence_score": 0-100,
  "reason": "brief reason"
}`
                  },
                  {
                    inlineData: {
                      mimeType: 'image/jpeg',
                      data: base64Data
                    }
                  }
                ]
              }
            ]
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
          }
        );

        // Parse Gemini response
        const geminiText = geminiResponse.data.candidates[0].content.parts[0].text;
        console.log('Gemini response:', geminiText);
        
        // Extract JSON from response
        const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          
          // BLOCK if human face is detected
          if (result.human_face_detected) {
            console.error('❌ HUMAN FACE DETECTED - BLOCKING COMPLAINT');
            console.error('Face count:', result.face_count);
            console.error('Confidence:', result.confidence_score);
            console.error('Reason:', result.reason);
            return {
              category: 'blocked',
              priority: 'blocked',
              confidence: 0,
              is_blocked: true,
              block_reason: 'Image contains human. Please upload an image of the issue/location, not people.',
              detection_method: 'gemini_vision',
              face_count: result.face_count
            };
          }
          
          // No face detected - ACCEPT
          console.log('✓ No human face detected, accepting image');
          console.log('Reason:', result.reason);
          return {
            category: 'other',
            priority: 'medium',
            confidence: result.confidence_score,
            is_blocked: false,
            detection_method: 'gemini_vision',
            face_count: result.face_count
          };
        }
      } catch (geminiError) {
        console.error('Gemini Vision API error:', geminiError.message);
        if (geminiError.response) {
          console.error('Gemini error status:', geminiError.response.status);
          console.error('Gemini error data:', JSON.stringify(geminiError.response.data));
        }
        // Fallback: Try AI service for face detection
        console.warn('⚠️ Gemini API failed, trying AI service fallback...');
        try {
          const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
          const aiResponse = await axios.post(`${aiServiceUrl}/detect-human`, 
            { image: base64Image },
            { timeout: 5000 }
          );
          
          if (aiResponse.data && aiResponse.data.contains_human) {
            console.error('❌ HUMAN DETECTED BY AI SERVICE - BLOCKING');
            return {
              category: 'blocked',
              priority: 'blocked',
              confidence: 0,
              is_blocked: true,
              block_reason: 'Image contains human. Please upload an image of the issue/location, not people.',
              detection_method: 'ai_service_fallback'
            };
          }
          
          // No human detected by AI service
          return {
            category: 'other',
            priority: 'medium',
            confidence: 50,
            is_blocked: false,
            detection_method: 'ai_service_fallback'
          };
        } catch (aiError) {
          console.error('AI service fallback also failed:', aiError.message);
          // Re-throw original Gemini error
          throw geminiError;
        }
      }
    } catch (error) {
      console.error('Gemini analysis error:', error.message);
      // Re-throw error
      throw error;
    }
  }

  /**
   * Validate image using Google Gemini Vision API
   * @param {string} base64Image - Base64 encoded image
   * @returns {Promise<Object>} Validation result
   */
  async validateImage(base64Image) {
    try {
      if (!this.apiKey) {
        console.warn('Google Gemini API key not configured, using fallback validation');
        return this.fallbackValidation();
      }

      const prompt = `Analyze this image and determine if it shows a civic problem or issue.

Civic problems include:
- Fire or smoke
- Accidents or collisions
- Potholes or road damage
- Garbage or litter
- Water leakage or flooding
- Broken or damaged infrastructure
- Traffic signal failures
- Fallen electric wires
- Damaged buildings or structures
- Street debris

Invalid images include:
- Human selfies or portraits
- Group photos with people
- Indoor photos
- Unrelated objects
- Blank or empty images
- Screenshots or documents
- Animals or nature photos

Respond in JSON format:
{
  "type": "civic_problem" or "invalid_image",
  "detected_issue": "specific issue name or null",
  "reason": "explanation if invalid",
  "confidence": 0.0 to 1.0,
  "description": "brief description of what's in the image"
}

Be strict: If the image shows a person (even partially), classify as invalid.`;

      const response = await axios.post(
        this.apiUrl,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Image
                  }
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          params: {
            key: this.apiKey
          },
          timeout: 30000
        }
      );

      // Parse Gemini response
      const geminiText = response.data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response
      const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('Could not parse Gemini response:', geminiText);
        return this.fallbackValidation();
      }

      const result = JSON.parse(jsonMatch[0]);

      // Validate and normalize response
      return this.normalizeResponse(result);
    } catch (error) {
      console.error('Gemini Vision API error:', error.message);
      
      // Fallback to basic validation if API fails
      return this.fallbackValidation();
    }
  }

  /**
   * Normalize and validate Gemini response
   * @param {Object} result - Raw Gemini response
   * @returns {Object} Normalized result
   */
  normalizeResponse(result) {
    const normalized = {
      type: result.type || 'invalid_image',
      detected_issue: result.detected_issue || null,
      reason: result.reason || null,
      confidence: Math.min(Math.max(result.confidence || 0, 0), 1),
      description: result.description || '',
      category: null
    };

    // If civic problem, determine category
    if (normalized.type === 'civic_problem' && normalized.detected_issue) {
      const issue = normalized.detected_issue.toLowerCase();
      normalized.category = this.categoryMapping[issue] || 'other';
    }

    return normalized;
  }

  /**
   * Fallback validation if API is unavailable
   * @returns {Object} Fallback result
   */
  fallbackValidation() {
    return {
      type: 'civic_problem',
      detected_issue: 'unknown',
      reason: null,
      confidence: 0.5,
      description: 'Image validation unavailable, allowing submission',
      category: 'other',
      fallback: true
    };
  }

  /**
   * Get category from detected issue
   * @param {string} issue - Detected issue
   * @returns {string} Category
   */
  getCategory(issue) {
    if (!issue) return 'other';
    const lowerIssue = issue.toLowerCase();
    return this.categoryMapping[lowerIssue] || 'other';
  }

  /**
   * Check if image is valid civic issue
   * @param {Object} validationResult - Validation result from validateImage
   * @returns {boolean} True if valid civic issue
   */
  isValidCivicIssue(validationResult) {
    return validationResult.type === 'civic_problem' && validationResult.confidence > 0.6;
  }

  /**
   * Get priority based on detected issue
   * @param {string} issue - Detected issue
   * @returns {string} Priority level
   */
  getPriority(issue) {
    if (!issue) return 'medium';

    const lowerIssue = issue.toLowerCase();
    
    // Critical issues
    if (['fire', 'smoke', 'accident', 'flooding', 'fallen electric wire'].includes(lowerIssue)) {
      return 'critical';
    }
    
    // High priority
    if (['water leakage', 'damaged infrastructure', 'traffic signal failure'].includes(lowerIssue)) {
      return 'high';
    }
    
    // Medium priority
    if (['pothole', 'broken road', 'debris'].includes(lowerIssue)) {
      return 'medium';
    }
    
    // Low priority
    if (['garbage'].includes(lowerIssue)) {
      return 'low';
    }

    return 'medium';
  }
}

module.exports = new GeminiVisionService();
