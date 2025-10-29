# Prepare Files for Hosting Upload
# This script prepares all files ready for upload to your hosting site

Write-Host "`n🎯 Preparing Files for Hosting Deployment..." -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Set paths
$projectRoot = "C:\Users\ianos\work\PHP\Payroll-master"
$deployFolder = Join-Path $projectRoot "ready-to-upload"
$frontendSrc = Join-Path $projectRoot "frontend\dist"
$backendSrc = Join-Path $projectRoot "backend"
$databaseSrc = Join-Path $projectRoot "database\schema.sql"

# Step 1: Build Frontend
Write-Host "📦 Step 1: Building frontend for production..." -ForegroundColor Yellow
Set-Location (Join-Path $projectRoot "frontend")
npm run build:prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Build failed! Fix errors and try again.`n" -ForegroundColor Red
    exit 1
}

Write-Host "   ✓ Frontend built successfully`n" -ForegroundColor Green

# Step 2: Create deployment folder structure
Write-Host "📁 Step 2: Creating deployment folder..." -ForegroundColor Yellow
Set-Location $projectRoot

if (Test-Path $deployFolder) {
    Remove-Item -Path $deployFolder -Recurse -Force
}

New-Item -Path $deployFolder -ItemType Directory -Force | Out-Null
New-Item -Path "$deployFolder\frontend" -ItemType Directory -Force | Out-Null
New-Item -Path "$deployFolder\api" -ItemType Directory -Force | Out-Null
New-Item -Path "$deployFolder\database" -ItemType Directory -Force | Out-Null

Write-Host "   ✓ Folders created`n" -ForegroundColor Green

# Step 3: Copy frontend files
Write-Host "📋 Step 3: Copying frontend files..." -ForegroundColor Yellow
Copy-Item -Path "$frontendSrc\*" -Destination "$deployFolder\frontend\" -Recurse -Force
Write-Host "   ✓ Frontend files copied`n" -ForegroundColor Green

# Step 4: Copy backend files
Write-Host "📋 Step 4: Copying backend files..." -ForegroundColor Yellow
$excludeFiles = @("test_*.php", "*.log", "*.txt")
Get-ChildItem -Path $backendSrc -Recurse | 
    Where-Object { 
        $exclude = $false
        foreach ($pattern in $excludeFiles) {
            if ($_.Name -like $pattern) { $exclude = $true; break }
        }
        -not $exclude
    } | 
    Copy-Item -Destination {
        $dest = $_.FullName -replace [regex]::Escape($backendSrc), "$deployFolder\api"
        if ($_.PSIsContainer) {
            New-Item -ItemType Directory -Path $dest -Force | Out-Null
        }
        $dest
    } -Force

Write-Host "   ✓ Backend files copied`n" -ForegroundColor Green

# Step 5: Copy database schema
Write-Host "📋 Step 5: Copying database schema..." -ForegroundColor Yellow
Copy-Item -Path $databaseSrc -Destination "$deployFolder\database\schema.sql" -Force
Write-Host "   ✓ Database schema copied`n" -ForegroundColor Green

# Step 6: Create .htaccess for frontend
Write-Host "⚙️  Step 6: Creating .htaccess file..." -ForegroundColor Yellow

$htaccessContent = @"
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite everything else to index.html for client-side routing
  RewriteRule ^ index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Disable directory listing
Options -Indexes

# Cache static assets (1 year)
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
  <IfModule mod_headers.c>
    Header set Cache-Control "max-age=31536000, public, immutable"
  </IfModule>
</FilesMatch>

# Don't cache HTML files
<FilesMatch "\.(html|htm)$">
  <IfModule mod_headers.c>
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
  </IfModule>
</FilesMatch>

# GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
"@

Set-Content -Path "$deployFolder\frontend\.htaccess" -Value $htaccessContent -Force
Write-Host "   ✓ .htaccess created`n" -ForegroundColor Green

# Step 7: Create .htaccess for API config protection
Write-Host "⚙️  Step 7: Protecting config files..." -ForegroundColor Yellow

$configHtaccess = @"
# Deny access to config files
<Files *.php>
  Order allow,deny
  Deny from all
</Files>
"@

New-Item -Path "$deployFolder\api\config" -ItemType Directory -Force | Out-Null
Set-Content -Path "$deployFolder\api\config\.htaccess" -Value $configHtaccess -Force
Write-Host "   ✓ Config protection added`n" -ForegroundColor Green

# Step 8: Create deployment instructions file
Write-Host "📝 Step 8: Creating instructions file..." -ForegroundColor Yellow

$instructions = @"
╔════════════════════════════════════════════════════════════════╗
║        FILES READY FOR HOSTING DEPLOYMENT                      ║
╚════════════════════════════════════════════════════════════════╝

📦 This folder contains everything ready to upload!

📁 UPLOAD INSTRUCTIONS:
═══════════════════════════════════════════════════════════════

1. FRONTEND FILES (frontend folder):
   → Upload to: public_html/
   ✓ Includes: index.html, .htaccess, assets/

2. BACKEND FILES (api folder):
   → Upload to: public_html/api/
   ✓ Includes: employer/, employee/, config/, models/

3. DATABASE (database folder):
   → Import via phpMyAdmin
   ✓ File: schema.sql

⚙️  IMPORTANT CONFIGURATION STEPS:
═══════════════════════════════════════════════════════════════

After uploading:

1. CREATE DATABASE:
   - Name: your_username_hrms
   - User: your_username_hrms_user
   - Password: (generate strong password)

2. IMPORT SCHEMA:
   - phpMyAdmin → Import → schema.sql

3. EDIT CONFIG:
   - File: public_html/api/config/database.php
   - Update: host, database, username, password

4. CREATE ADMIN USER:
   Run this SQL in phpMyAdmin:
   
   INSERT INTO employer_users (username, email, password_hash, 
   first_name, last_name, role, is_active)
   VALUES ('admin', 'your-email@example.com', 
   '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'Admin', 'User', 'super_admin', 1);
   
   Login: admin / password (change after login!)

5. TEST:
   - Visit: https://yourdomain.com
   - Login: https://yourdomain.com/employer/login

✅ CHECKLIST:
═══════════════════════════════════════════════════════════════
□ Uploaded frontend files to public_html/
□ Uploaded api files to public_html/api/
□ Created database
□ Imported schema.sql
□ Updated database.php config
□ Created admin user
□ Enabled SSL (HTTPS)
□ Tested login
□ Changed default password

📚 DETAILED GUIDE:
═══════════════════════════════════════════════════════════════
See: DEPLOY_TO_HOSTING.md for step-by-step instructions

🎉 Ready to Deploy!
═══════════════════════════════════════════════════════════════
"@

Set-Content -Path "$deployFolder\README.txt" -Value $instructions -Force
Write-Host "   ✓ Instructions created`n" -ForegroundColor Green

# Step 9: Create database config template
Write-Host "📝 Step 9: Creating config template..." -ForegroundColor Yellow

$configTemplate = @"
<?php
// ⚠️ UPDATE THESE VALUES AFTER UPLOADING TO YOUR HOSTING
return [
    'host' => 'localhost',  // Usually 'localhost', sometimes 'db.yourdomain.com'
    'database' => 'your_username_hrms',  // Your full database name (includes prefix)
    'username' => 'your_username_hrms_user',  // Your database username
    'password' => 'YOUR_STRONG_PASSWORD_HERE',  // Database password you created
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ],
];
"@

Set-Content -Path "$deployFolder\api\config\database.php.example" -Value $configTemplate -Force
Write-Host "   ✓ Config template created`n" -ForegroundColor Green

# Step 10: Display statistics
Write-Host "📊 Step 10: Build Statistics" -ForegroundColor Yellow

$frontendSize = (Get-ChildItem -Path "$deployFolder\frontend" -Recurse | Measure-Object -Property Length -Sum).Sum
$backendSize = (Get-ChildItem -Path "$deployFolder\api" -Recurse | Measure-Object -Property Length -Sum).Sum
$totalSize = $frontendSize + $backendSize

Write-Host "   Frontend: $([math]::Round($frontendSize / 1MB, 2)) MB" -ForegroundColor White
Write-Host "   Backend:  $([math]::Round($backendSize / 1MB, 2)) MB" -ForegroundColor White
Write-Host "   Total:    $([math]::Round($totalSize / 1MB, 2)) MB`n" -ForegroundColor Cyan

# Summary
Write-Host "✅ Preparation Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Green

Write-Host "📁 Files Location:" -ForegroundColor Cyan
Write-Host "   $deployFolder`n" -ForegroundColor White

Write-Host "📋 What to Upload:" -ForegroundColor Cyan
Write-Host "   frontend/* → public_html/" -ForegroundColor White
Write-Host "   api/*      → public_html/api/" -ForegroundColor White
Write-Host "   database/schema.sql → Import via phpMyAdmin`n" -ForegroundColor White

Write-Host "📖 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open File Explorer: explorer.exe '$deployFolder'" -ForegroundColor Yellow
Write-Host "   2. Read: README.txt in the folder" -ForegroundColor Yellow
Write-Host "   3. Follow: DEPLOY_TO_HOSTING.md guide" -ForegroundColor Yellow
Write-Host "   4. Upload files to your hosting" -ForegroundColor Yellow
Write-Host "   5. Configure database" -ForegroundColor Yellow
Write-Host "   6. Test your site!`n" -ForegroundColor Yellow

Write-Host "🌐 Opening folder..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
explorer.exe $deployFolder

Write-Host "`n🚀 Ready to deploy! Follow DEPLOY_TO_HOSTING.md for detailed steps.`n" -ForegroundColor Green
