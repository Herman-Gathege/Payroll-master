# 🏗️ Build & Deployment Guide - Fixing Blank Screen Issues

## ❌ Common Blank Screen Causes

1. **Missing SPA routing configuration** - Server doesn't fallback to index.html
2. **Wrong base path** - Assets loading from incorrect URLs
3. **Environment variables not loaded** - API calls failing
4. **CORS issues** - Backend rejecting requests
5. **Console errors** - JavaScript errors breaking the app

---

## ✅ Fixed Configuration

### 1. Updated `vite.config.js`
Added proper build configuration:
- ✅ Base path set to `/`
- ✅ Build output directory configured
- ✅ Code splitting for better performance
- ✅ Preview server configuration

### 2. Created `.env.production`
Added production environment variables:
- ✅ API base URL configured
- ✅ App name and version set

### 3. Nginx Configuration
Already has proper SPA routing:
- ✅ `try_files $uri $uri/ /index.html;`
- ✅ Fallback to index.html for 404s

---

## 🔨 Build Process

### Step 1: Clean Previous Build
```powershell
cd C:\Users\ianos\work\PHP\Payroll-master\frontend
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
```

### Step 2: Build for Production
```powershell
npm run build
```

**Expected Output:**
```
✓ built in XXXXms
dist/index.html                   X.XX kB
dist/assets/index-XXXXX.js        XXX.XX kB
dist/assets/index-XXXXX.css       XX.XX kB
```

### Step 3: Preview Build Locally
```powershell
npm run preview
```

**Access at:** http://localhost:5173

**Expected:** App loads correctly, no blank screen

---

## 🧪 Testing the Build

### Test 1: Preview Locally
```powershell
npm run preview
```

**Check:**
- [ ] Page loads (not blank)
- [ ] Login form visible
- [ ] Console has no errors (F12)
- [ ] Network requests working

### Test 2: Check Console
Open browser DevTools (F12) and check:

**Console Tab:**
- ❌ Look for red errors
- ⚠️ Check for warnings about missing modules
- ℹ️ Info messages are usually fine

**Network Tab:**
- ✅ All assets loaded (200 status)
- ❌ No 404 errors for CSS/JS files
- ✅ API requests reaching backend

### Test 3: Check Build Files
```powershell
ls dist
```

**Should contain:**
```
dist/
├── index.html              ✅
├── assets/
│   ├── index-[hash].js     ✅
│   ├── index-[hash].css    ✅
│   └── [other assets]      ✅
├── favicon.ico             ✅
└── [other static files]    ✅
```

---

## 🚀 Deployment Options

### Option 1: Apache/XAMPP (Recommended for You)

#### Step 1: Copy Build to htdocs
```powershell
# Copy dist folder to Apache
Copy-Item -Path "dist\*" -Destination "C:\xampp\htdocs\hrms" -Recurse -Force
```

#### Step 2: Create .htaccess for SPA Routing
Create `C:\xampp\htdocs\hrms\.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /hrms/
  
  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite everything else to index.html
  RewriteRule ^ index.html [L]
</IfModule>

# Cache static assets
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
  Header set Cache-Control "max-age=31536000, public, immutable"
</FilesMatch>

# Don't cache index.html
<FilesMatch "index\.html$">
  Header set Cache-Control "no-cache, no-store, must-revalidate"
</FilesMatch>
```

#### Step 3: Access Application
**URL:** http://localhost/hrms/

**If deployed to root:**
```powershell
Copy-Item -Path "dist\*" -Destination "C:\xampp\htdocs" -Recurse -Force
```
**URL:** http://localhost/

---

### Option 2: Nginx (If Using Docker)

Build is already configured in `frontend/Dockerfile`:

```dockerfile
FROM node:18 as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build and Run:**
```powershell
docker compose up --build -d
```

---

### Option 3: Static File Server (Quick Test)

```powershell
# Install serve globally (once)
npm install -g serve

# Serve the build
cd dist
serve -s . -p 5173
```

**Access at:** http://localhost:5173

---

## 🔍 Troubleshooting Blank Screen

### Issue 1: Blank Screen in Preview

**Diagnose:**
```powershell
npm run preview
# Open http://localhost:5173
# Press F12 > Console tab
```

**Look for:**
- `Uncaught SyntaxError` - Build issue
- `Failed to fetch` - API/CORS issue
- `Cannot read property of undefined` - Code error

**Solution:**
1. Check console for specific error
2. Fix the error in source code
3. Rebuild: `npm run build`
4. Test again: `npm run preview`

---

### Issue 2: Blank Screen on Apache

**Diagnose:**
Check browser console and network tab.

**Common Causes:**

#### Cause A: Missing .htaccess
**Symptom:** Refreshing page shows "404 Not Found"

**Solution:** Create `.htaccess` file (see above)

#### Cause B: Wrong Base Path
**Symptom:** Assets loading from wrong URL

**Solution:** 
If deployed to subdirectory (e.g., `/hrms/`), update `vite.config.js`:
```javascript
export default defineConfig({
  base: '/hrms/', // Change this
  // ...
})
```

Then rebuild:
```powershell
npm run build
```

#### Cause C: mod_rewrite Not Enabled
**Solution:**
1. Edit `C:\xampp\apache\conf\httpd.conf`
2. Find: `#LoadModule rewrite_module modules/mod_rewrite.so`
3. Remove `#` to uncomment
4. Restart Apache

---

### Issue 3: API Calls Failing

**Symptom:** Console shows CORS errors or 404 for API calls

**Diagnose:**
```javascript
// In browser console
console.log(import.meta.env.VITE_API_BASE_URL)
```

**Solution:**

#### If undefined:
1. Check `.env.production` exists
2. Rebuild: `npm run build`

#### If CORS error:
1. Update backend CORS headers to allow production URL
2. Edit `backend/api/employer/auth.php`:
```php
header("Access-Control-Allow-Origin: http://localhost");
// or for subdirectory:
header("Access-Control-Allow-Origin: http://localhost/hrms");
```

---

### Issue 4: Routes Not Working

**Symptom:** 
- Homepage works
- Direct URL (e.g., `/employer/login`) shows 404
- Refresh on any route shows 404

**Solution:**
Ensure SPA fallback is configured (see `.htaccess` above)

---

## 📋 Pre-Deployment Checklist

- [ ] Environment variables configured (`.env.production`)
- [ ] Build completes without errors (`npm run build`)
- [ ] Preview works locally (`npm run preview`)
- [ ] No console errors in preview
- [ ] All routes accessible in preview
- [ ] API calls working in preview
- [ ] Login functionality works
- [ ] Backend CORS configured for production URL
- [ ] Apache mod_rewrite enabled (if using Apache)
- [ ] `.htaccess` file created (if using Apache)
- [ ] Static files copied to web server
- [ ] Production URL accessible

---

## 🎯 Quick Fix Script

Create `deploy-to-apache.ps1`:

```powershell
# Build and Deploy to Apache
Write-Host "Building application..." -ForegroundColor Cyan
cd C:\Users\ianos\work\PHP\Payroll-master\frontend

# Clean
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue

# Build
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    
    # Deploy
    Write-Host "Deploying to Apache..." -ForegroundColor Cyan
    $destination = "C:\xampp\htdocs\hrms"
    
    # Create destination if not exists
    New-Item -Path $destination -ItemType Directory -Force | Out-Null
    
    # Copy files
    Copy-Item -Path "dist\*" -Destination $destination -Recurse -Force
    
    # Create .htaccess
    $htaccess = @"
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /hrms/
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>
"@
    
    Set-Content -Path "$destination\.htaccess" -Value $htaccess
    
    Write-Host "Deployment complete!" -ForegroundColor Green
    Write-Host "Access at: http://localhost/hrms/" -ForegroundColor Yellow
    
    # Open browser
    Start-Process "http://localhost/hrms/"
} else {
    Write-Host "Build failed! Check errors above." -ForegroundColor Red
}
```

**Usage:**
```powershell
.\deploy-to-apache.ps1
```

---

## 🎨 Testing After Deployment

### Test All Routes:
- [ ] http://localhost/hrms/
- [ ] http://localhost/hrms/employer/login
- [ ] http://localhost/hrms/employee/login
- [ ] http://localhost/hrms/employer/dashboard (after login)

### Test Functionality:
- [ ] Login as employer
- [ ] Navigate to different pages
- [ ] Refresh page (should stay on same page)
- [ ] Logout
- [ ] Login as employee

---

## 📊 Performance Optimization

### Check Build Size
```powershell
npm run build
```

**Typical sizes:**
- Total build: ~500KB - 2MB (gzipped)
- Main JS bundle: ~200KB - 800KB
- CSS bundle: ~50KB - 200KB

### Optimize if Too Large:
1. Enable tree shaking (already configured)
2. Code splitting (already configured)
3. Remove unused dependencies
4. Use dynamic imports for heavy components

---

## 🆘 Still Seeing Blank Screen?

### Last Resort Debugging:

1. **Build with source maps:**
```javascript
// vite.config.js
build: {
  sourcemap: true, // Change to true
}
```

2. **Check built index.html:**
```powershell
Get-Content dist\index.html
```

Should contain:
- `<script type="module" src="/assets/index-[hash].js">`
- `<link rel="stylesheet" href="/assets/index-[hash].css">`

3. **Test with simple HTML:**
Create `test.html` in `dist/`:
```html
<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><h1>Test Page</h1></body>
</html>
```

Deploy and access. If this works but app doesn't, it's a React issue.

4. **Check browser compatibility:**
- Use Chrome/Edge (recommended)
- Clear cache and hard reload (Ctrl+Shift+R)
- Try incognito mode

---

## ✅ Success Indicators

When deployment is successful:

✅ Homepage loads immediately (no blank screen)  
✅ No errors in console  
✅ All assets load with 200 status  
✅ Can navigate to /employer/login directly  
✅ Can refresh on any page without 404  
✅ Login works and redirects properly  
✅ All routes accessible  

---

**Need Help?** 
Check console errors first, then refer to specific troubleshooting sections above.
