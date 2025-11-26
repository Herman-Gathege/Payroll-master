<?php
/**
 * Payroll Configuration
 * Kenya Tax and Statutory Deductions - 2024
 * backend/config/payroll_config.php
 */

// Tax Rates
define('PERSONAL_RELIEF', 2400); // Monthly personal relief

// NSSF (National Social Security Fund)
define('NSSF_RATE', 0.06); // 6% employee contribution
define('NSSF_EMPLOYER_RATE', 0.06); // 6% employer contribution
define('NSSF_UPPER_LIMIT', 36000); // Maximum pensionable pay

// SHIF (Social Health Insurance Fund) - Replaces NHIF
define('SHIF_RATE', 0.0275); // 2.75% of gross pay

// Housing Levy
define('HOUSING_LEVY_RATE', 0.015); // 1.5% of gross pay

// Overtime
define('OVERTIME_RATE', 1.5); // 1.5x normal hourly rate

// Working hours
define('WORKING_HOURS_PER_MONTH', 160);
define('WORKING_DAYS_PER_MONTH', 22);

// Payment methods
define('PAYMENT_METHODS', [
    'bank_transfer' => 'Bank Transfer',
    'mobile_money' => 'Mobile Money (M-Pesa)',
    'cash' => 'Cash',
    'cheque' => 'Cheque'
]);

// Payroll status
define('PAYROLL_STATUS', [
    'draft' => 'Draft',
    'approved' => 'Approved',
    'paid' => 'Paid',
    'cancelled' => 'Cancelled'
]);

// PAYE Tax Bands (Kenya 2024)
define('PAYE_BANDS', [
    ['min' => 0, 'max' => 24000, 'rate' => 0.10],           // 10%
    ['min' => 24001, 'max' => 32333, 'rate' => 0.25],       // 25%
    ['min' => 32334, 'max' => 500000, 'rate' => 0.30],      // 30%
    ['min' => 500001, 'max' => 800000, 'rate' => 0.325],    // 32.5%
    ['min' => 800001, 'max' => PHP_INT_MAX, 'rate' => 0.35] // 35%
]);

// Company Information
define('COMPANY_NAME', 'Evolve');
define('COMPANY_ADDRESS', 'Nairobi, Kenya');
define('COMPANY_PIN', 'P000000000A');
define('COMPANY_EMAIL', 'payroll@evolve.com');
define('COMPANY_PHONE', '+254 700 000000');

// Document settings
define('PAYSLIP_LOGO_PATH', __DIR__ . '/../assets/logo.png');
define('REPORTS_OUTPUT_PATH', __DIR__ . '/../reports/');

?>
