# 🚀 QUICK DEPLOYMENT - Organization Signup & Login (No Email)

## ⚡ FAST TRACK: Get Organization Signup Working (30 minutes)

This guide focuses on deploying the system so organizations can signup and login. Email functionality can be added later.

---

## 📦 STEP 1: PREPARE FILES (2 minutes)

### Disable Email Temporarily

The system will work without SMTP configured - emails will fail silently without breaking functionality.

### Compress Files

**PowerShell:**
```powershell
Compress-Archive -Path "ready-to-upload\*" -DestinationPath "payroll-system.zip" -Force
```

---

## 🌐 STEP 2: UPLOAD TO cPanel (10 minutes)

1. **Login:** `https://yourdomain.com/cpanel`

2. **File Manager** → Navigate to `public_html`

3. **Upload** `payroll-system.zip`

4. **Right-click ZIP** → Extract → Extract Files

5. **Delete** ZIP after extraction

6. **Set Permissions:**
   - Select `api` folder
   - Right-click → Permissions → `755`
   - Check "Recurse into subdirectories"

**Verify Structure:**
```
public_html/
├── api/              (Backend PHP)
├── assets/           (Frontend assets)
├── index.html        (React app)
└── database/         (SQL files)
```

---

## 🗄️ STEP 3: SETUP DATABASE (10 minutes)

### 3.1 Create Database

**cPanel → MySQL Databases:**

1. **Create Database:** `payroll_system` (note the full name, e.g., `youruser_payroll`)
2. **Create User:** `payroll_admin` with strong password
3. **Add User to Database** with ALL PRIVILEGES
4. **Save these credentials!**

### 3.2 Import SQL Files (IMPORTANT: IN THIS ORDER!)

**cPanel → phpMyAdmin:**

1. Select your database from left sidebar
2. Click "Import" tab

**Import in this exact order:**

1. **First:** `database/schema_fixed.sql`
   - Click "Choose File" → Select file → "Go"
   - Wait for ✅ success message

2. **Second:** `database/add_onboarding_tables.sql`
   - Same process
   - Adds audit_log, leave types, notifications

3. **Third:** `database/update_organizations_signup.sql`
   - Same process
   - Updates organizations table for signup

**Verify:** You should see 30+ tables including:
- `organizations`
- `employer_users`
- `employee_users`
- `employees`
- `audit_log`

### 3.3 Update Database Config

**Edit in cPanel File Manager:** `public_html/api/config/database.php`

Find and update:
```php
private $host = "localhost";
private $db_name = "youruser_payroll";           // YOUR FULL DATABASE NAME
private $username = "youruser_payroll_admin";    // YOUR DATABASE USER
private $password = "your-database-password";    // YOUR PASSWORD
```

**Save the file.**

---

## 🔧 STEP 4: CONFIGURE .HTACCESS (5 minutes)

### 4.1 Frontend .htaccess

**Create/Edit:** `public_html/.htaccess`

```apache
# Force HTTPS (optional but recommended)
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# React Router - Send all non-API requests to index.html
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]
```

### 4.2 API .htaccess

**Create/Edit:** `public_html/api/.htaccess`

```apache
# Enable CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"

# Handle preflight requests
RewriteEngine On
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Security
php_flag display_errors off
php_flag log_errors on
```

---

## 🧪 STEP 5: TEST (5 minutes)

### Test 1: Database Connection

**Create:** `public_html/api/test_db.php`

```php
<?php
require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

if($db) {
    echo "<h2>✅ Database Connection Successful!</h2>";
    
    // Check tables
    $tables = $db->query("SHOW TABLES")->fetchAll();
    echo "<p>✅ Found " . count($tables) . " tables</p>";
    
    // Check organizations table structure
    $stmt = $db->query("SHOW COLUMNS FROM organizations");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if(in_array('contact_email', $columns)) {
        echo "<p>✅ Organizations table updated for signup</p>";
    } else {
        echo "<p>❌ Please run update_organizations_signup.sql</p>";
    }
    
    // Check employer_users table
    $check = $db->query("SELECT COUNT(*) FROM employer_users")->fetchColumn();
    echo "<p>✅ Employer users table ready (currently: $check users)</p>";
    
} else {
    echo "<h2>❌ Database Connection Failed!</h2>";
    echo "<p>Check your credentials in api/config/database.php</p>";
}
?>
```

**Visit:** `https://yourdomain.com/api/test_db.php`

**Expected Output:**
```
✅ Database Connection Successful!
✅ Found 35 tables
✅ Organizations table updated for signup
✅ Employer users table ready (currently: 0 users)
```

### Test 2: Frontend Loads

**Visit:** `https://yourdomain.com`

**Expected:** Login page with Lixnet logo and "Don't have an organization account? Create one here" link

### Test 3: Organization Signup API

**Visit:** `https://yourdomain.com/api/api/organization_signup.php`

**Expected:** 
```json
{"success":false,"message":"Invalid request method"}
```
(This means the API is accessible - it's rejecting GET requests, which is correct)

---

## 🎯 STEP 6: TEST ORGANIZATION SIGNUP

### Create Your First Organization

1. **Visit:** `https://yourdomain.com/signup`

2. **Fill the form:**
   ```
   Organization Details:
   - Organization Name: "Test Company Ltd"
   - Organization Code: "TEST001" (3-10 alphanumeric characters)
   - Subscription Plan: "Trial" (30 days free)
   - Contact Email: "admin@testcompany.com"
   - Contact Phone: "+1234567890" (optional)
   - Address: "123 Test Street" (optional)
   
   Admin Account:
   - Full Name: "John Admin"
   - Email: "john@testcompany.com"
   - Username: "johnadmin"
   - Password: "Admin@2025!"
   - Confirm Password: "Admin@2025!"
   ```

3. **Click through the steps** (3-step wizard)

4. **Submit on Review page**

5. **Success Screen** should show:
   - ✅ Organization created
   - Your credentials displayed
   - "Go to Login" button

### Test Login

1. **Click "Go to Login"** or visit `https://yourdomain.com/login`

2. **Login with:**
   - Username: `johnadmin`
   - Password: `Admin@2025!`

3. **Should see:** Dashboard with "Welcome to Test Company Ltd"

---

## ✅ VERIFICATION CHECKLIST

Check these work:

- [ ] `https://yourdomain.com` loads login page
- [ ] Login page shows "Create one here" link
- [ ] Clicking link goes to `/signup` page
- [ ] Signup form has 3 steps (Organization → Admin → Review)
- [ ] Can fill and submit form
- [ ] Success screen appears with credentials
- [ ] Can login with created credentials
- [ ] Dashboard loads with organization name
- [ ] Can navigate to Employees, Payroll, etc.

---

## 📧 ADDING EMAIL LATER (When Ready)

When you want to enable emails:

1. **Get Gmail App Password:**
   - Visit: https://myaccount.google.com/apppasswords
   - Enable 2FA → Create app password

2. **Edit:** `public_html/api/utils/EmailService.php` (lines 51-56)
   ```php
   $this->mailer->Username   = 'your-email@gmail.com';
   $this->mailer->Password   = 'your-app-password';
   ```

3. **Test email:**
   - Create test file: `public_html/api/test_email.php`
   ```php
   <?php
   require_once 'utils/EmailService.php';
   $emailService = new EmailService();
   $result = $emailService->testConnection();
   echo json_encode($result);
   ?>
   ```
   - Visit: `https://yourdomain.com/api/test_email.php`

4. **Done!** Emails will now send for:
   - Organization welcome emails
   - Employee onboarding emails
   - Payslip delivery

---

## 🐛 TROUBLESHOOTING

### Issue: "Database connection failed"

**Check:**
1. Database credentials in `api/config/database.php`
2. Database user has ALL PRIVILEGES in cPanel
3. Database name is correct (with prefix)

**Fix:**
```php
// In database.php, try adding:
error_reporting(E_ALL);
ini_set('display_errors', 1);
// Then visit test_db.php to see actual error
```

### Issue: "404 Not Found" on API calls

**Check:**
1. `.htaccess` file exists in `api/` folder
2. mod_rewrite is enabled (usually is on cPanel)

**Fix:**
```apache
# Add to api/.htaccess
RewriteEngine On
```

### Issue: Frontend loads but signup link doesn't work

**Check:**
1. `.htaccess` in root `public_html/` exists
2. React routing configured

**Fix:** Reload the page after clicking signup link

### Issue: "Organization code already exists"

**Solution:** Use different organization code or delete test organization:

```sql
-- In phpMyAdmin, run:
DELETE FROM organizations WHERE organization_code = 'TEST001';
DELETE FROM employer_users WHERE organization_id NOT IN (SELECT organization_id FROM organizations);
```

### Issue: Signup form submits but no success message

**Check browser console (F12) for errors:**
- Red errors in Console tab = JavaScript issue
- Red errors in Network tab = API issue

**Check API response:**
- Network tab → Find `organization_signup.php` request
- Click it → Response tab
- Should show JSON with success/error message

---

## 📊 DATABASE VERIFICATION

**In phpMyAdmin, verify signup worked:**

```sql
-- Check organization created
SELECT * FROM organizations ORDER BY created_at DESC LIMIT 1;

-- Check admin user created
SELECT eu.*, o.organization_name 
FROM employer_users eu 
JOIN organizations o ON eu.organization_id = o.organization_id 
ORDER BY eu.created_at DESC LIMIT 1;

-- Check default departments created
SELECT * FROM departments WHERE organization_id = (
    SELECT organization_id FROM organizations ORDER BY created_at DESC LIMIT 1
);

-- Check default positions created
SELECT * FROM positions WHERE organization_id = (
    SELECT organization_id FROM organizations ORDER BY created_at DESC LIMIT 1
);
```

**Expected:**
- 1 organization with your details
- 1 employer_user with role='super_admin'
- 5 default departments (HR, Finance, IT, Operations, Sales)
- 5 default positions (Manager, Supervisor, Executive, Officer, Assistant)

---

## 🎉 SUCCESS!

**If all tests pass, you now have:**

✅ Working organization self-registration
✅ Multi-tenant database with isolation
✅ Secure password hashing (BCrypt)
✅ 30-day trial period tracking
✅ Default departments and positions
✅ Admin login working
✅ Dashboard access
✅ Ready to add employees

**Next Steps:**
1. Delete `test_db.php` for security
2. Configure SMTP when ready
3. Start using the system!

---

## 📞 NEED HELP?

**Common commands to check status:**

```bash
# Check if database exists
mysql -u root -p -e "SHOW DATABASES LIKE '%payroll%';"

# Check tables in database
mysql -u root -p youruser_payroll -e "SHOW TABLES;"

# Check organizations
mysql -u root -p youruser_payroll -e "SELECT * FROM organizations;"
```

**System is ready! Focus on signup → login flow. Email can wait! 🚀**
