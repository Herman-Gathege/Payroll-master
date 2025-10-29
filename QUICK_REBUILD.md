# 🚀 Quick Rebuild Instructions

## ⚡ One-Command Rebuild

```powershell
cd C:\Users\ianos\work\PHP\Payroll-master
.\rebuild.ps1
```

## 📝 Manual Step-by-Step (If Script Fails)

### 1. Start XAMPP
- Open XAMPP Control Panel
- Start **Apache** and **MySQL**

### 2. Setup Database
```powershell
cd C:\Users\ianos\work\PHP\Payroll-master

# Create database
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS hr_management_system;"

# Import schema
Get-Content "database\schema.sql" | & "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system

# Create admin (admin / Admin@2025!)
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system -e "INSERT IGNORE INTO employer_users (organization_id, username, email, password_hash, role, first_name, last_name, is_active) VALUES (1, 'admin', 'admin@company.com', '\$2y\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5F2J3x4kBc5xO', 'super_admin', 'System', 'Administrator', 1);"

# Create employee (john.doe / Employee@2025!)
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system -e "INSERT IGNORE INTO employees (organization_id, first_name, last_name, email, phone_number, hire_date, employment_status) VALUES (1, 'John', 'Doe', 'john.doe@company.com', '+254712345678', '2024-01-01', 'active');"

& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system -e "INSERT IGNORE INTO employee_users (employee_id, username, email, password_hash, is_active) SELECT id, 'john.doe', 'john.doe@company.com', '\$2y\$12\$ukEHnHNNqSFwwxNcVhvpTOivE8SDuXE7NdAcxXO0noX6Whxmr5/jO', 1 FROM employees WHERE email='john.doe@company.com' LIMIT 1;"
```

### 3. Copy Backend
```powershell
Copy-Item -Path "backend\*" -Destination "C:\xampp\htdocs\backend\" -Recurse -Force
```

### 4. Build Frontend
```powershell
cd frontend
npm install
npm run build
```

### 5. Test
```powershell
# Start dev server
npm run dev

# Or test backend directly
Invoke-RestMethod -Uri "http://localhost/backend/api/unified_auth.php" -Method POST -Body '{"username":"admin","password":"Admin@2025!"}' -ContentType "application/json"
```

## 🔐 Login Credentials

| Role | Username | Password | Portal |
|------|----------|----------|--------|
| **Admin** | admin | Admin@2025! | /employer/dashboard |
| **Employee** | john.doe | Employee@2025! | /employee/portal |

## 🌐 Access URLs

- **Development:** http://localhost:5173/
- **Backend API:** http://localhost/backend/api/
- **phpMyAdmin:** http://localhost/phpmyadmin/

## ✨ What's Included in This Build

✅ **Unified Login Page**
- Single entry point for both employer and employee
- Clean white background
- Lixnet logo prominently displayed
- Blue minimalistic button

✅ **Automatic Role Routing**
- Detects user role from backend
- Routes to appropriate portal
- Supports all employer roles (super_admin, admin, hr_manager, etc.)

✅ **Bug Fixes**
- ✅ Timezone error fixed (Africa/Nairobi → +03:00)
- ✅ SQL column names corrected (department_name → name, position_name → title)
- ✅ Employee password hash updated
- ✅ All role types recognized

## 📚 Documentation Files

- **BUILD_SETUP_GUIDE.md** - Complete detailed setup guide
- **LOGIN_PAGE_UPDATE.md** - Login system changes
- **LOGIN_QUICK_REFERENCE.md** - Design specs and quick reference
- **rebuild.ps1** - Automated rebuild script

## 🐛 Common Issues

### "Database connection failed"
```powershell
# Check MySQL is running
Get-Process -Name mysqld
```

### "Port 5173 already in use"
```powershell
# Use different port
npm run dev -- --port 5174
```

### "Login failed"
```powershell
# Reset admin password
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system -e "UPDATE employer_users SET password_hash='\$2y\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5F2J3x4kBc5xO' WHERE username='admin';"

# Reset employee password
& "C:\xampp\mysql\bin\mysql.exe" -u root hr_management_system -e "UPDATE employee_users SET password_hash='\$2y\$12\$ukEHnHNNqSFwwxNcVhvpTOivE8SDuXE7NdAcxXO0noX6Whxmr5/jO' WHERE username='john.doe';"
```

## 📦 Production Deployment

Already prepared in `ready-to-upload/` folder:
- Frontend build (670 KB optimized)
- Backend PHP files
- Database schema
- Setup instructions

See **DEPLOY_TO_HOSTING.md** and **BACKEND_CPANEL_DEPLOYMENT.md** for deployment guides.

---

**Need Help?** Check BUILD_SETUP_GUIDE.md for detailed troubleshooting!
