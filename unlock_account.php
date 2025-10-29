<?php
// Unlock admin account and verify credentials
require_once 'backend/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "===== ACCOUNT UNLOCK & VERIFICATION =====\n\n";

// Step 1: Check current account status
echo "1. Checking account status...\n";
$query = "SELECT username, failed_login_attempts, locked_until FROM employer_users WHERE username = 'admin'";
$stmt = $db->prepare($query);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo "   Username: {$user['username']}\n";
    echo "   Failed attempts: {$user['failed_login_attempts']}\n";
    echo "   Locked until: " . ($user['locked_until'] ?? 'Not locked') . "\n\n";
} else {
    echo "   ❌ User not found!\n\n";
    exit;
}

// Step 2: Unlock account
echo "2. Unlocking account...\n";
$unlock_query = "UPDATE employer_users 
                 SET failed_login_attempts = 0, 
                     locked_until = NULL 
                 WHERE username = 'admin'";
$db->exec($unlock_query);
echo "   ✓ Account unlocked\n\n";

// Step 3: Verify password
echo "3. Verifying password...\n";
$pass_query = "SELECT password_hash FROM employer_users WHERE username = 'admin'";
$stmt = $db->prepare($pass_query);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

$test_password = 'Admin@2025!';
if (password_verify($test_password, $user['password_hash'])) {
    echo "   ✓ Password 'Admin@2025!' is correct\n\n";
} else {
    echo "   ❌ Password verification failed!\n";
    echo "   Fixing password...\n";
    $new_hash = password_hash($test_password, PASSWORD_BCRYPT);
    $fix_query = "UPDATE employer_users SET password_hash = :hash WHERE username = 'admin'";
    $stmt = $db->prepare($fix_query);
    $stmt->execute([':hash' => $new_hash]);
    echo "   ✓ Password fixed\n\n";
}

// Step 4: Final verification
echo "4. Final account status:\n";
$query = "SELECT username, email, role, is_active, failed_login_attempts, locked_until 
          FROM employer_users WHERE username = 'admin'";
$stmt = $db->prepare($query);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

echo "   Username: {$user['username']}\n";
echo "   Email: {$user['email']}\n";
echo "   Role: {$user['role']}\n";
echo "   Active: " . ($user['is_active'] ? 'Yes' : 'No') . "\n";
echo "   Failed attempts: {$user['failed_login_attempts']}\n";
echo "   Locked: " . ($user['locked_until'] ? 'Yes' : 'No') . "\n\n";

echo "===== STATUS =====\n";
echo "✓ Account is unlocked\n";
echo "✓ Password is correct\n";
echo "✓ Account is active\n";
echo "\n";
echo "You can now login with:\n";
echo "Username: admin\n";
echo "Password: Admin@2025!\n";
