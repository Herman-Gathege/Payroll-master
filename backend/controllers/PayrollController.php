<?php

/**
 * backend/controllers/PayrollController.php
 */

require_once __DIR__ . '/../models/Payroll.php';
require_once __DIR__ . '/../utils/CalculationService.php';
require_once __DIR__ . '/../config/payroll_config.php';

class PayrollController {
    private $db;
    private $payroll;
    private $organization_id;

    public function __construct($db, $session) {
        $this->db = $db;
        $this->payroll = new Payroll($db);
        $this->organization_id = $session['organization_id'] ?? null;

        if (!$this->organization_id) {
            throw new Exception('Organization context is missing in PayrollController');
        }
    }

    /**
     * Generate payroll for a specific employee and period
     */
    public function generateEmployeePayroll($employee_id, $month, $year) {
        try {
            /* -----------------------------------------------------
                1. Load Employee Salary Structure
            ----------------------------------------------------- */
            $salary = $this->getStructureForEmployee($employee_id);
            if (!$salary) {
                return ['success' => false, 'message' => 'No active salary structure found'];
            }

            /* -----------------------------------------------------
                2. Attendance: overtime + absent days
            ----------------------------------------------------- */
            $attendance = $this->getAttendanceData($employee_id, $month, $year);

            /* -----------------------------------------------------
                3. Earnings (basic + allowances + overtime - absences)
            ----------------------------------------------------- */
            $earnings = $this->calculateEarnings($salary, $attendance);

            /* -----------------------------------------------------
                4. Statutory Deductions (NEW DAY 2 ENGINE)
            ----------------------------------------------------- */
            $calc = CalculationService::calculateFromGross($earnings['gross_pay']);

            

            // Use net_pay consistently — match the database column
            $deductions = [
                'paye'              => $calc['paye'],
                'nssf_employee'     => $calc['nssf_employee'],
                // 'nssf_employer'     => $calc['nssf_employer'], // reporting only
                'shif'              => $calc['shif'],
                'housing_levy'      => $calc['housing_levy'],
                'personal_relief'   => $calc['personal_relief'],
                'total_deductions'  => $calc['total_deductions'],
                'net_pay'           => $calc['net_salary']   // ← USE net_pay HERE
            ];

            $payroll_data = array_merge($earnings, $deductions, [
                'employee_id'  => $employee_id,
                'period_month' => $month,
                'period_year'  => $year
                // no need to add net_pay again — it's already in $deductions
            ]);

            $payroll_id = $this->savePayroll($payroll_data);

            return [
                'success' => true,
                'message' => 'Payroll generated successfully',
                'payroll_id' => $payroll_id,
                'data' => $payroll_data
            ];

        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Generate payroll for all employees
     */
    public function generateBulkPayroll($month, $year) {
    try {
        $org_id = $this->organization_id;


        $stmt = $this->db->prepare("
            SELECT id 
            FROM employees 
            WHERE organization_id = :org_id 
              AND employment_status = 'Active'
        ");
        $stmt->execute([':org_id' => $org_id]);
        $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($employees)) {
            return [
                'success' => true,
                'message' => 'No active employees found',
                'results' => []
            ];
        }

        $results = [];
        foreach ($employees as $e) {
            $res = $this->generateEmployeePayroll($e['id'], $month, $year);
            $results[] = [
                'employee_id' => $e['id'],
                'status' => $res['success'] ? 'success' : 'failed',
                'message' => $res['message'] ?? 'Unknown error'
            ];
        }

        return [
            'success' => true,
            'message' => 'Bulk payroll generated successfully',
            'generated_count' => count($results),
            'results' => $results
        ];

    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ];
    }
}

    /**
     * Compute employee earnings from structure + attendance
     */
    // private function calculateEarnings($structure, $attendance) {

   

    private function calculateEarnings($structure, $attendance) {
    $basic = floatval($structure['basic_salary']);

    // Sum allowances
    $allowances_total = 0;
    foreach ($structure['allowances'] as $al) {
        $allowances_total += floatval($al['amount']);
    }

    // Benefits are part of gross — no need to store separately
    $benefits_total = 0;
    foreach ($structure['benefits'] as $b) {
        $benefits_total += floatval($b['amount']);
    }

    $overtime_hours = floatval($attendance['overtime_hours'] ?? 0);
    $hourly_rate = $basic / 160;
    $overtime_pay_amount = $overtime_hours * $hourly_rate * 1.5;

    $abs_days = intval($attendance['absent_days'] ?? 0);
    $daily_rate = $basic / 22;
    $absence_deduction = $abs_days * $daily_rate;

    $gross = $basic + $allowances_total + $benefits_total + $overtime_pay_amount - $absence_deduction;

    return [
        'basic_salary'       => $basic,
        'total_allowances'   => round($allowances_total, 2),
        'overtime_hours'     => $overtime_hours,
        // REMOVED: 'overtime_pay' — not in payroll table
        'absent_days'        => $abs_days,
        'absence_deduction'  => round($absence_deduction, 2),
        'gross_pay'          => round($gross, 2)
    ];
}

    /**
     * Attendance aggregation
     */
    private function getAttendanceData($employee_id, $month, $year) {
        $stmt = $this->db->prepare("
            SELECT
                SUM(overtime_hours) AS overtime_hours,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent_days
            FROM attendance
            WHERE employee_id = ?
            AND MONTH(attendance_date) = ?
            AND YEAR(attendance_date) = ?
        ");
        $stmt->execute([$employee_id, $month, $year]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: ['overtime_hours' => 0, 'absent_days' => 0];
    }

    /**
     * Save payroll record
     */
    private function savePayroll($data) {
    $sql = "INSERT INTO payroll
            (employee_id, organization_id, period_month, period_year, basic_salary,
            total_allowances,
            overtime_hours, absent_days, absence_deduction,
            gross_pay, paye, nssf_employee, shif, housing_levy,
            personal_relief, total_deductions, net_pay, status, created_at)
            VALUES
            (:employee_id, :organization_id, :period_month, :period_year, :basic_salary,
            :total_allowances,
            :overtime_hours, :absent_days, :absence_deduction,
            :gross_pay, :paye, :nssf_employee, :shif, :housing_levy,
            :personal_relief, :total_deductions, :net_pay,
            'draft', NOW())
            ON DUPLICATE KEY UPDATE
            basic_salary = VALUES(basic_salary),
            total_allowances = VALUES(total_allowances),
            overtime_hours = VALUES(overtime_hours),
            absent_days = VALUES(absent_days),
            absence_deduction = VALUES(absence_deduction),
            gross_pay = VALUES(gross_pay),
            paye = VALUES(paye),
            nssf_employee = VALUES(nssf_employee),
            shif = VALUES(shif),
            housing_levy = VALUES(housing_levy),
            personal_relief = VALUES(personal_relief),
            total_deductions = VALUES(total_deductions),
            net_pay = VALUES(net_pay),
            updated_at = NOW()";

    $stmt = $this->db->prepare($sql);
    $data['organization_id'] = $this->organization_id;
    $stmt->execute($data);

    return $this->db->lastInsertId();
}

    /**
     * Load employee’s active salary structure and allowances/benefits
     */
    public function getStructureForEmployee($employee_id) {
        $stmt = $this->db->prepare("
            SELECT s.* 
            FROM employee_salary_structure es 
            JOIN salary_structures s ON s.id = es.structure_id 
            WHERE es.employee_id = ? AND es.is_active = 1 
            LIMIT 1
        ");
        $stmt->execute([$employee_id]);
        $structure = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$structure) return null;

        $sid = $structure['id'];

        // Allowances
        $al = $this->db->prepare("SELECT * FROM salary_structure_allowances WHERE structure_id = :sid");
        $al->execute([':sid' => $sid]);
        $structure['allowances'] = $al->fetchAll(PDO::FETCH_ASSOC);

        // Benefits
        $bt = $this->db->prepare("SELECT * FROM salary_structure_benefits WHERE structure_id = :sid");
        $bt->execute([':sid' => $sid]);
        $structure['benefits'] = $bt->fetchAll(PDO::FETCH_ASSOC);

        return $structure;
    }

    public function getPayrollByPeriod($month, $year) {
    $stmt = $this->db->prepare("
        SELECT 
            p.*,
            e.employee_no,
            e.first_name,
            e.middle_name,
            e.last_name,
            e.id_number AS national_id
        FROM payroll p
        JOIN employees e ON e.id = p.employee_id
        WHERE p.period_month = ?
          AND p.period_year = ?
          AND p.organization_id = ?
          AND e.organization_id = ?

        ORDER BY e.first_name ASC
    ");

    $stmt->execute([$month, $year, $this->organization_id, $this->organization_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return [
        'success' => true,
        'data' => $rows
    ];
}


public function getPayslip($employee_id, $month, $year)
{
    $sql = "
        SELECT 
            p.*,
            e.first_name,
            e.last_name,
            e.employee_no,
            e.work_email,
            e.personal_email,

            COALESCE(d.name, 'N/A')      AS department_name,
            COALESCE(pos.title, 'N/A')   AS position_title

        FROM payroll p
        JOIN employees e ON e.id = p.employee_id
        LEFT JOIN departments d   ON e.department_id = d.id
        LEFT JOIN positions pos   ON e.position_id   = pos.id

        WHERE p.employee_id = :employee_id
          AND p.period_month = :month
          AND p.period_year  = :year
          AND e.organization_id = :org_id
          AND p.organization_id = :org_id

        LIMIT 1
    ";

    $stmt = $this->db->prepare($sql);
    $stmt->execute([
        ':employee_id' => $employee_id,
        ':month'       => $month,
        ':year'        => $year,
        ':org_id'      => $this->organization_id
    ]);

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        return null;
    }

    // THIS LINE WAS BROKEN BEFORE → NOW FIXED
    $fullName = trim($row['first_name'] . ' ' . ($row['last_name'] ?? ''));

    return [
        'employee_name'        => $fullName,
        'employee_number'      => $row['employee_no'],
        'department'           => $row['department_name'],
        'position'             => $row['position_title'],

        'period_month'         => (int)$row['period_month'],
        'period_year'          => (int)$row['period_year'],

        'basic_salary'         => (float)$row['basic_salary'],
        'housing_allowance'    => (float)$row['housing_allowance'],
        'transport_allowance'  => (float)$row['transport_allowance'],
        'medical_allowance'    => (float)$row['medical_allowance'],

        'gross_pay'            => (float)$row['gross_pay'],
        'paye'                 => (float)$row['paye'],
        'nssf_employee'        => (float)$row['nssf_employee'],
        'shif'                 => (float)$row['shif'],
        'housing_levy'         => (float)$row['housing_levy'],
        'personal_relief'      => (float)$row['personal_relief'],
        'total_deductions'     => (float)$row['total_deductions'],
        'net_pay'              => (float)$row['net_pay'],

        'overtime_pay'         => (float)$row['overtime_pay'],
        'overtime_hours'       => (float)$row['overtime_hours'],
        'absence_deduction'    => (float)$row['absence_deduction'],
        'absent_days'          => (int)$row['absent_days'],
    ];
}


public function getPayrollSummary($month, $year)
{
    $sql = "
        SELECT 
            COUNT(*) AS employee_count,
            SUM(gross_pay) AS total_gross,
            SUM(total_deductions) AS total_deductions,
            SUM(net_pay) AS total_net
        FROM payroll
        WHERE period_month = :month
        AND period_year = :year
        AND organization_id = :org_id
    ";

    $stmt = $this->db->prepare($sql);
    $stmt->execute([
        ':month' => $month,
        ':year' => $year,
        ':org_id' => $this->organization_id
    ]);

    $summary = $stmt->fetch(PDO::FETCH_ASSOC);

    return [
        'success' => true,
        'summary' => [
            'employee_count'    => intval($summary['employee_count']),
            'total_gross'       => floatval($summary['total_gross']),
            'total_deductions'  => floatval($summary['total_deductions']),
            'total_net'         => floatval($summary['total_net'])
        ]
    ];
}


/**
 * Get detailed payroll by ID
 */
public function getPayrollById($payroll_id)
{
    /* -------------------------------------------------------
       1. Load payroll record
    ------------------------------------------------------- */
    $sql = "
        SELECT 
            p.*,
            e.first_name,
            e.last_name,
            e.employee_no,
            e.work_email,
            e.personal_email,

            COALESCE(d.name, 'N/A')      AS department_name,
            COALESCE(pos.title, 'N/A')   AS position_name,

            es.structure_id

        FROM payroll p
        JOIN employees e ON e.id = p.employee_id
        LEFT JOIN departments d   ON e.department_id = d.id
        LEFT JOIN positions pos   ON e.position_id   = pos.id
        LEFT JOIN employee_salary_structure es ON es.employee_id = e.id AND es.is_active = 1

        WHERE p.id = :pid
        AND p.organization_id = :org_id
        LIMIT 1
    ";

    $stmt = $this->db->prepare($sql);
    $stmt->execute([':pid' => $payroll_id, ':org_id' => $this->organization_id]);
    $p = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$p) {
        return null;
    }

    /* -------------------------------------------------------
       2. Load salary structure allowances + benefits + currency
    ------------------------------------------------------- */
    $structure_id = $p['structure_id'];

    // Load structure
    $s = $this->db->prepare("SELECT currency FROM salary_structures WHERE id = :sid LIMIT 1");
    $s->execute([':sid' => $structure_id]);
    $structure = $s->fetch(PDO::FETCH_ASSOC);

    $currency = $structure['currency'] ?? 'KES'; // fallback

    // Allowances
    $al = $this->db->prepare("
        SELECT id, name, amount, taxable 
        FROM salary_structure_allowances 
        WHERE structure_id = :sid
    ");
    $al->execute([':sid' => $structure_id]);
    $allowances = $al->fetchAll(PDO::FETCH_ASSOC);

    // Benefits
    $bt = $this->db->prepare("
        SELECT id, name, amount, benefit_type, taxable 
        FROM salary_structure_benefits 
        WHERE structure_id = :sid
    ");
    $bt->execute([':sid' => $structure_id]);
    $benefits = $bt->fetchAll(PDO::FETCH_ASSOC);

    /* -------------------------------------------------------
       3. Build unified payslip object (matches your React)
    ------------------------------------------------------- */
    $fullName = trim($p['first_name'] . ' ' . $p['last_name']);

    return [
        'id'                => (int)$p['id'],
        'month'             => (int)$p['period_month'],
        'year'              => (int)$p['period_year'],

        'employee_name'     => $fullName,
        'employee_no'       => $p['employee_no'],
        'department_name'   => $p['department_name'],
        'position_name'     => $p['position_name'],
        'status'            => $p['status'],

        'currency'          => $currency,

        'basic_salary'      => (float)$p['basic_salary'],
        'gross_pay'         => (float)$p['gross_pay'],
        'taxable_income'    => (float)($p['taxable_income'] ?? 0),
        'paye'              => (float)$p['paye'],
        'nssf_employee'     => (float)$p['nssf_employee'],
        'nssf_employer'     => (float)($p['nssf_employer'] ?? 0), // optional
        'shif'              => (float)$p['shif'],
        'housing_levy'      => (float)$p['housing_levy'],
        'personal_relief'   => (float)$p['personal_relief'],
        'total_deductions'  => (float)$p['total_deductions'],
        'net_pay'           => (float)$p['net_pay'],

        'overtime_hours'    => (float)$p['overtime_hours'],
        'absence_deduction' => (float)$p['absence_deduction'],

        'allowances'        => $allowances,
        'benefits'          => $benefits
    ];

}


    /**
     * approve payroll
     */
public function approvePayroll($payroll_id) {
    try {
        $stmt = $this->db->prepare("
            UPDATE payroll 
            SET status = 'finalized'
            WHERE id = ? AND status = 'draft'
            AND organization_id = ?
        ");
        $stmt->execute([$payroll_id, $this->organization_id]);

        return $stmt->rowCount() > 0;
    } catch (Exception $e) {
        error_log("Approve payroll error: " . $e->getMessage());
        return false;
    }
}

/**
 * Mark payroll as paid
 */
public function processPayment($payroll_id, $payment_method = 'bank_transfer')
{
    try {
        // Prevent double payment
        $stmt = $this->db->prepare("
            SELECT status 
            FROM payroll 
            WHERE id = :id
        ");
        $stmt->execute([':id' => $payroll_id]);
        $status = $stmt->fetchColumn();

        if (!$status) {
            return false;
        }

        if ($status === 'paid') {
            return false; // already paid
        }

        // Update payroll record
        $stmt = $this->db->prepare("
            UPDATE payroll
            SET status = 'paid',
                payment_method = :method,
                payment_date = NOW(),
                updated_at = NOW()
            WHERE id = :id
        ");

        return $stmt->execute([
            ':method' => $payment_method,
            ':id'     => $payroll_id
        ]);

    } catch (Exception $e) {
        error_log('processPayment error: ' . $e->getMessage());
        return false;
    }
}


}
?>
