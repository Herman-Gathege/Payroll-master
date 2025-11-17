<?php

require_once __DIR__ . '/../config/Database.php';
require_once __DIR__ . '/../models/User.php';

use Backend\Models\User;

if (!isset($_GET['token'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Verification token missing']);
    exit;
}

$token = $_GET['token'];
$user = new User();

if ($user->verifyEmailToken($token)) {
    echo json_encode(['status' => 'success', 'message' => 'Email verified successfully']);
} else {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid or expired token']);
}
