# Simple Hosting Preparation Script
Write-Host "`nPreparing files for hosting upload...`n" -ForegroundColor Cyan

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Yellow
cd frontend
npm run build:prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

cd ..

# Create folders
Write-Host "`nCreating deployment folder..." -ForegroundColor Yellow
$deploy = "ready-to-upload"

if (Test-Path $deploy) {
    Remove-Item $deploy -Recurse -Force
}

New-Item -Path $deploy -ItemType Directory -Force | Out-Null
New-Item -Path "$deploy\frontend" -ItemType Directory -Force | Out-Null
New-Item -Path "$deploy\api" -ItemType Directory -Force | Out-Null
New-Item -Path "$deploy\database" -ItemType Directory -Force | Out-Null

# Copy files
Write-Host "Copying files..." -ForegroundColor Yellow
Copy-Item -Path "frontend\dist\*" -Destination "$deploy\frontend\" -Recurse -Force
Copy-Item -Path "backend\*" -Destination "$deploy\api\" -Recurse -Force
Copy-Item -Path "database\schema.sql" -Destination "$deploy\database\" -Force

# Create .htaccess
Write-Host "Creating .htaccess..." -ForegroundColor Yellow
$htaccess = "<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>
Options -Indexes"

$htaccess | Out-File -FilePath "$deploy\frontend\.htaccess" -Encoding ASCII

# Create README
Write-Host "Creating instructions..." -ForegroundColor Yellow
$readme = "FILES READY TO UPLOAD
=====================

1. Upload frontend/* to public_html/
2. Upload api/* to public_html/api/
3. Import database/schema.sql via phpMyAdmin
4. Edit api/config/database.php with your credentials
5. Visit your site!

See DEPLOY_TO_HOSTING.md for detailed steps."

$readme | Out-File -FilePath "$deploy\README.txt" -Encoding ASCII

# Show stats
$size = (Get-ChildItem $deploy -Recurse | Measure-Object -Property Length -Sum).Sum
$sizeMB = [math]::Round($size / 1MB, 2)

Write-Host "`nDone!" -ForegroundColor Green
Write-Host "Total size: $sizeMB MB" -ForegroundColor Cyan
Write-Host "Location: $PWD\$deploy`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open folder: explorer $deploy" -ForegroundColor White
Write-Host "2. Read: DEPLOY_TO_HOSTING.md" -ForegroundColor White
Write-Host "3. Upload to your hosting" -ForegroundColor White

explorer $deploy
