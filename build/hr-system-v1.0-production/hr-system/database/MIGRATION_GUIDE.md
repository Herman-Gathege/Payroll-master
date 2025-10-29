# Database Migration Guide - Dual Login System

## Overview
This guide explains how to migrate from the old single-user system to the new dual-login system with separate employer and employee authentication.

## New Features

### 1. Dual Authentication System
- **Employer Users**: Admins, HR managers, payroll officers, department managers
- **Employee Users**: Self-service portal for employees to view their own data

### 2. Key Improvements
- Separate login portals for employers and employees
- Organization multi-tenancy support
- Enhanced security with session management
- Two-factor authentication support
- Comprehensive audit logging
- Role-based access control (RBAC)

## Database Changes

### New Tables

#### Authentication Tables
1. `employer_users` - For administrative and management users
2. `employee_users` - For employee self-service portal
3. `user_sessions` - Session management for both user types
4. `login_logs` - Login activity tracking
5. `user_permissions` - Fine-grained permission control

#### Organization Tables
1. `organizations` - Multi-organization support
2. `payroll_periods` - Structured payroll period management
3. `leave_types` - Configurable leave types per organization
4. `system_settings` - Organization-specific settings

#### Enhanced Tables
- `employees` - Enhanced with organization_id
- `payroll` - Enhanced with more detailed fields
- `attendance` - Improved tracking with locations
- `leave_applications` - More comprehensive leave management

### Removed Tables
- `users` - Replaced by `employer_users` and `employee_users`

## Migration Steps

### Step 1: Backup Current Database
```bash
# Backup your current database
mysqldump -u hruser -p hr_management_system > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Create New Database (Optional - Clean Install)
```sql
-- Option A: Create new database
CREATE DATABASE hr_management_system_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Option B: Use existing database (will drop tables)
-- Make sure you have a backup first!
```

### Step 3: Run New Schema
```bash
# For Windows PowerShell
Get-Content database\dual_login_schema.sql | mysql -u hruser -p hr_management_system

# For MySQL command line
mysql -u hruser -p hr_management_system < database/dual_login_schema.sql
```

### Step 4: Migrate Existing Data (If applicable)

Create and run the migration script:

```sql
-- ============================================================================
-- DATA MIGRATION SCRIPT
-- Run this after creating the new schema if you have existing data
-- ============================================================================

-- Set your organization ID (created by default in schema as ID 1)
SET @org_id = 1;

-- Migrate Departments (if exists)
INSERT INTO departments (organization_id, name, code, description, is_active)
SELECT @org_id, name, code, description, is_active
FROM old_departments
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE code = old_departments.code);

-- Migrate Positions (if exists)
INSERT INTO positions (organization_id, department_id, title, code, job_description, job_level, is_active)
SELECT @org_id, d.id, op.title, op.code, op.job_description, op.job_level, op.is_active
FROM old_positions op
LEFT JOIN departments d ON d.code = op.department_code
WHERE NOT EXISTS (SELECT 1 FROM positions WHERE code = op.code);

-- Migrate Employees (if exists)
INSERT INTO employees (
    organization_id, employee_number, first_name, middle_name, last_name,
    national_id, kra_pin, date_of_birth, gender, phone_number, 
    personal_email, work_email, department_id, position_id,
    employment_type, employment_status, hire_date
)
SELECT 
    @org_id, employee_number, first_name, middle_name, last_name,
    national_id, kra_pin, date_of_birth, gender, phone_number,
    personal_email, work_email, d.id, p.id,
    employment_type, status, hire_date
FROM old_employees oe
LEFT JOIN departments d ON d.name = oe.department
LEFT JOIN positions p ON p.title = oe.position;

-- Migrate Users to Employer Users
INSERT INTO employer_users (
    organization_id, username, email, password_hash, 
    first_name, last_name, role, employee_id, is_active
)
SELECT 
    @org_id, u.username, u.email, u.password_hash,
    e.first_name, e.last_name, 
    CASE 
        WHEN u.role = 'admin' THEN 'admin'
        WHEN u.role = 'hr_manager' THEN 'hr_manager'
        WHEN u.role = 'manager' THEN 'department_manager'
        ELSE 'admin'
    END,
    ne.id,
    u.is_active
FROM old_users u
LEFT JOIN old_employees oe ON u.employee_id = oe.id
LEFT JOIN employees ne ON ne.employee_number = oe.employee_number
WHERE u.role IN ('admin', 'hr_manager', 'manager');

-- Create Employee User Accounts
-- Generate username and temporary password for each employee
INSERT INTO employee_users (
    employee_id, username, email, password_hash, 
    is_active, force_password_change
)
SELECT 
    e.id,
    LOWER(CONCAT(e.first_name, '.', e.last_name)),
    COALESCE(e.work_email, e.personal_email),
    -- Default password: 'Employee@123' - CHANGE THIS!
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    TRUE,
    TRUE
FROM employees e
WHERE e.employment_status = 'active'
AND NOT EXISTS (
    SELECT 1 FROM employee_users eu WHERE eu.employee_id = e.id
);

-- ============================================================================
-- POST-MIGRATION TASKS
-- ============================================================================

-- Update department heads
UPDATE departments d
JOIN employees e ON e.employee_number = d.head_employee_number
SET d.head_employee_id = e.id;

-- Update employee managers
UPDATE employees e1
JOIN employees e2 ON e2.employee_number = e1.manager_employee_number
SET e1.manager_id = e2.id;
```

## Step 5: Update Configuration

Update `backend/config/database.php`:

```php
<?php
class Database {
    private $host = "localhost";
    private $database_name = "hr_management_system";  // or hr_management_system_v2
    private $username = "hruser";
    private $password = "hr_password_123";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->database_name . ";charset=utf8mb4",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            throw new Exception("Database connection failed");
        }
        return $this->conn;
    }
}
?>
```

## Step 6: Create Sample Data (Testing)

```sql
-- Create a test employer user
INSERT INTO employer_users (
    organization_id, username, email, password_hash,
    first_name, last_name, role, is_active, email_verified
) VALUES (
    1, 'admin', 'admin@company.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Password: password
    'System', 'Administrator', 'super_admin', TRUE, TRUE
);

-- Create a test employee
INSERT INTO employees (
    organization_id, employee_number, first_name, last_name,
    national_id, kra_pin, date_of_birth, gender, phone_number,
    work_email, employment_type, employment_status, hire_date
) VALUES (
    1, 'EMP001', 'John', 'Doe',
    '12345678', 'A123456789Z', '1990-01-01', 'male', '0712345678',
    'john.doe@company.com', 'permanent', 'active', '2024-01-01'
);

-- Create employee user account
INSERT INTO employee_users (
    employee_id, username, email, password_hash,
    is_active, force_password_change
) VALUES (
    LAST_INSERT_ID(), 'john.doe', 'john.doe@company.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Password: password
    TRUE, TRUE
);
```

## Testing

### Test Employer Login
- Username: `admin`
- Password: `password`
- Expected: Access to full admin dashboard

### Test Employee Login
- Username: `john.doe`
- Password: `password`
- Expected: Access to employee self-service portal
- Should be prompted to change password on first login

## Important Security Notes

1. **Change Default Passwords**: All default passwords must be changed immediately
2. **Enable HTTPS**: Always use HTTPS in production
3. **Enable 2FA**: Enable two-factor authentication for employer users
4. **Session Security**: Configure appropriate session timeout values
5. **Password Policy**: Enforce strong password requirements
6. **Regular Backups**: Schedule regular database backups
7. **Audit Logs**: Regularly review audit logs for suspicious activity

## Rollback Plan

If you need to rollback:

```bash
# Restore from backup
mysql -u hruser -p hr_management_system < backup_YYYYMMDD_HHMMSS.sql
```

## Support

For issues or questions:
1. Check the logs in `backend/logs/`
2. Review error messages in browser console
3. Check database connection settings
4. Verify all tables were created successfully

## Next Steps

After migration:
1. Update API endpoints for dual login
2. Update frontend to support employer/employee portals
3. Test all functionality thoroughly
4. Train users on new system
5. Monitor system performance and logs
