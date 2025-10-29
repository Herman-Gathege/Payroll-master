<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['employee_id'])) {
                $employee_id = $_GET['employee_id'];

                // Get leave balance for employee
                // Calculate used leave from leave_requests table
                $query = "SELECT
                          SUM(CASE WHEN leave_type = 'Annual Leave' AND status = 'approved' THEN days ELSE 0 END) as annual_used,
                          SUM(CASE WHEN leave_type = 'Sick Leave' AND status = 'approved' THEN days ELSE 0 END) as sick_used,
                          SUM(CASE WHEN leave_type = 'Maternity Leave' AND status = 'approved' THEN days ELSE 0 END) as maternity_used,
                          SUM(CASE WHEN leave_type = 'Paternity Leave' AND status = 'approved' THEN days ELSE 0 END) as paternity_used
                          FROM leave_requests
                          WHERE employee_id = :employee_id
                          AND YEAR(start_date) = YEAR(CURDATE())";

                $stmt = $db->prepare($query);
                $stmt->bindParam(':employee_id', $employee_id);
                $stmt->execute();
                $usage = $stmt->fetch(PDO::FETCH_ASSOC);

                // Default entitlements (can be customized per employee or fetched from settings)
                $entitlements = [
                    'annual' => 21,
                    'sick' => 14,
                    'maternity' => 90,
                    'paternity' => 14
                ];

                $balance = [
                    'annual' => [
                        'total' => $entitlements['annual'],
                        'used' => (int)($usage['annual_used'] ?? 0),
                        'remaining' => $entitlements['annual'] - (int)($usage['annual_used'] ?? 0)
                    ],
                    'sick' => [
                        'total' => $entitlements['sick'],
                        'used' => (int)($usage['sick_used'] ?? 0),
                        'remaining' => $entitlements['sick'] - (int)($usage['sick_used'] ?? 0)
                    ],
                    'maternity' => [
                        'total' => $entitlements['maternity'],
                        'used' => (int)($usage['maternity_used'] ?? 0),
                        'remaining' => $entitlements['maternity'] - (int)($usage['maternity_used'] ?? 0)
                    ],
                    'paternity' => [
                        'total' => $entitlements['paternity'],
                        'used' => (int)($usage['paternity_used'] ?? 0),
                        'remaining' => $entitlements['paternity'] - (int)($usage['paternity_used'] ?? 0)
                    ]
                ];

                echo json_encode([
                    'success' => true,
                    'balance' => $balance
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Employee ID is required'
                ]);
            }
            break;

        default:
            echo json_encode([
                'success' => false,
                'message' => 'Method not allowed'
            ]);
            break;
    }
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
