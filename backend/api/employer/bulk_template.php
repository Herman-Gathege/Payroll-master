<?php
/**
 * EMPLOYEE BULK TEMPLATE API
 * ------------------------------------------------
 * - Generates a clean Excel template for bulk uploads
 * - Includes starter employee row
 * - CORS-safe and bypasses auth for OPTIONS requests
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// =========================================================
// STEP 1 — CORS
$frontendOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($frontendOrigin) {
    header("Access-Control-Allow-Origin: $frontendOrigin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Allow-Headers: Authorization, X-User, Content-Type, Accept");
}

// OPTIONS preflight must exit immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// =========================================================
// STEP 2 — BOOTSTRAP
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/SecurityMiddleware.php';
require_once __DIR__ . '/../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// =========================================================
// STEP 3 — AUTHENTICATION
// Only for GET requests — OPTIONS already bypassed
$session = SecurityMiddleware::verifyToken();
if ($session['user_type'] !== 'employer') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit();
}

// =========================================================
// STEP 4 — CREATE SPREADSHEET
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setTitle('Employee Template');

// Headers
$headers = [
    'employee_no',
    'first_name',
    'last_name',
    'work_email',
    'phone',
    'gender',
    'date_of_birth',
    'hire_date',
    'department_id',
    'position_id',
    'structure_id'
];
$sheet->fromArray($headers, null, 'A1');

// Starter row
$starterRow = [
    'EVOLVE-2026-XXXX',
    'John',
    'Doe',
    'john.doe@company.com',
    '0712345678',
    'Male',
    '01-15-1995',
    '06-01-2024',
    '1',
    '1',
    '1'
];
$sheet->fromArray($starterRow, null, 'A2');

// Notes
$sheet->setCellValue('A4', 'NOTES:');
$sheet->setCellValue(
    'A5',
    '• Do not change column headers
• Date format must be MM-DD-YYYY
• Gender must be Male, Female, or Other
• department_id, position_id, structure_id must already exist
• Duplicate the starter row to add more employees'
);
$sheet->mergeCells('A5:K9');

// =========================================================
// STEP 5 — DOWNLOAD
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="employee_bulk_upload_template.xlsx"');
header('Cache-Control: max-age=0');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
