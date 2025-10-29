<?php
// Simulate the action parsing

$_GET['action'] = 'change-password';
$_SERVER['REQUEST_URI'] = '/backend/api/employee/auth.php?action=change-password';

$request_uri = $_SERVER['REQUEST_URI'];
$action = 'login'; // default

// Check query parameter first
if (isset($_GET['action'])) {
    $action = str_replace('-', '_', $_GET['action']);
    echo "✓ Parsed from query parameter\n";
}
// Fall back to URI path parsing
elseif (strpos($request_uri, '/logout') !== false) {
    $action = 'logout';
    echo "✓ Parsed from URI - logout\n";
} elseif (strpos($request_uri, '/verify') !== false) {
    $action = 'verify';
    echo "✓ Parsed from URI - verify\n";
} elseif (strpos($request_uri, '/change-password') !== false || strpos($request_uri, 'change_password') !== false) {
    $action = 'change_password';
    echo "✓ Parsed from URI - change_password\n";
}

echo "Action: $action\n";
echo "Expected: change_password\n";
echo "Match: " . ($action === 'change_password' ? 'YES' : 'NO') . "\n";
?>
