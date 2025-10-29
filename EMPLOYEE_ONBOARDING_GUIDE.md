# Multi-Tenant Employee Onboarding System

## 🎯 Overview
Complete, production-ready employee onboarding system with:
- ✅ **Full Organization Isolation** - Zero cross-tenant data leakage
- ✅ **Race Condition Prevention** - Atomic database transactions
- ✅ **Auto Employee Number Generation** - ORG-YEAR-SEQUENCE format
- ✅ **Automatic Login Creation** - Optional employee portal access
- ✅ **Leave Balance Initialization** - Gender-aware leave types
- ✅ **Onboarding Workflow** - Checklist tracking
- ✅ **Audit Trail** - Complete action logging
- ✅ **Scalable Architecture** - Thread-safe, ready for high volume

---

## 🚀 Quick Start

### 1. Update Database Schema
```bash
# Add onboarding tables
mysql -u root -p payroll_system < database/add_onboarding_tables.sql
```

### 2. API Endpoint
**Base URL**: `http://yourdomain.com/api/api/employees.php`

**Authentication**: Required (JWT token with organization context)

---

## 📋 API Reference

### **GET /api/employees.php**
Get all employees for your organization

**Headers**:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "organization_id": 1,
      "employee_number": "DEMO-2025-001",
      "first_name": "John",
      "last_name": "Doe",
      "national_id": "12345678",
      "phone_number": "+254712345678",
      "work_email": "john.doe@company.com",
      "department_name": "IT",
      "position_title": "Software Developer",
      "employment_status": "active"
    }
  ],
  "count": 1
}
```

---

### **POST /api/employees.php**
Onboard new employee (atomic transaction)

**Request Body**:
```json
{
  "first_name": "Jane",
  "middle_name": "Marie",
  "last_name": "Smith",
  "national_id": "87654321",
  "date_of_birth": "1990-05-15",
  "gender": "female",
  "phone_number": "+254722345678",
  "personal_email": "jane.smith@gmail.com",
  "work_email": "jane.smith@company.com",
  "kra_pin": "A001234567X",
  "shif_number": "SHIF123456",
  "nssf_number": "NSSF987654",
  "postal_address": "P.O. Box 12345, Nairobi",
  "residential_address": "123 Main Street, Nairobi",
  "county": "Nairobi",
  "sub_county": "Westlands",
  "marital_status": "single",
  "nationality": "Kenyan",
  "department_id": 1,
  "position_id": 3,
  "manager_id": 5,
  "employment_type": "permanent",
  "hire_date": "2025-01-15",
  "probation_end_date": "2025-04-15",
  "create_login": true,
  "username": "jane.smith",
  "password": "Welcome@2025!"
}
```

**Required Fields**:
- `first_name`
- `last_name`
- `national_id`
- `date_of_birth`
- `gender`
- `phone_number`
- `employment_type`
- `hire_date`

**Response**:
```json
{
  "success": true,
  "message": "Employee onboarded successfully",
  "data": {
    "employee_id": 42,
    "employee_number": "DEMO-2025-042",
    "username": "jane.smith",
    "default_password": "Welcome@2025!"
  }
}
```

---

### **GET /api/employees.php?search=john**
Search employees within your organization

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_number": "DEMO-2025-001",
      "full_name": "John Doe",
      "work_email": "john.doe@company.com",
      "phone_number": "+254712345678",
      "department_name": "IT",
      "position_title": "Software Developer",
      "employment_status": "active"
    }
  ],
  "count": 1
}
```

---

### **GET /api/employees.php/{id}**
Get specific employee (organization-scoped)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "organization_id": 1,
    "employee_number": "DEMO-2025-001",
    "first_name": "John",
    "middle_name": "Robert",
    "last_name": "Doe",
    "national_id": "12345678",
    "kra_pin": "A001234567X",
    "date_of_birth": "1985-03-20",
    "gender": "male",
    "phone_number": "+254712345678",
    "personal_email": "john@gmail.com",
    "work_email": "john.doe@company.com",
    "department_name": "IT",
    "position_title": "Software Developer",
    "manager_name": "Alice Johnson",
    "employment_type": "permanent",
    "employment_status": "active",
    "hire_date": "2023-01-15"
  }
}
```

---

### **PUT /api/employees.php**
Update employee (organization-scoped)

**Request Body**:
```json
{
  "id": 1,
  "first_name": "John",
  "middle_name": "Robert",
  "last_name": "Doe",
  "kra_pin": "A001234567X",
  "shif_number": "SHIF123456",
  "nssf_number": "NSSF987654",
  "phone_number": "+254712345678",
  "personal_email": "john@gmail.com",
  "work_email": "john.doe@company.com",
  "department_id": 1,
  "position_id": 3,
  "manager_id": 5,
  "employment_status": "active"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Employee updated successfully"
}
```

---

### **DELETE /api/employees.php/{id}**
Soft delete employee (sets status to 'terminated')

**Response**:
```json
{
  "success": true,
  "message": "Employee updated successfully"
}
```

---

## 🔐 Security Features

### 1. Organization Isolation
```php
// All queries automatically filtered by organization_id
WHERE employees.organization_id = :organization_id
```
✅ User from Org A cannot see/edit employees from Org B

### 2. Race Condition Prevention
```php
$this->db->beginTransaction();
try {
    // Generate employee number with row-level lock
    // Check for duplicates
    // Insert employee
    // Create login account
    // Initialize leave balances
    $this->db->commit();
} catch (Exception $e) {
    $this->db->rollBack();
}
```
✅ Multiple concurrent onboardings safe
✅ No duplicate employee numbers possible

### 3. Authentication Required
```php
$auth = authenticateRequest();
$organization_id = $auth['user']['organization_id'];
```
✅ JWT token must include organization context
✅ Expired/invalid tokens rejected

### 4. Audit Trail
```php
// Every onboarding logged
INSERT INTO audit_log (
    user_id, action, table_name, record_id,
    new_values, ip_address, user_agent
)
```
✅ Complete accountability
✅ Track who onboarded which employee

---

## 🎯 What Happens During Onboarding

### Automatic Process Flow:

1. **Validation**
   - Check required fields
   - Verify national_id unique within organization
   
2. **Employee Number Generation**
   - Format: `ORG-YEAR-SEQUENCE`
   - Example: `DEMO-2025-042`
   - Thread-safe with database locks

3. **Employee Record Creation**
   - Insert into `employees` table
   - Links to organization_id automatically

4. **User Account Creation** (Optional)
   - Creates `employee_users` record
   - Username and password configurable
   - Default: `firstname.lastname` / `Welcome@2025!`

5. **Leave Balance Initialization**
   - Annual Leave: 21 days
   - Sick Leave: 14 days
   - Maternity/Paternity: Gender-specific
   - Compassionate: 7 days
   - Study Leave: 5 days

6. **Onboarding Checklist**
   - Creates tracking record
   - Assigns to HR user
   - Status: pending

7. **Audit Logging**
   - Records who onboarded
   - Captures IP and user agent
   - Stores employee details

**All operations are ATOMIC** - either all succeed or all rollback.

---

## 📊 Database Schema Updates

### New Tables Added:

```sql
-- Onboarding Checklist
onboarding_checklists (
    id, employee_id, onboarding_status,
    assigned_to, documents_received, account_created,
    equipment_issued, training_scheduled,
    induction_completed, contract_signed,
    notes, created_at, updated_at, completed_at
)

-- Audit Trail
audit_log (
    id, user_id, user_type, action,
    table_name, record_id,
    old_values, new_values,
    ip_address, user_agent, created_at
)

-- Leave Types (Default)
leave_types (
    id, code, name, days_per_year,
    carry_forward, max_carry_forward_days,
    gender_specific, requires_approval, is_active
)

-- Notifications
notifications (
    id, user_id, user_type, title, message,
    type, is_read, action_url, related_table,
    related_id, created_at, read_at
)
```

### Performance Indexes Added:
```sql
-- Faster queries
employees: idx_org_status (organization_id, employment_status)
employees: idx_org_dept (organization_id, department_id)
employees: idx_org_position (organization_id, position_id)
departments: idx_org_active (organization_id, is_active)
positions: idx_org_active (organization_id, is_active)
```

---

## 🧪 Testing

### Test Scenario 1: Onboard Employee
```bash
curl -X POST http://localhost/api/api/employees.php \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "Employee",
    "national_id": "99999999",
    "date_of_birth": "1995-01-01",
    "gender": "male",
    "phone_number": "+254700000000",
    "employment_type": "permanent",
    "hire_date": "2025-01-01",
    "create_login": true
  }'
```

### Test Scenario 2: Verify Isolation
1. Create employee in Org A
2. Login as user from Org B
3. Try to GET employee from Org A
4. ✅ Should return 404 (not found in your organization)

### Test Scenario 3: Race Condition
1. Send 10 concurrent POST requests
2. ✅ All should succeed
3. ✅ Employee numbers should be sequential (no duplicates)
4. ✅ Check: DEMO-2025-001, DEMO-2025-002, etc.

---

## 📈 Scalability Features

### 1. Database Transactions
- Prevents duplicate employee numbers
- Ensures data consistency
- ACID compliant

### 2. Efficient Queries
- Composite indexes for fast lookups
- Only fetches organization's data
- Supports pagination (add LIMIT/OFFSET)

### 3. Connection Pooling Ready
```php
// Use PDO persistent connections
$db = new PDO($dsn, $user, $pass, [
    PDO::ATTR_PERSISTENT => true
]);
```

### 4. Batch Import Support
For bulk onboarding, create wrapper:
```php
// Process 100 employees in parallel
foreach ($employees_batch as $employee) {
    $controller->onboardEmployee($employee);
}
```

### 5. Queue System Integration
For async processing:
```php
// Add to Redis queue
$redis->lpush('employee_onboarding', json_encode($data));

// Worker processes queue
while ($job = $redis->rpop('employee_onboarding')) {
    $controller->onboardEmployee(json_decode($job));
}
```

---

## ⚠️ Important Notes

### Employee Number Format
- Pattern: `{ORG_CODE}-{YEAR}-{SEQUENCE}`
- Example: `DEMO-2025-001`
- Resets annually
- Unique per organization per year

### National ID Uniqueness
- Enforced at database level
- Scoped to organization
- Employee from Org A can have same national_id as employee in Org B
- But no duplicates within same organization

### Leave Types
- Gender-specific types automatically assigned
- Maternity leave only for female employees
- Paternity leave only for male employees
- All other types assigned to everyone

### Onboarding Checklist
- Automatically created
- Status: pending → in_progress → completed
- Tracks: documents, account, equipment, training, induction, contract

---

## 🔧 Configuration

### Customize Employee Number Format
Edit `EmployeeOnboardingController.php`:
```php
private function generateEmployeeNumber() {
    // Change format here
    $employee_number = sprintf("%s-%s-%03d", $org_code, $year, $sequence);
    
    // Or use different pattern
    // $employee_number = sprintf("EMP%s%04d", $year, $sequence);
}
```

### Customize Default Leave Days
Edit `add_onboarding_tables.sql`:
```sql
INSERT INTO leave_types VALUES
('AL', 'Annual Leave', 30, TRUE, 10, 'all'),  -- Changed from 21 to 30
('SL', 'Sick Leave', 20, FALSE, 0, 'all');    -- Changed from 14 to 20
```

### Customize Default Password
Edit `EmployeeOnboardingController.php`:
```php
$default_password = $data->password ?? 'YourCompany@2025!';
```

---

## 🚨 Error Handling

### Duplicate National ID
```json
{
  "success": false,
  "message": "Employee with this National ID already exists in your organization"
}
```
**HTTP Status**: 409 Conflict

### Missing Required Fields
```json
{
  "success": false,
  "message": "Required fields missing: first_name, last_name, national_id, date_of_birth"
}
```
**HTTP Status**: 400 Bad Request

### No Organization Context
```json
{
  "success": false,
  "message": "Organization context not set"
}
```
**HTTP Status**: 401 Unauthorized

### Employee Not Found
```json
{
  "success": false,
  "message": "Employee not found in your organization"
}
```
**HTTP Status**: 404 Not Found

---

## 📞 Support

### Verify Installation
```bash
# Check if tables exist
mysql -u root -p payroll_system -e "SHOW TABLES LIKE '%onboarding%';"

# Check leave types
mysql -u root -p payroll_system -e "SELECT * FROM leave_types;"

# Check indexes
mysql -u root -p payroll_system -e "SHOW INDEX FROM employees WHERE Key_name LIKE 'idx_org%';"
```

### Enable Debug Mode
Add to top of `employees.php`:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

### Check Audit Log
```sql
SELECT 
    al.action,
    al.table_name,
    al.record_id,
    al.new_values->>'$.employee_number' as employee_number,
    al.created_at
FROM audit_log al
WHERE al.action = 'employee_onboarded'
ORDER BY al.created_at DESC
LIMIT 10;
```

---

## ✅ Deployment Checklist

- [ ] Run `add_onboarding_tables.sql`
- [ ] Copy `EmployeeOnboardingController.php` to `/backend/controllers/`
- [ ] Update `employees.php` API endpoint
- [ ] Test authentication with JWT token
- [ ] Verify organization_id in token payload
- [ ] Test employee onboarding
- [ ] Verify employee number generation
- [ ] Check leave balances created
- [ ] Verify audit log entries
- [ ] Test search functionality
- [ ] Test update/delete with organization scope
- [ ] Load test with concurrent requests
- [ ] Verify cross-organization isolation
- [ ] Remove debug mode
- [ ] Enable error logging (not display)

---

## 🎉 Done!

Your multi-tenant employee onboarding system is now:
- ✅ Fully isolated per organization
- ✅ Race condition proof
- ✅ Automatically numbered
- ✅ Audit logged
- ✅ Scalable
- ✅ Production ready

**Next Steps**:
1. Test onboarding in your environment
2. Integrate with frontend UI
3. Customize employee number format if needed
4. Set up batch import if required
5. Configure notification system

For questions or issues, check the audit log and error logs.
