<?php
// Test employee password verification

$stored_hash = '$2y$12$hwxTww9eL5.y2j84p1ugSuD5B7yGxctkGQ0sYj9chJ08SHSDT5ugC';
$test_password = 'Employee@2025!';

echo "Testing password verification:\n";
echo "Password: $test_password\n";
echo "Hash: $stored_hash\n\n";

if (password_verify($test_password, $stored_hash)) {
    echo "✅ Password matches!\n";
} else {
    echo "❌ Password does NOT match!\n";
    echo "\nGenerating new hash:\n";
    $new_hash = password_hash($test_password, PASSWORD_BCRYPT, ['cost' => 12]);
    echo "New hash: $new_hash\n";
}
?>
