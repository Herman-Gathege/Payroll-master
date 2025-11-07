<?php
require_once __DIR__ . '/../services/FileStorageService.php';
use Backend\Services\FileStorageService;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $uploadedBy = $_POST['uploaded_by'] ?? 'Unknown User';
    $fileService = new FileStorageService();
    $result = $fileService->uploadFile($_FILES['file'], $uploadedBy);
    echo json_encode($result);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request method. Use POST.'
    ]);
}
?>
