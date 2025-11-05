<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/AgentController.php';

// Handle preflight requests for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$database = new Database();
$db = $database->getConnection();
$controller = new AgentController($db);

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {

        case 'POST':
            // Detect multipart vs JSON
            $isMultipart = isset($_FILES['file']);
            $data = $isMultipart ? $_POST : json_decode(file_get_contents("php://input"), true);
            $action = $data['action'] ?? '';

            switch ($action) {
                case 'register':
                    $result = $controller->registerAgent($data);
                    echo json_encode($result);
                    break;

                case 'complete_profile':
                    if (!isset($data['agent_id'])) {
                        throw new Exception("Agent ID required");
                    }
                    $result = $controller->completeProfile($data['agent_id'], $data);
                    echo json_encode($result);
                    break;

                case 'upload_document':
                    // Handle FormData (multipart/form-data)
                    if (!isset($_POST['agent_id'], $_POST['doc_type'], $_FILES['file'])) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Missing file upload parameters']);
                        exit;
                    }

                    $agent_id = $_POST['agent_id'];
                    $doc_type = $_POST['doc_type'];
                    $file = $_FILES['file'];

                    $result = $controller->uploadDocument($agent_id, $doc_type, $file);
                    echo json_encode($result);
                    break;


                default:
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Invalid POST action']);
                    break;
            }
            break;

        case 'GET':
            if (isset($_GET['pending'])) {
                $agents = $controller->getPendingVerifications();
                echo json_encode(['success' => true, 'data' => $agents]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid GET request']);
            }
            break;

        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);
            if (isset($data['agent_id'], $data['status'])) {
                $result = $controller->verifyAgent($data['agent_id'], $data['status']);
                echo json_encode($result);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Missing agent_id or status']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server Error: ' . $e->getMessage()
    ]);
}
?>
