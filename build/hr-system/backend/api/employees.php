<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../controllers/EmployeeController.php';
require_once '../middleware/auth.php';

// Validate authentication for all requests except OPTIONS
// Comment out for development, uncomment for production
// AuthMiddleware::validateToken();

$database = new Database();
$db = $database->getConnection();

$controller = new EmployeeController($db);

$request_method = $_SERVER["REQUEST_METHOD"];

switch($request_method) {
    case 'GET':
        if(!empty($_GET["id"])) {
            $id = intval($_GET["id"]);
            $controller->getEmployee($id);
        } elseif(!empty($_GET["search"])) {
            $keywords = $_GET["search"];
            $controller->searchEmployees($keywords);
        } else {
            $controller->getAllEmployees();
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        $controller->createEmployee($data);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"));
        $controller->updateEmployee($data);
        break;

    case 'DELETE':
        $id = intval($_GET["id"]);
        $controller->deleteEmployee($id);
        break;

    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}
?>
