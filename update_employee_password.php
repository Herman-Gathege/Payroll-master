<?php
require_once 'backend/config/database.php';

$database = new Database();
$db = $database->getConnection();

$newPassword = 'TestPass123';
$passwordHash = password_hash($newPassword, PASSWORD_BCRYPT);

$stmt = $db->prepare('UPDATE employee_users SET password_hash = :hash WHERE username = :username');
$stmt->execute([
    ':hash' => $passwordHash,
    ':username' => 'john.doe'
]);

echo "✅ Password updated successfully!\n";
echo "Username: john.doe\n";
echo "New Password: $newPassword\n";
?>
