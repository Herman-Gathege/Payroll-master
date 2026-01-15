<?php
/**
 * EMPLOYEE BULK UPLOAD API
 * ------------------------------------------------
 * - Preview & Upload modes
 * - Validates FK integrity
 * - Creates employee login accounts
 * - Assigns salary structure correctly
 */

// =========================================================
// STEP 0 — ENABLE ERRORS (dev only)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// =========================================================
// STEP 1 — CORS
$frontendOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($frontendOrigin) {
    header("Access-Control-Allow-Origin: $frontendOrigin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Authorization, X-User, Content-Type, Accept");
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// =========================================================
// STEP 2 — BOOTSTRAP
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/SecurityMiddleware.php';

header('Content-Type: application/json');
SecurityMiddleware::applySecurityHeaders();

$db = (new Database())->getConnection();
$session = SecurityMiddleware::verifyToken();

if ($session['user_type'] !== 'employer') {
    http_response_code(403);
    echo json_encode(['success'=>false,'message'=>'Access denied']);
    exit();
}

// =========================================================
// STEP 3 — ORGANIZATION
$stmt = $db->prepare("SELECT organization_id FROM employer_users WHERE id = :id");
$stmt->execute([':id'=>$session['user_id']]);
$org = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$org) {
    echo json_encode(['success'=>false,'message'=>'Organization not found']);
    exit();
}

$organization_id = (int)$org['organization_id'];

// =========================================================
// STEP 4 — CSV PARSING
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success'=>false,'message'=>'CSV file required']);
    exit();
}

$rows = [];
$headers = null;

if (($handle = fopen($_FILES['file']['tmp_name'], 'r')) !== false) {
    while (($data = fgetcsv($handle, 2000, ',')) !== false) {
        if (!$headers) {
            $headers = array_map(fn($h) =>
                strtolower(trim(preg_replace('/\xEF\xBB\xBF/', '', $h))), $data);
            continue;
        }
        if (!array_filter($data)) continue;
        $rows[] = array_combine($headers, array_map('trim', $data));
    }
    fclose($handle);
}

if (!$rows) {
    echo json_encode(['success'=>false,'message'=>'CSV has no data']);
    exit();
}

// =========================================================
// STEP 5 — HEADER VALIDATION
$requiredHeaders = [
    'employee_no','first_name','last_name','work_email','phone',
    'gender','date_of_birth','hire_date','department_id','position_id','structure_id'
];

$missing = array_diff($requiredHeaders, $headers);
if ($missing) {
    echo json_encode([
        'success'=>false,
        'message'=>'Invalid CSV headers',
        'missing_headers'=>array_values($missing)
    ]);
    exit();
}

// =========================================================
// STEP 6 — MODE
$mode = $_POST['mode'] ?? 'preview';

// =========================================================
// STEP 7 — VALIDATION FUNCTION
function validateEmployeeRow($row, $orgId, $db, $csvNos) {
    $errors = [];

    foreach (['employee_no','first_name','last_name','work_email'] as $f) {
        if (empty($row[$f])) $errors[] = "$f missing";
    }

    if (!filter_var($row['work_email'], FILTER_VALIDATE_EMAIL))
        $errors[] = 'invalid email';

    if (!in_array($row['gender'], ['Male','Female','Other']))
        $errors[] = 'invalid gender';

    foreach (['date_of_birth','hire_date'] as $d) {
        if (!DateTime::createFromFormat('m-d-Y', $row[$d]))
            $errors[] = "invalid $d";
    }

    if (count(array_keys($csvNos, $row['employee_no'])) > 1)
        $errors[] = 'duplicate employee_no in CSV';

    // Existing employee
    $stmt = $db->prepare("SELECT id FROM employees WHERE employee_no=:e AND organization_id=:o");
    $stmt->execute([':e'=>$row['employee_no'], ':o'=>$orgId]);
    if ($stmt->fetch()) $errors[] = 'employee_no already exists';

    // Department
    $stmt = $db->prepare("SELECT id FROM departments WHERE id=:id AND organization_id=:o");
    $stmt->execute([':id'=>$row['department_id'], ':o'=>$orgId]);
    if (!$stmt->fetch()) $errors[] = 'invalid department_id';

    // Position
    $stmt = $db->prepare("SELECT id FROM positions WHERE id=:id");
    $stmt->execute([':id'=>$row['position_id']]);
    if (!$stmt->fetch()) $errors[] = 'invalid position_id';

    // Salary structure
    $stmt = $db->prepare("
        SELECT id FROM salary_structures
        WHERE id=:id AND organization_id=:o AND status='active'
    ");
    $stmt->execute([':id'=>$row['structure_id'], ':o'=>$orgId]);
    if (!$stmt->fetch()) $errors[] = 'invalid salary structure';

    return $errors;
}

// =========================================================
// STEP 8 — PREVIEW
if ($mode === 'preview') {
    $preview = array_slice($rows, 0, 10);
    foreach ($preview as $i => &$r) {
        $r['row'] = $i + 2;
        $r['errors'] = [];
    }
    echo json_encode(['success'=>true,'preview'=>$preview,'total_rows'=>count($rows)]);
    exit();
}

// =========================================================
// STEP 9 — UPLOAD
$csvNos = array_column($rows, 'employee_no');
$failed = [];
$inserted = [];

try {
    $db->beginTransaction();

    $stmtEmployee = $db->prepare("
        INSERT INTO employees (
            organization_id, employee_no, first_name, last_name,
            work_email, phone, gender, date_of_birth, hire_date,
            department_id, position_id
        ) VALUES (
            :org,:no,:fn,:ln,:email,:phone,:gender,
            STR_TO_DATE(:dob,'%m-%d-%Y'),
            STR_TO_DATE(:hire,'%m-%d-%Y'),
            :dept,:pos
        )
    ");

    foreach ($rows as $i => $row) {
        $errors = validateEmployeeRow($row, $organization_id, $db, $csvNos);
        if ($errors) {
            $failed[] = ['row'=>$i+2,'employee_no'=>$row['employee_no'],'errors'=>$errors];
            continue;
        }

        $stmtEmployee->execute([
            ':org'=>$organization_id,
            ':no'=>$row['employee_no'],
            ':fn'=>$row['first_name'],
            ':ln'=>$row['last_name'],
            ':email'=>$row['work_email'],
            ':phone'=>$row['phone'],
            ':gender'=>$row['gender'],
            ':dob'=>$row['date_of_birth'],
            ':hire'=>$row['hire_date'],
            ':dept'=>$row['department_id'],
            ':pos'=>$row['position_id']
        ]);

        $employeeId = $db->lastInsertId();

        // Assign salary structure
        $stmt = $db->prepare("
            INSERT INTO employee_salary_structure (
                employee_id, structure_id, assigned_by, effective_from, is_active
            ) VALUES (
                :emp,:structure,:by,CURDATE(),1
            )
        ");
        $stmt->execute([
            ':emp'=>$employeeId,
            ':structure'=>$row['structure_id'],
            ':by'=>$session['user_id']
        ]);

        // Create user login
        $stmtUser = $db->prepare("
            INSERT INTO employee_users (employee_id, username, password_hash)
            VALUES (:id,:u,:p)
        ");
        $stmtUser->execute([
            ':id'=>$employeeId,
            ':u'=>$row['work_email'],
            ':p'=>password_hash('Welcome@2025', PASSWORD_DEFAULT)
        ]);

        $inserted[] = $row['employee_no'];
    }

    $db->commit();

} catch (Throwable $e) {
    $db->rollBack();
    echo json_encode(['success'=>false,'message'=>'Bulk upload failed','error'=>$e->getMessage()]);
    exit();
}

// =========================================================
// STEP 10 — RESPONSE
echo json_encode([
    'success'=>true,
    'summary'=>[
        'total'=>count($rows),
        'inserted'=>count($inserted),
        'failed'=>count($failed)
    ],
    'failed_rows'=>$failed
]);
