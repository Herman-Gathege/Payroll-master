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