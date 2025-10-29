# 🔧 Fix "Invalid Username or Password" Error

## The Problem
You're getting "Invalid username or password" when trying to login with `admin` / `admin123`

## Possible Causes
1. ❌ Admin user not created in database
2. ❌ Backend not running
3. ❌ Backend can't connect to database
4. ❌ Wrong password hash

---

## ✅ SOLUTION - Step by Step

### Step 1: Make Sure Backend is Running

**Open a NEW Command Prompt** and run:
```bash
cd c:\Users\ianos\work\PHP\Payroll-master\backend
php -S localhost:8000
```

**You should see:**
```
PHP 8.4.11 Development Server started at ...
Listening on http://localhost:8000
```

**Keep this window open!**

---

### Step 2: Test Backend Connection

Open your browser and go to:
```
http://localhost:8000/test_connection.php
```

You should see JSON output showing:
- ✅ Database: Connected successfully
- ✅ Admin user: Found
- ✅ Password test: Password hash is correct

**If you see "Admin user: NOT FOUND"**, continue to Step 3.

---

### Step 3: Create Admin User

**Option A: Using MySQL Workbench/phpMyAdmin** (Easiest)

1. Open your MySQL client
2. Connect to `hr_management_system` database
3. File → Run SQL Script
4. Select: `create_admin_simple.sql`
5. Click "Run"
6. You should see the admin user details

**Option B: Using SQL directly**

Run this in your MySQL client:

```sql
USE hr_management_system;

-- Delete old admin if exists
DELETE FROM users WHERE username = 'admin';

-- Create new admin
INSERT INTO users (username, email, password_hash, role, is_active, employee_id)
VALUES (
    'admin',
    'admin@company.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    1,
    NULL
);

-- Verify
SELECT * FROM users WHERE username = 'admin';
```

---

### Step 4: Test Login Again

1. Go to: http://localhost:3000
2. Login with:
   - **Username:** admin
   - **Password:** admin123
3. Should work now! ✅

---

## 🔍 Debugging Checklist

Run through this checklist:

### ✅ Frontend Running?
- Open: http://localhost:3000
- Should show login page

### ✅ Backend Running?
- Open: http://localhost:8000
- Should show some output (not "page not found")

### ✅ Backend Can Connect to Database?
- Open: http://localhost:8000/test_connection.php
- Should show: "Connected successfully"

### ✅ Admin User Exists?
In MySQL, run:
```sql
USE hr_management_system;
SELECT username, email, role FROM users WHERE username = 'admin';
```

Should return one row with username "admin"

### ✅ Auth Endpoint Working?
Test with curl or Postman:
```bash
curl -X POST http://localhost:8000/api/auth.php -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

Should return: `"message": "Login successful"`

---

## 🆘 Still Not Working?

### Issue: Backend shows "Connection error"

**Fix:** Update `backend/config/database.php`

Check these values match your MySQL setup:
```php
private $host = "localhost";
private $database_name = "hr_management_system";
private $username = "hruser";
private $password = "hr_password_123";
```

**If you're using root user:**
```php
private $username = "root";
private $password = ""; // or your root password
```

---

### Issue: "Table 'users' doesn't exist"

**Fix:** Import the database schema

```sql
USE hr_management_system;
-- Then import schema_fixed.sql
```

---

### Issue: Frontend shows "Network Error"

**Fix:** Make sure backend is running on port 8000

Check `frontend/.env` has:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 📋 Quick Test Commands

**Test 1: Backend is accessible**
```
Open: http://localhost:8000
```
Should show: Some output (not error)

**Test 2: Database connection**
```
Open: http://localhost:8000/test_connection.php
```
Should show: JSON with "Connected successfully"

**Test 3: Admin user exists**
```sql
USE hr_management_system;
SELECT COUNT(*) FROM users WHERE username='admin';
```
Should return: 1

**Test 4: Frontend can reach backend**
```
Open browser console (F12) on http://localhost:3000
Try to login
Check Network tab for API calls
```
Should show: POST to http://localhost:8000/api/auth.php

---

## ✅ Working Setup Looks Like This

**Terminal 1 (Frontend):**
```
VITE v5.4.20  ready in 441 ms
➜  Local:   http://localhost:3000/
```

**Terminal 2 (Backend):**
```
PHP 8.4.11 Development Server started
Listening on http://localhost:8000
```

**Browser:**
- http://localhost:3000 → Shows login page
- Enter: admin / admin123
- Should redirect to dashboard ✅

---

## 🎯 Files I Created to Help

| File | Purpose |
|------|---------|
| `create_admin_simple.sql` | ✅ Creates admin user correctly |
| `backend/test_connection.php` | ✅ Tests database connection |
| `backend/api/auth.php` | ✅ Login API endpoint |
| `FIX_LOGIN_ERROR.md` | This file - troubleshooting guide |

---

## 🚀 Final Checklist

Before trying to login again:

- [ ] Backend is running (Terminal showing "Listening on http://localhost:8000")
- [ ] Frontend is running (Browser can open http://localhost:3000)
- [ ] Database `hr_management_system` exists
- [ ] Admin user exists (verified in MySQL)
- [ ] Test connection works (http://localhost:8000/test_connection.php)

If all checked ✅, login should work!

---

## 💡 Pro Tip

If you're still stuck, send me the output of:
```
http://localhost:8000/test_connection.php
```

This will show me exactly what's wrong!

---

**You're very close! Just create the admin user and make sure backend is running!** 🎉
