# Dual Login System - HR Management System

## Overview

The HR Management System now features a **dual authentication system** with separate login portals for employers and employees, providing enhanced security and better user experience.

## Architecture

### Two User Types

#### 1. Employer Users (`employer_users` table)
- **Purpose**: Administrative and management access
- **Roles**:
  - `super_admin` - Full system access
  - `admin` - Organization-wide administration
  - `hr_manager` - HR operations management
  - `payroll_officer` - Payroll processing
  - `department_manager` - Department-level management
  - `recruiter` - Recruitment management

#### 2. Employee Users (`employee_users` table)
- **Purpose**: Self-service portal access
- **Features**:
  - View personal information
  - View payslips and tax documents
  - Apply for leave
  - View attendance records
  - Update contact details
  - Access training materials

## Key Features

### Security Features
✅ Separate authentication tables for employers and employees  
✅ Password hashing with bcrypt  
✅ Two-factor authentication support  
✅ Session management and timeout  
✅ Login attempt tracking and account lockout  
✅ Password reset functionality  
✅ IP address and device tracking  
✅ Comprehensive audit logging  

### Multi-Tenancy
✅ Organization-based data separation  
✅ Organization-specific settings  
✅ Multiple organizations support  

### Session Management
✅ Token-based session tracking  
✅ Device and location tracking  
✅ Concurrent session control  
✅ Auto-logout on inactivity  

## Database Schema

### Core Authentication Tables

```
organizations
├── employer_users (Admin, HR, Managers)
│   ├── id
│   ├── organization_id
│   ├── username
│   ├── email
│   ├── password_hash
│   ├── role
│   └── ...
│
└── employees
    └── employee_users (Employee Self-Service)
        ├── id
        ├── employee_id
        ├── username
        ├── email
        ├── password_hash
        └── ...
```

### Session & Security Tables

- `user_sessions` - Active session management
- `login_logs` - Login attempt tracking
- `user_permissions` - Role-based permissions
- `audit_log` - System activity audit trail

## Installation

### Quick Setup (Recommended)

1. **Run the automated setup script**:
   ```bash
   setup_dual_login_database.bat
   ```

2. **Follow the prompts**:
   - Backup will be created automatically
   - Database will be created/updated
   - Default users will be created

### Manual Setup

1. **Backup existing database**:
   ```bash
   mysqldump -u hruser -p hr_management_system > backup.sql
   ```

2. **Import new schema**:
   ```bash
   mysql -u hruser -p hr_management_system < database/dual_login_schema.sql
   ```

3. **Verify installation**:
   ```sql
   SHOW TABLES;
   SELECT * FROM employer_users;
   SELECT * FROM employee_users;
   ```

## Default Credentials

### Employer Login (Admin Portal)
- **Username**: `admin`
- **Password**: `password`
- **Role**: Super Admin

### Employee Login (Self-Service Portal)
- **Username**: `john.doe`
- **Password**: `password`
- **Employee**: John Doe (EMP001)

> ⚠️ **CRITICAL**: Change these passwords immediately after first login!

## API Endpoints

### Employer Authentication

#### Login
```http
POST /api/employer/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@company.com",
    "role": "super_admin",
    "organization_id": 1
  }
}
```

#### Logout
```http
POST /api/employer/auth/logout
Authorization: Bearer {token}
```

### Employee Authentication

#### Login
```http
POST /api/employee/auth/login
Content-Type: application/json

{
  "username": "john.doe",
  "password": "password"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john.doe",
    "email": "john.doe@company.com",
    "employee_id": 1,
    "employee_number": "EMP001"
  }
}
```

#### Logout
```http
POST /api/employee/auth/logout
Authorization: Bearer {token}
```

## User Management

### Creating Employer Users

```sql
INSERT INTO employer_users (
    organization_id, username, email, password_hash,
    first_name, last_name, role, is_active
) VALUES (
    1, 'hr.manager', 'hr@company.com',
    '$2y$10$...', -- Use password_hash() function
    'Jane', 'Smith', 'hr_manager', TRUE
);
```

### Creating Employee Users

```sql
-- First, ensure employee exists in employees table
-- Then create employee user account
INSERT INTO employee_users (
    employee_id, username, email, password_hash,
    is_active, force_password_change
) VALUES (
    (SELECT id FROM employees WHERE employee_number = 'EMP002'),
    'jane.smith',
    'jane.smith@company.com',
    '$2y$10$...', -- Use password_hash() function
    TRUE,
    TRUE -- Force password change on first login
);
```

### Password Hashing (PHP)

```php
// Create password hash
$password = 'NewPassword123!';
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

// Verify password
if (password_verify($input_password, $stored_hash)) {
    // Password is correct
}
```

## Permissions System

### Default Permissions by Role

#### Super Admin
- All permissions
- Manage organizations
- Manage all users
- View all data

#### Admin
- Organization-wide management
- User management (except super admin)
- All HR operations
- Payroll management

#### HR Manager
- Employee management
- Leave management
- Recruitment
- Performance management
- View reports

#### Payroll Officer
- Payroll processing
- Attendance management
- Generate payslips
- View financial reports

#### Department Manager
- View department employees
- Approve leave requests
- View department reports

#### Employee (Self-Service)
- View own data
- Apply for leave
- View payslips
- Update contact details

### Custom Permissions

```sql
-- Grant custom permission to a user
INSERT INTO user_permissions (
    user_type, user_id, permission_key, permission_value, granted_by
) VALUES (
    'employer', 5, 'can_approve_expenses', TRUE, 1
);

-- Check if user has permission
SELECT permission_value 
FROM user_permissions 
WHERE user_type = 'employer' 
  AND user_id = 5 
  AND permission_key = 'can_approve_expenses'
  AND (expires_at IS NULL OR expires_at > NOW());
```

## Security Best Practices

### 1. Password Policy
```sql
-- Enforce in system_settings
INSERT INTO system_settings (organization_id, setting_key, setting_value, setting_type) VALUES
(1, 'password_min_length', '8', 'number'),
(1, 'password_require_uppercase', 'true', 'boolean'),
(1, 'password_require_lowercase', 'true', 'boolean'),
(1, 'password_require_number', 'true', 'boolean'),
(1, 'password_require_special', 'true', 'boolean'),
(1, 'password_expiry_days', '90', 'number');
```

### 2. Session Security
```sql
-- Configure session timeout
UPDATE system_settings 
SET setting_value = '30' 
WHERE setting_key = 'session_timeout_minutes';
```

### 3. Account Lockout
```sql
-- Automatic lockout after 5 failed attempts
-- Configured in employer_users and employee_users tables
-- locked_until field is set automatically
```

### 4. Two-Factor Authentication
```sql
-- Enable 2FA for a user
UPDATE employer_users 
SET two_factor_enabled = TRUE,
    two_factor_secret = 'BASE32SECRET'
WHERE id = 1;
```

### 5. Audit Logging
```sql
-- All login attempts are logged
SELECT * FROM login_logs 
WHERE user_id = 1 
  AND user_type = 'employer'
ORDER BY created_at DESC;

-- All data changes are logged
SELECT * FROM audit_log 
WHERE user_id = 1 
  AND table_name = 'employees'
ORDER BY created_at DESC;
```

## Monitoring & Maintenance

### Check Active Sessions
```sql
SELECT 
    s.id,
    s.user_type,
    s.user_id,
    CASE 
        WHEN s.user_type = 'employer' THEN eu.username
        WHEN s.user_type = 'employee' THEN emp_u.username
    END as username,
    s.ip_address,
    s.device_type,
    s.login_time,
    s.last_activity,
    s.expires_at
FROM user_sessions s
LEFT JOIN employer_users eu ON s.user_type = 'employer' AND s.user_id = eu.id
LEFT JOIN employee_users emp_u ON s.user_type = 'employee' AND s.user_id = emp_u.id
WHERE s.is_active = TRUE
  AND s.expires_at > NOW();
```

### Login Failure Analysis
```sql
SELECT 
    user_type,
    login_status,
    COUNT(*) as attempt_count,
    DATE(created_at) as attempt_date
FROM login_logs
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY user_type, login_status, DATE(created_at)
ORDER BY attempt_date DESC, user_type;
```

### Clean Up Old Sessions
```sql
-- Remove expired sessions
DELETE FROM user_sessions 
WHERE expires_at < NOW() 
   OR (last_activity < DATE_SUB(NOW(), INTERVAL 24 HOUR));
```

## Migration from Old System

See [MIGRATION_GUIDE.md](database/MIGRATION_GUIDE.md) for detailed migration instructions.

### Quick Migration Steps
1. Backup current database
2. Run new schema
3. Migrate user data
4. Create employee user accounts
5. Test both portals
6. Update API endpoints
7. Deploy frontend changes

## Troubleshooting

### Cannot login with new credentials
1. Check if user exists:
   ```sql
   SELECT * FROM employer_users WHERE username = 'admin';
   SELECT * FROM employee_users WHERE username = 'john.doe';
   ```

2. Verify password hash:
   ```php
   $hash = password_hash('password', PASSWORD_BCRYPT);
   echo $hash;
   ```

3. Check if account is locked:
   ```sql
   SELECT locked_until, failed_login_attempts 
   FROM employer_users 
   WHERE username = 'admin';
   ```

### Session expires too quickly
```sql
-- Increase session timeout
UPDATE system_settings 
SET setting_value = '120' 
WHERE setting_key = 'session_timeout_minutes';
```

### Database connection errors
1. Verify credentials in `backend/config/database.php`
2. Check MySQL service is running
3. Verify database exists
4. Check user permissions

## Support & Documentation

- **Full Schema**: `database/dual_login_schema.sql`
- **Migration Guide**: `database/MIGRATION_GUIDE.md`
- **Setup Script**: `setup_dual_login_database.bat`
- **API Documentation**: `API_DOCUMENTATION.md`

## License

This software is proprietary. See LICENSE file for details.

---

**Last Updated**: October 16, 2025  
**Version**: 2.0  
**Database Schema Version**: dual_login_v2
