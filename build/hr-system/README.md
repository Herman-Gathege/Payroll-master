# HR Management System - Production Package

## Quick Start

### 1. Upload Files
Upload all files to your web server's public_html directory (or equivalent).

### 2. Database Setup
```bash
# Import database schema
mysql -u username -p database_name < database/schema.sql
```

### 3. Configure Environment
```bash
# Copy and edit .env file
cp backend/.env.example backend/.env
nano backend/.env
```

Update these values:
- DB_HOST, DB_NAME, DB_USER, DB_PASS
- APP_ENV=production
- APP_DEBUG=false
- CORS_ORIGIN=https://yourdomain.com

### 4. Set Permissions
```bash
chmod 644 backend/.env
chmod -R 755 backend/
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
```

### 5. Test
Visit: https://yourdomain.com
Login: admin / Admin@2025!

## File Structure
```
/
├── index.html          # Frontend entry point
├── assets/            # JS, CSS, images
├── backend/           # API backend
│   ├── api/          # API endpoints
│   ├── config/       # Configuration
│   └── .env.example  # Environment template
├── database/          # SQL schemas
└── .htaccess         # Apache configuration
```

## Support
See docs/ folder for detailed documentation.