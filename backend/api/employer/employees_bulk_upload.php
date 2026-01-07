<?php
/**
 * EMPLOYEE BULK UPLOAD API — SKIP EXISTING & VALIDATE FK
 * ---------------------------------------
 * Modes:
 *  - preview : Parse + validate CSV, no DB writes
 *  - upload  : Validate + bulk insert (transaction-safe)
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
    header("Access-Control-Max-Age: 86400");
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
// STEP 3 — GET ORGANIZATION
$stmt = $db->prepare("SELECT organization_id FROM employer_users WHERE id = :id");
$stmt->execute([':id' => $session['user_id']]);
$org = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$org) {
    http_response_code(400);
    echo json_encode(['success'=>false,'message'=>'Organization not found']);
    exit();
}
$organization_id = (int)$org['organization_id'];

// =========================================================
// STEP 4 — ACCEPT AND PARSE CSV
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success'=>false,'message'=>'CSV file required']);
    exit();
}

$filePath = $_FILES['file']['tmp_name'];
$rows = [];
$headers = null;

if (($handle = fopen($filePath, 'r')) !== false) {
    while (($data = fgetcsv($handle, 2000, ',')) !== false) {
        if (!$headers) {
            $headers = array_map(function($h){
                return strtolower(trim(preg_replace('/\xEF\xBB\xBF/', '', $h)));
            }, $data);
            continue;
        }
        if (count(array_filter($data)) === 0) continue;

        $rowData = @array_combine($headers, array_map('trim', $data));
        if ($rowData === false) {
            echo json_encode(['success'=>false,'message'=>'CSV row/header mismatch']);
            exit();
        }
        $rows[] = $rowData;
    }
    fclose($handle);
}
if (empty($rows)) {
    echo json_encode(['success'=>false,'message'=>'CSV has no data']);
    exit();
}

// =========================================================
// STEP 5 — HEADER VALIDATION
$requiredHeaders = [
    'employee_no','first_name','last_name','work_email','phone',
    'gender','date_of_birth','hire_date','department_id','position_id','basic_salary'
];
$missingHeaders = array_diff($requiredHeaders, $headers);
if (!empty($missingHeaders)) {
    echo json_encode([
        'success'=>false,
        'message'=>'Invalid CSV headers',
        'missing_headers'=>array_values($missingHeaders)
    ]);
    exit();
}

// =========================================================
// STEP 6 — MODE
$mode = $_POST['mode'] ?? 'preview';

// =========================================================
// STEP 7 — VALIDATION FUNCTION (SKIP EXISTING, VALIDATE FKs)
function validateEmployeeRow(array $row, int $orgId, PDO $db, array $csvEmployeeNos): array {
    $errors = [];

    // Basic field checks
    foreach (['employee_no','first_name','last_name','work_email'] as $field) {
        if (empty($row[$field])) $errors[] = "$field missing";
    }
    if (!empty($row['work_email']) && !filter_var($row['work_email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'invalid email';
    }
    if (!in_array($row['gender'], ['Male','Female','Other'], true)) {
        $errors[] = 'invalid gender';
    }
    if (!is_numeric($row['basic_salary']) || $row['basic_salary'] < 0) {
        $errors[] = 'invalid salary';
    }
    foreach (['date_of_birth','hire_date'] as $dateField) {
        if (!DateTime::createFromFormat('m-d-Y', $row[$dateField])) {
            $errors[] = "invalid $dateField format";
        }
    }
    if (count(array_keys($csvEmployeeNos, $row['employee_no'])) > 1) {
        $errors[] = 'duplicate employee_no in CSV';
    }

    // Skip existing employees
    $stmt = $db->prepare("
        SELECT id FROM employees WHERE employee_no = :emp AND organization_id = :org LIMIT 1
    ");
    $stmt->execute([':emp'=>$row['employee_no'], ':org'=>$orgId]);
    if ($stmt->fetch()) {
        $errors[] = 'employee_no already exists';
    }

    // Validate department exists
    $stmt = $db->prepare("SELECT id FROM departments WHERE id = :id AND organization_id = :org");
    $stmt->execute([':id'=>$row['department_id'], ':org'=>$orgId]);
    if (!$stmt->fetch()) $errors[] = 'invalid department_id';

    // Validate position exists
    $stmt = $db->prepare("SELECT id FROM positions WHERE id = :id");
    $stmt->execute([':id'=>$row['position_id']]);
    if (!$stmt->fetch()) $errors[] = 'invalid position_id';

    return $errors;
}

// =========================================================
// STEP 8 — PREVIEW MODE
if ($mode === 'preview') {
    $slice = array_slice($rows, 0, 10);
    $preview = array_map(function($row,$i){
        $row['row'] = $i + 2;
        $row['errors'] = [];
        return $row;
    }, $slice, range(0,count($slice)-1));

    echo json_encode([
        'success'=>true,
        'preview'=>$preview,
        'total_rows'=>count($rows)
    ]);
    exit();
}

// =========================================================
// STEP 9 — UPLOAD MODE
$csvEmployeeNos = array_column($rows,'employee_no');
$failed = [];
$success = [];

try {
    $db->beginTransaction();

    $stmt = $db->prepare("
        INSERT INTO employees (
            organization_id, employee_no, first_name, last_name,
            work_email, phone, gender, date_of_birth, hire_date,
            department_id, position_id, basic_salary
        ) VALUES (
            :org,:emp,:fn,:ln,:email,:phone,:gender,
            STR_TO_DATE(:dob,'%m-%d-%Y'),
            STR_TO_DATE(:hire,'%m-%d-%Y'),
            :dept,:pos,:salary
        )
    ");

    foreach ($rows as $index => $row) {
        $errors = validateEmployeeRow($row, $organization_id, $db, $csvEmployeeNos);

        // Skip row if existing employee or invalid FK
        $skipRow = false;
        foreach ($errors as $err) {
            if (in_array($err, ['employee_no already exists','invalid department_id','invalid position_id'])) {
                $skipRow = true;
            }
        }

        if ($skipRow) {
            $failed[] = ['row'=>$index+2,'employee_no'=>$row['employee_no'],'errors'=>$errors];
            continue;
        }

        // Cast IDs
        $deptId = (int)$row['department_id'];
        $posId  = (int)$row['position_id'];

        // Insert
        $stmt->execute([
            ':org'=>$organization_id,
            ':emp'=>$row['employee_no'],
            ':fn'=>$row['first_name'],
            ':ln'=>$row['last_name'],
            ':email'=>$row['work_email'],
            ':phone'=>$row['phone'],
            ':gender'=>$row['gender'],
            ':dob'=>$row['date_of_birth'],
            ':hire'=>$row['hire_date'],
            ':dept'=>$deptId,
            ':pos'=>$posId,
            ':salary'=>$row['basic_salary']
        ]);

        $success[] = $row['employee_no'];
    }

    $db->commit();

} catch (Throwable $e) {
    if ($db->inTransaction()) $db->rollBack();
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Bulk upload failed','error'=>$e->getMessage()]);
    exit();
}

// =========================================================
// STEP 10 — FINAL RESPONSE
echo json_encode([
    'success'=>true,
    'summary'=>[
        'total'=>count($rows),
        'inserted'=>count($success),
        'failed'=>count($failed)
    ],
    'failed_rows'=>$failed
]);
