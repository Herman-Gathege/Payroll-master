<?php
// Test the actual employer auth API endpoint
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing Employer Authentication API\n";
echo "====================================\n\n";

// Simulate POST request to auth endpoint
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REQUEST_URI'] = '/backend/api/employer/auth';

// Set input data
$input = json_encode([
    'username' => 'admin',
    'password' => 'Admin@2025!'
]);

// Mock php://input
$temp = tmpfile();
fwrite($temp, $input);
fseek($temp, 0);

// Include the auth file
ob_start();
include 'backend/api/employer/auth.php';
$response = ob_get_clean();

echo "Response:\n";
echo $response;
echo "\n";

fclose($temp);
