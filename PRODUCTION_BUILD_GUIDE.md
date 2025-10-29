# Production Build Guide

## 🚀 Optimized Production Build Configuration

This guide covers the enhanced production build setup for the HR Management System.

---

## ✨ Production Optimizations Applied

### 1. **Code Splitting**
The build automatically splits code into optimized chunks:

- **react-vendor** (React core libraries)
- **mui-core** (Material-UI components)
- **mui-icons** (Material-UI icons - separate for lazy loading)
- **utils** (Axios, React Query, date utilities)
- **forms** (Form validation libraries)
- **charts** (Recharts library)

### 2. **Minification**
- Uses **Terser** for advanced JavaScript minification
- Removes all `console.log`, `console.info`, `console.debug` statements
- Strips comments and unnecessary whitespace
- Removes debugger statements

### 3. **Asset Optimization**
- Images: Organized in `assets/images/`
- Fonts: Organized in `assets/fonts/`
- CSS: Code-split for faster loading
- All assets include hash for cache-busting

### 4. **Performance Features**
- **Tree shaking**: Removes unused code
- **Dead code elimination**: Removes unreachable code
- **Chunk size warnings**: Alerts if chunks exceed 1000KB
- **CSS code splitting**: Loads CSS only when needed
- **Optimal caching**: Files named with content hashes

---

## 🔧 Build Commands

### Standard Production Build
```powershell
npm run build
```

### Explicit Production Mode
```powershell
npm run build:prod
```

### Build + Preview
```powershell
npm run build:analyze
```

### Development Server
```powershell
npm run dev
```

---

## 📦 Quick Deploy

### Option 1: Automated Script
```powershell
.\deploy.ps1
```

### Option 2: Custom Destination
```powershell
.\deploy.ps1 -Destination "C:\xampp\htdocs\myapp"
```

---

## 📊 Build Output Structure

```
dist/
├── index.html                           # Entry HTML (1-2 KB)
├── .htaccess                           # Apache SPA routing
└── assets/
    ├── js/
    │   ├── react-vendor-[hash].js      # React core (~160KB)
    │   ├── mui-core-[hash].js          # Material-UI (~280KB)
    │   ├── mui-icons-[hash].js         # Icons (lazy loaded)
    │   ├── utils-[hash].js             # Utilities
    │   ├── forms-[hash].js             # Form libraries
    │   ├── charts-[hash].js            # Chart library
    │   └── index-[hash].js             # Your app code
    ├── css/
    │   └── index-[hash].css            # Styles (~12KB)
    └── images/
        └── [various image assets]
```

---

## 🎯 Production Features

### Performance
✅ **Lazy Loading**: Components load on-demand  
✅ **Code Splitting**: Smaller initial bundle  
✅ **Tree Shaking**: No unused code  
✅ **Minification**: Reduced file sizes  
✅ **Compression**: GZIP enabled via .htaccess  

### Security
✅ **No Source Maps**: Code not readable  
✅ **No Console Logs**: Debug info removed  
✅ **Security Headers**: XSS, Frame, Content-Type protection  
✅ **CORS Ready**: Configured for API calls  

### Caching
✅ **Content Hashes**: Files change names when updated  
✅ **Long-term Caching**: Assets cached for 1 year  
✅ **HTML No-Cache**: Always fetch latest HTML  

---

## 🔍 Build Verification

### 1. Check Build Size
After building, verify the output:
```powershell
Get-ChildItem -Path dist -Recurse | Measure-Object -Property Length -Sum
```

Expected total: **~700-900 KB** (gzipped: ~200-250 KB)

### 2. Preview Locally
```powershell
npm run preview
```
Opens at: http://localhost:5173

### 3. Test Production Build
- ✅ Homepage loads without blank screen
- ✅ All routes work (employer/login, employee/login)
- ✅ No console errors in DevTools (F12)
- ✅ Assets load from correct paths
- ✅ Login functionality works
- ✅ Page refresh doesn't cause 404

---

## ⚙️ Environment Variables

### `.env.production`
```bash
VITE_API_BASE_URL=http://localhost/backend/api
VITE_APP_NAME=eVolve HR Management
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
VITE_BUILD_SOURCEMAP=false
VITE_DROP_CONSOLE=true
```

### Accessing in Code
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL
const appName = import.meta.env.VITE_APP_NAME
```

---

## 🌐 Apache/XAMPP Deployment

### Automatic Deployment
The `deploy.ps1` script automatically:
1. ✅ Cleans previous build
2. ✅ Builds for production
3. ✅ Shows build statistics
4. ✅ Copies to Apache directory
5. ✅ Creates `.htaccess` for SPA routing
6. ✅ Displays access URLs

### Manual Deployment
1. Build the app:
   ```powershell
   npm run build:prod
   ```

2. Copy `dist/*` to Apache:
   ```powershell
   Copy-Item -Path dist\* -Destination C:\xampp\htdocs\hrms -Recurse -Force
   ```

3. Ensure `.htaccess` exists with:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /hrms/
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule ^ index.html [L]
   </IfModule>
   ```

4. Enable `mod_rewrite` in Apache:
   - Edit: `C:\xampp\apache\conf\httpd.conf`
   - Find: `#LoadModule rewrite_module modules/mod_rewrite.so`
   - Remove `#` to uncomment
   - Restart Apache

---

## 🐛 Troubleshooting

### Blank Screen After Build
**Symptoms**: White/blank screen, no errors in build  
**Causes**:
- Incorrect base path in `vite.config.js`
- Missing `.htaccess` for SPA routing
- JavaScript errors (check browser console)

**Solutions**:
1. Check browser console (F12) for errors
2. Verify `base: '/'` in `vite.config.js`
3. Ensure `.htaccess` exists in deployment directory
4. Clear browser cache (Ctrl+Shift+R)
5. Check Apache error logs: `C:\xampp\apache\logs\error.log`

---

### 404 Errors on Routes
**Symptoms**: Direct URLs or page refresh shows 404  
**Cause**: Apache doesn't know about client-side routing

**Solution**:
1. Enable `mod_rewrite` in `httpd.conf`
2. Ensure `.htaccess` has correct `RewriteBase`
3. Restart Apache

---

### Assets Not Loading
**Symptoms**: 404 for CSS/JS files  
**Cause**: Incorrect base path or missing files

**Solutions**:
1. Check file paths in `dist/index.html`
2. Verify files exist in `dist/assets/`
3. Ensure subdirectory matches in `.htaccess` RewriteBase
4. Check Apache DocumentRoot in `httpd.conf`

---

### API CORS Errors
**Symptoms**: API calls blocked by browser  
**Cause**: Backend not allowing frontend origin

**Solution**:
Update backend CORS headers in `backend/api/*/auth.php`:
```php
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
```

---

### Large Bundle Size
**Symptoms**: Build size > 1MB  
**Cause**: Importing unnecessary libraries

**Solutions**:
1. Check build output for large chunks
2. Use tree-shaking compatible imports:
   ```javascript
   // ❌ Bad
   import * as Icons from '@mui/icons-material'
   
   // ✅ Good
   import PersonIcon from '@mui/icons-material/Person'
   ```
3. Lazy load heavy components:
   ```javascript
   const Charts = lazy(() => import('./Charts'))
   ```

---

## 📈 Performance Monitoring

### Build Time
Expected: **15-25 seconds**

### Bundle Size
- **Uncompressed**: 700-900 KB
- **GZIP Compressed**: 200-250 KB
- **Initial Load**: React vendor + app code (~400 KB)

### Lighthouse Scores (Target)
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 90+

---

## 🔄 Continuous Deployment

### Git Workflow
```powershell
# After making changes
git add .
git commit -m "Update feature X"
git push

# Build and deploy
.\deploy.ps1
```

### Version Updates
Update version in `package.json` and `.env.production`:
```json
"version": "1.1.0"
```

---

## 📚 Additional Resources

### Official Documentation
- [Vite Build Optimization](https://vitejs.dev/guide/build.html)
- [React Production Build](https://react.dev/learn/start-a-new-react-project#production-grade-react-frameworks)
- [Apache mod_rewrite](https://httpd.apache.org/docs/current/mod/mod_rewrite.html)

### Performance Tools
- Chrome DevTools Performance tab
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundle Analyzer](https://www.npmjs.com/package/rollup-plugin-visualizer)

---

## ✅ Production Checklist

Before deploying to production:

- [ ] Build completes without errors
- [ ] Preview build locally (`npm run preview`)
- [ ] All routes accessible
- [ ] Login functionality works
- [ ] API calls succeed
- [ ] No console errors
- [ ] Page refresh works on all routes
- [ ] Assets load correctly
- [ ] Performance acceptable (< 3s load)
- [ ] Mobile responsive
- [ ] CORS configured
- [ ] Error handling works
- [ ] Version updated in package.json

---

## 🆘 Support

If you encounter issues:

1. Check browser console (F12)
2. Check Apache error logs
3. Verify `.htaccess` configuration
4. Ensure mod_rewrite is enabled
5. Clear browser cache
6. Review this guide's troubleshooting section

---

**Last Updated**: October 24, 2025  
**Build System**: Vite 5.4.20  
**Target Platform**: Apache/XAMPP on Windows
