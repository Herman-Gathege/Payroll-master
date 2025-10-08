@echo off
echo ===================================
echo HR Management System - Database Setup
echo ===================================
echo.
echo This script will help you set up the database.
echo.
echo Please ensure MySQL is running on port 3306
echo.
pause

echo.
echo Step 1: Creating database and user...
echo.
echo Please enter your MySQL root password when prompted:
echo.

REM Adjust this path if your MySQL is installed elsewhere
set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

REM Check if MySQL exists at default location
if exist %MYSQL_PATH% (
    echo Found MySQL at default location
    %MYSQL_PATH% -u root -p < setup_database.sql
) else (
    echo MySQL not found at default location.
    echo Please run these commands manually in your MySQL client:
    echo.
    type setup_database.sql
    echo.
    pause
    goto schema_import
)

:schema_import
echo.
echo Step 2: Importing database schema...
echo Please enter your MySQL root password again:
echo.

if exist %MYSQL_PATH% (
    %MYSQL_PATH% -u root -p hr_management_system < database\schema.sql
) else (
    echo.
    echo Please import database\schema.sql manually in your MySQL client
    pause
    goto admin_user
)

:admin_user
echo.
echo Step 3: Creating admin user...
echo.

if exist %MYSQL_PATH% (
    %MYSQL_PATH% -u root -p < create_admin_user.sql
) else (
    echo Please run create_admin_user.sql manually in your MySQL client
    pause
)

echo.
echo ===================================
echo Database setup completed!
echo ===================================
echo.
echo Database: hr_management_system
echo User: hruser
echo Password: hr_password_123
echo.
echo Admin Login:
echo Username: admin
echo Password: admin123
echo.
echo Next steps:
echo 1. Start the backend: cd backend ^&^& php -S localhost:8000
echo 2. Open browser: http://localhost:3000
echo 3. Login with admin/admin123
echo.
pause
