<?php
/**
 * Quick Test: Email System & Organization Signup
 * 
 * Tests:
 * 1. SMTP connection
 * 2. Database schema
 * 3. PHPMailer installation
 * 4. Organization signup endpoint
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== EMAIL SYSTEM TEST ===\n\n";

// Test 1: PHPMailer Installation
echo "Test 1: PHPMailer Installation\n";
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
    echo "✅ PHPMailer installed via Composer\n\n";
} elseif (class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    echo "✅ PHPMailer available\n\n";
} else {
    echo "❌ PHPMailer NOT installed\n";
    echo "   Run: composer require phpmailer/phpmailer\n\n";
    exit(1);
}

// Test 2: EmailService class
echo "Test 2: EmailService Class\n";
if (file_exists(__DIR__ . '/utils/EmailService.php')) {
    require_once __DIR__ . '/utils/EmailService.php';
    echo "✅ EmailService.php found\n\n";
} else {
    echo "❌ EmailService.php NOT found\n\n";
    exit(1);
}

// Test 3: SMTP Connection
echo "Test 3: SMTP Connection\n";
try {
    $emailService = new EmailService();
    $result = $emailService->testConnection();
    
    if ($result['success']) {
        echo "✅ " . $result['message'] . "\n\n";
    } else {
        echo "❌ " . $result['message'] . "\n";
        echo "   → Check SMTP settings in utils/EmailService.php\n";
        echo "   → Lines 51-56 (Host, Username, Password)\n\n";
    }
} catch (Exception $e) {
    echo "❌ SMTP test failed: " . $e->getMessage() . "\n\n";
}

// Test 4: Database Connection
echo "Test 4: Database Connection\n";
if (file_exists(__DIR__ . '/config/database.php')) {
    require_once __DIR__ . '/config/database.php';
    try {
        $database = new Database();
        $db = $database->getConnection();
        echo "✅ Database connection successful\n\n";
        
        // Test 5: Organizations table schema
        echo "Test 5: Organizations Table Schema\n";
        $check_columns = $db->query("SHOW COLUMNS FROM organizations LIKE 'contact_email'");
        if ($check_columns->rowCount() > 0) {
            echo "✅ Organizations table updated for signup\n\n";
        } else {
            echo "❌ Organizations table needs update\n";
            echo "   → Run: database/update_organizations_signup.sql\n\n";
        }
        
        // Test 6: Audit log table
        echo "Test 6: Audit Log Table\n";
        $check_audit = $db->query("SHOW TABLES LIKE 'audit_log'");
        if ($check_audit->rowCount() > 0) {
            echo "✅ Audit log table exists\n\n";
        } else {
            echo "❌ Audit log table missing\n";
            echo "   → Run: database/add_onboarding_tables.sql\n\n";
        }
        
    } catch (PDOException $e) {
        echo "❌ Database connection failed: " . $e->getMessage() . "\n\n";
    }
} else {
    echo "❌ config/database.php NOT found\n\n";
}

// Test 7: Organization Signup Endpoint
echo "Test 7: Organization Signup Endpoint\n";
if (file_exists(__DIR__ . '/api/organization_signup.php')) {
    echo "✅ organization_signup.php exists\n\n";
} else {
    echo "❌ organization_signup.php NOT found\n\n";
}

// Summary
echo "=== TEST SUMMARY ===\n\n";
echo "Next Steps:\n";
echo "1. Configure SMTP in utils/EmailService.php (lines 51-56)\n";
echo "2. Run: database/update_organizations_signup.sql\n";
echo "3. Test signup: http://localhost:5173/signup\n";
echo "4. Test email: Create test organization and check inbox\n\n";

echo "Documentation:\n";
echo "→ EMAIL_SYSTEM_GUIDE.md (Complete email setup)\n";
echo "→ COMPLETE_SYSTEM_READY.md (Full deployment guide)\n\n";
?>
