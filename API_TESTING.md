# API Testing Guide

## Using cURL

### 1. Submit Complaint

```bash
curl -X POST http://localhost:5000/api/complaints \
  -H "Authorization: Bearer your_token" \
  -F "title=Pothole on Main Street" \
  -F "description=Large pothole causing accidents" \
  -F "category=infrastructure" \
  -F "priority=high" \
  -F "latitude=40.7128" \
  -F "longitude=-74.0060" \
  -F "date=2024-03-12" \
  -F "time=14:30:00" \
  -F "image=@/path/to/image.jpg"
```

### 2. Get All Complaints

```bash
curl -X GET "http://localhost:5000/api/complaints" \
  -H "Authorization: Bearer your_token"
```

### 3. Get Complaints with Filters

```bash
curl -X GET "http://localhost:5000/api/complaints?status=submitted&category=infrastructure&priority=high" \
  -H "Authorization: Bearer your_token"
```

### 4. Get Specific Complaint

```bash
curl -X GET http://localhost:5000/api/complaints/1 \
  -H "Authorization: Bearer your_token"
```

### 5. Update Complaint Status

```bash
curl -X PATCH http://localhost:5000/api/complaints/1/status \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "under_review",
    "message": "Officer assigned to investigate"
  }'
```

### 6. Delete Complaint

```bash
curl -X DELETE http://localhost:5000/api/complaints/1 \
  -H "Authorization: Bearer your_token"
```

## Using Postman

### Setup

1. Import collection from `postman_collection.json`
2. Set environment variables:
   - `base_url`: http://localhost:5000
   - `token`: your_jwt_token

### Requests

#### Submit Complaint
- Method: POST
- URL: {{base_url}}/api/complaints
- Headers:
  - Authorization: Bearer {{token}}
- Body (form-data):
  - title: Pothole on Main Street
  - description: Large pothole causing accidents
  - category: infrastructure
  - priority: high
  - latitude: 40.7128
  - longitude: -74.0060
  - date: 2024-03-12
  - time: 14:30:00
  - image: (select file)

#### Get Complaints
- Method: GET
- URL: {{base_url}}/api/complaints
- Headers:
  - Authorization: Bearer {{token}}

#### Update Status
- Method: PATCH
- URL: {{base_url}}/api/complaints/1/status
- Headers:
  - Authorization: Bearer {{token}}
  - Content-Type: application/json
- Body (raw JSON):
```json
{
  "status": "under_review",
  "message": "Officer assigned"
}
```

## Using Python Requests

```python
import requests
import json

BASE_URL = "http://localhost:5000/api"
TOKEN = "your_jwt_token"

headers = {
    "Authorization": f"Bearer {TOKEN}"
}

# Submit complaint
def submit_complaint():
    with open('image.jpg', 'rb') as f:
        files = {'image': f}
        data = {
            'title': 'Pothole on Main Street',
            'description': 'Large pothole causing accidents',
            'category': 'infrastructure',
            'priority': 'high',
            'latitude': 40.7128,
            'longitude': -74.0060,
            'date': '2024-03-12',
            'time': '14:30:00'
        }
        response = requests.post(
            f"{BASE_URL}/complaints",
            headers=headers,
            files=files,
            data=data
        )
    return response.json()

# Get complaints
def get_complaints(status=None, category=None, priority=None):
    params = {}
    if status:
        params['status'] = status
    if category:
        params['category'] = category
    if priority:
        params['priority'] = priority
    
    response = requests.get(
        f"{BASE_URL}/complaints",
        headers=headers,
        params=params
    )
    return response.json()

# Update status
def update_status(complaint_id, status, message=""):
    data = {
        'status': status,
        'message': message
    }
    response = requests.patch(
        f"{BASE_URL}/complaints/{complaint_id}/status",
        headers=headers,
        json=data
    )
    return response.json()

# Test
if __name__ == "__main__":
    # Submit
    result = submit_complaint()
    print("Submit:", result)
    
    # Get all
    complaints = get_complaints()
    print("All complaints:", complaints)
    
    # Get filtered
    filtered = get_complaints(status='submitted', category='infrastructure')
    print("Filtered:", filtered)
    
    # Update
    if complaints['complaints']:
        complaint_id = complaints['complaints'][0]['id']
        updated = update_status(complaint_id, 'under_review', 'Investigating')
        print("Updated:", updated)
```

## Using JavaScript/Fetch

```javascript
const BASE_URL = 'http://localhost:5000/api';
const TOKEN = 'your_jwt_token';

const headers = {
  'Authorization': `Bearer ${TOKEN}`
};

// Submit complaint
async function submitComplaint(formData) {
  const response = await fetch(`${BASE_URL}/complaints`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`
    },
    body: formData
  });
  return response.json();
}

// Get complaints
async function getComplaints(filters = {}) {
  const params = new URLSearchParams(filters);
  const response = await fetch(
    `${BASE_URL}/complaints?${params}`,
    { headers }
  );
  return response.json();
}

// Update status
async function updateStatus(complaintId, status, message = '') {
  const response = await fetch(
    `${BASE_URL}/complaints/${complaintId}/status`,
    {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, message })
    }
  );
  return response.json();
}

// Example usage
async function test() {
  // Get complaints
  const complaints = await getComplaints({ status: 'submitted' });
  console.log('Complaints:', complaints);
  
  // Update first complaint
  if (complaints.complaints.length > 0) {
    const result = await updateStatus(
      complaints.complaints[0].id,
      'under_review',
      'Officer assigned'
    );
    console.log('Updated:', result);
  }
}

test();
```

## AI Service Testing

### Categorize Complaint

```bash
curl -X POST http://localhost:8000/categorize \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pothole on Main Street",
    "description": "Large pothole causing accidents and vehicle damage"
  }'
```

Response:
```json
{
  "category": "infrastructure",
  "confidence": 0.8,
  "keywords": ["pothole", "road", "damage"]
}
```

### Analyze Priority

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Emergency: Building Collapse",
    "description": "Building partially collapsed, people trapped inside"
  }'
```

Response:
```json
{
  "priority": "critical",
  "scores": {
    "critical": 3,
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "recommendation": "Immediate action required. Escalate to emergency services."
}
```

## Response Examples

### Success Response
```json
{
  "success": true,
  "message": "Complaint submitted successfully",
  "id": 1,
  "complaint": {
    "id": 1,
    "user_id": 1,
    "title": "Pothole on Main Street",
    "description": "Large pothole causing accidents",
    "image_path": "/uploads/complaint-1234567890.jpg",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "date": "2024-03-12",
    "time": "14:30:00",
    "category": "infrastructure",
    "priority": "high",
    "status": "submitted",
    "created_at": "2024-03-12T14:30:00Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Missing required fields",
  "error": "Image file is required"
}
```

## Performance Testing

### Load Testing with Apache Bench

```bash
# Single request
ab -n 1 -c 1 http://localhost:5000/api/complaints

# 100 requests, 10 concurrent
ab -n 100 -c 10 http://localhost:5000/api/complaints

# With POST data
ab -n 100 -c 10 -p data.json -T application/json http://localhost:5000/api/complaints
```

### Load Testing with wrk

```bash
# Install wrk
git clone https://github.com/wg/wrk.git
cd wrk
make

# Run test
./wrk -t4 -c100 -d30s http://localhost:5000/api/complaints
```

## Debugging

### Enable Verbose Logging

```bash
# Backend
DEBUG=* npm run dev

# AI Service
export PYTHONUNBUFFERED=1
python main.py
```

### Check Network Traffic

```bash
# Monitor requests
tcpdump -i lo -n 'tcp port 5000'

# Monitor with Wireshark
wireshark
```

### Database Queries

```bash
# Enable query logging
mysql -u root -p -e "SET GLOBAL general_log = 'ON';"
mysql -u root -p -e "SET GLOBAL log_output = 'TABLE';"

# View logs
mysql -u root -p -e "SELECT * FROM mysql.general_log;"
```
