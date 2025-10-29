# Hosting Guide - HR Management System

## Current Status

✅ **What's Working:**
- Employee Portal with sidebar navigation
- Employer Dashboard
- Dual login system (employer/employee)
- Employee profile endpoint
- 5 critical employer endpoints (employees, payroll summary, departments, positions, auth)
- Database schema fixes applied
- CORS configured for local development
- Token-based authentication

❌ **What's NOT Ready for Production:**
- Security hardening incomplete
- No HTTPS/SSL configuration
- Environment variables not properly configured
- Database credentials hardcoded
- No backup system
- No monitoring/logging system
- Missing production .htaccess rules
- No rate limiting on production
- Email notifications not configured
- File upload security not implemented
- No automated tests (0% coverage)

## Production Readiness: ~45%

---

## Hosting Options

### 1. **Shared Hosting** (Easiest - Recommended for Starting)

**Best for:** Small businesses, 1-50 employees

**Providers:**
- Hostinger (~$3/month)
- Bluehost (~$4/month)
- SiteGround (~$7/month)
- HostGator (~$3/month)

**Requirements:**
- PHP 8.0+ support
- MySQL/MariaDB database
- SSL certificate (usually included)
- SSH access (for deployment)
- Composer support

**Pros:**
- ✅ Affordable
- ✅ Easy setup
- ✅ Managed infrastructure
- ✅ SSL included

**Cons:**
- ❌ Limited resources
- ❌ Shared IP (can affect performance)
- ❌ Less control

---

### 2. **VPS Hosting** (More Control)

**Best for:** Growing businesses, 50-200 employees

**Providers:**
- DigitalOcean (~$6-12/month)
- Linode (~$5-10/month)
- Vultr (~$6-12/month)
- AWS Lightsail (~$5-10/month)

**Requirements:**
- Ubuntu 22.04 LTS or similar
- LAMP/LEMP stack knowledge
- Server administration skills

**Pros:**
- ✅ Full control
- ✅ Better performance
- ✅ Scalable
- ✅ Dedicated resources

**Cons:**
- ❌ Requires technical knowledge
- ❌ You manage security/updates
- ❌ More expensive

---

### 3. **Platform as a Service (PaaS)** (Recommended for Production)

**Best for:** Businesses wanting managed infrastructure

**Providers:**
- Heroku (~$7-25/month)
- Platform.sh (~$10-50/month)
- Google Cloud Run (pay-as-you-go)

**Pros:**
- ✅ Managed infrastructure
- ✅ Auto-scaling
- ✅ Built-in monitoring
- ✅ Easy deployments

**Cons:**
- ❌ More expensive
- ❌ Vendor lock-in

---

## Pre-Deployment Checklist

### 1. Security (CRITICAL)

```bash
# Create these files before deploying:

# backend/.env (NEVER commit to git)
DB_HOST=localhost
DB_NAME=your_database_name
DB_USER=your_db_user
DB_PASS=your_secure_password_here
APP_ENV=production
APP_DEBUG=false
JWT_SECRET=generate_random_64_char_string_here
CORS_ORIGIN=https://yourdomain.com
```

**Actions needed:**
- [ ] Move all credentials to environment variables
- [ ] Generate strong JWT secret key
- [ ] Disable debug mode (`APP_DEBUG=false`)
- [ ] Configure HTTPS/SSL certificate
- [ ] Set up firewall rules
- [ ] Change all default passwords
- [ ] Review file permissions (644 for files, 755 for directories)

### 2. Database

**Actions needed:**
- [ ] Export production database schema
- [ ] Create database backup script
- [ ] Set up automated daily backups
- [ ] Configure database user with limited privileges
- [ ] Enable MySQL slow query log for monitoring

```bash
# Create backup script
php backend/scripts/backup_database.php
```

### 3. Frontend Build

```bash
cd frontend
npm run build

# This creates a 'dist' folder with optimized files
# Upload these files to your web server
```

**Actions needed:**
- [ ] Update API URLs in production build
- [ ] Configure production environment variables
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets (optional)

### 4. Backend Configuration

**Create `.htaccess` in web root:**

```apache
# Redirect to HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security headers
Header set X-Frame-Options "SAMEORIGIN"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"

# Hide PHP version
Header unset X-Powered-By

# Disable directory browsing
Options -Indexes

# Protect sensitive files
<FilesMatch "\.(env|log|json|lock)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

### 5. Email Configuration

**Actions needed:**
- [ ] Configure SMTP settings
- [ ] Test password reset emails
- [ ] Test leave request notifications
- [ ] Set up email templates

### 6. File Structure on Server

```
/var/www/yourdomain.com/
├── public_html/               # Web root (frontend)
│   ├── index.html
│   ├── assets/
│   └── backend/              # Backend API
│       ├── api/
│       ├── config/
│       └── middleware/
├── storage/                  # Outside web root
│   ├── logs/
│   ├── uploads/
│   └── backups/
└── .env                      # Outside web root
```

---

## Deployment Steps

### Option A: Shared Hosting

1. **Upload Files via FTP/SFTP**
   ```bash
   # Use FileZilla or similar
   - Upload frontend/dist/* to public_html/
   - Upload backend/ to public_html/backend/
   ```

2. **Create Database**
   - Use cPanel/Plesk to create MySQL database
   - Import your SQL schema
   - Update connection details

3. **Configure Environment**
   - Create `.env` file with production settings
   - Update CORS origins
   - Test all endpoints

### Option B: VPS (DigitalOcean Example)

```bash
# 1. Create droplet (Ubuntu 22.04)
# 2. SSH into server
ssh root@your-server-ip

# 3. Install LAMP stack
apt update && apt upgrade -y
apt install apache2 mysql-server php8.2 php8.2-mysql php8.2-curl php8.2-mbstring -y

# 4. Enable required modules
a2enmod rewrite headers ssl
systemctl restart apache2

# 5. Clone/upload your code
cd /var/www/html
# Upload files via git or scp

# 6. Set permissions
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

# 7. Configure virtual host
nano /etc/apache2/sites-available/yourdomain.conf

# 8. Enable SSL (Let's Encrypt)
apt install certbot python3-certbot-apache -y
certbot --apache -d yourdomain.com
```

### Option C: Heroku

```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
heroku create your-app-name

# 4. Add MySQL addon
heroku addons:create cleardb:ignite

# 5. Deploy
git push heroku main

# 6. Set environment variables
heroku config:set APP_ENV=production
heroku config:set DB_HOST=...
```

---

## Post-Deployment

### 1. Testing Checklist

- [ ] Test employer login
- [ ] Test employee login
- [ ] Test password reset
- [ ] Test employee CRUD operations
- [ ] Test payroll calculations
- [ ] Test leave requests
- [ ] Test file uploads
- [ ] Test email notifications
- [ ] Load test with multiple users

### 2. Monitoring

**Set up monitoring for:**
- Server uptime
- Database performance
- Error logs
- API response times
- Disk space usage

**Tools:**
- UptimeRobot (free uptime monitoring)
- LogRocket (frontend error tracking)
- Sentry (backend error tracking)

### 3. Backups

**Automated backup script:**

```bash
#!/bin/bash
# /root/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/hr_system"

# Database backup
mysqldump -u user -p'password' hr_management_system > $BACKUP_DIR/db_$DATE.sql

# Files backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/html

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

**Add to crontab:**
```bash
0 2 * * * /root/backup.sh
```

---

## Security Best Practices

1. **Never commit sensitive data to git**
   ```bash
   # Add to .gitignore
   .env
   *.log
   /backend/config/config.php
   /storage/
   ```

2. **Use prepared statements** ✅ (Already implemented)

3. **Validate all inputs** ✅ (Partially implemented)

4. **Use HTTPS only**

5. **Implement rate limiting** (Not yet implemented)

6. **Regular security updates**
   ```bash
   # Update packages monthly
   composer update
   npm update
   ```

7. **Set strong password policies** ✅ (Implemented)

8. **Enable two-factor authentication** (Not implemented)

---

## Cost Estimate

### Small Business (1-50 employees)

**Shared Hosting:**
- Hosting: $3-7/month
- Domain: $10-15/year
- SSL: Free (Let's Encrypt)
- **Total: ~$50-100/year**

### Medium Business (50-200 employees)

**VPS Hosting:**
- VPS: $10-20/month
- Domain: $10-15/year
- Backups: $5/month
- Monitoring: $10/month (optional)
- **Total: ~$350-450/year**

### Enterprise (200+ employees)

**Managed Platform:**
- Platform.sh/Heroku: $25-100/month
- Database: $10-50/month
- Monitoring/Logging: $20-50/month
- CDN: $10-30/month
- **Total: ~$800-2500/year**

---

## Recommended Next Steps

### Before Hosting (Critical - Do First):

1. **Complete Security Configuration**
   ```bash
   php scripts/setup_production_config.php
   ```

2. **Run Security Audit**
   ```bash
   php scripts/security_audit.php
   ```

3. **Test Database Backups**
   ```bash
   php scripts/test_backup.php
   ```

4. **Generate Documentation**
   - User manual
   - Admin guide
   - API documentation

5. **Set Up Monitoring**
   - Error logging
   - Performance monitoring
   - Uptime monitoring

### After Hosting (Important):

1. **User Training**
   - Admin training
   - Employee portal walkthrough
   - Support documentation

2. **Data Migration**
   - Import existing employee data
   - Verify all records
   - Test system with real data

3. **Go-Live Checklist**
   - Announce to users
   - Monitor for 48 hours
   - Have rollback plan ready

---

## Support & Maintenance

### Ongoing Tasks:
- Weekly: Check error logs
- Monthly: Review security updates
- Monthly: Test backups
- Quarterly: Security audit
- Yearly: Performance review

### Estimated Maintenance Time:
- 2-5 hours/month for small deployments
- 10-20 hours/month for large deployments

---

## Conclusion

**Can you host this?**

**YES** - but complete these critical tasks first:

1. ✅ Fix remaining CORS issues (almost done!)
2. ⚠️ Move credentials to environment variables
3. ⚠️ Set up SSL certificate
4. ⚠️ Configure production database
5. ⚠️ Build frontend for production
6. ⚠️ Set up automated backups
7. ⚠️ Enable error logging
8. ⚠️ Test all functionality in production environment

**Recommended path:**
Start with **shared hosting** ($3-7/month) to learn the system, then migrate to **VPS** as you grow.

**Timeline to production:**
- With current state: **2-3 days** of focused work
- Including testing: **1 week**
- Including user training: **2 weeks**

---

## Need Help?

Common deployment services for Kenya:

1. **Truehost Kenya** - Local, good support
2. **Safaricom Cloud** - Enterprise-grade
3. **DigitalOcean** - International VPS
4. **Cloudways** - Managed cloud hosting

**Questions?** Check the troubleshooting section in `PRODUCTION_DEPLOYMENT_GUIDE.md`
