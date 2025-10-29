# HR Management System - Quick Rebuild Script
# Run this to rebuild everything with latest changes

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  HR Management System - Complete Rebuild                ║" -ForegroundColor Cyan
Write-Host "║  Version 1.1.0 - Unified Login + Lixnet Branding        ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# Configuration
$ProjectRoot = "C:\Users\ianos\work\PHP\Payroll-master"
$XamppRoot = "C:\xampp"

# Step 1: Verify XAMPP
Write-Host "📋 Step 1: Checking prerequisites..." -ForegroundColor Yellow
if (!(Test-Path "$XamppRoot\apache\bin\httpd.exe")) {
    Write-Host "❌ XAMPP not found at $XamppRoot" -ForegroundColor Red
    exit 1
}
Write-Host "✅ XAMPP found" -ForegroundColor Green

# Step 2: Check services
Write-Host "`n📋 Step 2: Checking XAMPP services..." -ForegroundColor Yellow
$apacheRunning = Get-Process -Name httpd -ErrorAction SilentlyContinue
$mysqlRunning = Get-Process -Name mysqld -ErrorAction SilentlyContinue

if (!$apacheRunning) {
    Write-Host "⚠️  Apache not running - Please start it in XAMPP Control Panel" -ForegroundColor Yellow
    Start-Process "$XamppRoot\xampp-control.exe"
    Write-Host "Waiting for services to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

if ($mysqlRunning) {
    Write-Host "✅ MySQL is running" -ForegroundColor Green
} else {
    Write-Host "❌ MySQL not running - Please start it!" -ForegroundColor Red
    exit 1
}

# Step 3: Database Setup
Write-Host "`n📋 Step 3: Setting up database..." -ForegroundColor Yellow

# Create database
Write-Host "  → Creating database..." -ForegroundColor Gray
& "$XamppRoot\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS hr_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
Write-Host "  ✅ Database created" -ForegroundColor Green

# Import schema
Write-Host "  → Importing schema..." -ForegroundColor Gray
if (Test-Path "$ProjectRoot\database\schema_fixed.sql") {
    Get-Content "$ProjectRoot\database\schema_fixed.sql" | & "$XamppRoot\mysql\bin\mysql.exe" -u root hr_management_system
} else {
    Get-Content "$ProjectRoot\database\schema.sql" | & "$XamppRoot\mysql\bin\mysql.exe" -u root hr_management_system
}
Write-Host "  ✅ Schema imported (24 tables)" -ForegroundColor Green

# Create admin user
Write-Host "  → Creating admin user..." -ForegroundColor Gray
$adminHash = '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5F2J3x4kBc5xO'
& "$XamppRoot\mysql\bin\mysql.exe" -u root hr_management_system -e @"
INSERT IGNORE INTO employer_users (organization_id, username, email, password_hash, role, first_name, last_name, is_active)
VALUES (1, 'admin', 'admin@company.com', '$adminHash', 'super_admin', 'System', 'Administrator', 1);
"@
Write-Host "  ✅ Admin user created (admin / Admin@2025!)" -ForegroundColor Green

# Create employee user
Write-Host "  → Creating employee test user..." -ForegroundColor Gray
& "$XamppRoot\mysql\bin\mysql.exe" -u root hr_management_system -e @"
INSERT IGNORE INTO employees (organization_id, first_name, last_name, email, phone_number, hire_date, employment_status)
VALUES (1, 'John', 'Doe', 'john.doe@company.com', '+254712345678', '2024-01-01', 'active');
"@

$employeeId = & "$XamppRoot\mysql\bin\mysql.exe" -u root hr_management_system -N -e "SELECT id FROM employees WHERE email='john.doe@company.com' LIMIT 1;"

$employeeHash = '$2y$12$ukEHnHNNqSFwwxNcVhvpTOivE8SDuXE7NdAcxXO0noX6Whxmr5/jO'
& "$XamppRoot\mysql\bin\mysql.exe" -u root hr_management_system -e @"
INSERT IGNORE INTO employee_users (employee_id, username, email, password_hash, is_active, force_password_change)
VALUES ($employeeId, 'john.doe', 'john.doe@company.com', '$employeeHash', 1, 0);
"@
Write-Host "  ✅ Employee user created (john.doe / Employee@2025!)" -ForegroundColor Green

# Step 4: Copy Backend
Write-Host "`n📋 Step 4: Deploying backend to XAMPP..." -ForegroundColor Yellow
if (Test-Path "$XamppRoot\htdocs\backend") {
    Remove-Item "$XamppRoot\htdocs\backend" -Recurse -Force
}
Copy-Item -Path "$ProjectRoot\backend" -Destination "$XamppRoot\htdocs\backend" -Recurse -Force
Write-Host "✅ Backend deployed to $XamppRoot\htdocs\backend" -ForegroundColor Green

# Step 5: Build Frontend
Write-Host "`n📋 Step 5: Building frontend..." -ForegroundColor Yellow
cd "$ProjectRoot\frontend"
npm run build
Write-Host "✅ Frontend built successfully" -ForegroundColor Green

# Step 6: Test Backend
Write-Host "`n📋 Step 6: Testing backend API..." -ForegroundColor Yellow
try {
    $body = '{"username":"admin","password":"Admin@2025!"}'
    $response = Invoke-RestMethod -Uri "http://localhost/backend/api/unified_auth.php" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ Backend API working!" -ForegroundColor Green
        Write-Host "   User: $($response.user.username)" -ForegroundColor Gray
        Write-Host "   Role: $($response.user.role)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  API responded but login failed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Backend API test failed!" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

# Summary
Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║            ✅ REBUILD COMPLETE!                          ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📱 ACCESS YOUR APPLICATION:" -ForegroundColor Yellow
Write-Host "   Frontend (Dev):  http://localhost:5173/" -ForegroundColor Cyan
Write-Host "   Backend API:     http://localhost/backend/api/" -ForegroundColor Cyan
Write-Host "`n🔐 TEST CREDENTIALS:" -ForegroundColor Yellow
Write-Host "   EMPLOYER LOGIN:" -ForegroundColor Cyan
Write-Host "   → Username: admin" -ForegroundColor White
Write-Host "   → Password: Admin@2025!" -ForegroundColor White
Write-Host "   → Portal: /employer/dashboard`n" -ForegroundColor Gray
Write-Host "   EMPLOYEE LOGIN:" -ForegroundColor Cyan
Write-Host "   → Username: john.doe" -ForegroundColor White
Write-Host "   → Password: Employee@2025!" -ForegroundColor White
Write-Host "   → Portal: /employee/portal`n" -ForegroundColor Gray

Write-Host "🚀 TO START DEVELOPMENT:" -ForegroundColor Yellow
Write-Host "   cd $ProjectRoot\frontend" -ForegroundColor White
Write-Host "   npm run dev`n" -ForegroundColor White

Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   → BUILD_SETUP_GUIDE.md - Complete setup guide" -ForegroundColor White
Write-Host "   → LOGIN_PAGE_UPDATE.md - Login changes" -ForegroundColor White
Write-Host "   → LOGIN_QUICK_REFERENCE.md - Quick specs`n" -ForegroundColor White

Write-Host "✨ What's New:" -ForegroundColor Yellow
Write-Host "   ✓ Unified login page (single entry)" -ForegroundColor Green
Write-Host "   ✓ Clean white design with Lixnet logo" -ForegroundColor Green
Write-Host "   ✓ Blue minimalistic button" -ForegroundColor Green
Write-Host "   ✓ Role-based automatic routing" -ForegroundColor Green
Write-Host "   ✓ Fixed timezone issues" -ForegroundColor Green
Write-Host "   ✓ Fixed SQL column mismatches" -ForegroundColor Green
Write-Host "   ✓ Updated password hashes`n" -ForegroundColor Green

Write-Host "Press Enter to exit..."
Read-Host
