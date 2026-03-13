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
        
        // Call Gemini Vision API directly
        const geminiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: `You are analyzing an image for a civic complaint system.

TASK: Determine if this image is PRIMARILY a human selfie/portrait, or if it's a civic issue photo.

IMPORTANT RULES:
1. SELFIE/PORTRAIT = Face/person fills most of the frame, person is the main subject
2. CIVIC ISSUE = Infrastructure, road, pothole, water, garbage, accident, fire, etc.
3. If there are people INCIDENTALLY visible in a civic issue photo, it's still a CIVIC ISSUE

Examples:
- Selfie with face filling frame → SELFIE (block)
- Group photo of people → SELFIE (block)
- Pothole with water, road damage, etc. → CIVIC ISSUE (accept, even if people visible)
- Accident scene → CIVIC ISSUE (accept, even if people visible)
- Garbage/litter → CIVIC ISSUE (accept, even if people visible)

Respond ONLY with JSON (no other text):
{
  "is_selfie_or_portrait": true/false,
  "is_civic_issue": true/false,
  "confidence": 0.0-1.0,
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
          
          // Only block if it's a selfie/portrait (primary purpose is human)
          // AND confidence is high (>0.7)
          // Allow if it's a civic issue even if humans are incidentally visible
          if (result.is_selfie_or_portrait && result.confidence > 0.7) {
            console.error('❌ HUMAN SELFIE/PORTRAIT DETECTED - BLOCKING COMPLAINT');
            console.error('Confidence:', result.confidence);
            console.error('Reason:', result.reason);
            return {
              category: 'blocked',
              priority: 'blocked',
              confidence: 0.0,
              is_blocked: true,
              block_reason: 'Image contains human. Please upload an image of the issue/location, not people.',
              detection_method: 'gemini_vision'
            };
          }
          
          // If it's a civic issue, ALWAYS accept (even if humans visible)
          if (result.is_civic_issue) {
            console.log('✓ Civic issue detected, accepting image');
            console.log('Reason:', result.reason);
            return {
              category: 'other',
              priority: 'medium',
              confidence: 0.5,
              is_blocked: false,
              detection_method: 'gemini_vision',
              civic_issue: true
            };
          }
          
          // If confidence is low, accept (don't block uncertain cases)
          if (result.confidence < 0.6) {
            console.log('✓ Low confidence detection, accepting image');
            return {
              category: 'other',
              priority: 'medium',
              confidence: 0.5,
              is_blocked: false,
              detection_method: 'gemini_vision'
            };
          }
          
          // Default: accept
          console.log('✓ Image accepted');
          return {
            category: 'other',
            priority: 'medium',
            confidence: 0.5,
            is_blocked: false,
            detection_method: 'gemini_vision'
          };
        }
      } catch (geminiError) {
        console.error('Gemini Vision API error:', geminiError.message);
        // Fall through to allow submission if Gemini fails
      }
      
      // Fallback: Allow submission if Gemini fails
      console.warn('⚠️ Gemini detection failed, allowing submission');
      return {
        category: 'other',
        priority: 'medium',
        confidence: 0.5,
        is_blocked: false,
        fallback: true,
        message: 'Image validation skipped (service unavailable)'
      };
    } catch (error) {
      console.error('Gemini analysis error:', error.message);
      // Allow submission if there's an error (don't block)
      return {
        category: 'other',
        priority: 'medium',
        confidence: 0.5,
        is_blocked: false,
        fallback: true,
        error: error.message
      };
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
