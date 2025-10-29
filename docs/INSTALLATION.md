# Installation Guide - HR Management System

## System Requirements

### Server Requirements
- **Operating System**: Linux (Ubuntu 20.04+), Windows Server 2016+, or macOS
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **PHP**: Version 7.4 or higher with extensions:
  - PDO
  - PDO_MySQL
  - OpenSSL
  - JSON
  - Mbstring
  - GD
- **Database**: MySQL 5.7+ or MariaDB 10.3+
- **Storage**: Minimum 5GB free space
- **RAM**: Minimum 2GB (4GB recommended)

### Development Requirements
- **Node.js**: Version 16.x or higher
- **npm**: Version 7.x or higher
- **Flutter**: Version 3.0 or higher (for mobile development)
- **Git**: For version control

## Step-by-Step Installation

### 1. Database Setup

#### 1.1 Create Database
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE hr_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create database user
CREATE USER 'hruser'@'localhost' IDENTIFIED BY 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON hr_management_system.* TO 'hruser'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

#### 1.2 Import Schema
```bash
mysql -u hruser -p hr_management_system < database/schema.sql
```

#### 1.3 Create Admin User
```sql
-- Login to MySQL
mysql -u hruser -p hr_management_system

-- Insert admin user (password: admin123 - change immediately!)
INSERT INTO users (username, email, password_hash, role, is_active)
VALUES ('admin', 'admin@yourcompany.com',
'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'admin', 1);
```

### 2. Backend Setup (PHP)

#### 2.1 Configure Database Connection
Edit `backend/config/database.php`:
```php
private $host = "localhost";
private $database_name = "hr_management_system";
private $username = "hruser";
private $password = "your_secure_password";
```

#### 2.2 Configure Application
Edit `backend/config/config.php`:

```php
// Generate a secure JWT secret key
define('JWT_SECRET_KEY', 'your-256-bit-secret-key-here');

// Set your base URL
define('BASE_URL', 'http://your-domain.com');

// Configure upload directory
define('UPLOAD_DIR', __DIR__ . '/../../uploads/');
```

Generate a secure JWT secret:
```bash
# Linux/Mac
openssl rand -base64 32

# Or use PHP
php -r "echo bin2hex(random_bytes(32));"
```

#### 2.3 Create Upload Directories
```bash
mkdir -p uploads/{documents,photos,payslips,certificates}
chmod -R 755 uploads/
```

#### 2.4 Configure Web Server

**Apache (.htaccess)**
Create `backend/.htaccess`:
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php/$1 [L]

# Security headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "SAMEORIGIN"
Header set X-XSS-Protection "1; mode=block"
```

**Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/hr-system/backend;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location /api {
        try_files $uri $uri/ /api/index.php?$query_string;
    }
}
```

#### 2.5 Start PHP Development Server (For Testing)
```bash
cd backend
php -S localhost:8000
```

### 3. Frontend Setup (React)

#### 3.1 Install Dependencies
```bash
cd frontend
npm install
```

#### 3.2 Configure Environment
Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=HR Management System
```

For production:
```env
VITE_API_BASE_URL=https://your-domain.com/api
VITE_APP_NAME=HR Management System
```

#### 3.3 Build for Production
```bash
npm run build
```

The built files will be in `frontend/dist/`

#### 3.4 Deploy Frontend
Copy the contents of `frontend/dist/` to your web server:
```bash
# For Apache/Nginx
cp -r frontend/dist/* /var/www/html/hr-system/
```

### 4. Mobile App Setup (Flutter)

#### 4.1 Install Flutter
Follow official Flutter installation guide: https://flutter.dev/docs/get-started/install

#### 4.2 Install Dependencies
```bash
cd mobile
flutter pub get
```

#### 4.3 Configure API Endpoint
Edit `mobile/lib/services/api_service.dart`:
```dart
static const String baseUrl = 'https://your-domain.com/api';
```

#### 4.4 Build Mobile App

**For Android:**
```bash
# Debug build
flutter build apk --debug

# Release build
flutter build apk --release

# The APK will be at: build/app/outputs/flutter-apk/app-release.apk
```

**For iOS:**
```bash
# Requires macOS with Xcode
flutter build ios --release
```

### 5. Post-Installation Configuration

#### 5.1 Configure Company Settings
Login as admin and navigate to Settings to configure:
- Company name and details
- Company KRA PIN
- Company NSSF number
- Company SHIF number
- Working hours
- Leave policies

#### 5.2 Create Departments and Positions
1. Navigate to Settings > Departments
2. Add all company departments
3. Navigate to Settings > Positions
4. Add job positions

#### 5.3 Configure Leave Types
Leave types are pre-configured with Kenyan standards:
- Annual Leave: 21 days
- Sick Leave: 14 days
- Maternity Leave: 90 days
- Paternity Leave: 14 days

Adjust as needed in Settings > Leave Types

#### 5.4 Set Up Tax Rates
Tax rates are pre-configured for Kenya 2024:
- PAYE: Progressive tax bands
- SHIF: 2.75% of gross salary
- NSSF: 6% up to KES 36,000
- Housing Levy: 1.5%

Update in `backend/config/config.php` if rates change.

### 6. Testing the Installation

#### 6.1 Test Backend API
```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

#### 6.2 Test Frontend
1. Open browser to `http://localhost:3000`
2. Login with admin credentials
3. Verify all menu items load

#### 6.3 Test Mobile App
1. Run the app on a device/emulator
2. Login with admin credentials
3. Test clock in/out functionality

### 7. Security Hardening

#### 7.1 Change Default Passwords
```sql
-- Update admin password
UPDATE users SET password_hash = '$2y$10$YOUR_NEW_HASHED_PASSWORD' WHERE username = 'admin';
```

#### 7.2 SSL/TLS Configuration
Install SSL certificate (Let's Encrypt recommended):
```bash
# Ubuntu with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### 7.3 Firewall Configuration
```bash
# Ubuntu UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

#### 7.4 File Permissions
```bash
# Set proper permissions
find backend -type f -exec chmod 644 {} \;
find backend -type d -exec chmod 755 {} \;
chmod -R 755 uploads/
```

### 8. Backup Configuration

#### 8.1 Database Backup Script
Create `backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/hr-system"
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u hruser -p'your_password' hr_management_system > $BACKUP_DIR/db_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

#### 8.2 Schedule Backups
```bash
# Add to crontab
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * /path/to/backup.sh
```

### 9. Troubleshooting

#### Common Issues

**Issue: Database connection failed**
- Verify MySQL is running: `sudo systemctl status mysql`
- Check credentials in `backend/config/database.php`
- Verify user has correct permissions

**Issue: API returns 404**
- Check web server configuration
- Verify .htaccess or nginx config is correct
- Check file permissions

**Issue: CORS errors in frontend**
- Verify CORS headers in `backend/config/config.php`
- Check API base URL in frontend `.env`

**Issue: Mobile app can't connect**
- Use your server's IP address, not localhost
- Check firewall allows connections on port 8000/80/443
- Verify SSL certificate if using HTTPS

### 10. Maintenance

#### Regular Tasks
- **Daily**: Check system logs
- **Weekly**: Review backup logs
- **Monthly**: Update dependencies
- **Quarterly**: Review and update tax rates
- **Annually**: Review compliance requirements

#### Update Process
```bash
# Backup first!
./backup.sh

# Update backend
cd backend
git pull origin main

# Update frontend
cd ../frontend
git pull origin main
npm install
npm run build

# Update mobile
cd ../mobile
git pull origin main
flutter pub get
flutter build apk --release
```

## Support

For technical support, please contact:
- Email: support@yourcompany.com
- Phone: +254 XXX XXX XXX

## Next Steps

After installation:
1. Change all default passwords
2. Configure company settings
3. Add departments and positions
4. Import employee data
5. Train HR staff on system usage
6. Roll out to employees

Congratulations! Your HR Management System is now installed and ready to use.
