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

    public function __construct($db) {
        $this->db = $db;
        $this->payroll = new Payroll($db);
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

            $deductions = [
                'paye'              => $calc['paye'],
                'nssf_employee'     => $calc['nssf_employee'],
                'nssf_employer'     => $calc['nssf_employer'], // kept for reporting
                'shif'              => $calc['shif'],
                'housing_levy'      => $calc['housing_levy'],
                'personal_relief'   => $calc['personal_relief'],
                'total_deductions'  => $calc['total_deductions'],
                'net_salary'        => $calc['net_salary']
            ];

            $net_pay = $calc['net_salary'];

            /* -----------------------------------------------------
                5. Save payroll to DB
            ----------------------------------------------------- */
            $payroll_data = array_merge($earnings, $deductions, [
                'employee_id'   => $employee_id,
                'period_month'  => $month,
                'period_year'   => $year,
                'net_pay'       => $net_pay
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
            $stmt = $this->db->prepare("SELECT id FROM employees WHERE status = 'active'");
            $stmt->execute();
            $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $results = [];
            foreach ($employees as $e) {
                $res = $this->generateEmployeePayroll($e['id'], $month, $year);
                $results[] = [
                    'employee_id' => $e['id'],
                    'status' => $res['success'] ? 'success' : 'failed',
                    'message' => $res['message']
                ];
            }

            return [
                'success' => true,
                'message' => 'Bulk payroll generation completed',
                'results' => $results
            ];
        } catch (Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Compute employee earnings from structure + attendance
     */
    private function calculateEarnings($structure, $attendance) {

        $basic = floatval($structure['basic_salary']);

        /* -----------------------------------------------------
            Sum allowances & benefits from structure
        ----------------------------------------------------- */
        $allowances_total = 0;
        foreach ($structure['allowances'] as $al) {
            $allowances_total += floatval($al['amount']);
        }

        $benefits_total = 0;
        foreach ($structure['benefits'] as $b) {
            $benefits_total += floatval($b['amount']);
        }

        /* -----------------------------------------------------
            Overtime
        ----------------------------------------------------- */
        $overtime_hours = floatval($attendance['overtime_hours'] ?? 0);
        $hourly_rate = $basic / 160; // 160 hrs per month
        $overtime_pay = $overtime_hours * $hourly_rate * 1.5;

        /* -----------------------------------------------------
            Absence deduction
        ----------------------------------------------------- */
        $abs_days = intval($attendance['absent_days'] ?? 0);
        $daily_rate = $basic / 22;
        $absence_deduction = $abs_days * $daily_rate;

        /* -----------------------------------------------------
            Gross Pay
        ----------------------------------------------------- */
        $gross = $basic + $allowances_total + $benefits_total + $overtime_pay - $absence_deduction;

        return [
            'basic_salary' => $basic,
            'total_allowances' => $allowances_total,
            'total_benefits' => $benefits_total,

            'overtime_hours' => $overtime_hours,
            'overtime_pay' => round($overtime_pay, 2),

            'absent_days' => $abs_days,
            'absence_deduction' => round($absence_deduction, 2),

            'gross_pay' => round($gross, 2)
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
                (employee_id, period_month, period_year, basic_salary,
                 housing_allowance, transport_allowance, medical_allowance,
                 overtime_hours, overtime_pay, absent_days, absence_deduction,
                 gross_pay, paye, nssf_employee, shif, housing_levy,
                 personal_relief, total_deductions, net_pay, status, created_at)
                VALUES
                (:employee_id, :period_month, :period_year, :basic_salary,
                 :total_allowances, 0, 0,
                 :overtime_hours, :overtime_pay, :absent_days, :absence_deduction,
                 :gross_pay, :paye, :nssf_employee, :shif, :housing_levy,
                 :personal_relief, :total_deductions, :net_salary,
                 'draft', NOW())
                ON DUPLICATE KEY UPDATE
                 basic_salary = VALUES(basic_salary),
                 gross_pay = VALUES(gross_pay),
                 paye = VALUES(paye),
                 nssf_employee = VALUES(nssf_employee),
                 shif = VALUES(shif),
                 housing_levy = VALUES(housing_levy),
                 personal_relief = VALUES(personal_relief),
                 total_deductions = VALUES(total_deductions),
                 net_pay = VALUES(net_salary),
                 updated_at = NOW()";

        $stmt = $this->db->prepare($sql);
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
            e.first_name, 
            e.last_name, 
            e.id_number AS national_id
        FROM payroll p
        JOIN employees e ON e.id = p.employee_id
        WHERE p.period_month = ?
        AND p.period_year = ?
        ORDER BY e.first_name ASC
    ");
    
    $stmt->execute([$month, $year]);
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
            e.id_number AS national_id,
            e.work_email,
            e.personal_email
        FROM payroll p
        JOIN employees e ON e.id = p.employee_id
        WHERE p.employee_id = :employee_id
        AND p.period_month = :month
        AND p.period_year = :year
        LIMIT 1
    ";

    $stmt = $this->db->prepare($sql);
    $stmt->execute([
        ':employee_id' => $employee_id,
        ':month' => $month,
        ':year' => $year
    ]);

    $payslip = $stmt->fetch(PDO::FETCH_ASSOC);

    return $payslip ?: null;
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
    ";

    $stmt = $this->db->prepare($sql);
    $stmt->execute([
        ':month' => $month,
        ':year' => $year
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


}
?>
