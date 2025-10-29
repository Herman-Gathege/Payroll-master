<?php
// Fix password for employee user
require_once 'backend/config/database.php';

$database = new Database();
$db = $database->getConnection();

$username = 'john.doe';
$new_password = 'Employee@2025!';

// Generate correct hash
$password_hash = password_hash($new_password, PASSWORD_BCRYPT);

echo "Updating password for: $username\n";
echo "New password: $new_password\n";
echo "Hash: " . substr($password_hash, 0, 30) . "...\n\n";

// Update password
$query = "UPDATE employee_users SET password_hash = :password_hash WHERE username = :username";
$stmt = $db->prepare($query);
$stmt->bindParam(':password_hash', $password_hash);
$stmt->bindParam(':username', $username);

if ($stmt->execute()) {
    echo "✓ Password updated successfully!\n\n";
    
    // Verify it works
    $query = "SELECT password_hash FROM employee_users WHERE username = :username";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':username', $username);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($new_password, $user['password_hash'])) {
        echo "✓ Verification test PASSED!\n";
    } else {
        echo "✗ Verification test FAILED or user not found!\n";
    }
} else {
    echo "✗ Failed to update password\n";
}
