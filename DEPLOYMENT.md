# Deployment Guide

## Docker Deployment (Recommended)

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Quick Start

1. **Clone Repository**
```bash
git clone <repository-url>
cd complaint-system
```

2. **Build and Run**
```bash
docker-compose up -d
```

3. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- AI Service: http://localhost:8000
- MySQL: localhost:3306

4. **Stop Services**
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f ai-service
docker-compose logs -f mysql
```

## Manual Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python
sudo apt install -y python3 python3-pip python3-venv

# Install MySQL
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx
```

### 2. Database Setup

```bash
sudo mysql -u root -p < database/schema.sql
```

### 3. Backend Deployment

```bash
cd backend
npm install --production

# Create systemd service
sudo tee /etc/systemd/system/complaint-backend.service > /dev/null <<EOF
[Unit]
Description=Complaint System Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/complaint-system/backend
Environment="NODE_ENV=production"
Environment="PORT=5000"
Environment="DB_HOST=localhost"
Environment="DB_USER=root"
Environment="DB_PASSWORD=your_password"
Environment="DB_NAME=complaint_system"
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable complaint-backend
sudo systemctl start complaint-backend
```

### 4. AI Service Deployment

```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create systemd service
sudo tee /etc/systemd/system/complaint-ai.service > /dev/null <<EOF
[Unit]
Description=Complaint System AI Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/complaint-system/ai-service
Environment="ENVIRONMENT=production"
ExecStart=/var/www/complaint-system/ai-service/venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable complaint-ai
sudo systemctl start complaint-ai
```

### 5. Frontend Deployment

```bash
cd frontend
npm install
npm run build

# Copy to web root
sudo cp -r dist/* /var/www/html/complaint-system/

# Configure Nginx
sudo tee /etc/nginx/sites-available/complaint-system > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/html/complaint-system;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/complaint-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Cloud Deployment

### AWS Deployment

1. **EC2 Instance**
   - Ubuntu 22.04 LTS
   - t3.medium or larger
   - Security group: Allow 80, 443, 3306

2. **RDS MySQL**
   - MySQL 8.0
   - db.t3.micro or larger
   - Multi-AZ for production

3. **S3 for Images**
   - Create bucket for complaint images
   - Configure CORS
   - Set lifecycle policies

4. **CloudFront CDN**
   - Distribute frontend assets
   - Cache images

### Heroku Deployment

```bash
# Install Heroku CLI
curl https://cli.heroku.com/install.sh | sh

# Login
heroku login

# Create apps
heroku create complaint-backend
heroku create complaint-frontend
heroku create complaint-ai

# Set environment variables
heroku config:set DB_HOST=your-db-host -a complaint-backend
heroku config:set DB_USER=root -a complaint-backend
heroku config:set DB_PASSWORD=your-password -a complaint-backend

# Deploy
git push heroku main
```

## Monitoring and Maintenance

### Health Checks

```bash
# Backend
curl http://localhost:5000/health

# AI Service
curl http://localhost:8000/health

# Database
mysql -u root -p -e "SELECT 1"
```

### Log Rotation

```bash
# Configure logrotate
sudo tee /etc/logrotate.d/complaint-system > /dev/null <<EOF
/var/log/complaint-system/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
EOF
```

### Backup Strategy

```bash
# Daily database backup
0 2 * * * mysqldump -u root -p complaint_system > /backups/complaint_system_$(date +\%Y\%m\%d).sql

# Weekly full backup
0 3 * * 0 tar -czf /backups/complaint_system_$(date +\%Y\%m\%d).tar.gz /var/www/complaint-system/
```

### Performance Optimization

1. **Database**
   - Add indexes on frequently queried columns
   - Regular ANALYZE TABLE
   - Enable query cache

2. **Frontend**
   - Enable gzip compression
   - Minify CSS/JS
   - Use CDN for static assets

3. **Backend**
   - Enable clustering
   - Use connection pooling
   - Implement caching

## Troubleshooting

### Service Won't Start
```bash
# Check logs
journalctl -u complaint-backend -n 50
journalctl -u complaint-ai -n 50

# Verify ports
sudo netstat -tlnp | grep :5000
sudo netstat -tlnp | grep :8000
```

### Database Connection Issues
```bash
# Test connection
mysql -h localhost -u root -p complaint_system -e "SELECT 1"

# Check MySQL status
sudo systemctl status mysql
```

### High Memory Usage
```bash
# Monitor processes
top -p $(pgrep -f "node server.js")

# Check Node memory
node --max-old-space-size=2048 server.js
```

## Security Checklist

- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set strong database passwords
- [ ] Enable database backups
- [ ] Configure rate limiting
- [ ] Enable CORS properly
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Monitor access logs
- [ ] Set up alerts for errors

## Scaling Considerations

1. **Horizontal Scaling**
   - Load balancer (Nginx, HAProxy)
   - Multiple backend instances
   - Database replication

2. **Vertical Scaling**
   - Increase server resources
   - Optimize database queries
   - Implement caching

3. **Database Optimization**
   - Partitioning by date
   - Archive old complaints
   - Read replicas for reporting
