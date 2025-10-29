# Complete Hosting Guide - HR Management System

This guide covers all methods to host your HR Management System, from local development to production servers.

---

## 📋 Table of Contents

1. [Quick Local Hosting (XAMPP)](#quick-local-hosting-xampp)
2. [Production Hosting Options](#production-hosting-options)
3. [Shared Hosting (cPanel)](#shared-hosting-cpanel)
4. [VPS/Cloud Hosting](#vpscloud-hosting)
5. [Docker Deployment](#docker-deployment)
6. [Domain Configuration](#domain-configuration)
7. [SSL/HTTPS Setup](#sslhttps-setup)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Local Hosting (XAMPP)

### Current Setup (Already Working!)

You're currently running on XAMPP. Here's what's configured:

**Frontend**: http://localhost/hrms/  
**Backend**: http://localhost/backend/api/  
**Database**: MySQL on localhost:3306

### One-Command Deploy
```powershell
.\deploy.ps1
```

### Manual Steps
1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start Apache
   - Start MySQL

2. **Build Frontend**
   ```powershell
   cd frontend
   npm run build:prod
   ```

3. **Deploy Files**
   ```powershell
   # Copy frontend
   Copy-Item -Path dist\* -Destination C:\xampp\htdocs\hrms -Recurse -Force
   
   # Backend already at C:\xampp\htdocs\backend
   ```

4. **Access Application**
   - Homepage: http://localhost/hrms/
   - Employer Login: http://localhost/hrms/employer/login
   - Employee Login: http://localhost/hrms/employee/login

---

## 🌐 Production Hosting Options

### Option 1: Shared Hosting (Best for Small Teams)

**Recommended Providers**:
- Hostinger (PHP + MySQL)
- Bluehost
- SiteGround
- Namecheap

**Pricing**: $3-10/month  
**Suitable For**: 10-50 employees

---

### Option 2: VPS Hosting (Best for Medium Teams)

**Recommended Providers**:
- DigitalOcean ($6-12/month)
- Vultr ($5-10/month)
- Linode ($5-10/month)
- AWS Lightsail ($3.50-10/month)

**Pricing**: $5-50/month  
**Suitable For**: 50-500 employees

---

### Option 3: Cloud Hosting (Best for Large Organizations)

**Providers**:
- AWS (Amazon Web Services)
- Google Cloud Platform
- Microsoft Azure
- Heroku

**Pricing**: $10-500+/month  
**Suitable For**: 500+ employees, multiple locations

---

## 📦 Shared Hosting (cPanel) Setup

### Prerequisites
- Hosting account with PHP 8.0+ and MySQL
- cPanel access
- Domain name (optional but recommended)

### Step 1: Prepare Files Locally

1. **Build Frontend**
   ```powershell
   cd frontend
   npm run build:prod
   ```

2. **Create Deployment Package**
   ```powershell
   # Create a folder for upload
   New-Item -Path "deploy-package" -ItemType Directory -Force
   
   # Copy frontend build
   Copy-Item -Path "frontend\dist\*" -Destination "deploy-package\public_html" -Recurse
   
   # Copy backend
   Copy-Item -Path "backend\*" -Destination "deploy-package\api" -Recurse
   
   # Compress for upload
   Compress-Archive -Path "deploy-package\*" -DestinationPath "hrms-deployment.zip"
   ```

### Step 2: Upload Files

1. **Login to cPanel**
2. **Open File Manager**
3. **Navigate to public_html/**
4. **Upload and Extract**
   - Upload `hrms-deployment.zip`
   - Right-click → Extract
   - You should have:
     ```
     public_html/
     ├── index.html
     ├── assets/
     └── .htaccess
     
     public_html/api/
     ├── auth.php
     ├── config/
     └── ...
     ```

### Step 3: Setup Database

1. **Create Database**
   - cPanel → MySQL Databases
   - Create database: `username_hrms`
   - Create user: `username_hrms_user`
   - Set password (strong password!)
   - Add user to database (ALL PRIVILEGES)

2. **Import Schema**
   - cPanel → phpMyAdmin
   - Select your database
   - Import → Choose `database/schema.sql`
   - Click Go

3. **Create Admin User**
   - SQL tab → Run:
   ```sql
   INSERT INTO employer_users (username, email, password_hash, first_name, last_name, role, is_active)
   VALUES ('admin', 'admin@yourdomain.com', '$2y$10$encrypted_password', 'Admin', 'User', 'super_admin', 1);
   ```

### Step 4: Configure Backend

Edit `public_html/api/config/database.php`:
```php
<?php
return [
    'host' => 'localhost',
    'database' => 'username_hrms',
    'username' => 'username_hrms_user',
    'password' => 'your_strong_password',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
];
```

### Step 5: Update Frontend API URL

**If using domain**: Edit frontend and rebuild with production URL

1. Update `.env.production`:
   ```bash
   VITE_API_BASE_URL=https://yourdomain.com/api
   ```

2. Rebuild:
   ```powershell
   npm run build:prod
   ```

3. Re-upload frontend files

### Step 6: Test

- Visit: https://yourdomain.com
- Test login functionality
- Check browser console for errors

---

## 🖥️ VPS/Cloud Hosting Setup

### DigitalOcean Example (Ubuntu 22.04)

#### 1. Create Droplet
- OS: Ubuntu 22.04 LTS
- Plan: Basic ($6/month)
- Region: Closest to your users

#### 2. Initial Server Setup

```bash
# SSH into server
ssh root@your_server_ip

# Update system
apt update && apt upgrade -y

# Create non-root user
adduser hrms
usermod -aG sudo hrms

# Switch to new user
su - hrms
```

#### 3. Install LAMP Stack

```bash
# Install Apache
sudo apt install apache2 -y

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install PHP 8.2
sudo apt install software-properties-common -y
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-curl php8.2-xml php8.2-mbstring -y

# Enable Apache modules
sudo a2enmod rewrite
sudo a2enmod headers
sudo systemctl restart apache2
```

#### 4. Configure Firewall

```bash
# Allow HTTP, HTTPS, SSH
sudo ufw allow OpenSSH
sudo ufw allow 'Apache Full'
sudo ufw enable
```

#### 5. Setup Database

```bash
# Login to MySQL
sudo mysql

# Create database and user
CREATE DATABASE hrms_production;
CREATE USER 'hrms_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON hrms_production.* TO 'hrms_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u hrms_user -p hrms_production < /path/to/schema.sql
```

#### 6. Deploy Application

```bash
# Create web directory
sudo mkdir -p /var/www/hrms
sudo chown -R $USER:$USER /var/www/hrms

# Upload files (from your local machine)
# Option A: Using SCP
scp -r frontend/dist/* hrms@your_server_ip:/var/www/hrms/
scp -r backend/* hrms@your_server_ip:/var/www/hrms/api/

# Option B: Using Git
cd /var/www/hrms
git clone your-repo-url .
cd frontend && npm install && npm run build:prod
```

#### 7. Configure Apache

Create `/etc/apache2/sites-available/hrms.conf`:
```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    ServerAdmin admin@yourdomain.com
    DocumentRoot /var/www/hrms

    <Directory /var/www/hrms>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    <Directory /var/www/hrms/api>
        Options -Indexes
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/hrms_error.log
    CustomLog ${APACHE_LOG_DIR}/hrms_access.log combined
</VirtualHost>
```

Enable site:
```bash
sudo a2ensite hrms.conf
sudo a2dissite 000-default.conf
sudo systemctl reload apache2
```

#### 8. Update Backend Config

Edit `/var/www/hrms/api/config/database.php`:
```php
return [
    'host' => 'localhost',
    'database' => 'hrms_production',
    'username' => 'hrms_user',
    'password' => 'strong_password_here',
    'charset' => 'utf8mb4',
];
```

#### 9. Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/hrms
sudo find /var/www/hrms -type d -exec chmod 755 {} \;
sudo find /var/www/hrms -type f -exec chmod 644 {} \;
```

---

## 🐳 Docker Deployment

### Docker Compose Setup (Recommended)

Already configured! Just use:

```powershell
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Your `docker-compose.yml` handles:
- ✅ MySQL Database
- ✅ PHP Backend (Apache)
- ✅ React Frontend (Nginx)

**Access**:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080/api
- Database: localhost:3306

### Production Docker Deployment

1. **Update Environment Variables**

Create `.env` file:
```bash
# Database
MYSQL_ROOT_PASSWORD=secure_root_password
MYSQL_DATABASE=hrms_production
MYSQL_USER=hrms_user
MYSQL_PASSWORD=secure_password

# Backend
API_BASE_URL=https://api.yourdomain.com

# Frontend
VITE_API_BASE_URL=https://api.yourdomain.com
```

2. **Build and Push Images**

```bash
# Build images
docker-compose build

# Tag for registry
docker tag hrms-frontend:latest registry.digitalocean.com/your-registry/hrms-frontend:latest
docker tag hrms-backend:latest registry.digitalocean.com/your-registry/hrms-backend:latest

# Push to registry
docker push registry.digitalocean.com/your-registry/hrms-frontend:latest
docker push registry.digitalocean.com/your-registry/hrms-backend:latest
```

3. **Deploy to Server**

```bash
# On production server
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🌍 Domain Configuration

### Connect Domain to Server

#### For Shared Hosting
1. Login to domain registrar (GoDaddy, Namecheap, etc.)
2. Update nameservers to hosting provider's nameservers
3. Wait 24-48 hours for propagation

#### For VPS/Cloud
1. Create DNS A Record:
   - Type: A
   - Name: @ (or subdomain)
   - Value: your_server_ip
   - TTL: 3600

2. Add www subdomain:
   - Type: A
   - Name: www
   - Value: your_server_ip
   - TTL: 3600

3. For API subdomain (optional):
   - Type: A
   - Name: api
   - Value: your_server_ip
   - TTL: 3600

### Verify DNS Propagation
```powershell
# Check from local machine
nslookup yourdomain.com

# Or use online tool
# https://www.whatsmydns.net
```

---

## 🔒 SSL/HTTPS Setup

### Free SSL with Let's Encrypt (Recommended)

#### For VPS/Cloud (Ubuntu)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache -y

# Get SSL certificate
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

#### For Shared Hosting (cPanel)
1. cPanel → SSL/TLS Status
2. Run AutoSSL
3. Wait for certificate installation

### Update Frontend for HTTPS

1. Edit `.env.production`:
   ```bash
   VITE_API_BASE_URL=https://yourdomain.com/api
   ```

2. Rebuild:
   ```powershell
   npm run build:prod
   ```

3. Re-deploy

### Force HTTPS Redirect

Add to `.htaccess`:
```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 🎯 Post-Deployment Checklist

### Security
- [ ] Change all default passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall
- [ ] Disable directory listing
- [ ] Set proper file permissions
- [ ] Enable fail2ban (VPS)
- [ ] Setup database backups
- [ ] Configure CORS properly

### Performance
- [ ] Enable GZIP compression
- [ ] Setup browser caching
- [ ] Enable OPcache (PHP)
- [ ] Configure CDN (optional)
- [ ] Optimize images
- [ ] Enable HTTP/2

### Monitoring
- [ ] Setup uptime monitoring (UptimeRobot)
- [ ] Configure error logging
- [ ] Setup Google Analytics (optional)
- [ ] Monitor server resources
- [ ] Test backup restoration

### Testing
- [ ] Test all login functionality
- [ ] Verify API endpoints work
- [ ] Check mobile responsiveness
- [ ] Test on different browsers
- [ ] Verify email notifications (if configured)
- [ ] Test file uploads (if applicable)

---

## 🔧 Troubleshooting

### 500 Internal Server Error
**Causes**:
- PHP syntax errors
- Missing PHP extensions
- Incorrect file permissions
- .htaccess errors

**Solutions**:
```bash
# Check Apache error logs
sudo tail -f /var/log/apache2/error.log

# Check PHP version
php -v

# Install missing extensions
sudo apt install php8.2-mysql php8.2-mbstring php8.2-xml

# Fix permissions
sudo chown -R www-data:www-data /var/www/hrms
```

---

### Database Connection Failed
**Causes**:
- Incorrect credentials
- MySQL not running
- Host/port misconfigured

**Solutions**:
```bash
# Check MySQL status
sudo systemctl status mysql

# Test connection
mysql -u username -p -h localhost database_name

# Verify config in database.php
cat /var/www/hrms/api/config/database.php
```

---

### CORS Errors
**Cause**: Backend not allowing frontend origin

**Solution**: Update backend CORS headers
```php
// In each API endpoint
header('Access-Control-Allow-Origin: https://yourdomain.com');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

---

### Blank Page After Deployment
**Causes**:
- Incorrect base path
- Missing .htaccess
- JavaScript errors

**Solutions**:
1. Check browser console (F12)
2. Verify .htaccess exists
3. Clear browser cache (Ctrl+Shift+R)
4. Check Apache error logs

---

## 💰 Cost Comparison

### Local (XAMPP)
- **Cost**: Free
- **Best for**: Development, testing
- **Pros**: Quick setup, full control
- **Cons**: Not accessible online

### Shared Hosting
- **Cost**: $3-10/month
- **Best for**: 10-50 employees
- **Pros**: Easy to manage, affordable
- **Cons**: Limited resources, shared IP

### VPS
- **Cost**: $5-50/month
- **Best for**: 50-500 employees
- **Pros**: Dedicated resources, full control
- **Cons**: Requires technical knowledge

### Cloud
- **Cost**: $10-500+/month
- **Best for**: 500+ employees
- **Pros**: Scalable, reliable
- **Cons**: Complex setup, variable costs

---

## 📊 Recommended Hosting by Company Size

| Company Size | Recommended Hosting | Monthly Cost | Setup Difficulty |
|-------------|---------------------|--------------|------------------|
| 1-10 employees | XAMPP Local | Free | Easy |
| 10-50 employees | Shared Hosting | $3-10 | Easy |
| 50-200 employees | VPS (DigitalOcean) | $10-20 | Medium |
| 200-500 employees | VPS + Load Balancer | $30-50 | Hard |
| 500+ employees | Cloud (AWS/Azure) | $100+ | Expert |

---

## 🆘 Support Resources

### Official Documentation
- [Apache Documentation](https://httpd.apache.org/docs/)
- [PHP Manual](https://www.php.net/manual/en/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)

### Community Support
- Stack Overflow
- DigitalOcean Community
- Reddit: r/webhosting, r/selfhosted

### Monitoring Tools
- [UptimeRobot](https://uptimerobot.com/) - Free uptime monitoring
- [Google PageSpeed Insights](https://pagespeed.web.dev/) - Performance testing
- [SSL Labs](https://www.ssllabs.com/ssltest/) - SSL configuration testing

---

## 🚀 Quick Start Commands Summary

### Local Deployment (XAMPP)
```powershell
.\deploy.ps1
```

### Shared Hosting
1. Build: `npm run build:prod`
2. Upload via cPanel File Manager
3. Import database via phpMyAdmin
4. Update config files

### VPS (Ubuntu)
```bash
# Install LAMP
sudo apt update && sudo apt upgrade -y
sudo apt install apache2 mysql-server php8.2 -y

# Deploy app
cd /var/www/html
git clone your-repo
npm run build:prod

# Configure & start
sudo systemctl restart apache2
```

### Docker
```bash
docker-compose up -d
```

---

**Last Updated**: October 24, 2025  
**Version**: 1.0.0  
**Tested On**: Windows 10/11, Ubuntu 22.04, Apache 2.4, PHP 8.2, MySQL 8.0
