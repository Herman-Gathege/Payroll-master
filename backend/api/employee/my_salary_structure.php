<?php
/**
 * GET /api/employee/my_salary_structure.php
 * Returns current salary structure for the logged-in employee
 */

header("Content-Type: application/json; charset=UTF-8");

// ========================
// CORS
// ========================
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, X-User, Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ========================
// Authentication — using YOUR exact auth.php
// ========================
require_once __DIR__ . '/../../middleware/auth.php';     // ← FIXED PATH
require_once __DIR__ . '/../../config/database.php';     // ← FIXED PATH
require_once __DIR__ . '/../../models/SalaryStructure.php'; // ← FIXED PATH

$auth = authenticateRequest();   // ← This function exists in your auth.php

if (!$auth['success']) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => $auth['message']]);
    exit();
}

$user = $auth['user'];
$user_type = $auth['user_type'] ?? 'employee';

// Only employee, hr, or admin
if (!in_array($user_type, ['employee', 'hr', 'admin'])) {
    http_response_code(403);
    echo json_encode(["success" => false, "message" => "Access denied"]);
    exit();
}

// Determine which employee to show
$employee_id = (int)($user['employee_id'] ?? 0);

if ($user_type !== 'employee' && isset($_GET['employee_id'])) {
    $employee_id = (int)$_GET['employee_id'];
}

if ($employee_id <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid employee ID"]);
    exit();
}

// ========================
// Database Logic
// ========================
$db = (new Database())->getConnection();
$model = new SalaryStructure($db);

// Get active assignment
$stmt = $db->prepare("
    SELECT structure_id, effective_from, effective_to, assigned_at 
    FROM employee_salary_structure 
    WHERE employee_id = ? AND is_active = 1 
    ORDER BY assigned_at DESC LIMIT 1
");
$stmt->execute([$employee_id]);
$assignment = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$assignment) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "No active salary structure found"]);
    exit();
}

$structure_id = (int)$assignment['structure_id'];
$structure = $model->findById($structure_id);

if (!$structure) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Salary structure not found"]);
    exit();
}

// Load allowances & benefits safely
$allowances = $db->prepare("SELECT id, name, amount, taxable FROM salary_structure_allowances WHERE structure_id = ?");
$allowances->execute([$structure_id]);
$allowances = $allowances->fetchAll(PDO::FETCH_ASSOC);

$benefits = $db->prepare("SELECT id, name, amount, benefit_type, taxable FROM salary_structure_benefits WHERE structure_id = ?");
$benefits->execute([$structure_id]);
$benefits = $benefits->fetchAll(PDO::FETCH_ASSOC);

// Calculations
$gross = round((float)$structure['basic_salary'], 2);
foreach ($allowances as $a) {
    $gross += round((float)$a['amount'], 2);
}

$net = $gross;
foreach ($benefits as $b) {
    if ($b['taxable']) {
        $net -= round((float)$b['amount'], 2);
    }
}

// Final response
http_response_code(200);
echo json_encode([
    "success" => true,
    "data" => [
        "structure" => [
            "title"         => $structure['title'],
            "basic_salary"  => (float)$structure['basic_salary'],
            "gross_salary"  => $gross,
            "net_salary"    => $net,
            "currency"      => "KES",
            "effective_from" => $assignment['effective_from'] ?? null,
            "effective_to"   => $assignment['effective_to'] ?? null,
            "allowances"    => $allowances,
            "benefits"      => $benefits
        ],
        "assigned_at" => $assignment['assigned_at']
    ]
], JSON_NUMERIC_CHECK);