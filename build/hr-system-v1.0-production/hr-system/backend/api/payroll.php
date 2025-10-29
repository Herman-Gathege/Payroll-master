<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/PayrollController.php';
require_once __DIR__ . '/../utils/PayslipGenerator.php';
require_once __DIR__ . '/../utils/PayrollReportGenerator.php';

$database = new Database();
$db = $database->getConnection();

$payrollController = new PayrollController($db);
$method = $_SERVER['REQUEST_METHOD'];

// Get the request URI
$request_uri = $_SERVER['REQUEST_URI'];
$uri_parts = explode('/', trim($request_uri, '/'));

try {
    switch ($method) {
        case 'GET':
            handleGet($payrollController, $db);
            break;

        case 'POST':
            handlePost($payrollController, $db);
            break;

        case 'PUT':
            handlePut($payrollController);
            break;

        case 'DELETE':
            handleDelete();
            break;

        default:
            http_response_code(405);
            echo json_encode(['message' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

/**
 * Handle GET requests
 */
function handleGet($payrollController, $db) {
    $action = $_GET['action'] ?? '';

    switch ($action) {
        case 'get_payroll':
            // Get payroll for a specific period
            $month = $_GET['month'] ?? date('m');
            $year = $_GET['year'] ?? date('Y');
            $payroll = $payrollController->getPayrollByPeriod($month, $year);

            echo json_encode([
                'success' => true,
                'data' => $payroll
            ]);
            break;

        case 'get_payslip':
            // Get individual payslip
            $employee_id = $_GET['employee_id'] ?? 0;
            $month = $_GET['month'] ?? date('m');
            $year = $_GET['year'] ?? date('Y');

            $payslip = $payrollController->getPayslip($employee_id, $month, $year);

            if ($payslip) {
                echo json_encode([
                    'success' => true,
                    'data' => $payslip
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Payslip not found'
                ]);
            }
            break;

        case 'get_summary':
            // Get payroll summary
            $month = $_GET['month'] ?? date('m');
            $year = $_GET['year'] ?? date('Y');
            $summary = $payrollController->getPayrollSummary($month, $year);

            echo json_encode([
                'success' => true,
                'data' => $summary
            ]);
            break;

        case 'download_payslip':
            // Generate and download payslip
            $employee_id = $_GET['employee_id'] ?? 0;
            $month = $_GET['month'] ?? date('m');
            $year = $_GET['year'] ?? date('Y');

            $payslip = $payrollController->getPayslip($employee_id, $month, $year);

            if ($payslip) {
                $generator = new PayslipGenerator($payslip);
                $html = $generator->generateHTML();

                header('Content-Type: text/html');
                header('Content-Disposition: inline; filename="payslip.html"');
                echo $html;
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Payslip not found'
                ]);
            }
            break;

        case 'generate_report':
            // Generate payroll report
            $report_type = $_GET['report_type'] ?? 'summary';
            $month = $_GET['month'] ?? date('m');
            $year = $_GET['year'] ?? date('Y');

            $reportGenerator = new PayrollReportGenerator($db);

            switch ($report_type) {
                case 'summary':
                    $html = $reportGenerator->generateMonthlySummary($month, $year);
                    break;
                case 'detailed':
                    $html = $reportGenerator->generateDetailedReport($month, $year);
                    break;
                case 'tax':
                    $html = $reportGenerator->generateTaxReport($month, $year);
                    break;
                default:
                    $html = $reportGenerator->generateMonthlySummary($month, $year);
            }

            header('Content-Type: text/html');
            header('Content-Disposition: inline; filename="payroll_report.html"');
            echo $html;
            break;

        default:
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid action'
            ]);
            break;
    }
}

/**
 * Handle POST requests
 */
function handlePost($payrollController, $db) {
    $data = json_decode(file_get_contents("php://input"), true);
    $action = $data['action'] ?? '';

    switch ($action) {
        case 'generate_payroll':
            // Generate payroll for a single employee
            $employee_id = $data['employee_id'] ?? 0;
            $month = $data['month'] ?? date('m');
            $year = $data['year'] ?? date('Y');

            $result = $payrollController->generateEmployeePayroll($employee_id, $month, $year);
            echo json_encode($result);
            break;

        case 'generate_bulk_payroll':
            // Generate payroll for all active employees
            $month = $data['month'] ?? date('m');
            $year = $data['year'] ?? date('Y');

            $result = $payrollController->generateBulkPayroll($month, $year);
            echo json_encode($result);
            break;

        case 'send_payslip':
            // Send payslip via email
            $employee_id = $data['employee_id'] ?? 0;
            $month = $data['month'] ?? date('m');
            $year = $data['year'] ?? date('Y');
            $email = $data['email'] ?? null;

            $payslip = $payrollController->getPayslip($employee_id, $month, $year);

            if ($payslip) {
                $generator = new PayslipGenerator($payslip);
                $result = $generator->sendEmail($email);
                echo json_encode($result);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Payslip not found'
                ]);
            }
            break;

        default:
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid action'
            ]);
            break;
    }
}

/**
 * Handle PUT requests
 */
function handlePut($payrollController) {
    $data = json_decode(file_get_contents("php://input"), true);
    $action = $data['action'] ?? '';

    switch ($action) {
        case 'approve_payroll':
            // Approve payroll
            $payroll_id = $data['payroll_id'] ?? 0;
            $result = $payrollController->approvePayroll($payroll_id);

            echo json_encode([
                'success' => $result,
                'message' => $result ? 'Payroll approved successfully' : 'Failed to approve payroll'
            ]);
            break;

        case 'process_payment':
            // Process payment
            $payroll_id = $data['payroll_id'] ?? 0;
            $payment_method = $data['payment_method'] ?? 'bank_transfer';
            $result = $payrollController->processPayment($payroll_id, $payment_method);

            echo json_encode([
                'success' => $result,
                'message' => $result ? 'Payment processed successfully' : 'Failed to process payment'
            ]);
            break;

        default:
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid action'
            ]);
            break;
    }
}

/**
 * Handle DELETE requests
 */
function handleDelete() {
    http_response_code(501);
    echo json_encode([
        'success' => false,
        'message' => 'Delete not implemented'
    ]);
}
?>
