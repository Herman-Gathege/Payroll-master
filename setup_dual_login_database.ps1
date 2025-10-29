# ============================================================================
# Database Setup Script - Dual Login System (PowerShell)
# ============================================================================
# This script sets up the new dual-login database schema
# for the HR Management System
# ============================================================================

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "HR Management System - Dual Login Database Setup" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$DB_HOST = "localhost"
$DB_NAME = "hr_management_system"
$DB_USER = "hruser"
$DB_PASS = "hr_password_123"

# Find MySQL executable
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysql.exe",
    "C:\wamp\bin\mysql\mysql8.0.31\bin\mysql.exe"
)

$MYSQL_PATH = $null
foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $MYSQL_PATH = $path
        break
    }
}

if (-not $MYSQL_PATH) {
    # Try to find in PATH
    $mysqlCmd = Get-Command mysql -ErrorAction SilentlyContinue
    if ($mysqlCmd) {
        $MYSQL_PATH = $mysqlCmd.Source
    }
}

if (-not $MYSQL_PATH) {
    Write-Host "ERROR: MySQL not found!" -ForegroundColor Red
    Write-Host "Please install MySQL or add it to your PATH" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common MySQL locations:" -ForegroundColor Yellow
    Write-Host "  - C:\Program Files\MySQL\MySQL Server 8.0\bin" -ForegroundColor Gray
    Write-Host "  - C:\xampp\mysql\bin" -ForegroundColor Gray
    Write-Host "  - C:\wamp64\bin\mysql\mysql*\bin" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Database Host: $DB_HOST"
Write-Host "  Database Name: $DB_NAME"
Write-Host "  Database User: $DB_USER"
Write-Host "  MySQL Path: $MYSQL_PATH"
Write-Host ""

# Prompt for confirmation
$confirm = Read-Host "Do you want to proceed? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Setup cancelled." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 0
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Step 1: Creating Backup" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Create backup directory
$backupDir = "database\backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

# Create backup with timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "$backupDir\backup_$timestamp.sql"

Write-Host "Creating backup of existing database..."
$mysqldumpPath = $MYSQL_PATH -replace "mysql.exe", "mysqldump.exe"

if (Test-Path $mysqldumpPath) {
    $backupArgs = "-h", $DB_HOST, "-u", $DB_USER, "-p$DB_PASS", $DB_NAME
    & $mysqldumpPath $backupArgs | Out-File -FilePath $backupFile -Encoding UTF8 2>$null
    
    if ($LASTEXITCODE -eq 0 -and (Test-Path $backupFile) -and (Get-Item $backupFile).Length -gt 0) {
        Write-Host "Backup created successfully: $backupFile" -ForegroundColor Green
    } else {
        Write-Host "Warning: Could not create backup. Database might not exist yet." -ForegroundColor Yellow
    }
} else {
    Write-Host "Warning: mysqldump not found. Skipping backup." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Step 2: Creating/Updating Database" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Check if database exists
$checkDbQuery = "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$DB_NAME';"
$checkArgs = "-h", $DB_HOST, "-u", $DB_USER, "-p$DB_PASS", "-e", $checkDbQuery
$dbExists = & $MYSQL_PATH $checkArgs 2>$null

if ($dbExists -match $DB_NAME) {
    Write-Host "Database '$DB_NAME' exists." -ForegroundColor Yellow
    $dropDb = Read-Host "Do you want to DROP and recreate it? (yes/no)"
    
    if ($dropDb -eq "yes") {
        Write-Host "Dropping database..." -ForegroundColor Yellow
        $dropQuery = "DROP DATABASE IF EXISTS $DB_NAME;"
        $dropArgs = "-h", $DB_HOST, "-u", $DB_USER, "-p$DB_PASS", "-e", $dropQuery
        & $MYSQL_PATH $dropArgs 2>$null
        
        Write-Host "Creating database..." -ForegroundColor Yellow
        $createQuery = "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        $createArgs = "-h", $DB_HOST, "-u", $DB_USER, "-p$DB_PASS", "-e", $createQuery
        & $MYSQL_PATH $createArgs 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database recreated successfully." -ForegroundColor Green
        } else {
            Write-Host "Error: Failed to recreate database." -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
    } else {
        Write-Host "Using existing database." -ForegroundColor Green
    }
} else {
    Write-Host "Creating new database..." -ForegroundColor Yellow
    $createQuery = "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    $createArgs = "-h", $DB_HOST, "-u", $DB_USER, "-p$DB_PASS", "-e", $createQuery
    & $MYSQL_PATH $createArgs 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database created successfully." -ForegroundColor Green
    } else {
        Write-Host "Error: Failed to create database." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Step 3: Importing Schema" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Importing dual login schema..."
$schemaFile = "database\dual_login_schema.sql"

if (-not (Test-Path $schemaFile)) {
    Write-Host "Error: Schema file not found: $schemaFile" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

$importArgs = "-h", $DB_HOST, "-u", $DB_USER, "-p$DB_PASS", $DB_NAME
Get-Content $schemaFile | & $MYSQL_PATH $importArgs 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "Schema imported successfully!" -ForegroundColor Green
} else {
    Write-Host "Error: Failed to import schema." -ForegroundColor Red
    Write-Host "Please check your database credentials and try again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Step 4: Verifying Installation" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking tables..."
$showTablesQuery = "SHOW TABLES;"
$showTablesArgs = "-h", $DB_HOST, "-u", $DB_USER, "-p$DB_PASS", $DB_NAME, "-e", $showTablesQuery
$tables = & $MYSQL_PATH $showTablesArgs 2>$null

$requiredTables = @("employer_users", "employee_users", "employees", "organizations", "payroll", "attendance")
foreach ($table in $requiredTables) {
    if ($tables -match $table) {
        Write-Host "[OK] $table table exists" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] $table table missing" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Checking default users..."
$countEmployerQuery = "SELECT COUNT(*) as count FROM employer_users;"
$countEmployerArgs = "-h", $DB_HOST, "-u", $DB_USER, "-p$DB_PASS", $DB_NAME, "-s", "-N", "-e", $countEmployerQuery
$employerCount = & $MYSQL_PATH $countEmployerArgs 2>$null

$countEmployeeQuery = "SELECT COUNT(*) as count FROM employee_users;"
$countEmployeeArgs = "-h", $DB_HOST, "-u", $DB_USER, "-p$DB_PASS", $DB_NAME, "-s", "-N", "-e", $countEmployeeQuery
$employeeCount = & $MYSQL_PATH $countEmployeeArgs 2>$null

Write-Host "  Employer users: $employerCount"
Write-Host "  Employee users: $employeeCount"

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database: $DB_NAME" -ForegroundColor Green
Write-Host "Host: $DB_HOST" -ForegroundColor Green
Write-Host ""
Write-Host "DEFAULT LOGIN CREDENTIALS (CHANGE IMMEDIATELY):" -ForegroundColor Yellow
Write-Host ""
Write-Host "EMPLOYER LOGIN (Admin Portal):" -ForegroundColor Cyan
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: password" -ForegroundColor White
Write-Host ""
Write-Host "EMPLOYEE LOGIN (Self-Service Portal):" -ForegroundColor Cyan
Write-Host "  Username: john.doe" -ForegroundColor White
Write-Host "  Password: password" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT SECURITY NOTES:" -ForegroundColor Red
Write-Host "  - Change all default passwords immediately" -ForegroundColor Yellow
Write-Host "  - Review database\MIGRATION_GUIDE.md for next steps" -ForegroundColor Yellow
Write-Host "  - Configure your backend/config/database.php file" -ForegroundColor Yellow
Write-Host "  - Test both login portals before going live" -ForegroundColor Yellow
Write-Host ""
if (Test-Path $backupFile) {
    Write-Host "Backup Location: $backupFile" -ForegroundColor Gray
}
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Cyan

Read-Host "Press Enter to exit"
