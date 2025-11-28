<?php
// backend/api/calculate_payroll.php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-User');

require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/SecurityMiddleware.php';
require_once __DIR__ . '/../utils/CalculationService.php';

SecurityMiddleware::handleCORS();
SecurityMiddleware::applySecurityHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$auth = authenticateRequest();
if (!$auth['success']) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);

$gross = $payload['gross'] ?? null;
$basic = $payload['basic'] ?? null;
$allowances = $payload['allowances'] ?? [];
$benefits   = $payload['benefits'] ?? [];

try {
    if ($gross) {
        $result = CalculationService::calculateFromGross($gross);
    } else {
        if ($basic === null) {
            throw new Exception("Either gross or {basic, allowances, benefits} must be provided");
        }
        $result = CalculationService::calculate($basic, $allowances, $benefits);
    }

    echo json_encode(['success' => true, 'data' => $result]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
