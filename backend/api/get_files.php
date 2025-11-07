<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/FileModel.php';
require_once __DIR__ . '/../controllers/FileController.php';

use Backend\Controllers\FileController;
use Backend\Config\Database;

header('Content-Type: application/json');

try {
    $db = (new Database())->getConnection();
    $controller = new FileController($db);
    $files = $controller->getFiles();
    echo json_encode(['status' => 'success', 'data' => $files]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
