<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET');
header('Access-Control-Allow-Headers: Content-Type');

use Backend\Config\Database;

require_once __DIR__ . '/../config/Database.php';

try {
    if (!isset($_GET['id'])) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing file ID.'
        ]);
        exit;
    }

    $fileId = intval($_GET['id']);
    $db = Database::connect();

    // Find file info
    $stmt = $db->prepare("SELECT path FROM files WHERE id = :id");
    $stmt->bindParam(':id', $fileId, PDO::PARAM_INT);
    $stmt->execute();
    $file = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$file) {
        echo json_encode([
            'status' => 'error',
            'message' => 'File not found.'
        ]);
        exit;
    }

    $filePath = realpath($file['path']);

    // Delete physical file if it exists
    if ($filePath && file_exists($filePath)) {
        unlink($filePath);
    }

    // Delete from database
    $deleteStmt = $db->prepare("DELETE FROM files WHERE id = :id");
    $deleteStmt->bindParam(':id', $fileId, PDO::PARAM_INT);
    $deleteStmt->execute();

    echo json_encode([
        'status' => 'success',
        'message' => 'File deleted successfully.'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
