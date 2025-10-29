# Frontend Build Guide

Production build completed successfully! ✅

## Build Summary

**Build Output:**
- **Bundle Size:** 675.42 kB (194.70 kB gzipped)
- **CSS Size:** 11.77 kB (2.46 kB gzipped)
- **Build Time:** 16.86 seconds
- **Output Directory:** `frontend/dist/`

## Files Generated

```
frontend/dist/
├── index.html                           (0.97 kB)
└── assets/
    ├── apple-touch-icon-B6fORsat.png   (12.65 kB)
    ├── favicon-16x16-qxqtbSIl.png      (0.34 kB)
    ├── favicon-32x32-BB9CAOuD.png      (0.79 kB)
    ├── favicon-PvIL13JH.ico            (15.41 kB)
    ├── site-D5u-BDsO.webmanifest       (0.35 kB)
    ├── index-CwBz30FV.css              (11.77 kB)
    └── index-Dz0p_6NQ.js               (675.42 kB)
```

## Build Commands

### Development Build
```bash
cd frontend
npm run dev
```
This starts the Vite development server on http://localhost:5173

### Production Build
```bash
cd frontend
npm run build
```
This creates optimized production files in `frontend/dist/`

### Preview Production Build Locally
```bash
cd frontend
npm run preview
```
This serves the production build locally for testing

## Environment Configuration

### Development (.env)
```env
VITE_API_BASE_URL=http://localhost/backend/api
VITE_APP_ENV=development
```

### Production (.env.production)
```env
VITE_API_BASE_URL=https://yourdomain.com/backend/api
VITE_APP_ENV=production
```

**Note:** Environment variables MUST be prefixed with `VITE_` to be accessible in the app.

## Deployment Methods

### Option 1: Shared Hosting (cPanel/Plesk)

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Upload via FTP/SFTP:**
   - Upload all files from `frontend/dist/` to `public_html/` or `www/`
   - Keep the folder structure intact

3. **Configure .htaccess:**
   Create `.htaccess` in the root:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

### Option 2: VPS/Dedicated Server

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Copy to web directory:**
   ```bash
   sudo cp -r frontend/dist/* /var/www/html/
   ```

3. **Configure Apache:**
   ```apache
   <VirtualHost *:80>
       ServerName yourdomain.com
       DocumentRoot /var/www/html

       <Directory /var/www/html>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted

           # React Router support
           RewriteEngine On
           RewriteBase /
           RewriteRule ^index\.html$ - [L]
           RewriteCond %{REQUEST_FILENAME} !-f
           RewriteCond %{REQUEST_FILENAME} !-d
           RewriteRule . /index.html [L]
       </Directory>
   </VirtualHost>
   ```

4. **Configure Nginx:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       root /var/www/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

### Option 3: Cloud Platforms

#### Netlify
1. Connect GitHub repository
2. Build command: `cd frontend && npm run build`
3. Publish directory: `frontend/dist`
4. Environment variables: Set `VITE_API_BASE_URL`

#### Vercel
1. Import project from GitHub
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables: Set `VITE_API_BASE_URL`

#### AWS S3 + CloudFront
```bash
# Install AWS CLI
aws s3 sync frontend/dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Production Optimization

### Bundle Size Optimization

The build currently shows a warning about bundle size. To optimize:

1. **Code Splitting:**
   Edit `vite.config.js`:
   ```javascript
   export default {
     build: {
       rollupOptions: {
         output: {
           manualChunks: {
             vendor: ['react', 'react-dom', 'react-router-dom'],
             mui: ['@mui/material', '@mui/icons-material'],
             charts: ['recharts'],
           }
         }
       }
     }
   }
   ```

2. **Dynamic Imports:**
   Use lazy loading for routes:
   ```javascript
   const Dashboard = lazy(() => import('./pages/Dashboard'))
   const Employees = lazy(() => import('./pages/Employees'))
   ```

3. **Remove Unused Imports:**
   ```bash
   npm install -D vite-plugin-purge-icons
   ```

### Performance Optimizations

1. **Enable Gzip Compression:**
   ```apache
   # Apache
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
     AddOutputFilterByType DEFLATE application/javascript application/json
   </IfModule>
   ```

   ```nginx
   # Nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
   gzip_min_length 1000;
   ```

2. **Browser Caching:**
   ```apache
   # Apache
   <IfModule mod_expires.c>
     ExpiresActive On
     ExpiresByType image/jpg "access plus 1 year"
     ExpiresByType image/jpeg "access plus 1 year"
     ExpiresByType image/gif "access plus 1 year"
     ExpiresByType image/png "access plus 1 year"
     ExpiresByType text/css "access plus 1 month"
     ExpiresByType application/javascript "access plus 1 month"
   </IfModule>
   ```

3. **CDN Integration:**
   Upload static assets to CDN:
   ```javascript
   // vite.config.js
   export default {
     base: 'https://cdn.yourdomain.com/',
   }
   ```

## File Structure

### Production Structure
```
/var/www/html/              # Web root
├── index.html              # Main HTML file
├── assets/                 # Static assets
│   ├── *.js               # JavaScript bundles
│   ├── *.css              # Stylesheets
│   └── *.png              # Images/icons
├── backend/               # Backend API (separate directory)
│   └── api/
└── .htaccess              # Apache config (if needed)
```

### Recommended Permissions
```bash
# Files: 644
find /var/www/html -type f -exec chmod 644 {} \;

# Directories: 755
find /var/www/html -type d -exec chmod 755 {} \;

# Owner
chown -R www-data:www-data /var/www/html
```

## Testing Production Build

### 1. Test Locally
```bash
cd frontend
npm run preview
```
Visit http://localhost:4173

### 2. Test on Server
```bash
# Check if files are accessible
curl -I https://yourdomain.com
curl -I https://yourdomain.com/assets/index-*.js

# Check routing works
curl -I https://yourdomain.com/employer/login
curl -I https://yourdomain.com/employee/portal
```

### 3. Performance Testing
```bash
# Using Lighthouse
npm install -g lighthouse
lighthouse https://yourdomain.com --view

# Using WebPageTest
# Visit https://www.webpagetest.org
```

## Troubleshooting

### White Screen After Deployment

1. **Check browser console for errors**
2. **Verify API URL is correct:**
   ```bash
   grep VITE_API_BASE_URL frontend/.env.production
   ```
3. **Check network tab for 404 errors**
4. **Ensure .htaccess is configured for React Router**

### Assets Not Loading

1. **Check base path in vite.config.js:**
   ```javascript
   export default {
     base: '/', // Should be '/' for root deployment
   }
   ```

2. **Verify file permissions:**
   ```bash
   ls -la /var/www/html/assets/
   ```

### API Calls Failing

1. **Check CORS headers on backend**
2. **Verify API URL in .env.production**
3. **Check browser console for CORS errors**
4. **Test API directly:**
   ```bash
   curl https://yourdomain.com/backend/api/employer/auth.php
   ```

### Routes Return 404

1. **Ensure .htaccess is present**
2. **Check Apache mod_rewrite is enabled:**
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```
3. **For Nginx, verify try_files directive**

## Build Checklist

Before deploying to production:

- [ ] Update `.env.production` with production API URL
- [ ] Run `npm run build` successfully
- [ ] Test build locally with `npm run preview`
- [ ] Configure web server for React Router
- [ ] Set up HTTPS/SSL certificate
- [ ] Enable gzip compression
- [ ] Configure browser caching
- [ ] Test all routes work
- [ ] Test API connectivity
- [ ] Check browser console for errors
- [ ] Run Lighthouse performance test
- [ ] Set correct file permissions
- [ ] Configure CDN (optional)

## Security Headers

Add to `.htaccess` or server config:

```apache
# Security Headers
Header set X-Frame-Options "SAMEORIGIN"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"
Header set Permissions-Policy "geolocation=(self), microphone=(), camera=()"

# HTTPS Redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Continuous Deployment

### GitHub Actions Example
```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Build
        run: |
          cd frontend
          npm install
          npm run build
      - name: Deploy
        uses: SamKirkland/FTP-Deploy-Action@4.3.0
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./frontend/dist/
```

## Monitoring

### Setup Monitoring Tools

1. **Google Analytics:**
   ```javascript
   // Add to index.html
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   ```

2. **Sentry (Error Tracking):**
   ```bash
   npm install @sentry/react
   ```

3. **Uptime Monitoring:**
   - UptimeRobot (free)
   - Pingdom
   - StatusCake

## Next Steps

1. Review `docs/HOSTING_GUIDE.md` for complete deployment guide
2. Set up SSL certificate (Let's Encrypt)
3. Configure production backend
4. Test all features in production
5. Set up monitoring and analytics
6. Create backup strategy

---

**Build Status:** ✅ Complete
**Bundle Size:** 675 kB (acceptable for initial release)
**Ready for:** Production deployment
**Next:** Configure production server and deploy
