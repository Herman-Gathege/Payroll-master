# Login Diagnostic Guide

## Current Issue
Login shows "Invalid username or password" error

## Where the Error Can Come From

### 1. Frontend - EmployerLogin.jsx (Line 44)
**Location:** `frontend/src/pages/EmployerLogin.jsx:44`

```javascript
setError(err.response?.data?.message || err.message || 'Invalid username or password')
```

This line displays the error. The error can come from:
- `err.response.data.message` - Backend API error message
- `err.message` - JavaScript error message
- Default: `'Invalid username or password'`

---

### 2. Frontend - AuthContext.jsx (Line 33)
**Location:** `frontend/src/contexts/AuthContext.jsx:33`

```javascript
if (!response.success) {
  throw new Error(response.message || 'Login failed')
}
```

Checks if backend returns `success: false` and throws error

---

### 3. Backend - employer/auth.php (Multiple locations)

#### 3a. Missing username/password (Line 216-217)
```php
http_response_code(400);
echo json_encode(["success" => false, "message" => "Username and password are required"]);
```

#### 3b. User not found (Line 209-210)
```php
http_response_code(401);
echo json_encode(["success" => false, "message" => "Invalid username or password"]);
```

#### 3c. Wrong password (Line 187-191)
```php
http_response_code(401);
$message = "Invalid username or password";
if ($locked_until) {
    $message = "Too many failed attempts. Account locked for 30 minutes.";
}
echo json_encode(["success" => false, "message" => $message]);
```

#### 3d. Account locked (Line 74-77)
```php
http_response_code(403);
echo json_encode([
    "success" => false,
    "message" => "Account is locked. Please try again later or contact administrator."
]);
```

#### 3e. Database error (Line 212-216)
```php
http_response_code(500);
echo json_encode([
    "success" => false,
    "message" => "Database error occurred",
    "error" => $e->getMessage()
]);
```

---

## Diagnostic Steps with Logging Enabled

### Step 1: Open Browser Console
1. Open http://localhost:5173/employer/login
2. Press F12 to open Developer Tools
3. Go to Console tab

### Step 2: Attempt Login
Use credentials:
- Username: `admin`
- Password: `Admin@2025!`

### Step 3: Check Console Logs

You should see logs in this order:

```
[EmployerLogin] Attempting employer login...
[AuthContext] Calling employer login API...
[authService.employerLogin] Starting login request
[authService.employerLogin] Username: admin
[authService.employerLogin] Password length: 12
[API Interceptor] Request: {url: '/employer/auth.php', method: 'post', ...}
```

If successful:
```
[API Interceptor] Response: {status: 200, data: {success: true, ...}}
[authService.employerLogin] Response received: ...
[AuthContext] Login complete
```

If failed:
```
[API Interceptor] Response error: {status: 401, data: {success: false, message: "..."}}
[authService.employerLogin] Error occurred: ...
[AuthContext] Login error: ...
```

### Step 4: Check Backend Logs

#### On Windows with XAMPP:
Check Apache error log: `C:\xampp\apache\logs\error.log`

Look for:
```
[EMPLOYER AUTH] Raw input: {"username":"admin","password":"Admin@2025!"}
[EMPLOYER AUTH] Decoded data: {"username":"admin","password":"Admin@2025!"}
[EMPLOYER AUTH] Username: admin
[EMPLOYER AUTH] Password length: 12
[EMPLOYER AUTH] Attempting login for user: admin
[EMPLOYER AUTH] Verifying password for user: admin
[EMPLOYER AUTH] Password verification result: SUCCESS or FAILED
[EMPLOYER AUTH] Login successful for: admin
```

### Step 5: Check Network Tab
1. Open Network tab in DevTools
2. Filter by "auth"
3. Attempt login
4. Click on the auth.php request
5. Check:
   - Request URL: Should be `http://localhost/backend/api/employer/auth.php`
   - Request Method: POST
   - Request Payload: `{"username":"admin","password":"Admin@2025!"}`
   - Response: Check status code and response body

---

## Common Issues and Solutions

### Issue 1: Network Error / Cannot connect
**Symptom:** "Network Error" in console
**Solution:** Backend server not running. Start Apache/PHP server

### Issue 2: 404 Not Found
**Symptom:** Request URL returns 404
**Solution:** Check VITE_API_BASE_URL in `.env` file

### Issue 3: CORS Error
**Symptom:** CORS policy error in console
**Solution:** Check backend CORS headers allow http://localhost:5173

### Issue 4: Wrong password stored
**Symptom:** Backend logs show "Password verification result: FAILED"
**Solution:** Run `php fix_admin_password.php` to reset password

### Issue 5: User not found
**Symptom:** Backend logs show "User not found: admin"
**Solution:** Check database has user. Run `php check_users.php`

### Issue 6: Database connection error
**Symptom:** "Database error occurred" message
**Solution:** Check database credentials in `backend/config/database.php`

---

## Quick Test Commands

```bash
# Test backend API directly
php test_api.php

# Check users in database
php check_users.php

# Reset admin password
php fix_admin_password.php

# Reset employee password
php fix_employee_password.php

# Check database connection
php test_login.php
```

---

## API Endpoint Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/employer/auth.php` | POST | Employer login |
| `/employee/auth.php` | POST | Employee login |
| `/employer/auth.php?action=logout` | POST | Employer logout |
| `/employer/auth.php?action=verify` | GET | Verify employer token |

---

## Expected Flow

1. User enters credentials in frontend
2. Frontend calls `employerLogin()` from AuthContext
3. AuthContext calls `authService.employerLogin()`
4. authService makes POST to `/employer/auth.php`
5. Backend validates credentials
6. Backend returns `{success: true, token: "...", user: {...}}`
7. AuthContext stores token and user in localStorage
8. Frontend navigates to dashboard
