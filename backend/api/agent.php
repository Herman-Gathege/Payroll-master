<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/AgentController.php';

// ✅ Handle preflight requests (CORS)
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

        // ------------------------------
        // 🔹 POST — Register, Profile, Document Upload
        // ------------------------------
        case 'POST':
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

        // ------------------------------
        // 🔹 GET — Fetch lists, pending, or single agent
        // ------------------------------
        case 'GET':
            if (isset($_GET['pending'])) {
                $agents = $controller->getPendingVerifications();
                echo json_encode(['success' => true, 'data' => $agents]);

            } elseif (isset($_GET['list'])) {
                $filter = $_GET['filter'] ?? null;
                $agents = $controller->getAllAgents($filter);
                echo json_encode(['success' => true, 'data' => $agents]);

            } elseif (isset($_GET['id'])) {
                $id = intval($_GET['id']);
                $data = $controller->getAgentById($id);
                if ($data) {
                    echo json_encode(['success' => true, 'data' => $data]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Agent not found']);
                }

            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid GET request']);
            }
            break;

        // ------------------------------
        // 🔹 PUT — Verify or Review agent
        // ------------------------------
        case 'PUT':
            $raw = file_get_contents("php://input");
            $data = json_decode($raw, true);

            if (isset($data['action']) && $data['action'] === 'review') {
                // review: admin decision
                $agent_id = intval($data['agent_id'] ?? 0);
                $reviewer_id = intval($data['reviewer_id'] ?? 0);
                $decision = $data['decision'] ?? '';
                $comment = $data['comment'] ?? null;

                $res = $controller->reviewAgent($agent_id, $reviewer_id, $decision, $comment);
                echo json_encode($res);

            } elseif (isset($data['agent_id'], $data['status'])) {
                // fallback: old verify path
                $result = $controller->verifyAgent($data['agent_id'], $data['status']);
                echo json_encode($result);

            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Missing agent_id or status']);
            }
            break;

        // ------------------------------
        // ❌ Default — Invalid HTTP method
        // ------------------------------
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
