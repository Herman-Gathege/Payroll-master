# Simple Build and Deploy Script
param(
    [string]$Destination = "C:\xampp\htdocs\hrms"
)

Write-Host "`nBuilding and Deploying HR Management System..." -ForegroundColor Cyan
Write-Host "===============================================`n" -ForegroundColor Cyan

# Navigate to frontend
$frontendPath = "C:\Users\ianos\work\PHP\Payroll-master\frontend"
Set-Location $frontendPath

# Clean previous build
Write-Host "Cleaning previous build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
}

# Build for production
Write-Host "Building application for production..." -ForegroundColor Yellow
npm run build:prod

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nBuild failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Build successful!`n" -ForegroundColor Green

# Show build statistics
if (Test-Path "dist") {
    $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
    $distSizeMB = [math]::Round($distSize / 1MB, 2)
    Write-Host "Total build size: $distSizeMB MB" -ForegroundColor Cyan
}

# Create destination
if (!(Test-Path $Destination)) {
    New-Item -Path $Destination -ItemType Directory -Force | Out-Null
}

# Copy files
Write-Host "Deploying to $Destination..." -ForegroundColor Yellow
Copy-Item -Path "dist\*" -Destination $Destination -Recurse -Force

# Create .htaccess
$subdirectory = Split-Path $Destination -Leaf
$htaccessContent = @"
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /$subdirectory/
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>
"@

Set-Content -Path "$Destination\.htaccess" -Value $htaccessContent -Force

Write-Host "`nDeployment complete!" -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Green
Write-Host "URL: http://localhost/$subdirectory/" -ForegroundColor Cyan
Write-Host "`nLogins:" -ForegroundColor Cyan
Write-Host "  Employer: admin / Admin@2025!" -ForegroundColor White
Write-Host "  Employee: john.doe / Employee@2025!`n" -ForegroundColor White
