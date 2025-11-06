<?php
$hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // from DB

$testPasswords = ['password', 'admin', 'admin123', '123456'];

foreach ($testPasswords as $pw) {
    if (password_verify($pw, $hash)) {
        echo "✅ '$pw' matches the hash!\n";
    } else {
        echo "❌ '$pw' does NOT match.\n";
    }
}
?>
