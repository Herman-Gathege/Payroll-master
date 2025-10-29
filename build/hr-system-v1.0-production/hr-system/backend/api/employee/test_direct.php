<?php
// Direct test to see what action is being parsed
$_GET['action'] = 'change-password';
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REQUEST_URI'] = '/backend/api/employee/auth.php?action=change-password';

// Capture output
ob_start();

// Include the auth file
include 'auth.php';

$output = ob_get_clean();

echo "Output: $output\n";
?>
