<?php
/**
 * backend/api/payroll.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/SecurityMiddleware.php';

// === EXACT SAME SECURITY SETUP AS employee/profile.php ===
SecurityMiddleware::handleCORS();
SecurityMiddleware::applySecurityHeaders();
SecurityMiddleware::checkRateLimit('payroll', 200, 60);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db = (new Database())->getConnection();

try {
    $session = SecurityMiddleware::verifyToken();
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit();
}

$user_id     = $session['user_id'] ?? null;
$user_type   = $session['user_type'] ?? null;
$employee_id = $session['employee_id'] ?? null;  // This is already set correctly by verifyToken() for employees

/* ========================================
   NEW: MY PAYSLIPS (Employee Self-Service)
   ======================================== */
if (isset($_GET['action']) && $_GET['action'] === 'my_payslips') {
    if ($user_type !== 'employee' || !$employee_id) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied']);
        exit();
    }

    $stmt = $db->prepare("
        SELECT 
            p.id,
            p.period_month,
            p.period_year,
            p.gross_pay,
            p.total_deductions,
            p.net_pay,
            p.status,
            e.employee_no,
            e.first_name,
            e.last_name
        FROM payroll p
        JOIN employees e ON p.employee_id = e.id
        WHERE p.employee_id = ? 
          AND p.status IN ('finalized', 'paid')
        ORDER BY p.period_year DESC, p.period_month DESC
    ");
    $stmt->execute([$employee_id]);
    $payslips = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data'    => $payslips
    ]);
    exit();
}



require_once __DIR__ . '/../controllers/PayrollController.php';
require_once __DIR__ . '/../utils/PayslipGenerator.php';
require_once __DIR__ . '/../utils/PayrollReportGenerator.php';

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

            echo json_encode($payroll);

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

            echo json_encode($summary);

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
            require_once __DIR__ . '/../utils/EmailService.php';

            $employee_id = $data['employee_id'] ?? 0;
            $month = $data['month'] ?? date('m');
            $year = $data['year'] ?? date('Y');

            // Load payslip
            $payslip = $payrollController->getPayslip($employee_id, $month, $year);
            if (!$payslip) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Payslip not found'
                ]);
                break;
            }

            // Load employee email + details
            $query = "SELECT e.work_email, e.personal_email,
                        CONCAT(e.first_name, ' ', e.last_name) as full_name,
                        o.organization_name
                      FROM employees e
                      JOIN organizations o ON e.organization_id = o.id
                      WHERE e.id = :employee_id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':employee_id', $employee_id);
            $stmt->execute();
            $employee = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$employee) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Employee not found'
                ]);
                break;
            }

            // Select best email
            $to_email = $employee['work_email'] ?: $employee['personal_email'];
            if (!$to_email) {
                echo json_encode([
                    'success' => false,
                    'message' => 'No email address found for employee'
                ]);
                break;
            }

            // Prepare payslip summary for email
            $payroll_data = [
                'period' => date('F Y', mktime(0, 0, 0, $month, 1, $year)),
                'gross_pay' => $payslip['gross_pay'],
                'total_deductions' => $payslip['total_deductions'],
                'net_pay' => $payslip['net_pay']
            ];

            // Send email
            try {
                $emailService = new EmailService();
                $result = $emailService->sendPayslip($to_email, $employee['full_name'], $payroll_data);

                if ($result['success']) {
                    // Log email in audit log
                    $audit_query = "INSERT INTO audit_log (
                        user_id, user_type, action, table_name, record_id,
                        new_values, ip_address, user_agent
                    ) VALUES (
                        :user_id, 'system', 'payslip_emailed', 'payroll_records', :record_id,
                        :new_values, :ip_address, :user_agent
                    )";

                    $audit_stmt = $db->prepare($audit_query);
                    $audit_stmt->execute([
                        ':user_id' => 0,
                        ':record_id' => $payslip['id'],
                        ':new_values' => json_encode([
                            'employee_id' => $employee_id,
                            'email' => $to_email,
                            'period' => $payroll_data['period']
                        ]),
                        ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                        ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
                    ]);
                }

                echo json_encode($result);

            } catch (Exception $e) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to send email: ' . $e->getMessage()
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