# Quick Deployment Checklist

Use this checklist when deploying your HR Management System to production.

---

## 🎯 Pre-Deployment

### Code Review
- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] All API endpoints working
- [ ] Database schema up to date
- [ ] Environment variables configured
- [ ] .gitignore excludes sensitive files

### Build & Test
- [ ] Run production build: `npm run build:prod`
- [ ] Test build locally: `npm run preview`
- [ ] Check build size (should be ~700KB)
- [ ] Verify all routes work
- [ ] Test login functionality
- [ ] Check mobile responsiveness

### Security
- [ ] Changed default admin password
- [ ] Updated database credentials
- [ ] Removed test/demo accounts
- [ ] Configured CORS headers
- [ ] Disabled debug mode in PHP
- [ ] Removed phpinfo() files
- [ ] Set secure session settings

---

## 🚀 Deployment Steps

### 1. Prepare Files
```powershell
# Build frontend
cd frontend
npm run build:prod

# Create deployment package
cd ..
.\prepare-deployment.ps1
```

### 2. Database Setup
- [ ] Create production database
- [ ] Create database user with strong password
- [ ] Import schema: `database/schema.sql`
- [ ] Run migrations if needed
- [ ] Create initial admin user
- [ ] Test database connection

### 3. Upload Files
**Shared Hosting**:
- [ ] Upload frontend files to `public_html/`
- [ ] Upload backend files to `public_html/api/`
- [ ] Upload `.htaccess` files

**VPS/Cloud**:
- [ ] Upload to `/var/www/yourapp/`
- [ ] Set correct permissions (755 for directories, 644 for files)
- [ ] Configure Apache virtual host
- [ ] Restart Apache

### 4. Configure Backend
- [ ] Update `config/database.php` with production credentials
- [ ] Update CORS allowed origins
- [ ] Set production API URL
- [ ] Test API endpoints with curl/Postman

### 5. Configure Frontend
- [ ] Verify `.env.production` has correct API URL
- [ ] Check base path in `vite.config.js`
- [ ] Ensure `.htaccess` has correct RewriteBase
- [ ] Test all routes after deployment

---

## ✅ Post-Deployment Verification

### Functionality Tests
- [ ] Homepage loads without errors
- [ ] Employer login works
- [ ] Employee login works
- [ ] Dashboard displays correctly
- [ ] Navigation between pages works
- [ ] Page refresh doesn't show 404
- [ ] Logout functionality works
- [ ] API calls succeed

### Browser Tests
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Test on mobile devices
- [ ] Check different screen sizes

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] No 404 errors for assets
- [ ] GZIP compression enabled
- [ ] Caching headers set correctly
- [ ] Images optimized

### Security Tests
- [ ] HTTPS enabled (production)
- [ ] SSL certificate valid
- [ ] Security headers present
- [ ] SQL injection protected
- [ ] XSS protection enabled
- [ ] Directory listing disabled

---

## 🔐 Security Hardening

### Apache Configuration
```apache
# In .htaccess or httpd.conf

# Disable directory listing
Options -Indexes

# Protect sensitive files
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>

# Security headers
Header set X-Frame-Options "SAMEORIGIN"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"
```

### PHP Configuration
```php
// In php.ini or .user.ini

display_errors = Off
log_errors = On
error_log = /path/to/error.log
session.cookie_httponly = On
session.cookie_secure = On  // If using HTTPS
session.use_strict_mode = On
```

### Database Security
- [ ] Use prepared statements (already implemented)
- [ ] Minimum privilege principle for database user
- [ ] Regular backups scheduled
- [ ] Strong password requirements
- [ ] Account lockout after failed attempts

---

## 📊 Monitoring Setup

### Uptime Monitoring
- [ ] Setup UptimeRobot or similar
- [ ] Monitor main URL
- [ ] Monitor API endpoints
- [ ] Configure alerts (email/SMS)

### Error Logging
- [ ] Enable PHP error logging
- [ ] Enable Apache error logging
- [ ] Setup log rotation
- [ ] Monitor logs regularly

### Performance Monitoring
- [ ] Setup Google Analytics (optional)
- [ ] Monitor server resources (CPU, RAM, Disk)
- [ ] Track page load times
- [ ] Monitor database query performance

---

## 💾 Backup Strategy

### Automated Backups
```bash
# Database backup script
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql

# File backup
tar -czf files_backup_$(date +%Y%m%d).tar.gz /var/www/yourapp
```

### Backup Checklist
- [ ] Daily database backups
- [ ] Weekly full file backups
- [ ] Store backups off-site
- [ ] Test backup restoration
- [ ] Keep 30 days of backups

---

## 🔄 Rollback Plan

### If Deployment Fails
1. **Restore Previous Version**
   ```bash
   # Restore files
   cp -r /backup/previous-version/* /var/www/yourapp/
   
   # Restore database
   mysql -u username -p database_name < previous_backup.sql
   ```

2. **Check Logs**
   ```bash
   tail -f /var/log/apache2/error.log
   tail -f /var/log/mysql/error.log
   ```

3. **Common Issues**
   - Database connection failed → Check credentials
   - 500 error → Check PHP logs
   - Blank page → Check .htaccess and browser console
   - CORS error → Update backend headers

---

## 📱 Mobile App Deployment (Future)

When ready to deploy Flutter mobile app:

### Android
- [ ] Update `pubspec.yaml` version
- [ ] Configure API endpoint in `lib/config/`
- [ ] Build APK: `flutter build apk --release`
- [ ] Test on physical device
- [ ] Upload to Google Play Console

### iOS
- [ ] Update version in Xcode
- [ ] Configure API endpoint
- [ ] Build archive: `flutter build ios --release`
- [ ] Test on physical device
- [ ] Submit to App Store Connect

---

## 📞 Support Contacts

### Hosting Provider Support
- **Hosting Company**: _______________
- **Support Email**: _______________
- **Support Phone**: _______________
- **Account Number**: _______________

### Domain Registrar
- **Registrar**: _______________
- **Login URL**: _______________
- **Support Contact**: _______________

### DNS Provider
- **Provider**: _______________
- **API Access**: _______________

---

## 🎓 Training Checklist

Before going live, ensure:

### Admin Training
- [ ] How to add new employees
- [ ] How to manage payroll
- [ ] How to generate reports
- [ ] How to manage leave requests
- [ ] How to backup data
- [ ] How to change passwords
- [ ] Emergency contacts

### Employee Training
- [ ] How to login
- [ ] How to view payslips
- [ ] How to request leave
- [ ] How to update profile
- [ ] How to reset password
- [ ] Who to contact for issues

---

## 🚨 Emergency Procedures

### Site Down
1. Check server status
2. Check Apache/MySQL running
3. Check error logs
4. Contact hosting support
5. Notify users

### Data Breach
1. Take site offline immediately
2. Change all passwords
3. Restore from clean backup
4. Notify affected users
5. Review security measures
6. Document incident

### Database Corruption
1. Stop accepting new data
2. Restore from latest backup
3. Verify data integrity
4. Test thoroughly before going live
5. Document issue

---

## ✨ Success Criteria

Deployment is successful when:

✅ All users can login  
✅ No console errors  
✅ All features working  
✅ HTTPS enabled  
✅ Backups configured  
✅ Monitoring active  
✅ Documentation complete  
✅ Training completed  
✅ Support contacts saved  

---

## 📝 Post-Launch Tasks

### Week 1
- [ ] Monitor error logs daily
- [ ] Check uptime monitoring
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Update documentation

### Month 1
- [ ] Review performance metrics
- [ ] Optimize slow queries
- [ ] Review backup integrity
- [ ] Update SSL certificate (if needed)
- [ ] Plan feature updates

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Version**: _______________  
**Server**: _______________  
**Domain**: _______________  

---

**Remember**: Always test in staging before production!
