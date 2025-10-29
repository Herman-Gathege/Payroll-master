@echo off
REM ============================================================================
REM Database Setup Script - Dual Login System
REM ============================================================================
REM This script sets up the new dual-login database schema
REM for the HR Management System
REM ============================================================================

echo.
echo ============================================================================
echo HR Management System - Dual Login Database Setup
echo ============================================================================
echo.

REM Configuration
set DB_HOST=localhost
set DB_NAME=hr_management_system
set DB_USER=hruser
set DB_PASS=hr_password_123

echo Configuration:
echo - Database Host: %DB_HOST%
echo - Database Name: %DB_NAME%
echo - Database User: %DB_USER%
echo.

REM Prompt for confirmation
set /p CONFIRM="Are you sure you want to proceed? (yes/no): "
if /i not "%CONFIRM%"=="yes" (
    echo Setup cancelled.
    pause
    exit /b
)

echo.
echo ============================================================================
echo Step 1: Creating Backup
echo ============================================================================
echo.

REM Create backup directory if it doesn't exist
if not exist "database\backups" mkdir "database\backups"

REM Create backup with timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set BACKUP_FILE=database\backups\backup_%datetime:~0,8%_%datetime:~8,6%.sql

echo Creating backup of existing database...
mysqldump -h %DB_HOST% -u %DB_USER% -p%DB_PASS% %DB_NAME% > "%BACKUP_FILE%" 2>nul

if %ERRORLEVEL% equ 0 (
    echo Backup created successfully: %BACKUP_FILE%
) else (
    echo Warning: Could not create backup. Database might not exist yet.
)

echo.
echo ============================================================================
echo Step 2: Creating/Updating Database
echo ============================================================================
echo.

REM Check if database exists
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% -e "USE %DB_NAME%;" 2>nul

if %ERRORLEVEL% equ 0 (
    echo Database '%DB_NAME%' exists.
    set /p DROP_DB="Do you want to DROP and recreate it? (yes/no): "
    if /i "%DROP_DB%"=="yes" (
        echo Dropping database...
        mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% -e "DROP DATABASE IF EXISTS %DB_NAME%;"
        mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% -e "CREATE DATABASE %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        echo Database recreated.
    ) else (
        echo Using existing database.
    )
) else (
    echo Creating new database...
    mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% -e "CREATE DATABASE %DB_NAME% CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    if %ERRORLEVEL% equ 0 (
        echo Database created successfully.
    ) else (
        echo Error: Failed to create database.
        pause
        exit /b 1
    )
)

echo.
echo ============================================================================
echo Step 3: Importing Schema
echo ============================================================================
echo.

echo Importing dual login schema...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% %DB_NAME% < "database\dual_login_schema.sql"

if %ERRORLEVEL% equ 0 (
    echo Schema imported successfully!
) else (
    echo Error: Failed to import schema.
    pause
    exit /b 1
)

echo.
echo ============================================================================
echo Step 4: Creating Default Admin User
echo ============================================================================
echo.

REM Create a temporary SQL file for admin user
echo Creating default admin user...

(
echo -- Create default admin user
echo INSERT INTO employer_users ^(
echo     organization_id, username, email, password_hash,
echo     first_name, last_name, role, is_active, email_verified
echo ^) VALUES ^(
echo     1, 'admin', 'admin@company.com',
echo     '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
echo     'System', 'Administrator', 'super_admin', TRUE, TRUE
echo ^) ON DUPLICATE KEY UPDATE username=username;
echo.
echo -- Create sample employee
echo INSERT INTO employees ^(
echo     organization_id, employee_number, first_name, last_name,
echo     national_id, kra_pin, date_of_birth, gender, phone_number,
echo     work_email, employment_type, employment_status, hire_date
echo ^) VALUES ^(
echo     1, 'EMP001', 'John', 'Doe',
echo     '12345678', 'A123456789Z', '1990-01-01', 'male', '0712345678',
echo     'john.doe@company.com', 'permanent', 'active', CURDATE^(^)
echo ^) ON DUPLICATE KEY UPDATE employee_number=employee_number;
echo.
echo -- Create employee user account
echo INSERT INTO employee_users ^(
echo     employee_id, username, email, password_hash,
echo     is_active, force_password_change
echo ^)
echo SELECT 
echo     id, 'john.doe', work_email,
echo     '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
echo     TRUE, TRUE
echo FROM employees
echo WHERE employee_number = 'EMP001'
echo ON DUPLICATE KEY UPDATE username=username;
) > database\temp_admin.sql

mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% %DB_NAME% < "database\temp_admin.sql"

if %ERRORLEVEL% equ 0 (
    echo Default users created successfully!
) else (
    echo Warning: Could not create default users.
)

REM Clean up temporary file
del database\temp_admin.sql

echo.
echo ============================================================================
echo Step 5: Verifying Installation
echo ============================================================================
echo.

echo Checking tables...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "SHOW TABLES;" > database\temp_tables.txt

findstr /C:"employer_users" database\temp_tables.txt >nul
if %ERRORLEVEL% equ 0 (
    echo [OK] employer_users table exists
) else (
    echo [ERROR] employer_users table missing
)

findstr /C:"employee_users" database\temp_tables.txt >nul
if %ERRORLEVEL% equ 0 (
    echo [OK] employee_users table exists
) else (
    echo [ERROR] employee_users table missing
)

findstr /C:"employees" database\temp_tables.txt >nul
if %ERRORLEVEL% equ 0 (
    echo [OK] employees table exists
) else (
    echo [ERROR] employees table missing
)

findstr /C:"organizations" database\temp_tables.txt >nul
if %ERRORLEVEL% equ 0 (
    echo [OK] organizations table exists
) else (
    echo [ERROR] organizations table missing
)

del database\temp_tables.txt

echo.
echo Checking default users...
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "SELECT COUNT(*) as employer_count FROM employer_users;" -s -N > database\temp_count.txt
set /p EMPLOYER_COUNT=<database\temp_count.txt
echo - Employer users: %EMPLOYER_COUNT%

mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASS% %DB_NAME% -e "SELECT COUNT(*) as employee_count FROM employee_users;" -s -N > database\temp_count.txt
set /p EMPLOYEE_COUNT=<database\temp_count.txt
echo - Employee users: %EMPLOYEE_COUNT%

del database\temp_count.txt

echo.
echo ============================================================================
echo Setup Complete!
echo ============================================================================
echo.
echo Database: %DB_NAME%
echo Host: %DB_HOST%
echo.
echo DEFAULT LOGIN CREDENTIALS (CHANGE IMMEDIATELY):
echo.
echo EMPLOYER LOGIN (Admin Portal):
echo   Username: admin
echo   Password: password
echo.
echo EMPLOYEE LOGIN (Self-Service Portal):
echo   Username: john.doe
echo   Password: password
echo.
echo IMPORTANT SECURITY NOTES:
echo - Change all default passwords immediately
echo - Review database\MIGRATION_GUIDE.md for next steps
echo - Configure your backend/config/database.php file
echo - Test both login portals before going live
echo.
echo Backup Location: %BACKUP_FILE%
echo.
echo ============================================================================

pause
