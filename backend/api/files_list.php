<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../config/Database.php';

use Backend\Config\Database;

try {
    // Connect to DB
    $db = Database::connect();

    // Query all uploaded files
    $stmt = $db->prepare("SELECT id, filename, path, type, uploaded_by, created_at FROM files ORDER BY created_at DESC");
    $stmt->execute();
    $files = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Respond with list
    echo json_encode([
        "status" => "success",
        "count" => count($files),
        "files" => $files
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to fetch files: " . $e->getMessage()
    ]);
}
?>
