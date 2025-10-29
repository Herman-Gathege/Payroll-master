# 🚀 Quick Hosting Reference Card

## Your Current Setup

**Status**: ✅ Working locally on XAMPP  
**Frontend**: http://localhost/hrms/  
**Backend**: http://localhost/backend/api/  
**Database**: MySQL on localhost:3306

---

## 🎯 One-Command Deploy (Local)

```powershell
.\deploy.ps1
```

That's it! Your app is deployed to XAMPP.

---

## 🌐 Ready to Go Online? Choose Your Path:

### Path 1: Shared Hosting (Easiest) 💚
**Best for**: Small businesses, 10-50 employees  
**Cost**: $3-10/month  
**Setup Time**: 30 minutes

**Steps**:
1. Buy hosting + domain (Hostinger, Bluehost, etc.)
2. Build: `npm run build:prod`
3. Upload files via cPanel File Manager
4. Import database via phpMyAdmin
5. Done!

**Pros**: Easy, affordable, managed  
**Cons**: Limited resources, shared server

---

### Path 2: VPS (More Control) 💙
**Best for**: Growing companies, 50-200 employees  
**Cost**: $5-30/month  
**Setup Time**: 1-2 hours

**Steps**:
1. Create VPS (DigitalOcean, Vultr, etc.)
2. Install LAMP stack
3. Upload files via SSH/FTP
4. Configure Apache + MySQL
5. Done!

**Pros**: Dedicated resources, full control  
**Cons**: Requires technical knowledge

---

### Path 3: Docker (Modern) 💜
**Best for**: Dev teams, scalable deployments  
**Cost**: Varies by provider  
**Setup Time**: 15 minutes

**Steps**:
1. Ensure Docker installed
2. Run: `docker-compose up -d`
3. Done!

**Pros**: Consistent, portable, scalable  
**Cons**: Learning curve

---

## 📚 Documentation Created

I've created **3 comprehensive guides** for you:

### 1. **HOSTING_GUIDE.md** (Complete Guide)
- All hosting options explained
- Step-by-step setup for each
- SSL/HTTPS configuration
- Domain setup
- Troubleshooting

### 2. **DEPLOYMENT_CHECKLIST.md** (Action Plan)
- Pre-deployment checks
- Security hardening
- Testing procedures
- Rollback plan
- Emergency procedures

### 3. **HOSTING_ARCHITECTURE.md** (Visual Guide)
- Architecture diagrams
- Cost comparison
- Network flow
- File structure
- Decision guide

---

## ⚡ Quick Commands Reference

### Build & Deploy
```powershell
# Local XAMPP deployment
.\deploy.ps1

# Build only
cd frontend
npm run build:prod

# Preview build
npm run preview
```

### Database
```sql
-- Create admin user
INSERT INTO employer_users (username, email, password_hash, first_name, last_name, role)
VALUES ('admin', 'admin@company.com', '$2y$10$...', 'Admin', 'User', 'super_admin');
```

### Server Commands (VPS)
```bash
# Start Apache
sudo systemctl start apache2

# Start MySQL
sudo systemctl start mysql

# Check logs
sudo tail -f /var/log/apache2/error.log

# Restart services
sudo systemctl restart apache2
```

---

## 🆘 Common Issues & Fixes

### Blank Screen After Deploy
```
1. Press F12 → Check Console for errors
2. Verify .htaccess exists
3. Clear browser cache (Ctrl+Shift+R)
4. Check base path in vite.config.js
```

### 404 on Routes
```
1. Enable mod_rewrite in Apache
2. Check .htaccess RewriteBase
3. Restart Apache
```

### Database Connection Failed
```
1. Verify credentials in config/database.php
2. Check MySQL is running
3. Test connection: mysql -u username -p
```

### CORS Errors
```
Update backend/api/*/auth.php:
header('Access-Control-Allow-Origin: https://yourdomain.com');
```

---

## 📊 Cost Calculator

**Monthly Costs**:
- Domain: $1-2/month
- Shared Hosting: $3-10/month
- SSL Certificate: FREE (Let's Encrypt)
- VPS: $5-50/month
- Managed VPS: $30-100/month

**Total for small business**: $5-15/month

---

## ✅ Pre-Launch Checklist

Before going live:
- [ ] Changed default passwords
- [ ] Enabled HTTPS/SSL
- [ ] Configured backups
- [ ] Tested all features
- [ ] Set up monitoring
- [ ] Trained users
- [ ] Have support plan

---

## 🔗 Important URLs

**Current Setup**:
- Homepage: http://localhost/hrms/
- Employer: http://localhost/hrms/employer/login
- Employee: http://localhost/hrms/employee/login

**Production** (after deployment):
- Homepage: https://yourdomain.com
- Employer: https://yourdomain.com/employer/login
- Employee: https://yourdomain.com/employee/login

---

## 🎓 Recommended Hosting Providers

### Shared Hosting
1. **Hostinger** - $2.99/month - Best value
2. **Bluehost** - $3.95/month - Beginner friendly
3. **SiteGround** - $4.99/month - Great support

### VPS
1. **DigitalOcean** - $6/month - Popular choice
2. **Vultr** - $6/month - Fast performance
3. **Linode** - $5/month - Reliable

### Managed
1. **Cloudways** - $11/month - Managed VPS
2. **Kinsta** - $30/month - Premium managed

---

## 📞 Support

**Documentation**:
- HOSTING_GUIDE.md - Complete guide
- DEPLOYMENT_CHECKLIST.md - Step-by-step
- HOSTING_ARCHITECTURE.md - Visual reference
- PRODUCTION_BUILD_GUIDE.md - Build optimization

**Quick Help**:
- Check browser console (F12)
- Review Apache error logs
- Test API endpoints
- Verify database connection

---

## 🎯 Next Steps

1. **Choose your hosting option** (see above)
2. **Read the appropriate guide**:
   - Shared → HOSTING_GUIDE.md (cPanel section)
   - VPS → HOSTING_GUIDE.md (VPS section)
   - Docker → HOSTING_GUIDE.md (Docker section)
3. **Follow DEPLOYMENT_CHECKLIST.md**
4. **Test thoroughly**
5. **Go live!**

---

## 💡 Pro Tips

- **Start small**: Begin with shared hosting, upgrade as you grow
- **Test locally**: Always test with `npm run preview` before deploying
- **Backup first**: Before any deployment, backup your data
- **Monitor uptime**: Use free tools like UptimeRobot
- **SSL is mandatory**: Use Let's Encrypt for free SSL
- **Update regularly**: Keep PHP, MySQL, and packages updated

---

## 🚨 Emergency Contacts Template

**Fill this out before going live**:

```
Hosting Provider: ___________________
Support Email: ______________________
Support Phone: ______________________
Account #: __________________________

Domain Registrar: ___________________
Login URL: __________________________

Database Host: ______________________
Database Name: ______________________
Database User: ______________________

Server IP: __________________________
SSH Port: ___________________________

Backup Location: ____________________
Last Backup Date: ___________________
```

---

## 🎉 You're Ready!

You now have everything you need to host your HR Management System:

✅ **Local deployment** - Working with XAMPP  
✅ **Production build** - Optimized and ready  
✅ **Documentation** - Complete guides  
✅ **Scripts** - Automated deployment  
✅ **Checklists** - Nothing forgotten  

**Choose your hosting path and follow the guides. You got this! 🚀**

---

**Questions?** Review the detailed guides:
- `HOSTING_GUIDE.md` - How to host
- `DEPLOYMENT_CHECKLIST.md` - What to check
- `HOSTING_ARCHITECTURE.md` - Visual reference
- `PRODUCTION_BUILD_GUIDE.md` - Build details

**Last Updated**: October 24, 2025
