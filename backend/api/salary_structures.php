<?php
// backend/api/salary_structures.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/SalaryStructureController.php';
require_once __DIR__ . '/../middleware/auth.php'; // authenticateRequest()

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$database = new Database();
$db = $database->getConnection();
$controller = new SalaryStructureController($db);

// authenticate
$auth = authenticateRequest();
if (!$auth['success']) {
    http_response_code(401);
    echo json_encode(['success'=>false, 'message' => $auth['message'] ?? 'Authentication required']);
    exit;
}
$user = $auth['user'];
$org_id = $user['organization_id'];
$user_id = $user['id'];

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];
$parts = explode('/', trim(parse_url($uri, PHP_URL_PATH), '/'));
$query = [];
parse_str(parse_url($uri, PHP_URL_QUERY) ?? '', $query);

// routing:
if ($method === 'POST') {
    // create structure
    $payload = json_decode(file_get_contents("php://input"), true);
    $controller->createStructure($org_id, $user_id, $payload);
    exit;
}

if ($method === 'GET') {
    // GET /api/salary_structures.php?id= or /api/salary_structures.php?action=list
    if (!empty($_GET['id'])) {
        $controller->getStructure((int)$_GET['id'], $org_id);
        exit;
    }
    // list
    $controller->listStructures($org_id);
    exit;
}

if ($method === 'PUT') {
    // Update: expects id in query
    $payload = json_decode(file_get_contents("php://input"), true);
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'id query param required']);
        exit;
    }
    $controller->updateStructure((int)$id, $org_id, $user_id, $payload);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
