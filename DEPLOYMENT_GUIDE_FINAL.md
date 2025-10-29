# 🚀 COMPLETE DEPLOYMENT GUIDE - Multi-Tenant Payroll System

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ What You Have Ready:
- ✅ Frontend built (686 KB) with organization signup
- ✅ Backend with email system (PHPMailer)
- ✅ Multi-tenant database schema
- ✅ All files in `ready-to-upload/` folder
- ✅ Employee onboarding with email
- ✅ Payslip email delivery

---

## 🎯 DEPLOYMENT METHOD: cPanel (Recommended for You)

Based on your previous successful deployment, we'll use the same proven method.

---

## 📦 STEP 1: PREPARE FILES (5 minutes)

### 1.1 Configure SMTP Settings

**Edit:** `ready-to-upload\api\utils\EmailService.php`

**Find lines 51-56 and update:**

```php
// For Testing with Gmail:
$this->mailer->Host       = 'smtp.gmail.com';
$this->mailer->Username   = 'your-email@gmail.com';        // YOUR GMAIL
$this->mailer->Password   = 'xxxx xxxx xxxx xxxx';         // APP PASSWORD
$this->mailer->Port       = 587;

$this->from_email = 'noreply@yourcompany.com';
$this->from_name  = 'Your Company Payroll';
```

**How to Get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Enable 2-Factor Authentication (if not already)
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password
5. Paste in `EmailService.php`

**For Production (Optional - Better):**
```php
// SendGrid (100 emails/day free)
$this->mailer->Host       = 'smtp.sendgrid.net';
$this->mailer->Username   = 'apikey';
$this->mailer->Password   = 'YOUR_SENDGRID_API_KEY';
$this->mailer->Port       = 587;
```

### 1.2 Update Frontend API URL

**Edit:** `ready-to-upload\frontend\assets\js\index-*.js`

Find and replace:
```javascript
// Change from:
http://localhost/api/api/

// To:
https://yourdomain.com/api/api/
```

**OR** create a config file to avoid manual editing:

**Create:** `ready-to-upload\frontend\config.js`
```javascript
window.API_BASE_URL = 'https://yourdomain.com/api/api';
```

**Then update:** `ready-to-upload\frontend\index.html` (add before closing `</body>`):
```html
<script src="/config.js"></script>
```

### 1.3 Compress Files for Upload

**Windows PowerShell:**
```powershell
Compress-Archive -Path "ready-to-upload\*" -DestinationPath "payroll-system.zip" -Force
```

**Result:** `payroll-system.zip` (approximately 2-3 MB)

---

## 🌐 STEP 2: UPLOAD TO cPanel (10 minutes)

### 2.1 Login to cPanel
- URL: `https://yourdomain.com:2083` or `https://yourdomain.com/cpanel`
- Enter your cPanel credentials

### 2.2 Upload Files via File Manager

1. **Open File Manager** (cPanel → Files → File Manager)

2. **Navigate to public_html**
   - Click `public_html` folder
   - This is your web root

3. **Upload ZIP File**
   - Click "Upload" button (top right)
   - Select `payroll-system.zip`
   - Wait for upload to complete

4. **Extract Files**
   - Go back to File Manager
   - Right-click `payroll-system.zip`
   - Select "Extract"
   - Select "Extract Files"
   - Delete the ZIP after extraction

5. **Verify Structure**
   ```
   public_html/
   ├── api/              (Backend - PHP files)
   ├── frontend/         (React build)
   ├── database/         (SQL files)
   └── assets/           (Frontend assets)
   ```

### 2.3 Set Permissions

**In File Manager:**
1. Select `api` folder
2. Right-click → "Permissions"
3. Set to `755`
4. Check "Recurse into subdirectories"
5. Apply

---

## 🗄️ STEP 3: SETUP DATABASE (10 minutes)

### 3.1 Create Database

1. **cPanel → MySQL Databases**

2. **Create New Database:**
   - Database Name: `payroll_system` (or `youruser_payroll`)
   - Click "Create Database"
   - **Note the full database name** (e.g., `youruser_payroll`)

3. **Create Database User:**
   - Username: `payroll_admin`
   - Password: Generate strong password
   - Click "Create User"
   - **Save these credentials!**

4. **Add User to Database:**
   - Select the database
   - Select the user
   - Grant ALL PRIVILEGES
   - Click "Make Changes"

### 3.2 Import Database Schema

1. **cPanel → phpMyAdmin**

2. **Select your database** from left sidebar

3. **Click "Import" tab**

4. **Import files in ORDER:**

   **File 1:** `database/schema_fixed.sql`
   - Click "Choose File"
   - Select `schema_fixed.sql`
   - Click "Go"
   - Wait for success message

   **File 2:** `database/add_onboarding_tables.sql`
   - Same process
   - Adds audit log, leave types, notifications

   **File 3:** `database/update_organizations_signup.sql`
   - Same process
   - Updates organizations table

5. **Verify Tables Created:**
   - You should see 30+ tables
   - Check for: `organizations`, `employer_users`, `employees`, `employee_users`, `audit_log`

### 3.3 Update Database Configuration

**Edit:** `public_html/api/config/database.php`

**Update credentials:**
```php
<?php
class Database {
    private $host = "localhost";
    private $db_name = "youruser_payroll";      // YOUR FULL DATABASE NAME
    private $username = "youruser_payroll_admin"; // YOUR DATABASE USER
    private $password = "your-database-password"; // YOUR DATABASE PASSWORD
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
        }
        return $this->conn;
    }
}
?>
```

---

## 📧 STEP 4: INSTALL PHPMAILER (5 minutes)

### Option A: Via Composer (If Available)

**cPanel Terminal:**
```bash
cd public_html/api
composer install
```

### Option B: Manual Installation (Easier)

1. **Download PHPMailer:**
   - URL: https://github.com/PHPMailer/PHPMailer/archive/refs/heads/master.zip

2. **Upload to cPanel:**
   - Extract locally
   - Upload `PHPMailer-master` folder to `public_html/api/vendor/phpmailer/phpmailer/`

3. **Verify Structure:**
   ```
   public_html/api/vendor/phpmailer/phpmailer/
   ├── src/
   │   ├── PHPMailer.php
   │   ├── SMTP.php
   │   └── Exception.php
   └── ...
   ```

---

## 🔧 STEP 5: CONFIGURE .HTACCESS (5 minutes)

### 5.1 Frontend .htaccess

**Create:** `public_html/.htaccess`

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# React Router - Send all requests to index.html
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]
```

### 5.2 API .htaccess

**Create:** `public_html/api/.htaccess`

```apache
# Enable CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"

# Handle preflight requests
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Error handling
php_flag display_errors off
php_flag log_errors on
php_value error_log /home/youruser/public_html/api/error.log
```

---

## 🧪 STEP 6: TEST SYSTEM (15 minutes)

### Test 1: Database Connection

**Create:** `public_html/api/test_db.php`

```php
<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

if($db) {
    echo "✅ Database connected successfully!<br>";
    
    // Check tables
    $tables = $db->query("SHOW TABLES")->fetchAll();
    echo "✅ Found " . count($tables) . " tables<br>";
    
    // Check organizations table
    $check = $db->query("SHOW COLUMNS FROM organizations LIKE 'contact_email'")->fetch();
    echo $check ? "✅ Organizations table updated<br>" : "❌ Run update_organizations_signup.sql<br>";
    
} else {
    echo "❌ Database connection failed!";
}
?>
```

**Visit:** `https://yourdomain.com/api/test_db.php`

**Expected:**
```
✅ Database connected successfully!
✅ Found 35 tables
✅ Organizations table updated
```

### Test 2: SMTP Connection

**Create:** `public_html/api/test_email.php`

```php
<?php
require_once 'utils/EmailService.php';

$emailService = new EmailService();
$result = $emailService->testConnection();

header('Content-Type: application/json');
echo json_encode($result);
?>
```

**Visit:** `https://yourdomain.com/api/test_email.php`

**Expected:**
```json
{"success":true,"message":"SMTP connection successful"}
```

### Test 3: Organization Signup

**Visit:** `https://yourdomain.com/signup`

1. **Fill form:**
   - Organization Name: "Test Company Ltd"
   - Organization Code: "TEST001"
   - Plan: "Trial"
   - Admin Name: "Test Admin"
   - Email: "your-email@gmail.com"
   - Username: "testadmin"
   - Password: "Test@2025!"

2. **Submit**

3. **Check email** for welcome message

4. **Login** at `https://yourdomain.com/login`

5. **Should see dashboard**

### Test 4: Employee Creation

1. **Login as admin**
2. **Navigate to Employees → Add Employee**
3. **Fill form and check "Create Login Account"**
4. **Check email for employee credentials**
5. **Test employee login**

### Test 5: Payslip Email

1. **Generate payroll** for an employee
2. **Click "Send Payslip"**
3. **Check employee email**

---

## 🔒 STEP 7: SECURITY HARDENING (10 minutes)

### 7.1 Secure Database Credentials

**Create:** `public_html/api/.env`

```env
DB_HOST=localhost
DB_NAME=youruser_payroll
DB_USER=youruser_payroll_admin
DB_PASS=your-database-password

SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_PORT=587
```

**Update:** `public_html/api/config/database.php`

```php
<?php
// Load environment variables
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($value));
        }
    }
}

class Database {
    private $host = getenv('DB_HOST') ?: "localhost";
    private $db_name = getenv('DB_NAME');
    private $username = getenv('DB_USER');
    private $password = getenv('DB_PASS');
    // ... rest of class
}
?>
```

### 7.2 Protect Sensitive Files

**Update:** `public_html/api/.htaccess`

```apache
# Deny access to sensitive files
<FilesMatch "(\.env|\.log|composer\.json|composer\.lock)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Protect config directory
<Files "config.php">
    Order allow,deny
    Deny from all
</Files>
```

### 7.3 Delete Test Files

**Delete these files:**
- `public_html/api/test_db.php`
- `public_html/api/test_email.php`
- `public_html/api/test_system.php`
- `public_html/api/test_connection.php`

### 7.4 Enable HTTPS

**In cPanel:**
1. Go to "SSL/TLS Status"
2. Enable AutoSSL for your domain
3. Wait 5-10 minutes for certificate

**Or use Let's Encrypt:**
1. cPanel → "SSL/TLS"
2. Click "Manage AutoSSL"
3. Enable for your domain

---

## 📊 STEP 8: VERIFY DEPLOYMENT

### Checklist:

- [ ] Frontend loads at `https://yourdomain.com`
- [ ] Login page shows with Lixnet logo
- [ ] Signup link visible on login page
- [ ] Can create new organization
- [ ] Welcome email received
- [ ] Can login with new credentials
- [ ] Dashboard loads correctly
- [ ] Can add employee
- [ ] Employee onboarding email received
- [ ] Employee can login
- [ ] Can generate payroll
- [ ] Payslip email sent successfully
- [ ] All navigation works (no 404s)
- [ ] HTTPS is working (green padlock)

---

## 🐛 TROUBLESHOOTING

### Issue: "Database connection failed"

**Fix:**
1. Check credentials in `api/config/database.php`
2. Verify database user has ALL PRIVILEGES
3. Test with phpMyAdmin login

### Issue: "Class 'PHPMailer' not found"

**Fix:**
1. Verify `vendor/phpmailer/phpmailer/src/PHPMailer.php` exists
2. Check require path in `EmailService.php`
3. Try manual installation (Option B above)

### Issue: "SMTP connect() failed"

**Fix:**
1. Check Gmail App Password is correct
2. Try port 465 with SMTPS:
   ```php
   $this->mailer->Port = 465;
   $this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
   ```
3. Check server firewall allows port 587/465

### Issue: "404 on API calls"

**Fix:**
1. Check `.htaccess` in `api/` folder
2. Verify API URL in frontend config
3. Enable mod_rewrite in cPanel

### Issue: "Organization code already exists"

**Fix:**
- Use different organization code
- Or delete test organization from database:
  ```sql
  DELETE FROM organizations WHERE organization_code = 'TEST001';
  ```

### Issue: "Emails going to spam"

**Fix:**
1. Use real business email domain (not Gmail for production)
2. Add SPF record to DNS:
   ```
   v=spf1 include:_spf.google.com ~all
   ```
3. Use SendGrid or Mailgun for production

---

## 🎯 POST-DEPLOYMENT TASKS

### 1. Monitor Error Logs

**Check regularly:**
- `public_html/api/error.log`
- cPanel → "Errors" section

### 2. Backup Database

**Setup automatic backups:**
- cPanel → "Backup Wizard"
- Schedule daily backups
- Download weekly to local storage

### 3. Performance Optimization

**Enable caching:**
```apache
# In .htaccess
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 4. Setup Email Monitoring

**Track email delivery:**
- Check `audit_log` table for email records
- Monitor bounce rates
- Consider adding email tracking service

---

## 📞 QUICK REFERENCE

### Important URLs:
- **Frontend:** `https://yourdomain.com`
- **Login:** `https://yourdomain.com/login`
- **Signup:** `https://yourdomain.com/signup`
- **API:** `https://yourdomain.com/api/api/`
- **phpMyAdmin:** `https://yourdomain.com/phpmyadmin`
- **cPanel:** `https://yourdomain.com:2083`

### Important Files:
- **Database Config:** `api/config/database.php`
- **Email Config:** `api/utils/EmailService.php`
- **Environment:** `api/.env`
- **Error Log:** `api/error.log`

### Database Credentials:
- **Host:** localhost
- **Name:** youruser_payroll
- **User:** youruser_payroll_admin
- **Password:** [saved in password manager]

### SMTP Credentials:
- **Gmail:** your-email@gmail.com
- **App Password:** [16-character code]

---

## ✅ DEPLOYMENT COMPLETE!

Your multi-tenant payroll system is now **LIVE and FUNCTIONAL**:

✅ **Organization Signup** → Instant self-registration  
✅ **Email System** → Welcome, onboarding, payslip emails  
✅ **Multi-tenant** → Complete isolation per organization  
✅ **Employee Management** → Full onboarding with credentials  
✅ **Payroll Processing** → Email delivery to employees  
✅ **No Dead Ends** → All user flows complete  

### Next Steps:
1. Create your real organization account
2. Add your first employees
3. Process test payroll
4. Verify email delivery
5. Start using the system!

### Support Files:
- `COMPLETE_SYSTEM_READY.md` - Full system overview
- `EMAIL_SYSTEM_GUIDE.md` - Email configuration details
- `EMPLOYEE_ONBOARDING_GUIDE.md` - Employee management

**System is production-ready!** 🎉
