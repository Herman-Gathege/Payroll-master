# 🔧 Fix for Foreign Key Error #1005

## The Problem

You got error: `Can't create table hr_management_system.users (errno: 150 "Foreign key constraint is incorrectly formed")`

This happened because of a circular dependency:
- `users` table references `employees` table
- But `employees` doesn't exist yet when `users` is being created

## ✅ The Solution

I've created a **fixed schema** that creates tables in the correct order.

---

## 🚀 Quick Fix (3 Steps)

### Step 1: Drop the database (if it was partially created)

Open your MySQL client and run:

```sql
DROP DATABASE IF EXISTS hr_management_system;
```

### Step 2: Run the setup script

```sql
-- This creates the database and user
CREATE DATABASE hr_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'hruser'@'localhost' IDENTIFIED BY 'hr_password_123';
GRANT ALL PRIVILEGES ON hr_management_system.* TO 'hruser'@'localhost';
FLUSH PRIVILEGES;
USE hr_management_system;
```

### Step 3: Import the FIXED schema

**Use this file instead:** `database/schema_fixed.sql`

In MySQL Workbench:
- File → Run SQL Script
- Select: `database/schema_fixed.sql`
- Click "Run"

Or via command line (if MySQL is in PATH):
```bash
mysql -u hruser -phr_password_123 hr_management_system < database\schema_fixed.sql
```

### Step 4: Create admin user

```sql
INSERT INTO users (username, email, password_hash, role, is_active)
VALUES ('admin', 'admin@company.com',
'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'admin', 1);
```

---

## ✅ Verification

After running the above, check if it worked:

```sql
USE hr_management_system;
SHOW TABLES;
```

You should see these tables:
- ✅ departments
- ✅ positions
- ✅ employees
- ✅ users
- ✅ leave_types
- ✅ leave_applications
- ✅ leave_balances
- ✅ attendance
- ✅ salary_structures
- ✅ payroll
- ✅ system_settings
- And more...

Check if admin user was created:
```sql
SELECT username, email, role FROM users;
```

You should see:
```
username: admin
email: admin@company.com
role: admin
```

---

## 📁 Files to Use

| ❌ Don't Use | ✅ Use Instead |
|-------------|---------------|
| ~~database/schema.sql~~ | **database/schema_fixed.sql** |
| ~~setup_database.sql~~ | Just run the SQL commands above |
| ✅ create_admin_user.sql | Or use SQL command above |

---

## 🎯 Complete Setup Process

Here's the complete process in order:

**1. In MySQL client, run these commands:**

```sql
-- Drop old database if exists
DROP DATABASE IF EXISTS hr_management_system;

-- Create new database
CREATE DATABASE hr_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER IF NOT EXISTS 'hruser'@'localhost' IDENTIFIED BY 'hr_password_123';

-- Grant privileges
GRANT ALL PRIVILEGES ON hr_management_system.* TO 'hruser'@'localhost';
FLUSH PRIVILEGES;

-- Switch to the database
USE hr_management_system;
```

**2. Import the fixed schema:**

- File → Run SQL Script → `database/schema_fixed.sql`

**3. Create admin user:**

```sql
INSERT INTO users (username, email, password_hash, role, is_active)
VALUES ('admin', 'admin@company.com',
'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'admin', 1);
```

**4. Verify it worked:**

```sql
SELECT COUNT(*) as table_count FROM information_schema.tables
WHERE table_schema = 'hr_management_system';
```

Should return at least 10+ tables.

---

## 🚀 After Database is Set Up

1. **Start the backend:**
   ```bash
   cd c:\Users\ianos\work\PHP\Payroll-master\backend
   php -S localhost:8000
   ```

2. **Open your browser:**
   - Go to: http://localhost:3000
   - Login: admin / admin123

---

## 🆘 Still Having Issues?

**Error: "Access denied for user 'hruser'"**
- Make sure you ran the CREATE USER and GRANT commands
- Try with root user instead

**Error: "Table already exists"**
- Drop the database first: `DROP DATABASE hr_management_system;`
- Then start fresh with Step 1

**Can't find MySQL client?**
- Try MySQL Workbench: https://dev.mysql.com/downloads/workbench/
- Or phpMyAdmin: http://localhost/phpmyadmin (if using XAMPP)
- Or HeidiSQL: https://www.heidisql.com/

---

## 📋 Summary

**The Fix:**
- ✅ Use `schema_fixed.sql` instead of `schema.sql`
- ✅ Tables are now created in the correct order
- ✅ No more foreign key errors

**Next Step:**
- Once database is set up, start the backend and login!

---

**You got this!** Just follow the 4 steps above and you'll be running in 5 minutes! 🚀
