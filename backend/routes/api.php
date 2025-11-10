<?php
require '../vendor/autoload.php';

use Backend\Controllers\AgentController;
use Backend\Controllers\AdminApprovalController;
use PDO;

header('Content-Type: application/json');

try {
    // Database connection
    $pdo = new PDO('mysql:host=localhost;dbname=payroll_db;charset=utf8', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Controllers
    $agentController = new AgentController($pdo);
    $adminController = new AdminApprovalController($pdo);

    // Get and clean request URI
    $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $requestUri = rtrim($requestUri, '/');

    // --- Agent Routes ---
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $requestUri === '/Payroll-master/backend/api/agents/register') {
        echo json_encode($agentController->register());
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $requestUri === '/Payroll-master/backend/api/agents/login') {
        echo json_encode($agentController->login());
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $requestUri === '/Payroll-master/backend/api/agents/logout') {
        echo json_encode($agentController->logout());
        exit;
    }

    // --- Admin Approval Routes ---
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $requestUri === '/Payroll-master/backend/api/agents/approve') {
        $agentId = $_POST['agent_id'] ?? null;

        if (!$agentId) {
            echo json_encode(['success' => false, 'error' => 'Missing agent_id']);
            exit;
        }

        echo json_encode($adminController->approveAgent($agentId));
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST' && $requestUri === '/Payroll-master/backend/api/agents/reject') {
        $agentId = $_POST['agent_id'] ?? null;
        $reason = $_POST['reason'] ?? 'No reason provided';

        if (!$agentId) {
            echo json_encode(['success' => false, 'error' => 'Missing agent_id']);
            exit;
        }

        echo json_encode($adminController->rejectAgent($agentId, $reason));
        exit;
    }

    // --- Default response for unknown routes ---
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Endpoint not found']);

} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Server Error: ' . $e->getMessage()
    ]);
}
