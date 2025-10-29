# Quick Start Guide

Get up and running with the HR Management System in 15 minutes.

## Prerequisites Check

Before starting, ensure you have:
- [ ] PHP 7.4+ installed (`php --version`)
- [ ] MySQL 5.7+ installed (`mysql --version`)
- [ ] Node.js 16+ installed (`node --version`)
- [ ] Flutter 3.0+ (optional, for mobile) (`flutter --version`)

## Quick Setup (Development)

### 1. Clone/Extract Project
```bash
cd /path/to/Payroll-master
```

### 2. Database Setup (2 minutes)

```bash
# Create database
mysql -u root -p << EOF
CREATE DATABASE hr_management_system;
CREATE USER 'hruser'@'localhost' IDENTIFIED BY 'hr_password_123';
GRANT ALL PRIVILEGES ON hr_management_system.* TO 'hruser'@'localhost';
FLUSH PRIVILEGES;
EOF

# Import schema
mysql -u hruser -phr_password_123 hr_management_system < database/schema.sql

# Create admin user (password: admin123)
mysql -u hruser -phr_password_123 hr_management_system << EOF
INSERT INTO users (username, email, password_hash, role, is_active)
VALUES ('admin', 'admin@company.com',
'\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'admin', 1);
EOF
```

### 3. Backend Setup (1 minute)

```bash
# Update database config
cd backend/config
# Edit database.php with your credentials

# Start PHP server
cd ..
php -S localhost:8000
```

Keep this terminal open!

### 4. Frontend Setup (3 minutes)

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env

# Start development server
npm run dev
```

### 5. Access the System

Open browser to: **http://localhost:3000**

**Login Credentials:**
- Username: `admin`
- Password: `admin123`

🎉 **You're ready!**

## Mobile App (Optional)

```bash
cd mobile

# Install dependencies
flutter pub get

# Update API URL in lib/services/api_service.dart
# Change baseUrl to your computer's IP address

# Run on Android
flutter run

# Run on iOS (macOS only)
flutter run
```

## First Steps After Login

1. **Change Admin Password**
   - Go to Profile > Settings
   - Update password immediately

2. **Configure Company Details**
   - Settings > Company Information
   - Add company name, KRA PIN, NSSF, SHIF numbers

3. **Add Departments**
   - Settings > Departments
   - Create your organizational structure

4. **Add Positions**
   - Settings > Positions
   - Define job roles

5. **Add First Employee**
   - Employees > Add Employee
   - Fill in required Kenyan compliance fields

## Test the System

### Test Leave Application
1. Go to Leave Management
2. Click "Apply Leave"
3. Select dates and leave type
4. Submit application

### Test Attendance
1. Go to Attendance
2. Clock In
3. Clock Out
4. View attendance records

### Test Payroll
1. Add salary structure for employee
2. Go to Payroll
3. Generate payroll for current month
4. View generated payslip

## Common Issues & Solutions

### Issue: Can't connect to database
```bash
# Check MySQL is running
sudo systemctl status mysql  # Linux
brew services list  # macOS

# Check credentials in backend/config/database.php
```

### Issue: Frontend shows network error
```bash
# Make sure backend is running on localhost:8000
# Check .env file has correct API URL
# Check browser console for CORS errors
```

### Issue: Mobile app can't connect
```bash
# Use your computer's IP instead of localhost
# Find your IP:
# Windows: ipconfig
# macOS/Linux: ifconfig

# Update mobile/lib/services/api_service.dart:
# static const String baseUrl = 'http://192.168.1.XXX:8000/api';
```

### Issue: npm install fails
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

For production deployment, see [INSTALLATION.md](INSTALLATION.md) for:
- SSL certificate setup
- Web server configuration (Apache/Nginx)
- Security hardening
- Backup configuration
- Performance optimization

## Next Steps

- [ ] Read full documentation in [README.md](README.md)
- [ ] Review API documentation in [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- [ ] Configure backups
- [ ] Train your HR team
- [ ] Import existing employee data
- [ ] Set up email notifications

## Default Test Data

After installation, you can add test data:

```sql
-- Add test department
INSERT INTO departments (name, code, description)
VALUES ('Human Resources', 'HR', 'HR Department');

-- Add test position
INSERT INTO positions (title, code, department_id, job_level)
VALUES ('HR Manager', 'HR_MGR', 1, 'manager');

-- Add test employee (update with your data)
INSERT INTO employees (employee_number, first_name, last_name, national_id, kra_pin, date_of_birth, gender, phone_number, employment_type, hire_date, department_id, position_id)
VALUES ('EMP20240001', 'Jane', 'Doe', '12345678', 'A123456789X', '1990-01-15', 'female', '+254712345678', 'permanent', '2024-01-01', 1, 1);
```

## Getting Help

- Check documentation files
- Review error logs in browser console
- Check PHP error log
- Contact: support@yourcompany.com

## Useful Commands

```bash
# Backend
php -S localhost:8000                 # Start PHP server
php -r "echo password_hash('password', PASSWORD_DEFAULT);"  # Generate password hash

# Frontend
npm run dev                           # Start dev server
npm run build                         # Build for production
npm run preview                       # Preview production build

# Mobile
flutter pub get                       # Install dependencies
flutter run                           # Run app
flutter build apk                     # Build Android APK
flutter clean                         # Clean build files

# Database
mysql -u hruser -p hr_management_system  # Connect to database
mysqldump -u hruser -p hr_management_system > backup.sql  # Backup
mysql -u hruser -p hr_management_system < backup.sql      # Restore
```

## System Requirements Summary

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 2GB | 4GB |
| Storage | 5GB | 10GB |
| PHP | 7.4 | 8.0+ |
| MySQL | 5.7 | 8.0+ |
| Node.js | 16.x | 18.x |
| Flutter | 3.0 | Latest stable |

## Kenya-Specific Features

This system is pre-configured with:
- ✅ SHIF (formerly NHIF) deductions
- ✅ NSSF contributions
- ✅ PAYE tax calculation (2024 rates)
- ✅ Housing Levy (1.5%)
- ✅ Employment Act 2007 compliance
- ✅ Leave entitlements (Annual, Sick, Maternity, Paternity)
- ✅ KRA PIN validation

## Support & Resources

- **Documentation**: See all .md files in project root
- **API Reference**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Installation Guide**: [INSTALLATION.md](INSTALLATION.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)

---

**Ready to start?** Follow the Quick Setup steps above and you'll be running in 15 minutes! 🚀
