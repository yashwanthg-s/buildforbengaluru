# Quick Start Guide

## 5-Minute Setup with Docker

### Prerequisites
- Docker and Docker Compose installed

### Steps

1. **Clone/Extract Project**
```bash
cd complaint-system
```

2. **Start All Services**
```bash
docker-compose up -d
```

3. **Wait for Services**
```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

4. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000

5. **Test Citizen Workflow**
- Click "👤 Citizen"
- Fill complaint form
- Click "📷 Open Camera" → Capture photo
- Click "📍 Capture Location" → Get GPS
- Click "✓ Submit Complaint"

6. **Test Officer Workflow**
- Click "👮 Officer"
- View submitted complaints
- Click complaint to see details
- Update status

## Manual Setup (30 minutes)

### 1. Database
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 3. AI Service
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Access
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- AI: http://localhost:8000

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=complaint_system
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Common Commands

### Docker
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend

# Rebuild images
docker-compose build --no-cache

# Remove volumes
docker-compose down -v
```

### Backend
```bash
# Install dependencies
npm install

# Start development
npm run dev

# Start production
NODE_ENV=production node server.js
```

### Frontend
```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### AI Service
```bash
# Install dependencies
pip install -r requirements.txt

# Start service
python main.py

# With specific port
python -m uvicorn main:app --port 8000
```

### Database
```bash
# Connect to MySQL
mysql -u root -p complaint_system

# Import schema
mysql -u root -p complaint_system < database/schema.sql

# Backup database
mysqldump -u root -p complaint_system > backup.sql

# Restore database
mysql -u root -p complaint_system < backup.sql
```

## Testing

### Submit Test Complaint
```bash
curl -X POST http://localhost:5000/api/complaints \
  -H "Authorization: Bearer test" \
  -F "title=Test Complaint" \
  -F "description=This is a test complaint" \
  -F "category=other" \
  -F "priority=medium" \
  -F "latitude=40.7128" \
  -F "longitude=-74.0060" \
  -F "date=2024-03-12" \
  -F "time=14:30:00" \
  -F "image=@test.jpg"
```

### Get All Complaints
```bash
curl -X GET http://localhost:5000/api/complaints \
  -H "Authorization: Bearer test"
```

### Health Checks
```bash
# Backend
curl http://localhost:5000/health

# AI Service
curl http://localhost:8000/health
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :5000
lsof -i :8000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Error
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p -e "SELECT 1"
```

### Camera Not Working
- Check browser permissions
- Use HTTPS in production
- Test with different browser
- Check device has camera

### Location Not Detected
- Check browser permissions
- Enable location services
- Test with different location
- Check GPS availability

### Docker Issues
```bash
# Remove all containers
docker-compose down -v

# Rebuild everything
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

## File Locations

### Uploaded Images
```
backend/uploads/
```

### Database Backups
```
backups/
```

### Logs
```
# Docker
docker-compose logs

# Systemd
journalctl -u complaint-backend
journalctl -u complaint-ai
```

## Performance Tips

1. **Frontend**
   - Clear browser cache
   - Use production build
   - Enable compression

2. **Backend**
   - Use connection pooling
   - Enable caching
   - Monitor memory usage

3. **Database**
   - Add indexes
   - Regular maintenance
   - Archive old data

4. **AI Service**
   - Cache categorizations
   - Batch processing
   - Monitor response time

## Security Tips

1. **Change Default Passwords**
   - MySQL root password
   - Database credentials

2. **Enable HTTPS**
   - Get SSL certificate
   - Configure Nginx
   - Redirect HTTP to HTTPS

3. **Configure Firewall**
   - Allow only needed ports
   - Restrict database access
   - Enable rate limiting

4. **Regular Backups**
   - Daily database backups
   - Weekly full backups
   - Test restore process

## Next Steps

1. ✅ Setup and run system
2. ✅ Test citizen workflow
3. ✅ Test officer workflow
4. ✅ Review API documentation
5. ✅ Configure for production
6. ✅ Setup monitoring
7. ✅ Deploy to server

## Documentation

- `README.md` - Project overview
- `SETUP.md` - Detailed setup
- `DEPLOYMENT.md` - Production deployment
- `API_TESTING.md` - API testing
- `IMPLEMENTATION_SUMMARY.md` - Technical details

## Support

For issues:
1. Check logs: `docker-compose logs`
2. Review documentation
3. Check API endpoints
4. Verify environment variables
5. Test with curl/Postman

## Quick Reference

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend | http://localhost:5000 | 5000 |
| AI Service | http://localhost:8000 | 8000 |
| MySQL | localhost | 3306 |

| Component | Tech | Version |
|-----------|------|---------|
| Frontend | React | 18.2.0 |
| Backend | Node.js | 18+ |
| AI | Python | 3.8+ |
| Database | MySQL | 8.0 |

## Done!

Your geo-tagged complaint system is ready. Start submitting complaints and managing them through the officer dashboard.
