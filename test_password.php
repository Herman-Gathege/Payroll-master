<?php
// Test password verification
require_once 'backend/config/database.php';

$database = new Database();
$db = $database->getConnection();

$username = 'admin';
$password = 'Admin@2025!';

// Get user from database
$query = "SELECT id, username, password_hash FROM employer_users WHERE username = :username";
$stmt = $db->prepare($query);
$stmt->bindParam(':username', $username);
$stmt->execute();

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo "User found: " . $user['username'] . "\n";
    echo "Password hash: " . substr($user['password_hash'], 0, 30) . "...\n";
    
    // Test password verification
    if (password_verify($password, $user['password_hash'])) {
        echo "✓ Password verification SUCCESSFUL!\n";
    } else {
        echo "✗ Password verification FAILED!\n";
        
        // Try to create the correct hash
        $correct_hash = password_hash($password, PASSWORD_BCRYPT);
        echo "\nCorrect hash would be: " . substr($correct_hash, 0, 30) . "...\n";
    }
} else {
    echo "User not found!\n";
}
