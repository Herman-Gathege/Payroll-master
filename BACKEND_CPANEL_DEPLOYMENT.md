# 🔧 Backend Deployment to cPanel - Step by Step

This guide focuses specifically on deploying your PHP backend to cPanel.

---

## 📋 Prerequisites

✅ You have:
- cPanel access credentials
- Your backend files in `ready-to-upload\api\` folder
- Database created in cPanel
- 15-20 minutes

---

## 🎯 Quick Overview

```
Your Computer                    →    cPanel Server
ready-to-upload\api\             →    public_html\api\
├── employer/                    →    ├── employer/
├── employee/                    →    ├── employee/
├── config/                      →    ├── config/
├── models/                      →    ├── models/
└── ... (PHP files)              →    └── ... (PHP files)
```

---

## 📦 STEP 1: Login to cPanel

### 1.1 Access cPanel
Visit one of these URLs:
- **Option 1**: `https://yourdomain.com/cpanel`
- **Option 2**: `https://yourdomain.com:2083`
- **Option 3**: Use the login URL from your hosting provider

### 1.2 Enter Credentials
- **Username**: Your cPanel username
- **Password**: Your cPanel password

✅ **Step 1 Complete!** You're logged into cPanel.

---

## 📁 STEP 2: Upload Backend Files

### 2.1 Open File Manager

1. In cPanel dashboard, find the **"Files"** section
2. Click **"File Manager"**
3. A new tab opens showing your file structure

### 2.2 Navigate to public_html

1. In left sidebar, click **"public_html"**
2. This is your website's root directory

### 2.3 Create API Directory

1. Click **"+ Folder"** button at the top
2. In the popup:
   - **New Folder Name**: `api`
3. Click **"Create New Folder"**
4. You should see `api` folder appear

### 2.4 Enter API Directory

1. Double-click the `api` folder to open it
2. Now you're inside `public_html/api/`

### 2.5 Upload Backend Files

#### Option A: Upload via File Manager (Recommended)

1. Click **"Upload"** button at the top
2. In the upload page:
   - Click **"Select File"** or drag files
   - Navigate to: `C:\Users\ianos\work\PHP\Payroll-master\ready-to-upload\api\`
   - Select **ALL** files and folders
   - Wait for upload (watch progress bar)
3. Click **"Go Back to..."** when done

#### Option B: Upload as ZIP (Faster for Many Files)

1. **On your computer**, create a ZIP:
   ```powershell
   cd C:\Users\ianos\work\PHP\Payroll-master\ready-to-upload
   Compress-Archive -Path api\* -DestinationPath backend.zip
   ```

2. **In cPanel File Manager**:
   - Inside `public_html/api/`
   - Click **"Upload"**
   - Upload `backend.zip`
   - After upload, go back to File Manager

3. **Extract the ZIP**:
   - Right-click `backend.zip`
   - Select **"Extract"**
   - Confirm extraction
   - Delete `backend.zip` after extraction

### 2.6 Verify Upload

You should see these folders inside `public_html/api/`:
- ✅ `employer/`
- ✅ `employee/`
- ✅ `config/`
- ✅ `models/`
- ✅ `controllers/` (if present)
- ✅ `middleware/` (if present)
- ✅ Various `.php` files

✅ **Step 2 Complete!** Backend files are uploaded.

---

## 🗄️ STEP 3: Setup Database

### 3.1 Create Database

1. In cPanel, find **"Databases"** section
2. Click **"MySQL® Databases"**

3. Under **"Create New Database"**:
   - **New Database**: `hrms` (or `hr_management`)
   - Click **"Create Database"**
   - Click **"Go Back"**

4. **Important**: Note your full database name
   - Format: `username_hrms` (e.g., `john123_hrms`)
   - You'll need this exact name!

### 3.2 Create Database User

1. Scroll to **"MySQL Users"** section
2. Under **"Add New User"**:
   - **Username**: `hrms_user`
   - **Password**: Click **"Password Generator"**
   - **Copy the generated password** (SAVE IT!)
   - Click **"Use Password"**
   - Click **"Create User"**

3. **Important**: Note your full username
   - Format: `username_hrms_user` (e.g., `john123_hrms_user`)

### 3.3 Add User to Database

1. Scroll to **"Add User To Database"**
2. Select:
   - **User**: Your user (username_hrms_user)
   - **Database**: Your database (username_hrms)
3. Click **"Add"**

4. On the **"Manage User Privileges"** page:
   - Check **"ALL PRIVILEGES"** (first checkbox)
   - Click **"Make Changes"**

✅ **Step 3 Complete!** Database and user created.

---

## 📊 STEP 4: Import Database Schema

### 4.1 Open phpMyAdmin

1. In cPanel, find **"Databases"** section
2. Click **"phpMyAdmin"**
3. A new tab opens with phpMyAdmin interface

### 4.2 Select Database

1. On the **left sidebar**, click your database name
   - Should be: `username_hrms`
2. The main panel shows database is empty

### 4.3 Import Schema

1. Click **"Import"** tab at the top
2. Under **"File to import"**:
   - Click **"Choose File"**
   - Navigate to: `C:\Users\ianos\work\PHP\Payroll-master\ready-to-upload\database\`
   - Select **`schema.sql`**
3. Scroll down
4. Click **"Go"** button at bottom

### 4.4 Verify Import

After import completes:
- You should see: **"Import has been successfully finished"**
- On left sidebar, click your database name
- You should see **24 tables** appear:
  - `attendance`
  - `departments`
  - `employees`
  - `employer_users`
  - `employee_users`
  - `leave_requests`
  - `payroll`
  - `user_sessions`
  - ... and more

✅ **Step 4 Complete!** Database schema imported.

---

## ⚙️ STEP 5: Configure Database Connection

### 5.1 Edit Database Config

1. In **cPanel File Manager**, navigate to:
   - `public_html/api/config/`

2. Find **`database.php`** file

3. **Right-click** on `database.php`

4. Select **"Edit"** or **"Code Editor"**

5. Click **"Edit"** in the popup

### 5.2 Update Configuration

Replace the file content with your actual credentials:

```php
<?php
/**
 * Database Configuration
 * Updated: [Current Date]
 */

return [
    // Database connection settings
    'host' => 'localhost',  // Usually 'localhost', check with hosting provider
    
    // YOUR ACTUAL DATABASE NAME (includes username prefix)
    'database' => 'username_hrms',  // CHANGE THIS to your full database name
    
    // YOUR ACTUAL DATABASE USERNAME (includes username prefix)
    'username' => 'username_hrms_user',  // CHANGE THIS to your full username
    
    // YOUR ACTUAL DATABASE PASSWORD (from password generator)
    'password' => 'YOUR_GENERATED_PASSWORD_HERE',  // CHANGE THIS
    
    // Character set (don't change)
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    
    // PDO options (don't change)
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ],
];
```

### 5.3 Example Configuration

If your cPanel username is `john123` and you named things as suggested:

```php
return [
    'host' => 'localhost',
    'database' => 'john123_hrms',           // Your username + _hrms
    'username' => 'john123_hrms_user',      // Your username + _hrms_user
    'password' => 'aB3$xY9#mK2@qR8',        // Generated password
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ],
];
```

### 5.4 Save Changes

1. Click **"Save Changes"** button (top right)
2. Close the editor

✅ **Step 5 Complete!** Database connection configured.

---

## 🔐 STEP 6: Create Admin User

### 6.1 Open phpMyAdmin

1. Back in cPanel → **phpMyAdmin**
2. Select your database (`username_hrms`)

### 6.2 Run SQL Query

1. Click **"SQL"** tab at the top
2. Paste this SQL query:

```sql
INSERT INTO employer_users (
    username,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_active,
    created_at
) VALUES (
    'admin',
    'admin@yourdomain.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Admin',
    'User',
    'super_admin',
    1,
    NOW()
);
```

3. Click **"Go"** button

### 6.3 Verify Creation

- You should see: **"1 row inserted"**
- Click `employer_users` table in left sidebar
- You should see your admin user

**Login credentials created**:
- Username: `admin`
- Password: `password`
- ⚠️ **IMPORTANT**: Change this password after first login!

✅ **Step 6 Complete!** Admin user created.

---

## 🔒 STEP 7: Configure CORS (Security)

### 7.1 Update Employer Auth

1. In File Manager, navigate to:
   - `public_html/api/employer/`

2. Edit **`auth.php`**

3. Find these lines near the top:
```php
header('Access-Control-Allow-Origin: http://localhost:5173');
```

4. Change to your domain:
```php
header('Access-Control-Allow-Origin: https://yourdomain.com');
// Or if using subdomain:
// header('Access-Control-Allow-Origin: https://hr.yourdomain.com');
```

5. Save changes

### 7.2 Update Employee Auth

1. Navigate to: `public_html/api/employee/`
2. Edit **`auth.php`**
3. Make the same CORS change
4. Save changes

✅ **Step 7 Complete!** CORS configured for your domain.

---

## ✅ STEP 8: Test Backend

### 8.1 Test Database Connection

Create a test file to verify connection:

1. In File Manager, go to `public_html/api/`
2. Create new file: **"+ File"**
3. Name it: `test_connection.php`
4. Edit the file and paste:

```php
<?php
// Test database connection
require_once 'config/database.php';

try {
    $config = require 'config/database.php';
    $dsn = "mysql:host={$config['host']};dbname={$config['database']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['username'], $config['password'], $config['options']);
    
    echo "✅ Database connection successful!<br>";
    echo "Database: " . $config['database'] . "<br>";
    
    // Test query
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM employer_users");
    $result = $stmt->fetch();
    echo "Employer users found: " . $result['count'] . "<br>";
    
} catch (PDOException $e) {
    echo "❌ Connection failed: " . $e->getMessage();
}
?>
```

5. Save file
6. Visit: `https://yourdomain.com/api/test_connection.php`

**Expected output**:
```
✅ Database connection successful!
Database: username_hrms
Employer users found: 1
```

**If you see errors**: Check database credentials in `config/database.php`

### 8.2 Test Auth Endpoint

Visit: `https://yourdomain.com/api/employer/auth/verify.php`

**Expected**: JSON response like:
```json
{"success":false,"message":"No active session"}
```

**If 404 error**: Check that files uploaded correctly

### 8.3 Test API Structure

Check these URLs return something (not 404):
- `https://yourdomain.com/api/employer/auth/login.php`
- `https://yourdomain.com/api/employee/auth/login.php`

✅ **Step 8 Complete!** Backend is working!

---

## 🛡️ STEP 9: Secure Your Backend

### 9.1 Protect Config Directory

1. In File Manager, go to `public_html/api/config/`
2. Create new file: `.htaccess`
3. Edit and add:

```apache
# Deny direct access to config files
<Files *.php>
    Order allow,deny
    Deny from all
</Files>
```

4. Save

### 9.2 Delete Test File

1. Delete `test_connection.php` after testing
2. Right-click → Delete

### 9.3 Set Proper Permissions

1. Select `api` folder
2. Click **"Permissions"** at top
3. Recommended settings:
   - **Folders**: 755
   - **Files**: 644
4. Check **"Recurse into subdirectories"**
5. Click **"Change Permissions"**

✅ **Step 9 Complete!** Backend is secured.

---

## 📝 STEP 10: Final Configuration Notes

### Save These Details

Create a secure note with:

```
=================================
BACKEND CONFIGURATION DETAILS
=================================

Server URL: https://yourdomain.com
API Base URL: https://yourdomain.com/api

Database Details:
-----------------
Host: localhost
Database Name: username_hrms
Database User: username_hrms_user
Database Password: [YOUR_GENERATED_PASSWORD]

Admin Login:
-----------
Username: admin
Password: password (CHANGE IMMEDIATELY!)

phpMyAdmin:
----------
URL: https://yourdomain.com/phpmyadmin
(or yourdomain.com:2083/cpsess.../phpMyAdmin)

File Locations:
--------------
Backend: public_html/api/
Config: public_html/api/config/database.php
```

✅ **Step 10 Complete!** Documentation saved.

---

## 🎉 Backend Deployment Complete!

Your backend is now **live and functional**!

### ✅ What's Working:

- ✅ Backend files uploaded to cPanel
- ✅ Database created and configured
- ✅ Schema imported (24 tables)
- ✅ Admin user created
- ✅ Database connection working
- ✅ API endpoints accessible
- ✅ CORS configured
- ✅ Security hardened

### 🌐 Your API Endpoints:

**Employer APIs**:
- Login: `https://yourdomain.com/api/employer/auth/login.php`
- Verify: `https://yourdomain.com/api/employer/auth/verify.php`
- Logout: `https://yourdomain.com/api/employer/auth/logout.php`

**Employee APIs**:
- Login: `https://yourdomain.com/api/employee/auth/login.php`
- Verify: `https://yourdomain.com/api/employee/auth/verify.php`
- Logout: `https://yourdomain.com/api/employee/auth/logout.php`

---

## 🔄 Next Steps

### 1. Deploy Frontend
Now that backend is ready, deploy your frontend:
- Follow: `DEPLOY_TO_HOSTING.md` (Frontend section)
- Upload `ready-to-upload/frontend/*` to `public_html/`

### 2. Change Default Password
**CRITICAL**: Change admin password immediately!
- Login with: admin / password
- Navigate to Settings
- Change password to something strong

### 3. Test Everything
- Test employer login
- Test employee login
- Test dashboard loads
- Test API calls succeed

---

## 🐛 Troubleshooting

### Issue: "Database connection failed"

**Check**:
1. Database name includes username prefix: `username_hrms`
2. User name includes username prefix: `username_hrms_user`
3. Password copied correctly (no extra spaces)
4. Database exists in phpMyAdmin
5. User has ALL PRIVILEGES on database

**Fix**:
- Edit `config/database.php` with correct values
- Test with `test_connection.php`

---

### Issue: "404 Not Found" on API endpoints

**Check**:
1. Files uploaded to correct location: `public_html/api/`
2. Folder structure preserved during upload
3. File names are correct (case-sensitive on Linux)

**Fix**:
- Re-upload files
- Check folder structure matches source

---

### Issue: "500 Internal Server Error"

**Check**:
1. PHP syntax errors in files
2. File permissions (should be 644 for files, 755 for folders)
3. Missing PHP extensions

**Fix**:
- Check cPanel Error Log: cPanel → Errors
- View recent errors
- Fix reported issues

---

### Issue: "Access-Control-Allow-Origin" CORS error

**Check**:
1. CORS headers in API files
2. Origin matches your domain exactly

**Fix**:
```php
// In auth.php files
header('Access-Control-Allow-Origin: https://yourdomain.com');
header('Access-Control-Allow-Credentials: true');
```

---

## 📞 Getting Help

### cPanel Support
- Most hosting providers offer 24/7 support
- Access via: cPanel → Support
- Or hosting provider's website

### Common Support Requests:
- "Please enable PHP extension: pdo_mysql"
- "Please check why I'm getting 500 error"
- "Please verify my database connection settings"

---

## 💡 Pro Tips

1. **Backup First**: Before making changes, download a backup
2. **Test Connection**: Always test database connection first
3. **Check Error Logs**: cPanel → Errors shows recent issues
4. **Use Strong Passwords**: Never use simple passwords
5. **Document Changes**: Keep notes of what you change
6. **Test After Changes**: Verify everything still works

---

## ✨ Success!

Your backend is **deployed and operational**!

**Deployment Date**: __________  
**Domain**: __________  
**Deployed By**: __________

---

**Next**: Deploy your frontend to complete the full application!
