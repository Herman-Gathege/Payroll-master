<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once '../config/database.php';
require_once '../controllers/EmployeeOnboardingController.php';
require_once '../middleware/auth.php';

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Authenticate user
$auth = authenticateRequest();
if (!$auth['success']) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => $auth['message'] ?? "Authentication required"
    ]);
    exit();
}

$organization_id = $auth['user']['organization_id'] ?? null;
$user_id = $auth['user']['id'] ?? null;

if (!$organization_id) {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "No organization context found for user"
    ]);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$controller = new EmployeeOnboardingController($db, $organization_id, $user_id);

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];
$uri_parts = explode('/', trim(parse_url($request_uri, PHP_URL_PATH), '/'));
$id = null;
$query_params = [];
parse_str(parse_url($request_uri, PHP_URL_QUERY) ?? '', $query_params);
if (is_numeric(end($uri_parts))) {
    $id = end($uri_parts);
}

try {
    switch($method) {
        case 'GET':
            if (isset($query_params['search'])) {
                $controller->searchEmployees($query_params['search']);
            } elseif ($id) {
                $controller->getEmployee($id);
            } else {
                $controller->getAllEmployees();
            }
            break;
        case 'POST':
            $data = json_decode(file_get_contents("php://input"));
            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid JSON: " . json_last_error_msg()
                ]);
                exit();
            }
            $controller->onboardEmployee($data);
            break;
        case 'PUT':
            $data = json_decode(file_get_contents("php://input"));
            if (json_last_error() !== JSON_ERROR_NONE) {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid JSON: " . json_last_error_msg()
                ]);
                exit();
            }
            $controller->updateEmployee($data);
            break;
        case 'DELETE':
            if ($id) {
                $data = (object)['id' => $id, 'employment_status' => 'terminated'];
                $controller->updateEmployee($data);
            } else {
                http_response_code(400);
                echo json_encode([
                    "success" => false,
                    "message" => "Employee ID required"
                ]);
            }
            break;
        default:
            http_response_code(405);
            echo json_encode([
                "success" => false,
                "message" => "Method not allowed"
            ]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error",
        "details" => $e->getMessage()
    ]);
}