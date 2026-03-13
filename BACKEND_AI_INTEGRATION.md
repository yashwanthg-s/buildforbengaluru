# Backend AI Service Integration Guide

## Overview
This guide shows how to integrate the Python NLP service with your existing Node.js backend for automatic complaint analysis.

## Step 1: Create AI Service Client

Create a new file: `backend/services/ai-service-client.js`

```javascript
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

class AIServiceClient {
  /**
   * Analyze a single complaint
   */
  async analyzeComplaint(complaint) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/analyze-complaint`,
        {
          title: complaint.title,
          description: complaint.description,
          category: complaint.category || 'other',
          priority: complaint.priority || 'medium',
          image_detection: complaint.image_detection || null
        },
        { timeout: 10000 }
      );
      
      return response.data;
    } catch (error) {
      console.error('AI Service error:', error.message);
      // Return default analysis on error
      return this._getDefaultAnalysis(complaint);
    }
  }

  /**
   * Analyze multiple complaints in batch
   */
  async batchAnalyze(complaints) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/batch-analyze`,
        complaints.map(c => ({
          title: c.title,
          description: c.description,
          category: c.category || 'other',
          priority: c.priority || 'medium',
          image_detection: c.image_detection || null
        })),
        { timeout: 30000 }
      );
      
      return response.data;
    } catch (error) {
      console.error('Batch analysis error:', error.message);
      throw error;
    }
  }

  /**
   * Quick emergency detection
   */
  async detectEmergency(complaint) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/detect-emergency`,
        {
          title: complaint.title,
          description: complaint.description,
          category: complaint.category || 'other',
          priority: complaint.priority || 'medium',
          image_detection: complaint.image_detection || null
        },
        { timeout: 5000 }
      );
      
      return response.data;
    } catch (error) {
      console.error('Emergency detection error:', error.message);
      return { emergency: false, confidence: 0, score: 0 };
    }
  }

  /**
   * Check for duplicate complaints
   */
  async checkDuplicate(complaint, existingComplaints) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/check-duplicate`,
        {
          title: complaint.title,
          description: complaint.description,
          category: complaint.category || 'other',
          latitude: complaint.latitude,
          longitude: complaint.longitude,
          existing_complaints: existingComplaints.map(c => ({
            id: c.id,
            title: c.title,
            description: c.description,
            category: c.category,
            latitude: c.latitude,
            longitude: c.longitude,
            created_at: c.created_at
          }))
        },
        { timeout: 10000 }
      );
      
      return response.data;
    } catch (error) {
      console.error('Duplicate check error:', error.message);
      return { is_duplicate: false, similarity_score: 0 };
    }
  }

  /**
   * Get default analysis (fallback)
   */
  _getDefaultAnalysis(complaint) {
    return {
      category: complaint.category || 'other',
      priority: complaint.priority || 'medium',
      emergency: false,
      confidence: 0.5,
      emergency_keywords: [],
      reasoning: 'Default analysis (AI service unavailable)',
      score: 0
    };
  }

  /**
   * Check if AI service is available
   */
  async healthCheck() {
    try {
      const response = await axios.get(
        `${AI_SERVICE_URL}/health`,
        { timeout: 5000 }
      );
      return response.data.status === 'OK';
    } catch (error) {
      console.error('AI Service health check failed:', error.message);
      return false;
    }
  }
}

module.exports = new AIServiceClient();
```

## Step 2: Update Complaint Controller

Modify: `backend/controllers/complaintController.js`

```javascript
const Complaint = require('../models/Complaint');
const aiServiceClient = require('../services/ai-service-client');
const contentFilter = require('../utils/contentFilter');

class ComplaintController {
  static async createComplaint(req, res) {
    try {
      const { title, description, category, priority, latitude, longitude, date, time, user_id } = req.body;
      const userId = user_id || req.user?.id || 1;

      // Validate required fields
      if (!title || !description || !latitude || !longitude || !date || !time) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      // Check content for inappropriate material
      const contentCheck = contentFilter.checkContent(title, description);
      if (contentCheck.isBlocked) {
        return res.status(400).json({
          success: false,
          message: contentCheck.reason,
          blocked: true
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Image file is required'
        });
      }

      // Validate coordinates
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates'
        });
      }

      // Prepare complaint data
      let complaintData = {
        user_id: userId,
        title,
        description,
        image_path: `/uploads/${req.file.filename}`,
        latitude: lat,
        longitude: lng,
        date,
        time,
        category: category || 'other',
        priority: priority || 'medium'
      };

      // ✨ NEW: Analyze with AI service
      console.log('📊 Analyzing complaint with AI service...');
      let aiAnalysis = null;
      
      try {
        aiAnalysis = await aiServiceClient.analyzeComplaint({
          title,
          description,
          category: category || 'other',
          priority: priority || 'medium',
          image_detection: req.body.image_detection || null
        });

        console.log('✓ AI Analysis complete:', {
          emergency: aiAnalysis.emergency,
          priority: aiAnalysis.priority,
          confidence: aiAnalysis.confidence
        });

        // Update complaint data with AI results
        complaintData.category = aiAnalysis.category;
        complaintData.priority = aiAnalysis.priority;
        complaintData.is_emergency = aiAnalysis.emergency;
        complaintData.ai_confidence = aiAnalysis.confidence;
        complaintData.emergency_keywords = aiAnalysis.emergency_keywords.join(',');
        complaintData.ai_analysis_score = aiAnalysis.score;
      } catch (aiError) {
        console.warn('⚠️ AI analysis failed, using default values:', aiError.message);
        // Continue with default values
      }

      // Save to database
      const complaintId = await Complaint.create(complaintData);

      // ✨ NEW: Check for duplicates
      let duplicateInfo = null;
      try {
        const recentComplaints = await Complaint.getRecentInArea(
          complaintData.category,
          lat,
          lng,
          30
        );

        if (recentComplaints.length > 0) {
          console.log('🔍 Checking for duplicates...');
          duplicateInfo = await aiServiceClient.checkDuplicate(
            {
              title,
              description,
              category: complaintData.category,
              latitude: lat,
              longitude: lng
            },
            recentComplaints
          );

          if (duplicateInfo.is_duplicate) {
            console.log('⚠️ Duplicate detected:', duplicateInfo);
          }
        }
      } catch (dupError) {
        console.warn('⚠️ Duplicate check failed:', dupError.message);
      }

      // Prepare response
      const response = {
        success: true,
        message: 'Complaint submitted successfully',
        id: complaintId,
        complaint: {
          id: complaintId,
          ...complaintData
        }
      };

      // Add AI analysis to response
      if (aiAnalysis) {
        response.ai_analysis = {
          emergency: aiAnalysis.emergency,
          priority: aiAnalysis.priority,
          confidence: aiAnalysis.confidence,
          keywords: aiAnalysis.emergency_keywords,
          score: aiAnalysis.score
        };
      }

      // Add duplicate notification if found
      if (duplicateInfo && duplicateInfo.is_duplicate) {
        response.duplicate_detected = true;
        response.duplicate_message = duplicateInfo.message;
        response.similar_complaints_count = duplicateInfo.similar_complaints.length;
      }

      res.status(201).json(response);
    } catch (error) {
      console.error('Create complaint error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit complaint',
        error: error.message
      });
    }
  }

  // ... rest of controller methods
}

module.exports = ComplaintController;
```

## Step 3: Update Database Schema

Add AI analysis columns to complaints table:

```sql
-- Add AI analysis columns
ALTER TABLE complaints ADD COLUMN is_emergency BOOLEAN DEFAULT FALSE;
ALTER TABLE complaints ADD COLUMN ai_confidence FLOAT DEFAULT 0;
ALTER TABLE complaints ADD COLUMN emergency_keywords VARCHAR(500);
ALTER TABLE complaints ADD COLUMN ai_analysis_score INT DEFAULT 0;

-- Add indexes for better query performance
CREATE INDEX idx_is_emergency ON complaints(is_emergency);
CREATE INDEX idx_ai_confidence ON complaints(ai_confidence);
```

## Step 4: Update Environment Variables

Add to `backend/.env`:

```env
# AI Service Configuration
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_TIMEOUT=10000
ENABLE_AI_ANALYSIS=true
ENABLE_DUPLICATE_CHECK=true
```

## Step 5: Create Admin Dashboard Enhancement

Update `frontend/src/components/AdminDashboard.jsx` to show AI analysis:

```javascript
// In the complaint card, add AI analysis display
{complaint.ai_analysis && (
  <div className="ai-analysis-section">
    <h4>🤖 AI Analysis</h4>
    <div className="analysis-details">
      <span className="emergency-badge" style={{
        background: complaint.ai_analysis.emergency ? '#dc3545' : '#28a745'
      }}>
        {complaint.ai_analysis.emergency ? '🚨 EMERGENCY' : '✓ Normal'}
      </span>
      <span className="confidence">
        Confidence: {(complaint.ai_analysis.confidence * 100).toFixed(0)}%
      </span>
      <span className="score">
        Score: {complaint.ai_analysis.score}
      </span>
    </div>
    {complaint.ai_analysis.keywords.length > 0 && (
      <div className="keywords">
        <strong>Keywords:</strong> {complaint.ai_analysis.keywords.join(', ')}
      </div>
    )}
  </div>
)}
```

## Step 6: Create Monitoring Dashboard

Create `backend/routes/ai-monitoring.js`:

```javascript
const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const aiServiceClient = require('../services/ai-service-client');

// Get AI service health
router.get('/health', async (req, res) => {
  try {
    const isHealthy = await aiServiceClient.healthCheck();
    res.json({
      success: true,
      ai_service_healthy: isHealthy,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get AI analysis statistics
router.get('/stats', async (req, res) => {
  try {
    const [emergencyCount] = await Complaint.query(
      'SELECT COUNT(*) as count FROM complaints WHERE is_emergency = TRUE'
    );
    
    const [avgConfidence] = await Complaint.query(
      'SELECT AVG(ai_confidence) as avg FROM complaints WHERE ai_confidence > 0'
    );
    
    const [totalAnalyzed] = await Complaint.query(
      'SELECT COUNT(*) as count FROM complaints WHERE ai_analysis_score > 0'
    );

    res.json({
      success: true,
      stats: {
        emergency_complaints: emergencyCount[0].count,
        avg_confidence: avgConfidence[0].avg || 0,
        total_analyzed: totalAnalyzed[0].count,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
```

## Step 7: Add to Server Routes

Update `backend/server.js`:

```javascript
const aiMonitoringRoutes = require('./routes/ai-monitoring');

// ... existing routes ...

app.use('/api/ai-monitoring', aiMonitoringRoutes);
```

## Testing Integration

### 1. Start AI Service
```bash
cd ai-service
python main.py
```

### 2. Start Backend
```bash
cd backend
npm start
```

### 3. Test Complaint Submission
```bash
curl -X POST "http://localhost:5000/api/complaints" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fire in apartment building",
    "description": "Smoke and flames coming from second floor, people trapped inside",
    "category": "Public Safety",
    "priority": "High",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "date": "2024-01-20",
    "time": "14:30:00",
    "user_id": 1
  }'
```

### 4. Check AI Monitoring
```bash
curl http://localhost:5000/api/ai-monitoring/health
curl http://localhost:5000/api/ai-monitoring/stats
```

## Expected Response

```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "id": 123,
  "complaint": {
    "id": 123,
    "user_id": 1,
    "title": "Fire in apartment building",
    "description": "Smoke and flames coming from second floor, people trapped inside",
    "category": "Fire Emergency",
    "priority": "Critical",
    "is_emergency": true,
    "ai_confidence": 0.95,
    "emergency_keywords": "fire,flames,trapped",
    "ai_analysis_score": 10,
    ...
  },
  "ai_analysis": {
    "emergency": true,
    "priority": "Critical",
    "confidence": 0.95,
    "keywords": ["fire", "flames", "trapped"],
    "score": 10
  }
}
```

## Troubleshooting

### AI Service Not Responding
```javascript
// Add retry logic
async function analyzeWithRetry(complaint, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await aiServiceClient.analyzeComplaint(complaint);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### Slow Response Times
```javascript
// Add caching
const cache = new Map();

async function analyzeWithCache(complaint) {
  const key = `${complaint.title}:${complaint.description}`;
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const result = await aiServiceClient.analyzeComplaint(complaint);
  cache.set(key, result);
  
  // Clear cache after 1 hour
  setTimeout(() => cache.delete(key), 3600000);
  
  return result;
}
```

## Performance Optimization

### 1. Batch Processing
```javascript
// Process multiple complaints at once
async function processBatch(complaints) {
  const results = await aiServiceClient.batchAnalyze(complaints);
  
  for (const result of results.complaints) {
    await Complaint.update(result.complaint_id, {
      is_emergency: result.emergency,
      ai_confidence: result.confidence,
      priority: result.priority
    });
  }
}
```

### 2. Async Processing
```javascript
// Don't wait for AI analysis
app.post('/api/complaints', async (req, res) => {
  // Save complaint immediately
  const complaintId = await Complaint.create(complaintData);
  
  // Analyze in background
  aiServiceClient.analyzeComplaint(complaintData)
    .then(analysis => {
      Complaint.update(complaintId, {
        is_emergency: analysis.emergency,
        ai_confidence: analysis.confidence,
        priority: analysis.priority
      });
    })
    .catch(error => console.error('Background analysis failed:', error));
  
  res.json({ success: true, id: complaintId });
});
```

## Summary

✅ AI service integrated with Node.js backend
✅ Automatic complaint analysis on submission
✅ Emergency detection and priority classification
✅ Duplicate complaint detection
✅ AI analysis results stored in database
✅ Monitoring dashboard for AI service health
✅ Error handling and fallback mechanisms
✅ Performance optimization strategies

The integration is complete and ready for production!
