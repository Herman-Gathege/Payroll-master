# 🚀 Organization Signup & Email System - Complete Guide

## ✅ What Was Implemented

### **1. Organization Self-Registration**
New tenants can create their own organization accounts with:
- Organization details (name, code, subscription plan)
- Admin user account creation
- Automatic department & position setup
- 30-day free trial

### **2. Email System (PHPMailer)**
Automated emails for:
- **Welcome emails** to new organization admins
- **Employee onboarding emails** with login credentials
- **Payslip delivery** to employee emails (work or personal)
- All emails use professional HTML templates

### **3. Payroll Email Integration**
Payroll system automatically emails payslips to employees using their onboarding email addresses.

---

## 📋 Prerequisites

### **1. Install PHPMailer**
```bash
# Navigate to backend folder
cd backend

# Install PHPMailer via Composer
composer require phpmailer/phpmailer

# OR download manually from: https://github.com/PHPMailer/PHPMailer
# Extract to backend/phpmailer/
```

### **2. SMTP Configuration**
You need an SMTP email account. Options:

**Option A: Gmail (Recommended for Testing)**
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password

**Option B: Other SMTP Providers**
- **SendGrid** - 100 emails/day free
- **Mailgun** - 5,000 emails/month free  
- **AWS SES** - Very cheap
- **cPanel Email** - If hosting supports it

---

## 🔧 Setup Instructions

### **Step 1: Install PHPMailer**

#### Using Composer (Recommended):
```bash
cd C:\Users\ianos\work\PHP\Payroll-master\backend
composer require phpmailer/phpmailer
```

#### Manual Installation:
```bash
# Download PHPMailer
# https://github.com/PHPMailer/PHPMailer/archive/refs/heads/master.zip

# Extract to:
# backend/phpmailer/
```

### **Step 2: Configure SMTP Settings**

Edit `backend/utils/EmailService.php` (lines 51-55):

```php
$this->mailer->Host       = 'smtp.gmail.com'; // Your SMTP host
$this->mailer->Username   = 'your-email@gmail.com'; // Your email
$this->mailer->Password   = 'your-app-password'; // 16-char app password
$this->mailer->Port       = 587;

// Sender info
$this->from_email = 'noreply@yourcompany.com'; // From email
$this->from_name  = 'Payroll System'; // From name
```

**For Production (Environment Variables):**
Create `.env` file in backend folder:
```env
SMTP_HOST=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_PORT=587
FROM_EMAIL=noreply@yourcompany.com
FROM_NAME=Payroll System
```

### **Step 3: Update Database Schema**

```bash
# Add missing columns for organization signup
mysql -u root -p payroll_system < database/update_organizations_signup.sql

# Add email support tables (already done if you ran add_onboarding_tables.sql)
mysql -u root -p payroll_system < database/add_onboarding_tables.sql
```

### **Step 4: Build Frontend with Signup Page**

```bash
cd frontend
npm run build
```

Copy `dist/` folder to your web server.

### **Step 5: Test Email Configuration**

Create `backend/test_email.php`:
```php
<?php
require_once 'utils/EmailService.php';

$emailService = new EmailService();
$result = $emailService->testConnection();

if ($result['success']) {
    echo "✅ SMTP Connection Successful!\n";
} else {
    echo "❌ SMTP Connection Failed: " . $result['message'] . "\n";
}
?>
```

Run:
```bash
cd backend
php test_email.php
```

---

## 🎯 Complete User Flow

### **Flow 1: Organization Signup**
```
1. User visits /signup
2. Fills organization details:
   - Organization Name: "Acme Corporation"
   - Organization Code: "ACME001"
   - Subscription Plan: "Trial"
3. Fills admin details:
   - Name: "John Doe"
   - Email: "john@acmecorp.com"
   - Username: "john.admin"
   - Password: "Secure@2025!"
4. Submits form
5. Backend:
   - Creates organization
   - Creates admin user
   - Creates default departments (HR, Finance, IT, etc.)
   - Creates default positions (Manager, Supervisor, etc.)
   - Sends welcome email
   - Logs signup in audit trail
6. User sees success message
7. User clicks "Go to Login"
8. User logs in with credentials
9. User lands on /employer/dashboard
```

### **Flow 2: Employee Onboarding with Email**
```
1. Admin navigates to /employer/employees
2. Clicks "Add Employee"
3. Fills employee details:
   - Name: "Jane Smith"
   - Email: "jane.smith@gmail.com" (work_email or personal_email)
   - National ID: "12345678"
   - Department: "IT"
   - Position: "Software Developer"
4. Checks "Create Login Account"
5. Checks "Send Welcome Email"
6. Submits form
7. Backend:
   - Generates employee number (ACME-2025-001)
   - Creates employee record
   - Creates login account
   - Initializes leave balances
   - Sends welcome email to jane.smith@gmail.com
8. Jane receives email with:
   - Employee number
   - Username
   - Password
   - Link to employee portal
```

### **Flow 3: Payroll Email Delivery**
```
1. Admin navigates to /employer/payroll
2. Clicks "Generate Payroll for October 2025"
3. Backend processes payroll for all employees
4. Admin clicks "Send Payslip" for employee
5. Backend:
   - Gets employee email (work_email or personal_email)
   - Generates payslip data
   - Sends HTML email with:
     * Payslip summary (gross, deductions, net)
     * PDF attachment (optional)
   - Logs email sent in audit trail
6. Employee receives payslip email
7. Employee can view in email or download PDF
```

---

## 📧 Email Templates

### **1. Welcome Email (Organization Admin)**
- **Subject:** Welcome to Payroll System - {Organization Name}
- **Content:**
  - Welcome message
  - Organization name & code
  - Login credentials (username)
  - Link to dashboard
  - Trial period info (30 days)
  - List of features

### **2. Employee Onboarding Email**
- **Subject:** Welcome to {Organization Name} - Your Account Details
- **Content:**
  - Welcome message
  - Employee number
  - Username & password
  - Security warning (change password)
  - Link to employee portal
  - List of portal features

### **3. Payslip Email**
- **Subject:** Payslip for {Month Year}
- **Content:**
  - Greeting
  - Payslip period
  - Earnings table
  - Deductions table
  - Net pay (highlighted)
  - PDF attachment
  - Confidentiality notice

---

## 🧪 Testing Checklist

### **Test 1: Organization Signup**
```bash
# Frontend
1. Visit http://localhost:5173/signup
2. Fill form:
   - Org Name: Test Company Ltd
   - Org Code: TEST001
   - Plan: Trial
   - Admin: Test Admin / test@test.com / testadmin / Test@2025!
3. Click Complete Registration
4. ✅ Should see success message
5. ✅ Should receive welcome email at test@test.com
6. Click "Go to Login"
7. Login with: testadmin / Test@2025!
8. ✅ Should land on dashboard
```

### **Test 2: Employee Onboarding with Email**
```bash
# Backend API Test
curl -X POST http://localhost/api/api/employees.php \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Employee",
    "national_id": "99999999",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "phone_number": "+254700000000",
    "work_email": "your-test-email@gmail.com",
    "employment_type": "permanent",
    "hire_date": "2025-01-01",
    "create_login": true,
    "send_email": true
  }'

# ✅ Should receive employee onboarding email
# ✅ Check email has username and password
```

### **Test 3: Payslip Email**
```bash
# Backend API Test
curl -X POST http://localhost/api/api/payroll.php \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "send_payslip",
    "employee_id": 1,
    "month": 10,
    "year": 2025
  }'

# ✅ Should receive payslip email
# ✅ Check email has payslip details
```

---

## 🔒 Security Best Practices

### **1. SMTP Credentials**
```bash
# NEVER commit credentials to git
# Use environment variables

# .gitignore should include:
.env
backend/.env
backend/config/email.php
```

### **2. Email Rate Limiting**
```php
// Add to EmailService.php
private $rate_limit = 100; // emails per hour
private $sent_count = 0;

public function sendEmail() {
    if ($this->sent_count >= $this->rate_limit) {
        throw new Exception('Rate limit exceeded');
    }
    // ... send email
    $this->sent_count++;
}
```

### **3. Email Validation**
```php
// Already implemented in organization_signup.php
if (!filter_var($data->admin_email, FILTER_VALIDATE_EMAIL)) {
    // Reject invalid email
}
```

---

## 🐛 Troubleshooting

### **Issue: "SMTP connect() failed"**
**Cause:** Incorrect SMTP settings or firewall blocking port 587

**Solution:**
```bash
# Test SMTP connection
php backend/test_email.php

# Check firewall
telnet smtp.gmail.com 587

# Try alternative port
$this->mailer->Port = 465;
$this->mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
```

### **Issue: "Could not instantiate mail function"**
**Cause:** PHPMailer not installed

**Solution:**
```bash
# Install via Composer
cd backend
composer require phpmailer/phpmailer

# OR check manual installation path
# backend/phpmailer/PHPMailer.php should exist
```

### **Issue: Emails going to spam**
**Solution:**
1. Use a real domain email (not Gmail for production)
2. Add SPF record to DNS:
   ```
   v=spf1 include:_spf.google.com ~all
   ```
3. Add DKIM signature
4. Use professional email content (no spammy words)

### **Issue: "Class 'PHPMailer\PHPMailer\PHPMailer' not found"**
**Solution:**
```php
// Check autoload path in EmailService.php
$possible_paths = [
    __DIR__ . '/../../vendor/autoload.php',  // Composer
    __DIR__ . '/../vendor/autoload.php',
    __DIR__ . '/phpmailer/autoload.php'      // Manual
];
```

---

## 📊 Email Analytics

Track email delivery in `audit_log` table:

```sql
-- Check sent emails
SELECT 
    action,
    new_values->>'$.email' as recipient,
    new_values->>'$.period' as period,
    created_at
FROM audit_log
WHERE action IN ('payslip_emailed', 'welcome_email_sent', 'onboarding_email_sent')
ORDER BY created_at DESC
LIMIT 20;

-- Email statistics
SELECT 
    action,
    COUNT(*) as email_count,
    DATE(created_at) as date
FROM audit_log
WHERE action LIKE '%email%'
GROUP BY action, DATE(created_at)
ORDER BY date DESC;
```

---

## 🚀 Production Deployment

### **1. Update SMTP Settings**
```bash
# Use production SMTP service (SendGrid, Mailgun, AWS SES)
# Never use Gmail in production (rate limits)

# Set environment variables on server
export SMTP_HOST=smtp.sendgrid.net
export SMTP_USERNAME=apikey
export SMTP_PASSWORD=your-sendgrid-api-key
export FROM_EMAIL=noreply@yourcompany.com
```

### **2. Enable Email Queue (Optional)**
For high-volume email sending:

```php
// Add emails to queue instead of sending immediately
$redis->lpush('email_queue', json_encode([
    'type' => 'payslip',
    'to' => 'employee@company.com',
    'data' => $payroll_data
]));

// Worker process (run in background)
while (true) {
    $job = $redis->rpop('email_queue');
    if ($job) {
        $emailService->sendEmail(json_decode($job));
    }
    sleep(1);
}
```

### **3. Monitor Email Delivery**
```bash
# Check failed emails
SELECT * FROM audit_log 
WHERE action = 'email_failed' 
ORDER BY created_at DESC 
LIMIT 10;

# Set up alerts for failures
```

---

## ✅ Final Checklist

- [ ] PHPMailer installed (`composer require phpmailer/phpmailer`)
- [ ] SMTP credentials configured in `EmailService.php`
- [ ] Database updated (`update_organizations_signup.sql`)
- [ ] Frontend built with signup page (`npm run build`)
- [ ] SMTP connection tested (`php test_email.php`)
- [ ] Organization signup tested (frontend form)
- [ ] Welcome email received
- [ ] Employee onboarding email tested
- [ ] Payslip email tested
- [ ] Credentials removed from code (use `.env`)
- [ ] `.env` added to `.gitignore`
- [ ] Production SMTP service configured (not Gmail)
- [ ] Email templates customized with company branding
- [ ] Email delivery monitoring enabled

---

## 📞 Support

### **Email Not Sending?**
1. Check SMTP credentials
2. Run `php backend/test_email.php`
3. Check error logs: `backend/logs/error.log`
4. Verify firewall allows port 587/465
5. Check spam folder

### **Signup Not Working?**
1. Check database schema updated
2. Verify organization_code unique
3. Check console for errors (F12)
4. Test API directly: `curl -X POST ...`

### **Payslip Email Not Sending?**
1. Verify employee has work_email or personal_email
2. Check payroll record exists
3. Check audit_log for email attempts
4. Verify SMTP connection works

---

## 🎉 Success!

Your system now has:
- ✅ Organization self-registration
- ✅ Automatic welcome emails
- ✅ Employee onboarding emails
- ✅ Payslip email delivery
- ✅ Professional HTML email templates
- ✅ Complete audit trail
- ✅ No dead ends - every flow is complete

**Next Steps:**
1. Customize email templates with your branding
2. Set up production SMTP service
3. Enable email analytics dashboard
4. Add email notification preferences
5. Implement email templates editor (admin panel)
