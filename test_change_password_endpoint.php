<?php
/**
 * Direct test of change password endpoint
 */

$url = 'http://localhost/backend/api/employee/auth.php?action=change-password';

// First, login to get a valid token
$login_url = 'http://localhost/backend/api/employee/auth.php';
$login_data = [
    'username' => 'john.doe',
    'password' => 'Employee@2025!'
];

$login_options = [
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode($login_data)
    ]
];

echo "Step 1: Logging in to get token...\n";
$login_context = stream_context_create($login_options);
$login_result = file_get_contents($login_url, false, $login_context);
$login_response = json_decode($login_result, true);

if (!$login_response['success']) {
    die("Login failed: " . $login_response['message'] . "\n");
}

$token = $login_response['token'];
echo "✓ Login successful, token: " . substr($token, 0, 20) . "...\n\n";

// Now test change password
echo "Step 2: Attempting to change password...\n";

$data = [
    'current_password' => 'Employee@2025!',
    'new_password' => 'NewPassword123!'
];

$options = [
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\nAuthorization: Bearer $token",
        'content' => json_encode($data),
        'ignore_errors' => true
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "Response: $result\n\n";

$response = json_decode($result, true);

if ($response && isset($response['success'])) {
    if ($response['success']) {
        echo "✓✓✓ PASSWORD CHANGE SUCCESSFUL! ✓✓✓\n";
    } else {
        echo "✗ Password change failed: " . $response['message'] . "\n";
        if (isset($response['debug'])) {
            echo "Debug info: " . json_encode($response['debug']) . "\n";
        }
    }
} else {
    echo "✗ Invalid response format\n";
}
?>
