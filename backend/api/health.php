<?php
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$conn = $database->getConnection();

if ($conn) {
    echo json_encode(['status' => 'ok', 'message' => '✅ Database connected successfully']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => '❌ Database connection failed']);
}
?>
