<?php
/**
 * Test login functionality directly
 */

require_once 'backend/config/database.php';

$database = new Database();
$db = $database->getConnection();

$username = 'admin';
$password = 'Admin@2025!';

echo "Testing login for: $username\n";
echo "Password: $password\n\n";

// Query employer_users table
$query = "SELECT
            eu.id, eu.username, eu.email, eu.password_hash, eu.role,
            eu.organization_id, eu.employee_id, eu.is_active,
            eu.two_factor_enabled, eu.failed_login_attempts, eu.locked_until,
            eu.first_name, eu.last_name, eu.phone_number,
            o.organization_name, o.organization_code
          FROM employer_users eu
          JOIN organizations o ON eu.organization_id = o.id
          WHERE eu.username = :username AND eu.is_active = 1";

$stmt = $db->prepare($query);
$stmt->bindParam(":username", $username);
$stmt->execute();

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo "✓ User found in database\n";
    echo "  ID: {$user['id']}\n";
    echo "  Username: {$user['username']}\n";
    echo "  Email: {$user['email']}\n";
    echo "  Role: {$user['role']}\n";
    echo "  Active: " . ($user['is_active'] ? 'Yes' : 'No') . "\n";
    echo "  Locked until: " . ($user['locked_until'] ?? 'Not locked') . "\n\n";

    // Verify password
    if (password_verify($password, $user['password_hash'])) {
        echo "✓ Password verification PASSED!\n";
        echo "\n✓✓✓ LOGIN WOULD SUCCEED ✓✓✓\n";
    } else {
        echo "✗ Password verification FAILED!\n";
        echo "  Stored hash: " . substr($user['password_hash'], 0, 30) . "...\n";
    }
} else {
    echo "✗ User not found or not active\n";
}
?>
