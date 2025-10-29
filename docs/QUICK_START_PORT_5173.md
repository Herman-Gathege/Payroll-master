# 🚀 Quick Start Guide - Updated for Port 5173

## ⚡ Port Configuration

The application has been updated to run on **port 5173** (Vite's default) to avoid conflicts with other services on port 3000.

---

## 🔧 Configuration Changes Made

### 1. Frontend Configuration ✅
- **Vite Config:** Updated to port 5173
- **Environment Variables:** Updated API URL to `http://localhost/backend/api`
- **CORS Headers:** Backend updated to allow `http://localhost:5173`

### 2. Backend Configuration ✅
- **Employer Auth API:** CORS updated to allow port 5173
- **Employee Auth API:** CORS updated to allow port 5173
- **Credentials Support:** Added `Access-Control-Allow-Credentials: true`

---

## 🏃 How to Start the Application

### Prerequisites:
1. ✅ MySQL Server running with `hr_management_system` database
2. ✅ Apache/XAMPP/WAMP with PHP 7.4+
3. ✅ Node.js 16+ installed

### Step 1: Start Backend (PHP)
Your backend should already be running if you have XAMPP/WAMP started.

**Verify Backend is Running:**
```powershell
# Test employer auth endpoint
curl http://localhost/backend/api/employer/auth
```

### Step 2: Start Frontend (React)
```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The application will start on: **http://localhost:5173**

---

## 🌐 Access URLs

### Frontend:
- **Landing Page:** http://localhost:5173
- **Employer Login:** http://localhost:5173/employer/login
- **Employee Login:** http://localhost:5173/employee/login

### Backend API:
- **Base URL:** http://localhost/backend/api
- **Employer Auth:** http://localhost/backend/api/employer/auth
- **Employee Auth:** http://localhost/backend/api/employee/auth

---

## 🔐 Login Credentials

### Employer Login:
- **URL:** http://localhost:5173/employer/login
- **Username:** `admin`
- **Password:** `Admin@2025!`
- **Access:** Full system (Dashboard, Employees, Payroll, Leave, etc.)

### Employee Login:
- **URL:** http://localhost:5173/employee/login
- **Username:** `john.doe`
- **Password:** `Employee@2025!`
- **Note:** Must change password on first login
- **Access:** Self-service portal (Profile, Payslips, Leave)

---

## 📋 Environment Variables

### Frontend `.env` File:
```env
VITE_API_BASE_URL=http://localhost/backend/api
```

### Vite Config:
```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost/backend/api',
      changeOrigin: true
    }
  }
}
```

---

## 🐛 Troubleshooting

### Issue: "Port 5173 is already in use"
**Solution 1:** Kill the process using port 5173
```powershell
# Find process using port 5173
netstat -ano | findstr :5173

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Solution 2:** Use a different port
Edit `frontend/vite.config.js`:
```javascript
server: {
  port: 5174, // or any available port
}
```

### Issue: CORS errors in browser console
**Cause:** Backend not updated or cached headers

**Solution:**
1. Clear browser cache
2. Verify backend CORS headers show `http://localhost:5173`
3. Restart XAMPP/WAMP

### Issue: API calls return 404
**Cause:** Backend not running or incorrect URL

**Solution:**
1. Verify XAMPP/WAMP is running
2. Check `http://localhost/backend/api/employer/auth` in browser
3. Verify `.htaccess` is configured correctly

### Issue: Login works but redirects fail
**Cause:** Route guards not properly configured

**Solution:**
1. Check browser console for errors
2. Verify token is stored in localStorage
3. Check userType is set correctly

---

## 🧪 Quick Test Checklist

After starting the application:

- [ ] Frontend loads at http://localhost:5173
- [ ] Employer login page loads at http://localhost:5173/employer/login
- [ ] Employee login page loads at http://localhost:5173/employee/login
- [ ] Can login as admin (Admin@2025!)
- [ ] Redirects to employer dashboard
- [ ] Can logout
- [ ] Can login as employee (john.doe/Employee@2025!)
- [ ] Prompted to change password
- [ ] Can change password successfully
- [ ] Redirects to employee portal
- [ ] No CORS errors in console

---

## 📊 Development Server Info

### Frontend (Vite):
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Available Scripts:
```bash
npm run dev      # Start development server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🔄 What Changed from Port 3000 to 5173?

| File | Old Value | New Value |
|------|-----------|-----------|
| `vite.config.js` | `port: 3000` | `port: 5173` |
| `frontend/.env` | - | `VITE_API_BASE_URL=http://localhost/backend/api` |
| `employer/auth.php` | `Allow-Origin: *` | `Allow-Origin: http://localhost:5173` |
| `employee/auth.php` | `Allow-Origin: *` | `Allow-Origin: http://localhost:5173` |

---

## 📝 Notes

1. **Port 5173** is Vite's default port and less likely to conflict
2. **CORS** is now properly configured with credentials support
3. **API Base URL** updated to match your PHP backend location
4. **Session cookies** will work correctly with credentials enabled

---

## 🎯 Next Steps After Starting

1. **Test Authentication:**
   - Login as employer
   - Login as employee
   - Test password change
   - Test logout

2. **Create Backend Endpoints:**
   - `backend/api/employer/employees.php`
   - `backend/api/employee/profile.php`
   - `backend/api/employee/payslips.php`
   - `backend/api/employee/leave.php`

3. **Update Frontend Components:**
   - Update `Employees.jsx`
   - Update `Payroll.jsx`
   - Update `Leave.jsx`
   - Create `EmployeePortal.jsx`

---

## 💡 Pro Tips

1. **Auto-open browser:** Add `--open` to dev script:
   ```json
   "dev": "vite --open"
   ```

2. **Expose to network:** Add `--host` to test on mobile:
   ```json
   "dev": "vite --host"
   ```

3. **Use environment-specific configs:**
   - `.env.development` for dev settings
   - `.env.production` for prod settings

4. **Hot Module Replacement (HMR):** Vite automatically reloads on file changes

---

**Last Updated:** October 16, 2025  
**Port:** 5173 (Changed from 3000)  
**Status:** ✅ Ready to Start
