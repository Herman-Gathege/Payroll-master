<?php

/**
 * backend/controllers/PayrollController.php
 */

require_once __DIR__ . '/../models/Payroll.php';
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
            // Get employee salary structure
            $salary = $this->getEmployeeSalary($employee_id);
            if (!$salary) {
                return ['success' => false, 'message' => 'No active salary structure found'];
            }

            // Get attendance data
            $attendance = $this->getAttendanceData($employee_id, $month, $year);

            // Calculate earnings
            $earnings = $this->calculateEarnings($salary, $attendance);

            // Calculate deductions
            $deductions = $this->calculateDeductions($earnings['gross_pay']);

            // Calculate net pay
            $net_pay = $earnings['gross_pay'] - $deductions['total_deductions'];

            // Save payroll record
            $payroll_data = array_merge($earnings, $deductions, [
                'employee_id' => $employee_id,
                'period_month' => $month,
                'period_year' => $year,
                'net_pay' => $net_pay
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
     * Generate payroll for all active employees
     */
    public function generateBulkPayroll($month, $year) {
        try {
            $query = "SELECT id FROM employees WHERE status = 'active'";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $results = [];
            foreach ($employees as $employee) {
                $result = $this->generateEmployeePayroll($employee['id'], $month, $year);
                $results[] = [
                    'employee_id' => $employee['id'],
                    'status' => $result['success'] ? 'success' : 'failed',
                    'message' => $result['message']
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
     * Calculate all earnings
     */
    private function calculateEarnings($salary, $attendance) {
        $basic_salary = floatval($salary['basic_salary']);
        $housing_allowance = floatval($salary['housing_allowance'] ?? 0);
        $transport_allowance = floatval($salary['transport_allowance'] ?? 0);
        $medical_allowance = floatval($salary['medical_allowance'] ?? 0);

        // Calculate overtime pay
        $overtime_hours = floatval($attendance['overtime_hours'] ?? 0);
        $hourly_rate = $basic_salary / 160; // Assuming 160 work hours per month
        $overtime_rate = OVERTIME_RATE ?? 1.5;
        $overtime_pay = $overtime_hours * $hourly_rate * $overtime_rate;

        // Calculate deductions for absences
        $absent_days = intval($attendance['absent_days'] ?? 0);
        $daily_rate = $basic_salary / 22; // Assuming 22 working days per month
        $absence_deduction = $absent_days * $daily_rate;

        $gross_pay = $basic_salary + $housing_allowance + $transport_allowance +
                     $medical_allowance + $overtime_pay - $absence_deduction;

        return [
            'basic_salary' => $basic_salary,
            'housing_allowance' => $housing_allowance,
            'transport_allowance' => $transport_allowance,
            'medical_allowance' => $medical_allowance,
            'overtime_hours' => $overtime_hours,
            'overtime_pay' => round($overtime_pay, 2),
            'absent_days' => $absent_days,
            'absence_deduction' => round($absence_deduction, 2),
            'gross_pay' => round($gross_pay, 2)
        ];
    }

    /**
     * Calculate all deductions based on Kenyan tax laws
     */
    private function calculateDeductions($gross_pay) {
        // PAYE Calculation (Kenya 2024 rates)
        $paye = $this->calculatePAYE($gross_pay);

        // NSSF Calculation (6% of pensionable pay, max KES 2,160)
        $nssf_employee = $this->calculateNSSF($gross_pay);

        // NHIF/SHIF Calculation
        $shif = $this->calculateSHIF($gross_pay);

        // Housing Levy (1.5%)
        $housing_levy = $this->calculateHousingLevy($gross_pay);

        // Personal Relief
        $personal_relief = PERSONAL_RELIEF ?? 2400;

        $total_deductions = $paye + $nssf_employee + $shif + $housing_levy - $personal_relief;

        return [
            'paye' => round($paye, 2),
            'nssf_employee' => round($nssf_employee, 2),
            'shif' => round($shif, 2),
            'housing_levy' => round($housing_levy, 2),
            'personal_relief' => round($personal_relief, 2),
            'total_deductions' => round($total_deductions, 2)
        ];
    }

    /**
     * Calculate PAYE based on Kenya tax bands
     */
    private function calculatePAYE($gross_pay) {
        $taxable_income = $gross_pay;
        $tax = 0;

        // Kenya PAYE tax bands 2024
        $bands = [
            ['min' => 0, 'max' => 24000, 'rate' => 0.10],
            ['min' => 24001, 'max' => 32333, 'rate' => 0.25],
            ['min' => 32334, 'max' => 500000, 'rate' => 0.30],
            ['min' => 500001, 'max' => 800000, 'rate' => 0.325],
            ['min' => 800001, 'max' => PHP_INT_MAX, 'rate' => 0.35]
        ];

        foreach ($bands as $band) {
            if ($taxable_income > $band['min']) {
                $taxable_in_band = min($taxable_income, $band['max']) - $band['min'];
                $tax += $taxable_in_band * $band['rate'];
            }
        }

        return $tax;
    }

    /**
     * Calculate NSSF contribution
     */
    private function calculateNSSF($gross_pay) {
        $nssf_rate = NSSF_RATE ?? 0.06;
        $nssf_upper_limit = NSSF_UPPER_LIMIT ?? 36000;

        $pensionable_pay = min($gross_pay, $nssf_upper_limit);
        return $pensionable_pay * $nssf_rate;
    }

    /**
     * Calculate SHIF (Social Health Insurance Fund)
     */
    private function calculateSHIF($gross_pay) {
        $shif_rate = SHIF_RATE ?? 0.0275;
        return $gross_pay * $shif_rate;
    }

    /**
     * Calculate Housing Levy
     */
    private function calculateHousingLevy($gross_pay) {
        $housing_levy_rate = HOUSING_LEVY_RATE ?? 0.015;
        return $gross_pay * $housing_levy_rate;
    }

    /**
     * Get employee salary structure
     */
    private function getEmployeeSalary($employee_id) {
        $query = "SELECT * FROM salary_structures
                  WHERE employee_id = ? AND is_active = 1
                  ORDER BY effective_date DESC LIMIT 1";

        $stmt = $this->db->prepare($query);
        $stmt->execute([$employee_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get attendance data for the month
     */
    private function getAttendanceData($employee_id, $month, $year) {
        $query = "SELECT
                    SUM(overtime_hours) as overtime_hours,
                    SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days
                  FROM attendance
                  WHERE employee_id = ?
                  AND MONTH(attendance_date) = ?
                  AND YEAR(attendance_date) = ?";

        $stmt = $this->db->prepare($query);
        $stmt->execute([$employee_id, $month, $year]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: ['overtime_hours' => 0, 'absent_days' => 0];
    }

    /**
     * Save payroll record to database
     */
    private function savePayroll($data) {
        $query = "INSERT INTO payroll
                  (employee_id, period_month, period_year, basic_salary, housing_allowance,
                   transport_allowance, medical_allowance, overtime_hours, overtime_pay,
                   absent_days, absence_deduction, gross_pay, paye, nssf_employee, shif,
                   housing_levy, personal_relief, total_deductions, net_pay, status, created_at)
                  VALUES
                  (:employee_id, :period_month, :period_year, :basic_salary, :housing_allowance,
                   :transport_allowance, :medical_allowance, :overtime_hours, :overtime_pay,
                   :absent_days, :absence_deduction, :gross_pay, :paye, :nssf_employee, :shif,
                   :housing_levy, :personal_relief, :total_deductions, :net_pay, 'draft', NOW())
                  ON DUPLICATE KEY UPDATE
                   basic_salary = :basic_salary,
                   housing_allowance = :housing_allowance,
                   transport_allowance = :transport_allowance,
                   medical_allowance = :medical_allowance,
                   overtime_hours = :overtime_hours,
                   overtime_pay = :overtime_pay,
                   absent_days = :absent_days,
                   absence_deduction = :absence_deduction,
                   gross_pay = :gross_pay,
                   paye = :paye,
                   nssf_employee = :nssf_employee,
                   shif = :shif,
                   housing_levy = :housing_levy,
                   personal_relief = :personal_relief,
                   total_deductions = :total_deductions,
                   net_pay = :net_pay,
                   updated_at = NOW()";

        $stmt = $this->db->prepare($query);
        $stmt->execute($data);

        return $this->db->lastInsertId();
    }

    /**
     * Get payroll records by period
     */
    public function getPayrollByPeriod($month, $year) {
        $query = "SELECT p.*,
                  CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                  e.employee_number,
                  e.department,
                  e.position
                  FROM payroll p
                  LEFT JOIN employees e ON p.employee_id = e.id
                  WHERE p.period_month = ? AND p.period_year = ?
                  ORDER BY e.employee_number";

        $stmt = $this->db->prepare($query);
        $stmt->execute([$month, $year]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get individual payslip
     */
    public function getPayslip($employee_id, $month, $year) {
        $query = "SELECT p.*,
                  CONCAT(e.first_name, ' ', e.last_name) as employee_name,
                  e.employee_number,
                  e.department,
                  e.position,
                  e.email,
                  e.phone
                  FROM payroll p
                  LEFT JOIN employees e ON p.employee_id = e.id
                  WHERE p.employee_id = ? AND p.period_month = ? AND p.period_year = ?";

        $stmt = $this->db->prepare($query);
        $stmt->execute([$employee_id, $month, $year]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Approve payroll
     */
    public function approvePayroll($payroll_id) {
        $query = "UPDATE payroll SET status = 'approved', approved_at = NOW() WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$payroll_id]);
    }

    /**
     * Process payment (mark as paid)
     */
    public function processPayment($payroll_id, $payment_method = 'bank_transfer') {
        $query = "UPDATE payroll
                  SET status = 'paid',
                      payment_method = ?,
                      paid_at = NOW()
                  WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$payment_method, $payroll_id]);
    }

    /**
     * Get payroll summary for a period
     */
    public function getPayrollSummary($month, $year) {
        $query = "SELECT
                    COUNT(*) as total_employees,
                    SUM(basic_salary) as total_basic_salary,
                    SUM(housing_allowance + transport_allowance + medical_allowance) as total_allowances,
                    SUM(overtime_pay) as total_overtime,
                    SUM(gross_pay) as total_gross_pay,
                    SUM(paye) as total_paye,
                    SUM(nssf_employee) as total_nssf,
                    SUM(shif) as total_shif,
                    SUM(housing_levy) as total_housing_levy,
                    SUM(total_deductions) as total_deductions,
                    SUM(net_pay) as total_net_pay
                  FROM payroll
                  WHERE period_month = ? AND period_year = ?";

        $stmt = $this->db->prepare($query);
        $stmt->execute([$month, $year]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>
