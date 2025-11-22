<?php
// backend/controllers/PayrollController.php

require_once __DIR__ . '/../models/Payroll.php';
require_once __DIR__ . '/../config/payroll_config.php';

class PayrollController
{
    private $db;
    private $payroll;

    public function __construct($db)
    {
        $this->db = $db;
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->payroll = new Payroll($db);

        header('Content-Type: application/json; charset=utf-8');
    }

    /* -------------------------
       Helper: uniform JSON response
       ------------------------- */
    private function respond(int $statusCode, bool $success, $data = null, string $message = '', array $meta = [])
    {
        http_response_code($statusCode);
        $payload = ['success' => $success, 'message' => $message];
        if ($data !== null) $payload['data'] = $data;
        if (!empty($meta)) $payload['meta'] = $meta;
        echo json_encode($payload);
        exit;
    }

    private function sanitize($value)
    {
        return $value === null ? null : trim($value);
    }

    private function validateMonthYear($month, $year)
    {
        if (!is_int($month) || $month < 1 || $month > 12) return false;
        if (!is_int($year) || $year < 1900 || $year > intval(date('Y'))) return false;
        return true;
    }

    /* =====================================================
       Generate payroll for one employee
       ===================================================== */
    public function generateEmployeePayroll($employee_id, $month, $year)
    {
        try {
            $employee_id = intval($employee_id);
            $month = intval($month);
            $year = intval($year);

            if ($employee_id <= 0 || !$this->validateMonthYear($month, $year)) {
                return $this->respond(400, false, null, 'Invalid employee ID or period');
            }

            $salary = $this->getEmployeeSalary($employee_id);
            if (!$salary) {
                return $this->respond(404, false, null, 'No active salary structure found for employee');
            }

            $attendance = $this->getAttendanceData($employee_id, $month, $year);

            $earnings = $this->calculateEarnings($salary, $attendance);
            $deductions = $this->calculateDeductions($earnings['gross_pay']);

            $net_pay = $earnings['gross_pay'] - $deductions['total_deductions'];

            $payroll_data = array_merge($earnings, $deductions, [
                'employee_id' => $employee_id,
                'period_month' => $month,
                'period_year' => $year,
                'net_pay' => round($net_pay, 2)
            ]);

            $payroll_id = $this->savePayroll($payroll_data);

            return $this->respond(201, true, $payroll_data, 'Payroll generated successfully');

        } catch (Exception $e) {
            error_log("PayrollController@generateEmployeePayroll error: " . $e->getMessage());
            return $this->respond(500, false, null, 'Server error while generating payroll');
        }
    }

    /* =====================================================
       Generate payroll for all active employees
       ===================================================== */
    public function generateBulkPayroll($month, $year)
    {
        try {
            $month = intval($month);
            $year = intval($year);

            if (!$this->validateMonthYear($month, $year)) {
                return $this->respond(400, false, null, 'Invalid period');
            }

            $stmt = $this->db->prepare("SELECT id FROM employees WHERE employment_status = 'active'");
            $stmt->execute();
            $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $results = [];
            foreach ($employees as $employee) {
                $res = $this->generateEmployeePayroll($employee['id'], $month, $year);
                $results[] = [
                    'employee_id' => $employee['id'],
                    'status' => $res['success'] ? 'success' : 'failed',
                    'message' => $res['message'] ?? ''
                ];
            }

            return $this->respond(200, true, $results, 'Bulk payroll generation completed');

        } catch (Exception $e) {
            error_log("PayrollController@generateBulkPayroll error: " . $e->getMessage());
            return $this->respond(500, false, null, 'Server error during bulk payroll generation');
        }
    }

    /* =====================================================
       Payroll calculations
       ===================================================== */
    private function calculateEarnings($salary, $attendance)
    {
        $basic = floatval($salary['basic_salary']);
        $housing = floatval($salary['housing_allowance'] ?? 0);
        $transport = floatval($salary['transport_allowance'] ?? 0);
        $medical = floatval($salary['medical_allowance'] ?? 0);

        $overtime_hours = floatval($attendance['overtime_hours'] ?? 0);
        $hourly_rate = $basic / 160;
        $overtime_rate = OVERTIME_RATE ?? 1.5;
        $overtime_pay = $overtime_hours * $hourly_rate * $overtime_rate;

        $absent_days = intval($attendance['absent_days'] ?? 0);
        $daily_rate = $basic / 22;
        $absence_deduction = $absent_days * $daily_rate;

        $gross_pay = $basic + $housing + $transport + $medical + $overtime_pay - $absence_deduction;

        return [
            'basic_salary' => $basic,
            'housing_allowance' => $housing,
            'transport_allowance' => $transport,
            'medical_allowance' => $medical,
            'overtime_hours' => $overtime_hours,
            'overtime_pay' => round($overtime_pay, 2),
            'absent_days' => $absent_days,
            'absence_deduction' => round($absence_deduction, 2),
            'gross_pay' => round($gross_pay, 2)
        ];
    }

    private function calculateDeductions($gross_pay)
    {
        $paye = $this->calculatePAYE($gross_pay);
        $nssf = $this->calculateNSSF($gross_pay);
        $shif = $this->calculateSHIF($gross_pay);
        $housing_levy = $this->calculateHousingLevy($gross_pay);
        $personal_relief = PERSONAL_RELIEF ?? 2400;

        $total = $paye + $nssf + $shif + $housing_levy - $personal_relief;

        return [
            'paye' => round($paye, 2),
            'nssf_employee' => round($nssf, 2),
            'shif' => round($shif, 2),
            'housing_levy' => round($housing_levy, 2),
            'personal_relief' => round($personal_relief, 2),
            'total_deductions' => round($total, 2)
        ];
    }

    private function calculatePAYE($gross)
    {
        $tax = 0;
        $bands = [
            ['min'=>0,'max'=>24000,'rate'=>0.1],
            ['min'=>24001,'max'=>32333,'rate'=>0.25],
            ['min'=>32334,'max'=>500000,'rate'=>0.3],
            ['min'=>500001,'max'=>800000,'rate'=>0.325],
            ['min'=>800001,'max'=>PHP_INT_MAX,'rate'=>0.35]
        ];

        foreach ($bands as $b) {
            if ($gross > $b['min']) {
                $taxable = min($gross,$b['max']) - $b['min'];
                $tax += $taxable * $b['rate'];
            }
        }

        return $tax;
    }

    private function calculateNSSF($gross) { return min($gross, NSSF_UPPER_LIMIT ?? 36000) * (NSSF_RATE ?? 0.06); }
    private function calculateSHIF($gross) { return $gross * (SHIF_RATE ?? 0.0275); }
    private function calculateHousingLevy($gross) { return $gross * (HOUSING_LEVY_RATE ?? 0.015); }

    private function getEmployeeSalary($employee_id)
    {
        $stmt = $this->db->prepare("SELECT * FROM salary_structures WHERE employee_id=? AND is_active=1 ORDER BY effective_date DESC LIMIT 1");
        $stmt->execute([$employee_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function getAttendanceData($employee_id, $month, $year)
    {
        $stmt = $this->db->prepare("
            SELECT 
                SUM(overtime_hours) AS overtime_hours,
                SUM(CASE WHEN status='absent' THEN 1 ELSE 0 END) AS absent_days
            FROM attendance
            WHERE employee_id=? AND MONTH(attendance_date)=? AND YEAR(attendance_date)=?
        ");
        $stmt->execute([$employee_id, $month, $year]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: ['overtime_hours'=>0,'absent_days'=>0];
    }

    private function savePayroll($data)
    {
        $query = "INSERT INTO payroll 
            (employee_id, period_month, period_year, basic_salary, housing_allowance, transport_allowance,
            medical_allowance, overtime_hours, overtime_pay, absent_days, absence_deduction, gross_pay,
            paye, nssf_employee, shif, housing_levy, personal_relief, total_deductions, net_pay, status, created_at)
            VALUES 
            (:employee_id, :period_month, :period_year, :basic_salary, :housing_allowance, :transport_allowance,
            :medical_allowance, :overtime_hours, :overtime_pay, :absent_days, :absence_deduction, :gross_pay,
            :paye, :nssf_employee, :shif, :housing_levy, :personal_relief, :total_deductions, :net_pay, 'draft', NOW())
            ON DUPLICATE KEY UPDATE 
            basic_salary=:basic_salary, housing_allowance=:housing_allowance, transport_allowance=:transport_allowance,
            medical_allowance=:medical_allowance, overtime_hours=:overtime_hours, overtime_pay=:overtime_pay,
            absent_days=:absent_days, absence_deduction=:absence_deduction, gross_pay=:gross_pay,
            paye=:paye, nssf_employee=:nssf_employee, shif=:shif, housing_levy=:housing_levy,
            personal_relief=:personal_relief, total_deductions=:total_deductions, net_pay=:net_pay, updated_at=NOW()";

        $stmt = $this->db->prepare($query);
        $stmt->execute($data);
        return $this->db->lastInsertId();
    }

    /* =====================================================
       Fetch payrolls by period
       ===================================================== */
    public function getPayrollByPeriod($month, $year)
    {
        try {
            $stmt = $this->db->prepare("
                SELECT p.*, CONCAT(e.first_name,' ',e.last_name) AS employee_name, e.employee_number, e.department, e.position
                FROM payroll p
                LEFT JOIN employees e ON p.employee_id=e.id
                WHERE p.period_month=? AND p.period_year=?
                ORDER BY e.employee_number
            ");
            $stmt->execute([$month,$year]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $this->respond(200,true,$rows,'Payroll records retrieved');
        } catch(Exception $e) {
            error_log("PayrollController@getPayrollByPeriod error: ".$e->getMessage());
            return $this->respond(500,false,null,'Server error fetching payroll records');
        }
    }

    /* =====================================================
       Fetch individual payslip
       ===================================================== */
    public function getPayslip($employee_id, $month, $year)
    {
        try {
            $stmt = $this->db->prepare("
                SELECT p.*, CONCAT(e.first_name,' ',e.last_name) AS employee_name, e.employee_number,
                       e.department, e.position, e.email, e.phone
                FROM payroll p
                LEFT JOIN employees e ON p.employee_id=e.id
                WHERE p.employee_id=? AND p.period_month=? AND p.period_year=?
            ");
            $stmt->execute([$employee_id,$month,$year]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if(!$row) return $this->respond(404,false,null,'Payslip not found');
            return $this->respond(200,true,$row,'Payslip retrieved');
        } catch(Exception $e) {
            error_log("PayrollController@getPayslip error: ".$e->getMessage());
            return $this->respond(500,false,null,'Server error fetching payslip');
        }
    }

    public function approvePayroll($payroll_id)
    {
        try {
            $stmt = $this->db->prepare("UPDATE payroll SET status='approved', approved_at=NOW() WHERE id=?");
            $stmt->execute([$payroll_id]);
            return $this->respond(200,true,null,'Payroll approved');
        } catch(Exception $e) {
            error_log("PayrollController@approvePayroll error: ".$e->getMessage());
            return $this->respond(500,false,null,'Server error approving payroll');
        }
    }

    public function processPayment($payroll_id, $method='bank_transfer')
    {
        try {
            $stmt = $this->db->prepare("
                UPDATE payroll SET status='paid', payment_method=?, paid_at=NOW() WHERE id=?
            ");
            $stmt->execute([$method,$payroll_id]);
            return $this->respond(200,true,null,'Payroll marked as paid');
        } catch(Exception $e) {
            error_log("PayrollController@processPayment error: ".$e->getMessage());
            return $this->respond(500,false,null,'Server error processing payment');
        }
    }

    public function getPayrollSummary($month,$year)
    {
        try {
            $stmt = $this->db->prepare("
                SELECT 
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
                WHERE period_month=? AND period_year=?
            ");
            $stmt->execute([$month,$year]);
            $summary = $stmt->fetch(PDO::FETCH_ASSOC);
            return $this->respond(200,true,$summary,'Payroll summary retrieved');
        } catch(Exception $e) {
            error_log("PayrollController@getPayrollSummary error: ".$e->getMessage());
            return $this->respond(500,false,null,'Server error fetching payroll summary');
        }
    }
}
?>
