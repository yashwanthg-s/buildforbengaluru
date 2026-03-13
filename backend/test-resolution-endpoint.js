const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple test image (1x1 pixel JPEG in base64)
const TEST_IMAGE_BASE64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

async function testResolutionEndpoint() {
  console.log('🧪 Testing Resolution Endpoint\n');
  console.log('================================\n');
  
  // Test data
  const complaintId = 1; // Change this to a valid complaint ID
  const officerId = 2;   // Change this to a valid officer ID
  
  const payload = {
    officer_id: officerId,
    before_image: TEST_IMAGE_BASE64,
    after_image: TEST_IMAGE_BASE64,
    resolution_notes: 'Test resolution - fixed the issue'
  };
  
  console.log('📋 Test Configuration:');
  console.log(`   Complaint ID: ${complaintId}`);
  console.log(`   Officer ID: ${officerId}`);
  console.log(`   Endpoint: POST /api/complaints/${complaintId}/resolve`);
  console.log(`   Payload size: ${JSON.stringify(payload).length} bytes\n`);
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/complaints/${complaintId}/resolve`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(payload))
      }
    };
    
    console.log('🚀 Sending request...\n');
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Response Status: ${res.statusCode}\n`);
        console.log('📝 Response Headers:');
        Object.entries(res.headers).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
        console.log('\n📦 Response Body:');
        
        try {
          const jsonData = JSON.parse(data);
          console.log(JSON.stringify(jsonData, null, 2));
          
          if (res.statusCode === 200 && jsonData.success) {
            console.log('\n✅ Test PASSED - Resolution created successfully!');
            console.log(`   Resolution ID: ${jsonData.resolution_id}`);
            console.log(`   Before image: ${jsonData.before_image_path}`);
            console.log(`   After image: ${jsonData.after_image_path}`);
            
            // Check if files exist
            console.log('\n🔍 Checking if image files were created...');
            const uploadsDir = path.join(__dirname, 'uploads');
            if (fs.existsSync(uploadsDir)) {
              const files = fs.readdirSync(uploadsDir);
              const resolutionFiles = files.filter(f => f.includes('resolution'));
              console.log(`   Found ${resolutionFiles.length} resolution image files`);
              resolutionFiles.slice(-2).forEach(f => {
                console.log(`   - ${f}`);
              });
            }
          } else {
            console.log('\n❌ Test FAILED - Unexpected response');
          }
        } catch (e) {
          console.log(data);
          console.log('\n❌ Failed to parse response as JSON');
        }
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('\n❌ Request Error:', error.message);
      console.error('\n⚠️ Make sure the backend is running: npm run dev');
      reject(error);
    });
    
    req.write(JSON.stringify(payload));
    req.end();
  });
}

// Run the test
testResolutionEndpoint().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
