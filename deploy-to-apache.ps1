# Build and Deploy to Apache/XAMPP
param(
    [string]$Destination = "C:\xampp\htdocs\hrms",
    [switch]$OpenBrowser
)

Write-Host "`n🏗️  HR Management System - Build & Deploy" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Navigate to frontend directory
$projectRoot = "C:\Users\ianos\work\PHP\Payroll-master"
$frontendPath = Join-Path $projectRoot "frontend"

if (!(Test-Path $frontendPath)) {
    Write-Host "❌ Frontend directory not found: $frontendPath" -ForegroundColor Red
    exit 1
}

Set-Location $frontendPath

# Step 1: Clean previous build
Write-Host "🧹 Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "   ✓ Cleaned" -ForegroundColor Green
} else {
    Write-Host "   ✓ No previous build found" -ForegroundColor Green
}

# Step 2: Build application
Write-Host "`n📦 Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Build failed! Check errors above.`n" -ForegroundColor Red
    exit 1
}

Write-Host "   ✓ Build successful!" -ForegroundColor Green

# Step 3: Check build output
$distPath = Join-Path $frontendPath "dist"
if (!(Test-Path $distPath)) {
    Write-Host "`n❌ Build output not found!`n" -ForegroundColor Red
    exit 1
}

# Display build statistics
Write-Host "`n📊 Build Statistics:" -ForegroundColor Cyan
$indexHtml = Get-Item (Join-Path $distPath "index.html")
$jsFiles = Get-ChildItem -Path (Join-Path $distPath "assets") -Filter "*.js" -ErrorAction SilentlyContinue
$cssFiles = Get-ChildItem -Path (Join-Path $distPath "assets") -Filter "*.css" -ErrorAction SilentlyContinue

Write-Host "   index.html: $([math]::Round($indexHtml.Length / 1KB, 2)) KB" -ForegroundColor White
if ($jsFiles) {
    $totalJsSize = ($jsFiles | Measure-Object -Property Length -Sum).Sum
    $jsCount = $jsFiles.Count
    Write-Host "   JavaScript: $([math]::Round($totalJsSize / 1KB, 2)) KB ($jsCount files)" -ForegroundColor White
}
if ($cssFiles) {
    $totalCssSize = ($cssFiles | Measure-Object -Property Length -Sum).Sum
    $cssCount = $cssFiles.Count
    Write-Host "   CSS: $([math]::Round($totalCssSize / 1KB, 2)) KB ($cssCount files)" -ForegroundColor White
}

# Step 4: Deploy to Apache
Write-Host "`n🚀 Deploying to Apache..." -ForegroundColor Yellow

# Create destination directory
if (!(Test-Path $Destination)) {
    New-Item -Path $Destination -ItemType Directory -Force | Out-Null
    Write-Host "   ✓ Created directory: $Destination" -ForegroundColor Green
}

# Copy files
try {
    Copy-Item -Path "$distPath\*" -Destination $Destination -Recurse -Force
    Write-Host "   ✓ Files copied to: $Destination" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to copy files: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Create .htaccess for SPA routing
Write-Host "`n⚙️  Configuring Apache..." -ForegroundColor Yellow

$subdirectory = Split-Path $Destination -Leaf
$htaccessContent = @"
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /$subdirectory/
  
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
</IfModule>

# Cache static assets
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
  <IfModule mod_headers.c>
    Header set Cache-Control "max-age=31536000, public, immutable"
  </IfModule>
</FilesMatch>

# Don't cache index.html
<FilesMatch "index\.html$">
  <IfModule mod_headers.c>
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
  </IfModule>
</FilesMatch>

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
"@

$htaccessPath = Join-Path $Destination ".htaccess"
Set-Content -Path $htaccessPath -Value $htaccessContent -Force
Write-Host "   ✓ Created .htaccess with SPA routing" -ForegroundColor Green

# Step 6: Verify mod_rewrite
Write-Host "`n🔍 Checking Apache configuration..." -ForegroundColor Yellow
$apacheConf = "C:\xampp\apache\conf\httpd.conf"
if (Test-Path $apacheConf) {
    $confContent = Get-Content $apacheConf -Raw
    if ($confContent -match "^LoadModule rewrite_module") {
        Write-Host "   ✓ mod_rewrite is enabled" -ForegroundColor Green
    } elseif ($confContent -match "^#LoadModule rewrite_module") {
        Write-Host "   ⚠️  mod_rewrite is DISABLED - Enable it in httpd.conf" -ForegroundColor Yellow
        Write-Host "      1. Edit: $apacheConf" -ForegroundColor Gray
        Write-Host "      2. Find: #LoadModule rewrite_module modules/mod_rewrite.so" -ForegroundColor Gray
        Write-Host "      3. Remove the # to uncomment" -ForegroundColor Gray
        Write-Host "      4. Restart Apache" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠️  Apache config not found at standard location" -ForegroundColor Yellow
}

# Step 7: Success summary
Write-Host "`n✅ Deployment Complete!" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

$url = "http://localhost/$subdirectory/"
Write-Host "🌐 Application URL:" -ForegroundColor Cyan
Write-Host "   $url" -ForegroundColor White

Write-Host "`n🔐 Login Credentials:" -ForegroundColor Cyan
Write-Host "   Employer: admin / Admin@2025!" -ForegroundColor White
Write-Host "   Employee: john.doe / Employee@2025!" -ForegroundColor White

Write-Host "`n📝 Important Routes:" -ForegroundColor Cyan
Write-Host "   Homepage:        $url" -ForegroundColor White
Write-Host "   Employer Login:  ${url}employer/login" -ForegroundColor White
Write-Host "   Employee Login:  ${url}employee/login" -ForegroundColor White

Write-Host "`n🔧 Troubleshooting:" -ForegroundColor Cyan
Write-Host "   - If blank screen: Check browser console (F12)" -ForegroundColor White
Write-Host "   - If 404 on routes: Enable mod_rewrite (see above)" -ForegroundColor White
Write-Host "   - If API errors: Update CORS headers in backend" -ForegroundColor White
Write-Host "   - Clear browser cache: Ctrl+Shift+R" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "   See BUILD_DEPLOYMENT_GUIDE.md for detailed troubleshooting`n" -ForegroundColor White

# Open browser if requested
if ($OpenBrowser) {
    Write-Host "🌍 Opening browser..." -ForegroundColor Cyan
    Start-Sleep -Seconds 1
    Start-Process $url
}

Write-Host ""
