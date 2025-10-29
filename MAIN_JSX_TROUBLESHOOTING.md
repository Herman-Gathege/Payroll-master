# 🔧 Main.jsx Not Resolving - Troubleshooting Guide

## Issue
The site is not loading - main.jsx is not resolving properly.

## Quick Diagnosis

### Step 1: Check Browser Console
1. Open browser at http://localhost:5173
2. Press F12 to open DevTools
3. Go to **Console** tab
4. Look for errors (red text)

### Common Errors & Solutions:

#### Error: "Failed to resolve module"
**Cause:** Missing dependency or incorrect import path

**Solution:**
```powershell
cd frontend
npm install
```

#### Error: "Uncaught SyntaxError"
**Cause:** JavaScript syntax error in code

**Solution:** Check the file mentioned in error and fix syntax

#### Error: "Cannot find module"
**Cause:** Missing file or incorrect path

**Solution:** Verify all imported files exist

#### Error: CORS policy
**Cause:** Backend not allowing frontend requests

**Solution:** Already fixed in auth.php files

---

## Step-by-Step Debugging

### 1. Check if Vite Server is Running
```powershell
# Should show:
# VITE v5.4.20  ready in XXX ms
# ➜  Local:   http://localhost:5173/
```

If not showing, restart:
```powershell
cd frontend
npm run dev
```

### 2. Check Dependencies
```powershell
cd frontend
npm install
```

### 3. Clear Cache and Restart
```powershell
# Stop server (Ctrl+C)
cd frontend
rm -r node_modules/.vite
npm run dev
```

### 4. Test Diagnostic Page
Open: http://localhost:5173/diagnostic.html

Should show:
- ✓ Frontend HTML loaded
- ✓ Backend accessible  
- React app status

### 5. Check Network Tab
1. Open F12 → Network tab
2. Reload page
3. Look for:
   - `main.jsx` - Should be 200 OK
   - Any 404 errors?
   - Any failed requests?

---

## Common Issues & Fixes

### Issue 1: Blank White Page
**Symptoms:** Page loads but nothing shows

**Check:**
1. Browser console for JavaScript errors
2. React DevTools (if installed)
3. Element inspector - is `<div id="root">` empty?

**Fix:**
```javascript
// Check in browser console:
console.log(document.getElementById('root'))
// Should show <div id="root">...</div> with content
```

### Issue 2: Module Resolution Error
**Symptoms:** "Failed to resolve module" in console

**Fix:**
```powershell
cd frontend
rm -r node_modules
rm package-lock.json
npm install
npm run dev
```

### Issue 3: React Not Rendering
**Symptoms:** HTML loads but React doesn't mount

**Check:**
- Is `/src/main.jsx` being loaded?
- Network tab shows main.jsx as 200 OK?
- Any errors in main.jsx or App.jsx?

**Fix:**
```powershell
# Verify files exist
ls src/main.jsx
ls src/App.jsx
ls src/contexts/AuthContext.jsx

# If missing, files were deleted/moved
```

### Issue 4: Port Conflict
**Symptoms:** Server won't start or shows wrong port

**Fix:**
```powershell
# Kill any process using port 5173
netstat -ano | findstr :5173
# Note the PID, then:
taskkill /PID <PID> /F

# Restart
npm run dev
```

### Issue 5: HMR (Hot Module Reload) Issues
**Symptoms:** Changes don't reflect, page keeps reloading

**Fix:**
```powershell
# Clear Vite cache
cd frontend
rm -r node_modules/.vite
npm run dev
```

---

## Manual Verification

### Check Main Files Exist:
```powershell
cd frontend
ls index.html          # Should exist
ls src/main.jsx        # Should exist
ls src/App.jsx         # Should exist
ls src/index.css       # Should exist
```

### Check Main.jsx Content:
Should have:
- `import React from 'react'`
- `import ReactDOM from 'react-dom/client'`
- `import App from './App'`
- `ReactDOM.createRoot(document.getElementById('root')).render(...)`

### Check Index.html:
Should have:
- `<div id="root"></div>`
- `<script type="module" src="/src/main.jsx"></script>`

---

## Browser Debugging Commands

Open browser console (F12) and run:

```javascript
// Check if root element exists
console.log(document.getElementById('root'))

// Check if React loaded
console.log(window.React)

// Check loaded scripts
console.log(document.scripts)

// Check for errors
console.log('Errors:', performance.getEntriesByType('navigation'))

// Force reload without cache
location.reload(true)
```

---

## Nuclear Option: Complete Reset

If nothing works, complete reset:

```powershell
# Stop server (Ctrl+C)

# Navigate to frontend
cd C:\Users\ianos\work\PHP\Payroll-master\frontend

# Remove everything
rm -r node_modules
rm -r .vite
rm package-lock.json

# Reinstall
npm install

# Start fresh
npm run dev
```

---

## Check Vite Config

File: `frontend/vite.config.js`

Should have:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // other settings...
  }
})
```

---

## Expected Working Flow

1. **Start server:** `npm run dev`
2. **Vite starts:** Shows "VITE ready in XXXms"
3. **Open browser:** http://localhost:5173
4. **HTML loads:** index.html downloaded
5. **Module loads:** /src/main.jsx loaded as ES module
6. **React mounts:** ReactDOM.createRoot runs
7. **App renders:** App component renders to #root
8. **Router works:** BrowserRouter handles navigation
9. **Page shows:** Login page visible

---

## Test Files Created

1. **diagnostic.html** - Browser diagnostic page
   - URL: http://localhost:5173/diagnostic.html
   - Tests: Frontend, Backend, React, Storage

---

## What to Check Next

### If Page is Completely Blank:
1. View page source (Ctrl+U) - Should show HTML
2. If HTML is there but nothing renders → JavaScript error
3. Check console for errors
4. Check if main.jsx is being loaded (Network tab)

### If Getting 404:
1. Server might not be running
2. Wrong URL (should be localhost:5173, not 3000)
3. Vite cache issue → Clear and restart

### If Page Loads Then Disappears:
1. React error during rendering
2. Route guard redirecting
3. Check AuthContext initialization
4. Check App.jsx routes

---

## Success Indicators

When working correctly, you should see:

**Console (F12):**
```
AuthContext: Calling employer login API... (when you login)
No errors or warnings
```

**Network Tab:**
```
main.jsx          200 OK  (module)
App.jsx           200 OK  (module)
AuthContext.jsx   200 OK  (module)
index.css         200 OK  (css)
```

**Page:**
```
Login form visible
Can type in username/password
Login button clickable
```

---

## Next Steps

1. **Open diagnostic page:** http://localhost:5173/diagnostic.html
2. **Check what errors it shows**
3. **Report back what you see**
4. **I'll help fix the specific issue**

---

**Created:** $(Get-Date)  
**Status:** Diagnostic mode enabled  
**Action:** Check diagnostic page and browser console
