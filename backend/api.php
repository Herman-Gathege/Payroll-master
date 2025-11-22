<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config/database.php';

spl_autoload_register(function ($class) {
    $file = __DIR__ . '/' . str_replace('\\', '/', $class) . '.php';
    if (file_exists($file)) require_once $file;
});

try {
    $pdo = new PDO(DB_DSN, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$employeeCtrl = new Backend\Controllers\EmployeeController($pdo);
$attendanceCtrl = new Backend\Controllers\AttendanceController($pdo);
$departmentCtrl = new Backend\Controllers\DepartmentController($pdo);
$positionCtrl = new Backend\Controllers\PositionController($pdo);
$payrollCtrl = new Backend\Controllers\PayrollController($pdo);

$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestUri = rtrim($requestUri, '/');
$segments = explode('/', $requestUri);

try {
    if ($segments[1] === 'api') {
        switch ($segments[2] ?? '') {
            case 'employees':
                if ($requestMethod === 'GET') {
                    if (isset($segments[3])) $employeeCtrl->getOne(intval($segments[3]));
                    else $employeeCtrl->getAll();
                } elseif ($requestMethod === 'POST') {
                    $employeeCtrl->create(json_decode(file_get_contents('php://input'), true));
                } elseif ($requestMethod === 'PUT' && isset($segments[3])) {
                    $employeeCtrl->update(intval($segments[3]), json_decode(file_get_contents('php://input'), true));
                } elseif ($requestMethod === 'DELETE' && isset($segments[3])) {
                    $employeeCtrl->delete(intval($segments[3]));
                } else {
                    http_response_code(405);
                    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
                }
                break;

            case 'departments':
                if ($requestMethod === 'GET') {
                    if (isset($segments[3])) $departmentCtrl->getOne(intval($segments[3]));
                    else $departmentCtrl->getAll();
                }
                break;

            case 'positions':
                if ($requestMethod === 'GET') {
                    if (isset($segments[3]) && $segments[3] === 'department' && isset($segments[4])) $positionCtrl->getByDepartment(intval($segments[4]));
                    else $positionCtrl->getAll();
                }
                break;

            case 'payroll':
                if ($requestMethod === 'POST' && ($segments[3] ?? '') === 'generate') {
                    $input = json_decode(file_get_contents('php://input'), true);
                    if (!empty($input['employee_id'])) $payrollCtrl->generateEmployeePayroll($input['employee_id'], $input['month'], $input['year']);
                    else $payrollCtrl->generateBulkPayroll($input['month'], $input['year']);
                } elseif ($requestMethod === 'GET' && isset($segments[3]) && isset($segments[4])) {
                    $payrollCtrl->getPayrollByPeriod(intval($segments[3]), intval($segments[4]));
                } elseif ($requestMethod === 'GET' && isset($segments[3])) {
                    $payrollCtrl->getPayslip(intval($segments[3]), intval($_GET['month']), intval($_GET['year']));
                } elseif ($requestMethod === 'POST' && isset($segments[3]) && ($segments[4] ?? '') === 'approve') {
                    $payrollCtrl->approvePayroll(intval($segments[3]));
                } elseif ($requestMethod === 'POST' && isset($segments[3]) && ($segments[4] ?? '') === 'pay') {
                    $input = json_decode(file_get_contents('php://input'), true);
                    $method = $input['method'] ?? 'bank_transfer';
                    $payrollCtrl->processPayment(intval($segments[3]), $method);
                } elseif ($requestMethod === 'GET' && isset($segments[3]) && ($segments[4] ?? '') === 'summary') {
                    $payrollCtrl->getPayrollSummary(intval($segments[3]), intval($segments[5] ?? 0));
                }
                break;

            default:
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Endpoint not found']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'API base path not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
