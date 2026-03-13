# NLP Service - Quick Start Guide

## Installation

### 1. Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### 2. Setup Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
cd ai-service
pip install -r requirements.txt
```

### 4. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env if needed (optional)
# nano .env
```

### 5. Run the Service
```bash
# Option 1: Direct Python
python main.py

# Option 2: Using uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Option 3: Production mode
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 6. Verify Service is Running
```bash
# Check health
curl http://localhost:8000/health

# Expected response:
# {"status":"OK","service":"complaint-ai"}
```

### 7. Access API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Basic Usage

### Test Emergency Detection
```bash
curl -X POST "http://localhost:8000/analyze-complaint" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fire in apartment building",
    "description": "Smoke and flames coming from second floor, people trapped inside",
    "category": "Public Safety",
    "priority": "High",
    "image_detection": "fire"
  }'
```

### Expected Response
```json
{
  "category": "Fire Emergency",
  "priority": "Critical",
  "emergency": true,
  "confidence": 0.95,
  "emergency_keywords": ["fire", "flames", "trapped"],
  "reasoning": "Title contains emergency keywords: fire, flames | Description contains emergency keywords: trapped | Image detection indicates emergency: fire",
  "score": 10
}
```

## Running Tests

### Run Test Suite
```bash
python test_emergency_detection.py
```

### Expected Output
```
============================================================
Testing /analyze-complaint endpoint
============================================================

📋 Test: Fire Emergency
   Input: Fire in apartment building
   ✓ Emergency: True
   ✓ Priority: critical
   ✓ Confidence: 0.95
   Score: 10
   Keywords: fire, flames, trapped
   ✅ PASSED

...

============================================================
Results: 9 passed, 0 failed out of 9 tests
============================================================
```

## Integration with Node.js Backend

### 1. Install axios in Node.js project
```bash
npm install axios
```

### 2. Create AI Service Client
```javascript
// ai-client.js
const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

class AIServiceClient {
  async analyzeComplaint(complaint) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/analyze-complaint`,
        {
          title: complaint.title,
          description: complaint.description,
          category: complaint.category,
          priority: complaint.priority,
          image_detection: complaint.image_detection
        }
      );
      return response.data;
    } catch (error) {
      console.error('AI Service error:', error.message);
      throw error;
    }
  }

  async detectEmergency(complaint) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/detect-emergency`,
        complaint
      );
      return response.data;
    } catch (error) {
      console.error('Emergency detection error:', error.message);
      throw error;
    }
  }

  async batchAnalyze(complaints) {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/batch-analyze`,
        complaints
      );
      return response.data;
    } catch (error) {
      console.error('Batch analysis error:', error.message);
      throw error;
    }
  }
}

module.exports = new AIServiceClient();
```

### 3. Use in Complaint Controller
```javascript
// backend/controllers/complaintController.js
const aiClient = require('../services/ai-client');

async function createComplaint(req, res) {
  try {
    const { title, description, category, priority, image_detection } = req.body;

    // Analyze with AI service
    const analysis = await aiClient.analyzeComplaint({
      title,
      description,
      category,
      priority,
      image_detection
    });

    // Store in database with AI results
    const complaint = await Complaint.create({
      user_id: req.user.id,
      title,
      description,
      category: analysis.category,
      priority: analysis.priority,
      is_emergency: analysis.emergency,
      ai_confidence: analysis.confidence,
      emergency_keywords: analysis.emergency_keywords.join(','),
      ...
    });

    res.json({
      success: true,
      complaint,
      analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
```

## Troubleshooting

### Service Won't Start
```bash
# Check Python version
python --version  # Should be 3.8+

# Check if port 8000 is in use
# Windows:
netstat -ano | findstr :8000

# macOS/Linux:
lsof -i :8000

# Kill process using port 8000 (if needed)
# Windows:
taskkill /PID <PID> /F

# macOS/Linux:
kill -9 <PID>
```

### Dependencies Installation Failed
```bash
# Upgrade pip
pip install --upgrade pip

# Try installing with specific versions
pip install -r requirements.txt --force-reinstall

# Or install individually
pip install fastapi==0.104.1
pip install uvicorn==0.24.0
# ... etc
```

### Service Responds Slowly
```bash
# Check system resources
# Windows:
tasklist /v

# macOS/Linux:
top

# Run with multiple workers
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Tests Fail
```bash
# Make sure service is running
curl http://localhost:8000/health

# Check service logs for errors
# Look for error messages in console output

# Try individual test
python -c "import requests; print(requests.get('http://localhost:8000/health').json())"
```

## Performance Tips

### 1. Use Batch Analysis for Multiple Complaints
```javascript
// Instead of:
for (let complaint of complaints) {
  await aiClient.analyzeComplaint(complaint);
}

// Do this:
const results = await aiClient.batchAnalyze(complaints);
```

### 2. Cache Results
```javascript
const cache = new Map();

async function analyzeWithCache(complaint) {
  const key = `${complaint.title}:${complaint.description}`;
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const result = await aiClient.analyzeComplaint(complaint);
  cache.set(key, result);
  return result;
}
```

### 3. Run Multiple Workers
```bash
# Production deployment
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Environment Variables

### Development
```bash
AI_SERVICE_HOST=0.0.0.0
AI_SERVICE_PORT=8000
LOG_LEVEL=DEBUG
```

### Production
```bash
AI_SERVICE_HOST=0.0.0.0
AI_SERVICE_PORT=8000
LOG_LEVEL=INFO
USE_TRANSFORMER_MODEL=true
```

## Next Steps

1. **Read Full Documentation**: See `NLP_SERVICE_GUIDE.md`
2. **Explore API**: Visit http://localhost:8000/docs
3. **Run Tests**: Execute `python test_emergency_detection.py`
4. **Integrate**: Add AI service calls to your Node.js backend
5. **Monitor**: Set up logging and monitoring

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation at http://localhost:8000/docs
3. Check service logs for error messages
4. Refer to `NLP_SERVICE_GUIDE.md` for detailed information

## Common Commands

```bash
# Start service
python main.py

# Run tests
python test_emergency_detection.py

# Check health
curl http://localhost:8000/health

# View API docs
# Open browser to http://localhost:8000/docs

# Stop service
# Press Ctrl+C in terminal

# Deactivate virtual environment
deactivate
```

Happy coding! 🚀
