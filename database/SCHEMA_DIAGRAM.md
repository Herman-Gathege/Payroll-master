# Database Schema Diagram - Dual Login System

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         DUAL LOGIN ARCHITECTURE                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  organizations   │
│─────────────────│
│ • id (PK)       │
│ • name          │◄────┐
│ • code          │     │
│ • kra_pin       │     │
│ • is_active     │     │
└──────────────────┘     │
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
│ employer_users   │ │ departments  │ │  employees   │
│─────────────────│ │──────────────│ │──────────────│
│ • id (PK)       │ │ • id (PK)    │ │ • id (PK)    │
│ • org_id (FK) ──┤ │ • org_id (FK)│ │ • org_id (FK)│
│ • username      │ │ • name       │ │ • emp_number │
│ • email         │ │ • code       │ │ • first_name │
│ • password_hash │ │ • head_id ───┼─┤ • last_name  │
│ • role          │ │ • is_active  │ │ • natl_id    │
│ • employee_id ──┼─┼──────────────┘ │ • kra_pin    │
│ • is_active     │ │                │ • dept_id    │
│ • last_login    │ │                │ • position_id│
│ • 2fa_enabled   │ │                │ • manager_id │
└──────────────────┘ │                │ • status     │
         │            │                └──────────────┘
         │            │                      │
         │            │                      │
         │            └──────────────┐       │
         │                           │       │
         ▼                           ▼       ▼
┌──────────────────┐          ┌──────────────────┐
│ user_sessions    │          │ employee_users   │
│─────────────────│          │──────────────────│
│ • id (PK)       │          │ • id (PK)        │
│ • user_type     │          │ • employee_id ◄──┤
│ • user_id (FK)  │          │ • username       │
│ • session_token │          │ • email          │
│ • ip_address    │          │ • password_hash  │
│ • login_time    │          │ • is_active      │
│ • expires_at    │          │ • last_login     │
└──────────────────┘          │ • 2fa_enabled    │
         │                    │ • force_pwd_chg  │
         │                    └──────────────────┘
         │                              │
         │                              │
         └──────────────┬───────────────┘
                        │
                        ▼
                ┌──────────────────┐
                │   login_logs     │
                │──────────────────│
                │ • id (PK)        │
                │ • user_type      │
                │ • user_id        │
                │ • username       │
                │ • status         │
                │ • ip_address     │
                │ • created_at     │
                └──────────────────┘
```

## Payroll & HR Management

```
┌──────────────┐
│  employees   │
│──────────────│
│ • id (PK)    │
└──────────────┘
      │ │ │ │
      │ │ │ └────────────────────────┐
      │ │ │                          │
      │ │ └──────────────┐           │
      │ │                │           │
      │ └─────────┐      │           │
      │           │      │           │
      ▼           ▼      ▼           ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│salary_struct │ │  attendance  │ │employee_bank_dtl │
│──────────────│ │──────────────│ │──────────────────│
│• id (PK)     │ │• id (PK)     │ │• id (PK)         │
│• emp_id (FK) │ │• emp_id (FK) │ │• emp_id (FK)     │
│• basic_sal   │ │• att_date    │ │• payment_method  │
│• allowances  │ │• check_in    │ │• bank_name       │
│• effective_dt│ │• check_out   │ │• account_number  │
│• is_active   │ │• status      │ │• mpesa_number    │
└──────────────┘ │• work_hours  │ └──────────────────┘
                 └──────────────┘
      │                  │
      │                  │
      ▼                  ▼
┌──────────────┐ ┌──────────────────┐
│   payroll    │ │ next_of_kin      │
│──────────────│ │──────────────────│
│• id (PK)     │ │• id (PK)         │
│• org_id (FK) │ │• emp_id (FK)     │
│• emp_id (FK) │ │• full_name       │
│• period_month│ │• relationship    │
│• period_year │ │• phone_number    │
│• basic_sal   │ │• is_primary      │
│• allowances  │ │• is_beneficiary  │
│• overtime    │ └──────────────────┘
│• gross_pay   │
│• paye        │
│• nssf        │
│• shif        │
│• deductions  │
│• net_pay     │
│• status      │
└──────────────┘
```

## Leave Management

```
┌──────────────────┐
│  organizations   │
└──────────────────┘
         │
         ▼
┌──────────────────┐
│   leave_types    │
│──────────────────│
│ • id (PK)        │
│ • org_id (FK)    │
│ • name           │
│ • code           │
│ • days_per_year  │
│ • is_paid        │
└──────────────────┘
         │
         │ ┌──────────────┐
         └─┤  employees   │
           └──────────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
┌──────────────────┐ ┌──────────────────────┐
│ leave_balance    │ │ leave_applications   │
│──────────────────│ │──────────────────────│
│• id (PK)         │ │• id (PK)             │
│• emp_id (FK)     │ │• emp_id (FK)         │
│• lv_type_id (FK) │ │• lv_type_id (FK)     │
│• year            │ │• start_date          │
│• total_days      │ │• end_date            │
│• used_days       │ │• days_requested      │
│• remaining_days  │ │• reason              │
│• carried_forward │ │• status              │
└──────────────────┘ │• approved_by         │
                     │• applied_date        │
                     └──────────────────────┘
```

## Audit & Security

```
┌──────────────────┐     ┌──────────────────────┐
│ employer_users   │     │   employee_users     │
│   OR employees   │     │                      │
└──────────────────┘     └──────────────────────┘
         │                         │
         └────────────┬────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│  audit_log       │      │user_permissions  │
│──────────────────│      │──────────────────│
│• id (PK)         │      │• id (PK)         │
│• user_type       │      │• user_type       │
│• user_id         │      │• user_id         │
│• action          │      │• permission_key  │
│• table_name      │      │• permission_val  │
│• record_id       │      │• granted_by      │
│• old_values      │      │• expires_at      │
│• new_values      │      └──────────────────┘
│• ip_address      │
│• created_at      │
└──────────────────┘
```

## Key Relationships

### Authentication Flow
1. **Employer Login** → `employer_users` → Create `user_sessions` → Log in `login_logs`
2. **Employee Login** → `employee_users` → Create `user_sessions` → Log in `login_logs`

### Data Access Control
1. **Organizations** → Filter all data by `organization_id`
2. **Employer Users** → Access based on `role` and `user_permissions`
3. **Employee Users** → Access only own data via `employee_id`

### Payroll Processing Flow
1. `employees` → Get active employees
2. `salary_structures` → Get current salary
3. `attendance` → Calculate work hours/absences
4. `leave_applications` → Deduct approved leaves
5. `payroll` → Calculate and store payroll
6. `employee_bank_details` → Payment information

### Leave Management Flow
1. `leave_types` → Available leave types
2. `leave_balance` → Check available balance
3. `leave_applications` → Submit application
4. Approval by employer user
5. Update `leave_balance` → Deduct used days
6. Update `attendance` → Mark leave days

## Table Categories

### 🔐 Authentication (5 tables)
- `organizations`
- `employer_users`
- `employee_users`
- `user_sessions`
- `login_logs`

### 👥 Employee Management (7 tables)
- `employees`
- `departments`
- `positions`
- `employee_bank_details`
- `next_of_kin`
- `employee_documents`
- `user_permissions`

### 💰 Payroll (4 tables)
- `salary_structures`
- `payroll`
- `payroll_periods`
- `attendance`

### 🏖️ Leave Management (3 tables)
- `leave_types`
- `leave_balance`
- `leave_applications`

### 🔍 Audit & System (2 tables)
- `audit_log`
- `system_settings`

## Indexes Summary

### Performance Optimization
All tables include strategic indexes on:
- Primary keys (automatically indexed)
- Foreign keys
- Frequently queried fields
- Composite indexes for common query patterns

### Example Composite Indexes
```sql
-- Employee lookup by organization and status
idx_emp_org_status (organization_id, employment_status, department_id)

-- Payroll period queries
idx_payroll_org_period_status (organization_id, period_year, period_month, payment_status)

-- Attendance tracking
idx_attendance_emp_date_status (employee_id, attendance_date, status)

-- Leave queries
idx_leave_emp_status (employee_id, status, start_date)
```

## Views for Quick Access

### `view_active_employees`
Combined employee data with department and position info

### `view_current_payroll_summary`
Current month payroll aggregated by organization

### `view_leave_balance_summary`
Employee leave balances with all details

## Data Flow Example: Employee Login to View Payslip

```
1. Employee enters credentials
   ↓
2. Query employee_users table
   ↓
3. Verify password_hash
   ↓
4. Create entry in user_sessions
   ↓
5. Log successful login in login_logs
   ↓
6. Get employee_id from employee_users
   ↓
7. Query payroll table filtered by employee_id
   ↓
8. Return payslip data to employee
   ↓
9. Log data access in audit_log
```

## Security Features in Schema

✅ Separate authentication tables (employer vs employee)  
✅ Password hashing (bcrypt - password_hash field)  
✅ Session token management  
✅ Failed login tracking  
✅ Account lockout mechanism  
✅ Two-factor authentication support  
✅ IP address logging  
✅ Audit trail for all changes  
✅ Permission-based access control  
✅ Organization data isolation  

---

**Schema Version**: 2.0 (Dual Login)  
**Last Updated**: October 16, 2025  
**Total Tables**: 21 core tables + 3 views  
**Charset**: utf8mb4 (Full Unicode support)  
**Engine**: InnoDB (ACID compliance)
