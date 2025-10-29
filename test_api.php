<?php
/**
 * Test the login API endpoint directly
 */

$url = 'http://localhost/backend/api/employer/auth.php';
$data = [
    'username' => 'admin',
    'password' => 'Admin@2025!'
];

$options = [
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "API Response:\n";
echo $result . "\n\n";

$response = json_decode($result, true);

if ($response && $response['success']) {
    echo "✓✓✓ LOGIN API WORKS! ✓✓✓\n";
    echo "Token: " . substr($response['token'], 0, 20) . "...\n";
    echo "User: {$response['user']['username']} ({$response['user']['role']})\n";
} else {
    echo "✗ Login failed: " . ($response['message'] ?? 'Unknown error') . "\n";
}
?>
