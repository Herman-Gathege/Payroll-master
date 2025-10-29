# Setup Apache DocumentRoot

## Issue
The new endpoints return 404 because Apache can't find them. This is because Apache's DocumentRoot is pointing to `C:/xampp/htdocs` but our project is in `C:/Users/ianos/work/PHP/Payroll-master`.

## Solution: Choose One

### Option 1: Create Symlink (Easiest)

**Windows Command Prompt (Run as Administrator):**
```cmd
cd C:\xampp\htdocs
mklink /D backend C:\Users\ianos\work\PHP\Payroll-master\backend
```

This creates a symbolic link so `http://localhost/backend/api/...` points to your project.

**Test it:**
```cmd
curl http://localhost/backend/api/employer/employees
```

---

### Option 2: Copy Backend to htdocs

```cmd
xcopy /E /I C:\Users\ianos\work\PHP\Payroll-master\backend C:\xampp\htdocs\backend
```

**Note:** You'll need to copy again every time you make changes.

---

### Option 3: Change Apache DocumentRoot

**Edit:** `C:\xampp\apache\conf\httpd.conf`

**Find:**
```apache
DocumentRoot "C:/xampp/htdocs"
<Directory "C:/xampp/htdocs">
```

**Change to:**
```apache
DocumentRoot "C:/Users/ianos/work/PHP/Payroll-master"
<Directory "C:/Users/ianos/work/PHP/Payroll-master">
```

**Restart Apache**

---

## Recommended: Option 1 (Symlink)

It's the cleanest and doesn't require copying files.

### After Setup

1. **Test endpoints:**
   ```cmd
   php test_production_endpoints.php
   ```

2. **Test in browser:**
   - Login: http://localhost:5173/employer/login
   - Credentials: admin / Admin@2025!
   - Dashboard should load with data! ✅

---

## Quick Test

```bash
# After creating symlink, this should work:
curl http://localhost/backend/api/employer/auth.php

# Should return: "Method not allowed" (because GET is not allowed on login)
# That's GOOD - it means the file is found!
```

---

## If Symlink Fails

Some Windows versions don't allow symlinks. Use **Option 2** (copy files) instead:

```cmd
xcopy /E /I C:\Users\ianos\work\PHP\Payroll-master\backend C:\xampp\htdocs\backend
```

Then whenever you make changes:
```cmd
xcopy /E /Y C:\Users\ianos\work\PHP\Payroll-master\backend C:\xampp\htdocs\backend
```
