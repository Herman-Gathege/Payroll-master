# Production Deployment Guide

## 🚀 Phase 1: Initial Setup (Week 1-2)

### 1.1 Environment Configuration

```bash
# Backend setup
cd backend
cp .env.example .env
nano .env  # Edit with production values
```

**Required .env changes:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_HOST=your-production-db-host
DB_PASSWORD=STRONG_RANDOM_PASSWORD

JWT_SECRET=GENERATE_WITH: openssl rand -base64 48

CORS_ALLOWED_ORIGINS=https://your-domain.com
```

### 1.2 Database Setup

```sql
-- Create production database
CREATE DATABASE hr_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with limited privileges
CREATE USER 'hruser_prod'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE ON hr_management_system.* TO 'hruser_prod'@'localhost';
FLUSH PRIVILEGES;

-- Run migrations
mysql -u hruser_prod -p hr_management_system < database/schema.sql
mysql -u hruser_prod -p hr_management_system < database/dual_login_schema.sql
```

### 1.3 Update Database Config

Replace `backend/config/database.php` usage with `backend/config/database_secure.php`:

```php
// In all API files, replace:
require_once '../../config/database.php';

// With:
require_once '../../config/database_secure.php';
```

### 1.4 Update Auth Endpoints to Use Security Middleware

Edit `backend/api/employer/auth.php` and `backend/api/employee/auth.php`:

```php
<?php
require_once '../../config/database_secure.php';
require_once '../../middleware/SecurityMiddleware.php';

// Apply security measures
SecurityMiddleware::handleCORS();
SecurityMiddleware::applySecurityHeaders();

// Rate limit login attempts
SecurityMiddleware::checkRateLimit('login', 5, 300);

// ... rest of code
```

### 1.5 Web Server Configuration

#### Apache (.htaccess for backend/api/)

```apache
# backend/api/.htaccess
RewriteEngine On

# Force HTTPS in production
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Hide PHP version
Header unset X-Powered-By

# Prevent directory listing
Options -Indexes

# Protect sensitive files
<FilesMatch "\.(env|log|sql|md)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Set security headers
Header set X-Frame-Options "DENY"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"
```

#### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Strong SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/hr-system/backend/api;
    index index.php;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Hide sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ \.(env|log|sql|md)$ {
        deny all;
    }

    # PHP processing
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
    }
}
```

### 1.6 SSL Certificate

```bash
# Using Let's Encrypt (certbot)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

## 📋 Phase 2: Security Hardening (Week 2-3)

### 2.1 Create Security Checklist Script

```bash
# Run this script to verify security
php backend/scripts/security_audit.php
```

### 2.2 Disable Debug Mode

Ensure in production `.env`:
```env
APP_DEBUG=false
LOG_LEVEL=error
```

### 2.3 Set File Permissions

```bash
# Backend
chmod 750 backend/
chmod 640 backend/.env
chmod 750 backend/api/
chmod 644 backend/api/*.php

# Logs directory
mkdir -p backend/logs
chmod 770 backend/logs
chown www-data:www-data backend/logs

# Uploads directory
mkdir -p backend/uploads
chmod 770 backend/uploads
chown www-data:www-data backend/uploads
```

### 2.4 Database Security

```sql
-- Disable remote root login
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Remove anonymous users
DELETE FROM mysql.user WHERE User='';

-- Remove test database
DROP DATABASE IF EXISTS test;

FLUSH PRIVILEGES;
```

### 2.5 Implement Rate Limiting

Already included in `SecurityMiddleware.php`. For production, use Redis:

```php
// Install Redis
sudo apt install redis-server php-redis

// Update config.php
'cache' => [
    'driver' => 'redis',
    'redis' => [
        'host' => '127.0.0.1',
        'port' => 6379,
    ]
]
```

---

## 🔍 Phase 3: Missing Endpoints (Week 3-5)

### Priority Endpoints to Build:

**Created file structure:**
```
backend/api/
├── employer/
│   ├── employees.php ✅ NEED TO BUILD
│   ├── payroll/
│   │   └── summary.php ✅ NEED TO BUILD
│   ├── departments.php ✅ NEED TO BUILD
│   ├── positions.php ✅ NEED TO BUILD
│   └── reports.php ✅ NEED TO BUILD
└── employee/
    ├── profile.php ✅ NEED TO BUILD
    ├── payslips.php ✅ NEED TO BUILD
    └── attendance.php ✅ NEED TO BUILD
```

I'll create templates for these next.

---

## 🧪 Phase 4: Testing (Week 5-6)

### 4.1 Backend Unit Tests

```bash
# Install PHPUnit
composer require --dev phpunit/phpunit

# Run tests
./vendor/bin/phpunit tests/
```

### 4.2 Frontend Tests

```bash
cd frontend
npm install --save-dev @testing-library/react vitest
npm run test
```

### 4.3 Security Testing

```bash
# Install OWASP ZAP or run manual tests
# Test for:
- SQL Injection
- XSS
- CSRF
- Authentication bypass
- Session hijacking
```

---

## 📊 Phase 5: Monitoring (Week 6-7)

### 5.1 Error Monitoring (Sentry)

```bash
# Frontend
npm install @sentry/react

# Update .env
VITE_SENTRY_DSN=your-sentry-dsn
```

```javascript
// frontend/src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

### 5.2 Application Monitoring

```bash
# Install New Relic or similar
sudo apt-get install newrelic-php5
```

### 5.3 Log Aggregation

```bash
# Set up ELK Stack or use cloud services
# - Elasticsearch
# - Logstash
# - Kibana
```

---

## 🔄 Phase 6: Backup & Recovery (Week 7-8)

### 6.1 Automated Database Backup

```bash
#!/bin/bash
# /etc/cron.daily/backup-database

DB_NAME="hr_management_system"
DB_USER="hruser_prod"
DB_PASS="your_password"
BACKUP_DIR="/var/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)

mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

Make executable:
```bash
chmod +x /etc/cron.daily/backup-database
```

### 6.2 File Backup

```bash
# Use rsync for incremental backups
rsync -avz --delete /var/www/hr-system /backup/hr-system/
```

---

## 🚢 Phase 7: Deployment (Week 8)

### 7.1 Frontend Build

```bash
cd frontend
npm run build

# Deploy to web server
rsync -avz dist/ user@server:/var/www/hr-system/public/
```

### 7.2 Backend Deployment

```bash
# Deploy backend
rsync -avz --exclude='.env' --exclude='logs/*' backend/ user@server:/var/www/hr-system/backend/

# Set permissions
ssh user@server "cd /var/www/hr-system && chmod 640 backend/.env"
```

### 7.3 Database Migration

```bash
# Run on production server
mysql -u hruser_prod -p hr_management_system < migrations/001_add_missing_columns.sql
```

### 7.4 Zero-Downtime Deployment

Use blue-green deployment:
```bash
# Deploy to staging
# Test thoroughly
# Switch traffic to new version
# Monitor for issues
# Rollback if needed
```

---

## ✅ Final Production Checklist

### Before Go-Live:

- [ ] All `.env` files configured correctly
- [ ] SSL certificate installed and tested
- [ ] Database secured and backed up
- [ ] All sensitive data encrypted
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Error logging to Sentry
- [ ] Monitoring dashboards set up
- [ ] Backup automation tested
- [ ] Disaster recovery plan documented
- [ ] Security audit completed
- [ ] Penetration testing done
- [ ] Load testing completed
- [ ] User acceptance testing passed
- [ ] Documentation complete
- [ ] Support team trained
- [ ] Rollback plan ready

### Post-Launch:

- [ ] Monitor error rates
- [ ] Monitor response times
- [ ] Check backup success
- [ ] Review security logs
- [ ] User feedback collection
- [ ] Performance optimization
- [ ] Regular security updates

---

## 🆘 Emergency Contacts

```
Production Issues: your-oncall@company.com
Security Issues: security@company.com
Database Admin: dba@company.com
```

---

## 📞 Support

For deployment help:
- Documentation: /docs
- Support: support@your-company.com
- Emergency: +254-XXX-XXXXXX
