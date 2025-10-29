# 🚀 Deploy to Your Hosting Site - Step by Step

This guide will walk you through deploying your HR Management System to a live hosting provider (shared hosting with cPanel).

---

## 📋 Before You Start

### What You Need:
- [ ] Hosting account with PHP 8.0+ and MySQL
- [ ] cPanel access (or FTP credentials)
- [ ] Domain name (optional but recommended)
- [ ] 10-30 minutes of time

### What You Have:
- ✅ Working local application
- ✅ Production-ready build configuration
- ✅ Database schema ready
- ✅ All files prepared

---

## 🎯 Quick Overview

```
Your Computer          →        Hosting Server
├── Frontend (React)   →   Upload to: public_html/
├── Backend (PHP)      →   Upload to: public_html/api/
└── Database (SQL)     →   Import via phpMyAdmin
```

---

## 📦 STEP 1: Build Your Frontend

### 1.1 Open PowerShell and navigate to your project

```powershell
cd C:\Users\ianos\work\PHP\Payroll-master
```

### 1.2 Build for production

```powershell
cd frontend
npm run build:prod
```

**Expected output:**
```
✓ 11633 modules transformed.
✓ built in ~20s
```

**Result:** A `dist/` folder with optimized files (~670 KB)

### 1.3 Verify the build

```powershell
ls dist
```

You should see:
- `index.html`
- `assets/` folder (with js, css, images)

✅ **Step 1 Complete!** Your frontend is built.

---

## 📁 STEP 2: Prepare Files for Upload

### 2.1 Create a deployment folder

```powershell
# Go back to project root
cd ..

# Create deployment folder
New-Item -Path "ready-to-upload" -ItemType Directory -Force

# Create subfolders
New-Item -Path "ready-to-upload\frontend" -ItemType Directory -Force
New-Item -Path "ready-to-upload\api" -ItemType Directory -Force
New-Item -Path "ready-to-upload\database" -ItemType Directory -Force
```

### 2.2 Copy frontend files

```powershell
# Copy built frontend
Copy-Item -Path "frontend\dist\*" -Destination "ready-to-upload\frontend\" -Recurse -Force
```

### 2.3 Copy backend files

```powershell
# Copy backend API
Copy-Item -Path "backend\*" -Destination "ready-to-upload\api\" -Recurse -Force -Exclude "test_*"
```

### 2.4 Copy database schema

```powershell
# Copy database file
Copy-Item -Path "database\schema.sql" -Destination "ready-to-upload\database\schema.sql"
```

### 2.5 Create .htaccess for frontend

Create a file `ready-to-upload\frontend\.htaccess` with this content:

```powershell
@"
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite everything else to index.html
  RewriteRule ^ index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Cache static assets
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
  <IfModule mod_headers.c>
    Header set Cache-Control "max-age=31536000, public"
  </IfModule>
</FilesMatch>

# Don't cache HTML
<FilesMatch "index\.html$">
  <IfModule mod_headers.c>
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </IfModule>
</FilesMatch>

# GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
"@ | Out-File -FilePath "ready-to-upload\frontend\.htaccess" -Encoding ASCII
```

✅ **Step 2 Complete!** Files are ready in `ready-to-upload/` folder.

---

## 🌐 STEP 3: Upload to Your Hosting

### Option A: Using cPanel File Manager (Recommended)

#### 3.1 Login to cPanel
- Go to: `https://yourdomain.com/cpanel` or `https://yourhostname.com:2083`
- Enter your username and password

#### 3.2 Open File Manager
- In cPanel, find and click **"File Manager"**
- You'll see `public_html/` folder

#### 3.3 Upload Frontend Files

1. **Navigate** to `public_html/`
2. **Click** "Upload" button at the top
3. **Select** all files from `ready-to-upload\frontend\` folder
4. **Wait** for upload to complete
5. **Verify** you see:
   - `index.html`
   - `.htaccess`
   - `assets/` folder

#### 3.4 Create API Directory

1. In `public_html/`, click **"+ Folder"**
2. Name it: `api`
3. Click "Create New Folder"

#### 3.5 Upload Backend Files

1. **Navigate** into `public_html/api/`
2. **Click** "Upload"
3. **Select** all files from `ready-to-upload\api\` folder
4. **Wait** for upload to complete
5. **Verify** you see:
   - `employer/` folder
   - `employee/` folder
   - `config/` folder
   - `models/` folder

### Option B: Using FTP Client (FileZilla)

#### 3.1 Download FileZilla
- Download from: https://filezilla-project.org/
- Install and open

#### 3.2 Connect to Your Server
- **Host**: ftp.yourdomain.com (or IP from hosting)
- **Username**: Your FTP username
- **Password**: Your FTP password
- **Port**: 21
- Click "Quickconnect"

#### 3.3 Upload Files
- **Left panel**: Navigate to `ready-to-upload\frontend\`
- **Right panel**: Navigate to `/public_html/`
- **Drag & drop** all frontend files to right panel
- **Create folder** `api` in `/public_html/`
- **Upload** backend files to `/public_html/api/`

✅ **Step 3 Complete!** Files are uploaded to your hosting.

---

## 🗄️ STEP 4: Setup Database

### 4.1 Create Database

1. In cPanel, find **"MySQL Databases"**
2. Under "Create New Database":
   - Database Name: `hrms` or `hr_management`
   - Click "Create Database"
3. **Note down** the full database name (usually `username_hrms`)

### 4.2 Create Database User

1. Scroll to "MySQL Users"
2. Under "Add New User":
   - Username: `hrms_user`
   - Password: Click "Generate Password" (copy it!)
   - Click "Create User"
3. **Save these credentials** securely!

### 4.3 Add User to Database

1. Scroll to "Add User To Database"
2. Select your user and database
3. Click "Add"
4. On privileges page, check **"ALL PRIVILEGES"**
5. Click "Make Changes"

### 4.4 Import Database Schema

1. In cPanel, find **"phpMyAdmin"**
2. Click to open phpMyAdmin
3. On left sidebar, **click your database** (username_hrms)
4. Click **"Import"** tab at the top
5. Click **"Choose File"**
6. Select `ready-to-upload\database\schema.sql`
7. Scroll down and click **"Go"**
8. Wait for success message

### 4.5 Create Admin User

1. In phpMyAdmin, click **"SQL"** tab
2. Paste this SQL (replace with your details):

```sql
INSERT INTO employer_users (
    username, 
    email, 
    password_hash, 
    first_name, 
    last_name, 
    role, 
    is_active
) VALUES (
    'admin',
    'your-email@example.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Admin',
    'User',
    'super_admin',
    1
);
```

3. Click **"Go"**
4. You'll login with: `admin` / `password` (change password after first login!)

✅ **Step 4 Complete!** Database is ready.

---

## ⚙️ STEP 5: Configure Backend

### 5.1 Edit Database Configuration

1. In cPanel File Manager, navigate to: `public_html/api/config/`
2. **Right-click** on `database.php`
3. Click **"Edit"**
4. Update with your database credentials:

```php
<?php
return [
    'host' => 'localhost',  // Usually 'localhost'
    'database' => 'username_hrms',  // Your full database name
    'username' => 'username_hrms_user',  // Your database user
    'password' => 'your_strong_password',  // Password you created
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
];
```

5. Click **"Save Changes"**

### 5.2 Update CORS Settings (if needed)

If your domain is different from localhost:

1. Edit `public_html/api/employer/auth.php`
2. Find this line near the top:
```php
header('Access-Control-Allow-Origin: http://localhost:5173');
```
3. Change to your domain:
```php
header('Access-Control-Allow-Origin: https://yourdomain.com');
```
4. Repeat for `employee/auth.php`

### 5.3 Set Correct Permissions

In cPanel File Manager:
1. Select `api` folder
2. Click **"Permissions"** at top
3. Set to **755** for folders
4. Set to **644** for files
5. Click "Change Permissions"

✅ **Step 5 Complete!** Backend is configured.

---

## 🔧 STEP 6: Update Frontend API URL (If Using Domain)

### If your site is at a domain (not subdirectory):

You need to rebuild with production API URL.

1. **Edit** `frontend\.env.production`:
```bash
VITE_API_BASE_URL=https://yourdomain.com/api
```

2. **Rebuild**:
```powershell
cd frontend
npm run build:prod
```

3. **Re-upload** the `dist/` contents to `public_html/`

### If in subdirectory (like /hrms):

1. **Update** `.htaccess` RewriteBase:
```apache
RewriteBase /hrms/
```

2. **Update** frontend to use relative paths (already configured!)

✅ **Step 6 Complete!** URLs are configured.

---

## ✅ STEP 7: Test Your Deployment

### 7.1 Test Homepage

Visit: `https://yourdomain.com`

**Expected**: You should see the homepage (not blank!)

**If blank**: 
- Press F12 → Check Console for errors
- Verify `.htaccess` uploaded correctly
- Clear browser cache (Ctrl+Shift+R)

### 7.2 Test Employer Login

Visit: `https://yourdomain.com/employer/login`

- Username: `admin`
- Password: `password`

**Expected**: Login successful, redirect to dashboard

### 7.3 Test Employee Login

Visit: `https://yourdomain.com/employee/login`

- Username: (create one in database or use test data)

### 7.4 Test API Endpoint

Visit: `https://yourdomain.com/api/employer/auth/verify.php`

**Expected**: JSON response (not 404)

### 7.5 Check All Routes

- Click through navigation
- Refresh page on different routes
- Verify no 404 errors

✅ **Step 7 Complete!** Everything is tested.

---

## 🔒 STEP 8: Security & Optimization

### 8.1 Enable SSL (HTTPS)

**Most Important Step!**

1. In cPanel, find **"SSL/TLS Status"**
2. Click **"Run AutoSSL"**
3. Wait for certificate installation (2-5 minutes)
4. Your site will be accessible via HTTPS

### 8.2 Force HTTPS Redirect

Add to top of `.htaccess`:
```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 8.3 Change Default Password

1. Login as admin
2. Go to Settings → Change Password
3. Use a strong password!

### 8.4 Disable Directory Listing

Add to `.htaccess`:
```apache
Options -Indexes
```

### 8.5 Protect Config Files

Create `public_html/api/config/.htaccess`:
```apache
Deny from all
```

✅ **Step 8 Complete!** Site is secured.

---

## 📊 STEP 9: Setup Monitoring (Optional)

### 9.1 Uptime Monitoring

1. Sign up at: https://uptimerobot.com (FREE)
2. Add monitor:
   - Type: HTTP(s)
   - URL: `https://yourdomain.com`
   - Interval: 5 minutes
3. Add email alert

### 9.2 Error Logging

Check cPanel → **Error Log** regularly

### 9.3 Backup Setup

1. cPanel → **Backup**
2. Enable automatic backups
3. Download manual backup weekly

✅ **Step 9 Complete!** Monitoring is active.

---

## 🎉 Deployment Complete!

### Your Site is Live! 🚀

**Access Your Application:**
- **Homepage**: https://yourdomain.com
- **Employer Login**: https://yourdomain.com/employer/login
- **Employee Login**: https://yourdomain.com/employee/login

**Admin Credentials:**
- Username: `admin`
- Password: `password` (CHANGE THIS!)

---

## 📝 Post-Deployment Checklist

- [ ] Homepage loads correctly
- [ ] Employer login works
- [ ] Employee login works
- [ ] Dashboard displays data
- [ ] Navigation works
- [ ] Page refresh doesn't cause 404
- [ ] SSL certificate active (HTTPS)
- [ ] Default password changed
- [ ] Database backups enabled
- [ ] Uptime monitoring active
- [ ] Error logging checked
- [ ] Mobile responsive tested

---

## 🐛 Troubleshooting

### Issue: Blank White Screen

**Causes:**
- Missing `.htaccess`
- Incorrect file paths
- JavaScript errors

**Solutions:**
1. Check browser console (F12)
2. Verify `.htaccess` uploaded
3. Clear browser cache
4. Check file permissions (755/644)

---

### Issue: 404 on Page Refresh

**Cause:** mod_rewrite not working

**Solutions:**
1. Verify `.htaccess` has RewriteRule
2. Contact host to enable mod_rewrite
3. Check Apache allows .htaccess overrides

---

### Issue: Database Connection Failed

**Cause:** Wrong credentials

**Solutions:**
1. Verify database name includes prefix (username_hrms)
2. Check username includes prefix
3. Verify password is correct
4. Test connection in phpMyAdmin

---

### Issue: CORS Errors

**Cause:** Backend not allowing frontend origin

**Solution:**
Edit API files, update:
```php
header('Access-Control-Allow-Origin: https://yourdomain.com');
```

---

### Issue: 500 Internal Server Error

**Causes:**
- PHP syntax errors
- Wrong file permissions
- Missing PHP extensions

**Solutions:**
1. Check cPanel Error Log
2. Verify PHP version (8.0+)
3. Set permissions: 755 folders, 644 files
4. Check PHP extensions: mysqli, pdo, mbstring

---

## 🔄 Updating After Initial Deployment

### To Deploy Updates:

1. **Make changes** locally
2. **Test** locally: `npm run preview`
3. **Build**: `npm run build:prod`
4. **Upload** only changed files
5. **Test** on live site
6. **Clear** browser cache

### Quick Update Script:

```powershell
# Rebuild
cd frontend
npm run build:prod

# Upload via FTP or File Manager
# Only upload: dist/* to public_html/
```

---

## 💡 Pro Tips

1. **Always test locally first** with `npm run preview`
2. **Backup before updating** - Download files first
3. **Use version control** - Git helps track changes
4. **Monitor error logs** - Check weekly
5. **Keep PHP updated** - Security patches important
6. **Document changes** - Keep notes of what you modify
7. **Test on mobile** - Use responsive design mode
8. **Setup staging** - Test updates before production

---

## 📞 Need Help?

### Hosting Support
- Most hosting providers have 24/7 chat support
- Have your account number ready
- Describe the issue clearly

### Common Support Requests:
- "Please enable mod_rewrite for my domain"
- "Please install PHP extension: mbstring"
- "Please check why my domain shows 500 error"

### Documentation Reference:
- **Full guide**: HOSTING_GUIDE.md
- **Checklist**: DEPLOYMENT_CHECKLIST.md
- **Architecture**: HOSTING_ARCHITECTURE.md

---

## ✨ Success!

Your HR Management System is now **live and accessible** to the world!

**Share the URL** with your team and start using it! 🎊

---

**Deployment Date**: _____________  
**Domain**: _____________  
**Hosting Provider**: _____________  
**Database Name**: _____________  

**Keep this information secure!**
