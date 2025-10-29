# ⚠️ IMPORTANT: Restart Apache to Fix Change Password

## The Issue
You're seeing **"Username and password are required"** on the change password screen because Apache is caching the old version of the PHP code.

## The Solution: Restart Apache

### Method 1: XAMPP Control Panel (Recommended)
1. Open **XAMPP Control Panel**
2. Click **Stop** next to Apache
3. Wait 2-3 seconds
4. Click **Start** next to Apache
5. Test the change password again

### Method 2: Windows Services
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find **Apache2.4** service
4. Right-click → **Restart**

### Method 3: Command Line (as Administrator)
```cmd
net stop Apache2.4
net start Apache2.4
```

## After Restarting

1. Go to: http://localhost:5173/employee/login
2. Login with:
   - Username: `john.doe`
   - Password: `Employee@2025!`
3. You'll be redirected to change password screen
4. Fill in:
   - **Current Password**: `Employee@2025!`
   - **New Password**: (choose a new password, at least 8 characters)
   - **Confirm New Password**: (same as above)
5. Click "Change Password"
6. Should work now! ✓

## What Was Fixed

The backend code at `backend/api/employee/auth.php` now:
- Correctly parses the `action=change-password` query parameter
- Routes to the change password endpoint instead of login
- Has detailed logging for debugging

## Verification

To verify Apache picked up the changes, you can check if this returns the new endpoint:

```bash
curl "http://localhost/backend/api/employee/auth.php?action=change-password" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer faketoken" \
  -d '{"new_password":"test123"}'
```

**Expected response** (after restart):
```json
{"success":false,"message":"Invalid session"}
```
(This is good - it means it's hitting the change password endpoint)

**Wrong response** (before restart):
```json
{"success":false,"message":"Username and password are required"}
```
(This means it's still hitting the login endpoint)

## Test Credentials

**Employer:**
- Username: `admin`
- Password: `Admin@2025!`

**Employee:**
- Username: `john.doe`
- Password: `Employee@2025!`

---

## Technical Details

The fix involved updating the action parsing logic in `backend/api/employee/auth.php`:

```php
// Check query parameter first
if (isset($_GET['action'])) {
    $action = str_replace('-', '_', $_GET['action']);
}
```

This allows the API to recognize `?action=change-password` and route to the correct endpoint.

The change password endpoint expects:
- Authorization header with Bearer token
- JSON body with: `current_password` and `new_password`
