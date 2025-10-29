# 🚀 Complete Build & Setup Guide
## HR Management System with Unified Login

**Last Updated:** October 26, 2025  
**Version:** 1.1.0 with Unified Login + Lixnet Branding

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Database Setup](#database-setup)
4. [Backend Setup](#backend-setup)
5. [Frontend Build](#frontend-build)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Software
- **XAMPP** (Apache 2.4.58+ & MySQL 8.0+)
- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)
- **PHP** 8.2+

### Verify Installation
```powershell
# Check XAMPP
Test-Path "C:\xampp\apache\bin\httpd.exe"  # Should return True
Test-Path "C:\xampp\mysql\bin\mysql.exe"   # Should return True

# Check Node.js & npm
node --version   # Should show v18.x.x or higher
npm --version    # Should show v9.x.x or higher
```

---

## 🚀 Quick Start

### 1. Start XAMPP Services
```powershell
# Start Apache
& "C:\xampp\xampp_start.exe"

# OR use XAMPP Control Panel
# Start both Apache and MySQL
```

### 2. Verify Services Running
```powershell
$xamppPath = "C:\xampp\apache\bin\httpd.exe"
if (Test-Path $xamppPath) {
    $apacheRunning = Get-Process -Name httpd -ErrorAction SilentlyContinue
    $mysqlRunning = Get-Process -Name mysqld -ErrorAction SilentlyContinue
    
    if ($apacheRunning) { 
        Write-Host "✅ Apache is running" -ForegroundColor Green 
    } else { 
        Write-Host "❌ Apache not running" -ForegroundColor Red 
    }
    
    if ($mysqlRunning) { 
        Write-Host "✅ MySQL is running" -ForegroundColor Green 
    } else { 
        Write-Host "❌ MySQL not running" -ForegroundColor Red 
    }
}
```

---

## 🗄️ Database Setup

### Step 1: Create Database
```powershell
# Navigate to project root
cd C:\Users\ianos\work\PHP\Payroll-master

# Create database
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS hr_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 2: Import Schema
```powershell
# Import main schema (24 tables)
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system < database\schema.sql

# OR if you have the fixed schema
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system < database\schema_fixed.sql
```

### Step 3: Create Admin User
```powershell
# Option A: Using SQL file
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system < create_admin_user.sql

# Option B: Manual SQL
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system -e "
INSERT INTO employer_users (organization_id, username, email, password_hash, role, first_name, last_name, is_active)
VALUES (
    1,
    'admin',
    'admin@company.com',
    '\$2y\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5F2J3x4kBc5xO',
    'super_admin',
    'System',
    'Administrator',
    1
);
"
```

### Step 4: Create Employee Test User
```powershell
# First, create an employee record
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system -e "
INSERT INTO employees (organization_id, first_name, last_name, email, phone_number, hire_date, employment_status)
VALUES (1, 'John', 'Doe', 'john.doe@company.com', '+254712345678', '2024-01-01', 'active');
"

# Get the employee ID
$employeeId = & "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system -N -e "SELECT id FROM employees WHERE email='john.doe@company.com' LIMIT 1;"

# Create employee user account
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system -e "
INSERT INTO employee_users (employee_id, username, email, password_hash, is_active, force_password_change)
VALUES (
    $employeeId,
    'john.doe',
    'john.doe@company.com',
    '\$2y\$12\$ukEHnHNNqSFwwxNcVhvpTOivE8SDuXE7NdAcxXO0noX6Whxmr5/jO',
    1,
    0
);
"
```

### Step 5: Verify Database Tables
```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system -e "SHOW TABLES;"
```

**Expected Tables (24):**
- audit_log
- attendance
- benefit_enrollments
- benefits
- departments
- disciplinary_actions
- employee_users
- employees
- employer_users
- leave_balances
- leave_requests
- leave_types
- login_logs
- organizations
- payroll
- payroll_deductions
- performance_reviews
- positions
- recruitment_applications
- recruitment_postings
- tax_configurations
- training_records
- training_sessions
- user_sessions

### Step 6: Verify Test Users
```powershell
# Check employer user
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system -e "SELECT id, username, email, role FROM employer_users WHERE username='admin';"

# Check employee user
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system -e "SELECT id, username, email FROM employee_users WHERE username='john.doe';"
```

---

## 🔧 Backend Setup

### Step 1: Copy Backend to XAMPP
```powershell
# Copy entire backend folder
Copy-Item -Path "C:\Users\ianos\work\PHP\Payroll-master\backend\*" -Destination "C:\xampp\htdocs\backend\" -Recurse -Force

Write-Host "✅ Backend copied to XAMPP!" -ForegroundColor Green
```

### Step 2: Verify Critical Files
```powershell
# Check if key files exist
$files = @(
    "C:\xampp\htdocs\backend\api\unified_auth.php",
    "C:\xampp\htdocs\backend\config\database_secure.php",
    "C:\xampp\htdocs\backend\config\config.php"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - MISSING!" -ForegroundColor Red
    }
}
```

### Step 3: Test Backend API
```powershell
# Test admin login
$body = '{"username":"admin","password":"Admin@2025!"}'
$response = Invoke-RestMethod -Uri "http://localhost/backend/api/unified_auth.php" -Method POST -Body $body -ContentType "application/json"

if ($response.success) {
    Write-Host "✅ Admin login works!" -ForegroundColor Green
    Write-Host "   User: $($response.user.username)"
    Write-Host "   Role: $($response.user.role)"
} else {
    Write-Host "❌ Login failed!" -ForegroundColor Red
}
```

---

## 🎨 Frontend Build

### Step 1: Install Dependencies
```powershell
cd C:\Users\ianos\work\PHP\Payroll-master\frontend
npm install
```

### Step 2: Build for Production
```powershell
# Clean build
npm run build

# Expected output:
# ✓ 11633 modules transformed
# ✓ dist/ folder created with optimized assets
# Total size: ~670 KB (gzipped: ~190 KB)
```

### Step 3: Deploy to XAMPP
```powershell
# Option A: Copy dist to XAMPP htdocs
Copy-Item -Path "dist\*" -Destination "C:\xampp\htdocs\hrms\" -Recurse -Force

# Option B: Serve from project (development)
npm run dev
# Opens at http://localhost:5173/
```

---

## 🧪 Testing

### Test Admin Login
1. Open browser: `http://localhost:5173/` or `http://localhost/hrms/`
2. Enter credentials:
   - **Username:** `admin`
   - **Password:** `Admin@2025!`
3. Expected: Redirect to `/employer/dashboard`

### Test Employee Login
1. Open browser: `http://localhost:5173/` or `http://localhost/hrms/`
2. Enter credentials:
   - **Username:** `john.doe`
   - **Password:** `Employee@2025!`
3. Expected: Redirect to `/employee/portal`

### Backend API Tests
```powershell
# Test admin login
Invoke-RestMethod -Uri "http://localhost/backend/api/unified_auth.php" -Method POST -Body '{"username":"admin","password":"Admin@2025!"}' -ContentType "application/json"

# Test employee login
Invoke-RestMethod -Uri "http://localhost/backend/api/unified_auth.php" -Method POST -Body '{"username":"john.doe","password":"Employee@2025!"}' -ContentType "application/json"
```

---

## 🐛 Troubleshooting

### Issue 1: Database Connection Failed
**Error:** "Connection error: SQLSTATE[HY000]..."

**Solutions:**
```powershell
# 1. Check MySQL is running
Get-Process -Name mysqld -ErrorAction SilentlyContinue

# 2. Test connection
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "SELECT 1;"

# 3. Check database exists
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "SHOW DATABASES LIKE 'hr_management_system';"
```

### Issue 2: Timezone Error
**Error:** "Unknown or incorrect time zone: 'Africa/Nairobi'"

**Solution:** Already fixed in `database_secure.php` (uses UTC+3 offset)

### Issue 3: Column Not Found Errors
**Error:** "Unknown column 'd.department_name'"

**Solution:** Already fixed in `unified_auth.php` (uses correct column aliases)

### Issue 4: Login Failed - Invalid Credentials
**Error:** "Invalid username or password"

**Solutions:**
```powershell
# 1. Verify user exists
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system -e "SELECT username, is_active FROM employer_users;"

# 2. Reset admin password
$newHash = '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5F2J3x4kBc5xO'
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system -e "UPDATE employer_users SET password_hash='$newHash' WHERE username='admin';"

# 3. Reset employee password
$newHash = '$2y$12$ukEHnHNNqSFwwxNcVhvpTOivE8SDuXE7NdAcxXO0noX6Whxmr5/jO'
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system -e "UPDATE employee_users SET password_hash='$newHash' WHERE username='john.doe';"
```

### Issue 5: Port Already in Use
**Error:** "Port 5173 is already in use"

**Solutions:**
```powershell
# Find process using port 5173
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

# Kill the process or use different port
npm run dev -- --port 5174
```

### Issue 6: Apache Won't Start
**Error:** "Port 80 is already in use"

**Solutions:**
```powershell
# 1. Find what's using port 80
Get-NetTCPConnection -LocalPort 80

# 2. Stop IIS if running
Stop-Service -Name W3SVC -Force

# 3. Or change Apache port in httpd.conf
```

---

## 📦 Complete Rebuild Script

Save this as `rebuild.ps1`:

```powershell
# Complete Rebuild Script
Write-Host "`n🚀 HR Management System - Complete Rebuild`n" -ForegroundColor Cyan

# Step 1: Check prerequisites
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Yellow
if (!(Test-Path "C:\xampp\apache\bin\httpd.exe")) {
    Write-Host "❌ XAMPP not found!" -ForegroundColor Red
    exit
}

# Step 2: Start services
Write-Host "Step 2: Starting XAMPP services..." -ForegroundColor Yellow
Start-Process "C:\xampp\xampp-control.exe"
Start-Sleep -Seconds 3

# Step 3: Setup database
Write-Host "Step 3: Setting up database..." -ForegroundColor Yellow
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS hr_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system < "C:\Users\ianos\work\PHP\Payroll-master\database\schema.sql"
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system < "C:\Users\ianos\work\PHP\Payroll-master\create_admin_user.sql"

# Step 4: Copy backend
Write-Host "Step 4: Copying backend to XAMPP..." -ForegroundColor Yellow
Copy-Item -Path "C:\Users\ianos\work\PHP\Payroll-master\backend\*" -Destination "C:\xampp\htdocs\backend\" -Recurse -Force

# Step 5: Build frontend
Write-Host "Step 5: Building frontend..." -ForegroundColor Yellow
cd "C:\Users\ianos\work\PHP\Payroll-master\frontend"
npm run build

# Step 6: Test
Write-Host "`n✅ Rebuild complete!" -ForegroundColor Green
Write-Host "`nTest URLs:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173/" -ForegroundColor Cyan
Write-Host "  Backend: http://localhost/backend/api/" -ForegroundColor Cyan
Write-Host "`nTest Credentials:" -ForegroundColor Yellow
Write-Host "  Admin: admin / Admin@2025!" -ForegroundColor White
Write-Host "  Employee: john.doe / Employee@2025!`n" -ForegroundColor White
```

---

## 📝 Summary

### What's New in This Build
✅ Unified login page (single entry point)  
✅ Clean white design with Lixnet logo  
✅ Blue minimalistic button  
✅ Role-based automatic routing  
✅ Fixed timezone issues  
✅ Fixed SQL column name mismatches  
✅ Updated employee password hash  

### Default Credentials
| Role | Username | Password | Portal |
|------|----------|----------|--------|
| Admin | admin | Admin@2025! | /employer/dashboard |
| Employee | john.doe | Employee@2025! | /employee/portal |

### Key Files Changed
- `frontend/src/pages/Login.jsx` - Unified login UI
- `frontend/src/contexts/AuthContext.jsx` - Role detection
- `backend/api/unified_auth.php` - Unified authentication
- `backend/config/database_secure.php` - Timezone fix

---

**Need Help?** Check the troubleshooting section or review error logs:
- Apache: `C:\xampp\apache\logs\error.log`
- Browser Console: Press F12 > Console tab

---

*Built with ❤️ for Kenya-compliant HR management*
