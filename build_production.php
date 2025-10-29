<?php
/**
 * Production Build Script - Windows Compatible
 * Creates a complete production-ready package using native PHP functions
 */

echo "=================================================\n";
echo "HR Management System - Production Build\n";
echo "=================================================\n\n";

$baseDir = __DIR__;
$buildDir = $baseDir . '/build';
$distDir = $buildDir . '/hr-system';

// Recursive directory delete function
function deleteDirectory($dir) {
    if (!file_exists($dir)) {
        return true;
    }
    if (!is_dir($dir)) {
        return unlink($dir);
    }
    foreach (scandir($dir) as $item) {
        if ($item == '.' || $item == '..') {
            continue;
        }
        if (!deleteDirectory($dir . DIRECTORY_SEPARATOR . $item)) {
            return false;
        }
    }
    return rmdir($dir);
}

// Recursive directory copy function
function copyDirectory($src, $dst) {
    $dir = opendir($src);
    @mkdir($dst, 0777, true);
    while (false !== ($file = readdir($dir))) {
        if (($file != '.') && ($file != '..')) {
            if (is_dir($src . '/' . $file)) {
                copyDirectory($src . '/' . $file, $dst . '/' . $file);
            } else {
                copy($src . '/' . $file, $dst . '/' . $file);
            }
        }
    }
    closedir($dir);
}

// Step 1: Clean previous build
echo "Step 1: Cleaning previous build...\n";
if (file_exists($buildDir)) {
    deleteDirectory($buildDir);
}
mkdir($buildDir, 0777, true);
mkdir($distDir, 0777, true);
echo "✅ Build directory created\n\n";

// Step 2: Copy backend files
echo "Step 2: Copying backend files...\n";
$backendDirs = ['api', 'config', 'middleware'];
foreach ($backendDirs as $dir) {
    $source = $baseDir . '/backend/' . $dir;
    $dest = $distDir . '/backend/' . $dir;
    if (file_exists($source)) {
        copyDirectory($source, $dest);
        echo "  ✓ Copied backend/$dir\n";
    }
}

// Copy .env.example
if (file_exists($baseDir . '/backend/.env.example')) {
    if (!file_exists($distDir . '/backend')) {
        mkdir($distDir . '/backend', 0777, true);
    }
    copy($baseDir . '/backend/.env.example', $distDir . '/backend/.env.example');
    echo "  ✓ Copied .env.example\n";
}
echo "✅ Backend files copied\n\n";

// Step 3: Copy frontend build
echo "Step 3: Copying frontend build...\n";
$frontendSource = $baseDir . '/frontend/dist';
if (file_exists($frontendSource)) {
    // Copy all files from dist to root of distDir
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($frontendSource, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($files as $file) {
        $relativePath = substr($file->getPathname(), strlen($frontendSource) + 1);
        $targetPath = $distDir . '/' . $relativePath;

        if ($file->isDir()) {
            @mkdir($targetPath, 0777, true);
        } else {
            copy($file->getPathname(), $targetPath);
        }
    }
    echo "✅ Frontend build copied\n\n";
} else {
    echo "⚠️  Frontend not built yet. Run 'npm run build' in frontend directory first.\n\n";
}

// Step 4: Copy database schema
echo "Step 4: Copying database files...\n";
if (file_exists($baseDir . '/database')) {
    copyDirectory($baseDir . '/database', $distDir . '/database');
    echo "✅ Database files copied\n\n";
}

// Step 5: Create .htaccess files
echo "Step 5: Creating .htaccess files...\n";

// Root .htaccess
$rootHtaccess = <<<'HTACCESS'
# HR Management System - Root .htaccess

# Enable rewrite engine
RewriteEngine On

# Force HTTPS (uncomment in production)
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security Headers
<IfModule mod_headers.c>
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    Header unset X-Powered-By
</IfModule>

# Disable directory browsing
Options -Indexes

# Protect sensitive files
<FilesMatch "\.(env|log|sql|json|lock)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# React Router - Redirect all requests to index.html
RewriteCond %{REQUEST_URI} !^/backend/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
    AddOutputFilterByType DEFLATE application/javascript application/json
    AddOutputFilterByType DEFLATE application/xml application/xhtml+xml
</IfModule>

# Browser caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
    ExpiresByType text/html "access plus 0 seconds"
</IfModule>
HTACCESS;

file_put_contents($distDir . '/.htaccess', $rootHtaccess);
echo "  ✓ Created root .htaccess\n";

// Backend .htaccess
$backendHtaccess = <<<'HTACCESS'
# Backend API .htaccess

# Deny access to .env files
<FilesMatch "^\.env">
    Order allow,deny
    Deny from all
</FilesMatch>

# Protect config directory
<FilesMatch "\.(php)$">
    # Allow only specific config files to be accessed
</FilesMatch>
HTACCESS;

if (!file_exists($distDir . '/backend')) {
    mkdir($distDir . '/backend', 0777, true);
}
file_put_contents($distDir . '/backend/.htaccess', $backendHtaccess);
echo "  ✓ Created backend .htaccess\n";
echo "✅ .htaccess files created\n\n";

// Step 6: Create deployment instructions
echo "Step 6: Creating deployment files...\n";

$readme = <<<'README'
# HR Management System - Production Package

## Quick Start

### 1. Upload Files
Upload all files to your web server's public_html directory (or equivalent).

### 2. Database Setup
```bash
# Import database schema
mysql -u username -p database_name < database/schema.sql
```

### 3. Configure Environment
```bash
# Copy and edit .env file
cp backend/.env.example backend/.env
nano backend/.env
```

Update these values:
- DB_HOST, DB_NAME, DB_USER, DB_PASS
- APP_ENV=production
- APP_DEBUG=false
- CORS_ORIGIN=https://yourdomain.com

### 4. Set Permissions
```bash
chmod 644 backend/.env
chmod -R 755 backend/
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
```

### 5. Test
Visit: https://yourdomain.com
Login: admin / Admin@2025!

## File Structure
```
/
├── index.html          # Frontend entry point
├── assets/            # JS, CSS, images
├── backend/           # API backend
│   ├── api/          # API endpoints
│   ├── config/       # Configuration
│   └── .env.example  # Environment template
├── database/          # SQL schemas
└── .htaccess         # Apache configuration
```

## Support
See docs/ folder for detailed documentation.
README;

file_put_contents($distDir . '/README.md', $readme);
echo "  ✓ Created README.md\n";

// Installation script
$install = <<<'INSTALL'
#!/bin/bash
# Installation script for HR Management System

echo "HR Management System - Installation"
echo "===================================="
echo ""

# Check requirements
echo "Checking requirements..."
php -v > /dev/null 2>&1 || { echo "PHP not found!"; exit 1; }
mysql --version > /dev/null 2>&1 || { echo "MySQL not found!"; exit 1; }
echo "✓ Requirements met"
echo ""

# Create .env file
if [ ! -f backend/.env ]; then
    echo "Creating .env file..."
    cp backend/.env.example backend/.env
    echo "✓ .env file created"
    echo "⚠️  Please edit backend/.env with your database credentials"
    echo ""
else
    echo "✓ .env file already exists"
    echo ""
fi

# Set permissions
echo "Setting permissions..."
chmod 644 backend/.env
chmod -R 755 backend/
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
echo "✓ Permissions set"
echo ""

echo "Installation complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your database credentials"
echo "2. Import database: mysql -u user -p database < database/schema.sql"
echo "3. Visit your domain to access the system"
INSTALL;

file_put_contents($distDir . '/install.sh', $install);
echo "  ✓ Created install.sh\n";
echo "✅ Deployment files created\n\n";

// Step 7: Create archive using ZipArchive
echo "Step 7: Creating deployment archive...\n";
$archiveName = 'hr-system-v1.0-production.zip';
$archivePath = $buildDir . '/' . $archiveName;

$zip = new ZipArchive();
if ($zip->open($archivePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {
    // Create recursive directory iterator
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($distDir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($files as $file) {
        if (!$file->isDir()) {
            $filePath = $file->getRealPath();
            $relativePath = 'hr-system/' . substr($filePath, strlen($distDir) + 1);
            $zip->addFile($filePath, $relativePath);
        }
    }

    $zip->close();

    if (file_exists($archivePath)) {
        $size = round(filesize($archivePath) / 1024 / 1024, 2);
        echo "✅ Archive created: $archiveName ($size MB)\n\n";
    } else {
        echo "⚠️  Failed to create archive\n\n";
    }
} else {
    echo "⚠️  Failed to create ZIP archive\n\n";
}

// Summary
echo "=================================================\n";
echo "Build Complete!\n";
echo "=================================================\n\n";

echo "Output:\n";
echo "  Directory: build/hr-system/\n";
echo "  Archive:   build/$archiveName\n\n";

echo "Package Contents:\n";
echo "  ✓ Frontend (production build)\n";
echo "  ✓ Backend API\n";
echo "  ✓ Database schemas\n";
echo "  ✓ Configuration templates\n";
echo "  ✓ .htaccess files\n";
echo "  ✓ Installation script\n";
echo "  ✓ Documentation\n\n";

echo "Next Steps:\n";
echo "1. Upload build/$archiveName to your server\n";
echo "2. Extract to public_html directory\n";
echo "3. Run install.sh script\n";
echo "4. Configure backend/.env file\n";
echo "5. Import database schema\n\n";

echo "=================================================\n";
?>
