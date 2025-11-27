<?php
// backend/api/salary_structures.php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-User');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/SalaryStructureController.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/SecurityMiddleware.php';



SecurityMiddleware::handleCORS();
SecurityMiddleware::applySecurityHeaders(); 

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// -----------------------------------------------------------
// AUTH + EXTRACT USER FROM X-USER HEADER
// -----------------------------------------------------------
// --- replace existing AuthMiddleware::validateToken(); + header reading block with:
$auth = authenticateRequest();
if (!$auth['success']) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => $auth['message'] ?? 'Authentication required']);
    exit;
}

$user = $auth['user'];
$org_id = $user['organization_id'];
// $org_id is now safe to use for controller instantiation



// -----------------------------------------------------------
// CONTROLLER INSTANCE
// -----------------------------------------------------------
$database = new Database();
$db = $database->getConnection();
$controller = new SalaryStructureController($db, $org_id);

$method = $_SERVER['REQUEST_METHOD'];

// -----------------------------------------------------------
// CREATE STRUCTURE
// -----------------------------------------------------------
if ($method === 'POST') {
    $payload = json_decode(file_get_contents("php://input"), true);

    try {
        $id = $controller->create($payload);

        if (!empty($payload['allowances'])) {
            $controller->saveAllowances($id, $payload['allowances']);
        }
        if (!empty($payload['benefits'])) {
            $controller->saveBenefits($id, $payload['benefits']);
        }

        echo json_encode([
            'success' => true,
            'message' => 'Structure created',
            'id' => $id
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// -----------------------------------------------------------
// LIST STRUCTURES
// -----------------------------------------------------------
if ($method === 'GET' && !isset($_GET['id'])) {
    $data = $controller->getAll();
    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

// -----------------------------------------------------------
// GET ONE STRUCTURE
// -----------------------------------------------------------
if ($method === 'GET' && isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    $data = $controller->getOne($id);

    if (!$data) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Not found']);
        exit;
    }

    echo json_encode(['success' => true, 'data' => $data]);
    exit;
}

// -----------------------------------------------------------
// UPDATE STRUCTURE
// -----------------------------------------------------------
if ($method === 'PUT') {
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'id is required']);
        exit;
    }

    $payload = json_decode(file_get_contents("php://input"), true);

    try {
        $controller->update($id, $payload);

        if (isset($payload['allowances'])) {
            $controller->saveAllowances($id, $payload['allowances']);
        }

        if (isset($payload['benefits'])) {
            $controller->saveBenefits($id, $payload['benefits']);
        }

        echo json_encode(['success' => true, 'message' => 'Updated']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
