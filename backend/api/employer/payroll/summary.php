<?php
/**
 * Payroll Summary API
 * Provides payroll summary data for dashboard and reports
 * Path: backend/api/employer/payroll/summary.php
 */

require_once '../../../config/database_secure.php';
require_once '../../../middleware/SecurityMiddleware.php';

// Apply security measures
SecurityMiddleware::handleCORS();
SecurityMiddleware::applySecurityHeaders();
SecurityMiddleware::checkRateLimit('payroll_summary', 100, 60);

$database = new Database();
$db = $database->getConnection();

$request_method = $_SERVER["REQUEST_METHOD"];

// Verify authentication
$session = SecurityMiddleware::verifyToken();
$user_id = $session['user_id'];
$user_type = $session['user_type'];

// Only employers can access
if ($user_type !== 'employer') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit();
}

/**
 * GET - Get payroll summary
 */
if ($request_method === 'GET') {
    try {
        // Get employer's organization
        $org_query = "SELECT organization_id FROM employer_users WHERE id = :user_id";
        $org_stmt = $db->prepare($org_query);
        $org_stmt->execute([':user_id' => $user_id]);
        $org_data = $org_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$org_data) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Organization not found']);
            exit();
        }

        $organization_id = $org_data['organization_id'];

        // Get query parameters
        $month = isset($_GET['month']) ? (int)$_GET['month'] : (int)date('n');
        $year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');

        // Validate month and year
        if ($month < 1 || $month > 12) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid month']);
            exit();
        }

        if ($year < 2000 || $year > 2100) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid year']);
            exit();
        }

        // Get employee count
        $emp_count_query = "SELECT COUNT(*) as total_employees
                           FROM employees
                           WHERE organization_id = :org_id
                             AND employment_status = 'active'";
        $emp_count_stmt = $db->prepare($emp_count_query);
        $emp_count_stmt->execute([':org_id' => $organization_id]);
        $emp_count = $emp_count_stmt->fetch(PDO::FETCH_ASSOC)['total_employees'];

        // Get payroll summary from payroll table (if exists)
        $payroll_query = "SELECT
                            COUNT(DISTINCT employee_id) as employees_paid,
                            SUM(gross_salary) as total_gross,
                            SUM(basic_salary) as total_basic,
                            SUM(total_allowances) as total_allowances,
                            SUM(total_deductions) as total_deductions,
                            SUM(net_salary) as total_net,
                            SUM(paye) as total_paye,
                            SUM(nssf_employee) as total_nssf_employee,
                            SUM(nssf_employer) as total_nssf_employer,
                            SUM(nhif) as total_nhif,
                            SUM(housing_levy) as total_housing_levy
                          FROM payroll
                          WHERE organization_id = :org_id
                            AND MONTH(payroll_date) = :month
                            AND YEAR(payroll_date) = :year
                            AND status = 'approved'";

        $payroll_stmt = $db->prepare($payroll_query);
        $payroll_stmt->execute([
            ':org_id' => $organization_id,
            ':month' => $month,
            ':year' => $year
        ]);
        $payroll_data = $payroll_stmt->fetch(PDO::FETCH_ASSOC);

        // If no payroll data, calculate from employee salaries
        if (!$payroll_data['employees_paid']) {
            $salary_query = "SELECT
                               COUNT(*) as employees_paid,
                               SUM(salary) as total_basic,
                               0 as total_allowances,
                               0 as total_deductions,
                               SUM(salary) as total_gross,
                               SUM(salary) as total_net,
                               0 as total_paye,
                               0 as total_nssf_employee,
                               0 as total_nssf_employer,
                               0 as total_nhif,
                               0 as total_housing_levy
                             FROM employees
                             WHERE organization_id = :org_id
                               AND employment_status = 'active'
                               AND date_hired <= LAST_DAY(CONCAT(:year, '-', LPAD(:month, 2, '0'), '-01'))";

            $salary_stmt = $db->prepare($salary_query);
            $salary_stmt->execute([
                ':org_id' => $organization_id,
                ':month' => $month,
                ':year' => $year
            ]);
            $payroll_data = $salary_stmt->fetch(PDO::FETCH_ASSOC);
        }

        // Get department breakdown
        $dept_query = "SELECT
                         d.name as department,
                         COUNT(DISTINCT e.id) as employee_count,
                         SUM(e.salary) as total_salary
                       FROM employees e
                       LEFT JOIN departments d ON e.department_id = d.id
                       WHERE e.organization_id = :org_id
                         AND e.employment_status = 'active'
                       GROUP BY d.id, d.name
                       ORDER BY total_salary DESC";

        $dept_stmt = $db->prepare($dept_query);
        $dept_stmt->execute([':org_id' => $organization_id]);
        $departments = $dept_stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get recent payroll runs
        $recent_query = "SELECT
                           id, payroll_date, status,
                           COUNT(DISTINCT employee_id) as employees,
                           SUM(net_salary) as total_amount,
                           created_at
                         FROM payroll
                         WHERE organization_id = :org_id
                         GROUP BY id, payroll_date, status, created_at
                         ORDER BY payroll_date DESC
                         LIMIT 5";

        $recent_stmt = $db->prepare($recent_query);
        $recent_stmt->execute([':org_id' => $organization_id]);
        $recent_payrolls = $recent_stmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculate summary statistics
        $summary = [
            'period' => [
                'month' => $month,
                'year' => $year,
                'month_name' => date('F', mktime(0, 0, 0, $month, 1, $year))
            ],
            'employees' => [
                'total' => (int)$emp_count,
                'paid' => (int)($payroll_data['employees_paid'] ?? 0)
            ],
            'payroll' => [
                'gross_salary' => (float)($payroll_data['total_gross'] ?? 0),
                'basic_salary' => (float)($payroll_data['total_basic'] ?? 0),
                'allowances' => (float)($payroll_data['total_allowances'] ?? 0),
                'deductions' => (float)($payroll_data['total_deductions'] ?? 0),
                'net_salary' => (float)($payroll_data['total_net'] ?? 0)
            ],
            'statutory' => [
                'paye' => (float)($payroll_data['total_paye'] ?? 0),
                'nssf_employee' => (float)($payroll_data['total_nssf_employee'] ?? 0),
                'nssf_employer' => (float)($payroll_data['total_nssf_employer'] ?? 0),
                'total_nssf' => (float)(($payroll_data['total_nssf_employee'] ?? 0) + ($payroll_data['total_nssf_employer'] ?? 0)),
                'nhif' => (float)($payroll_data['total_nhif'] ?? 0),
                'housing_levy' => (float)($payroll_data['total_housing_levy'] ?? 0)
            ],
            'departments' => $departments,
            'recent_payrolls' => $recent_payrolls
        ];

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $summary
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch payroll summary',
            'error' => Database::getConfig('app.debug') ? $e->getMessage() : 'Database error'
        ]);
    }
}

/**
 * Invalid method
 */
else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
