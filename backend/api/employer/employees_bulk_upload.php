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
// STEP 4 — FILE PARSING (CSV OR EXCEL)
require_once __DIR__ . '/../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success'=>false,'message'=>'File required']);
    exit();
}

$rows = [];
$headers = null;
$filePath = $_FILES['file']['tmp_name'];
$fileType = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);

// ---------------- CSV ----------------
if (in_array(strtolower($fileType), ['csv'])) {
    if (($handle = fopen($filePath, 'r')) !== false) {
        while (($data = fgetcsv($handle, 2000, ',')) !== false) {
            if (!$headers) {
                $headers = array_map(
                    fn($h) => strtolower(trim(preg_replace('/\xEF\xBB\xBF/', '', $h))),
                    $data
                );
                continue;
            }
            if (!array_filter($data)) continue;
            $rows[] = array_combine($headers, array_map('trim', $data));
        }
        fclose($handle);
    }
}

// ---------------- EXCEL ----------------
elseif (in_array(strtolower($fileType), ['xls','xlsx'])) {
    $spreadsheet = IOFactory::load($filePath);
    $sheet = $spreadsheet->getActiveSheet();
    foreach ($sheet->getRowIterator() as $rowIndex => $row) {
        $cellIterator = $row->getCellIterator();
        $cellIterator->setIterateOnlyExistingCells(false);
        $data = [];
        foreach ($cellIterator as $cell) {
            $data[] = $cell->getValue();
        }

        if ($rowIndex === 1) { // Header row
            $headers = array_map(
                fn($h) => strtolower(trim($h)),
                $data
            );
            continue;
        }

        if (!array_filter($data)) continue; // skip empty rows
        $rows[] = array_combine($headers, array_map('trim', $data));
    }
}

// ---------------- VALIDATION ----------------
if (!$rows) {
    echo json_encode(['success'=>false,'message'=>'Uploaded file has no data']);
    exit();
}


// =========================================================
// STEP 5 — HEADER VALIDATION
$requiredHeaders = [
    'employee_no','first_name','last_name','work_email','phone',
    'gender','date_of_birth','hire_date',
    'department_id','position_id','structure_id'
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
function validateEmployeeRow(array $row, int $orgId, PDO $db, array $csvNos): array {
    $errors = [];

    foreach (['employee_no','first_name','last_name','work_email'] as $f) {
        if (empty($row[$f])) {
            $errors[] = [
                'field'=>$f,
                'code'=>'REQUIRED',
                'message'=>"$f is required"
            ];
        }
    }

    if (!empty($row['work_email']) &&
        !filter_var($row['work_email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = [
            'field'=>'work_email',
            'code'=>'INVALID_EMAIL',
            'message'=>'Invalid email format'
        ];
    }

    if (!in_array($row['gender'], ['Male','Female','Other'], true)) {
        $errors[] = [
            'field'=>'gender',
            'code'=>'INVALID_VALUE',
            'message'=>'Gender must be Male, Female, or Other'
        ];
    }

    foreach (['date_of_birth','hire_date'] as $d) {
        if (!DateTime::createFromFormat('m-d-Y', $row[$d])) {
            $errors[] = [
                'field'=>$d,
                'code'=>'INVALID_DATE',
                'message'=>'Date must be in MM-DD-YYYY format'
            ];
        }
    }

    if (count(array_keys($csvNos, $row['employee_no'])) > 1) {
        $errors[] = [
            'field'=>'employee_no',
            'code'=>'DUPLICATE_CSV',
            'message'=>'Duplicate employee number in CSV'
        ];
    }

    // Existing employee
    $stmt = $db->prepare("
        SELECT id FROM employees
        WHERE employee_no=:e AND organization_id=:o
    ");
    $stmt->execute([':e'=>$row['employee_no'], ':o'=>$orgId]);
    if ($stmt->fetch()) {
        $errors[] = [
            'field'=>'employee_no',
            'code'=>'EXISTS',
            'message'=>'Employee number already exists'
        ];
    }

    // Department
    $stmt = $db->prepare("
        SELECT id FROM departments
        WHERE id=:id AND organization_id=:o
    ");
    $stmt->execute([':id'=>$row['department_id'], ':o'=>$orgId]);
    if (!$stmt->fetch()) {
        $errors[] = [
            'field'=>'department_id',
            'code'=>'INVALID_FK',
            'message'=>'Invalid department'
        ];
    }

    // Position
    $stmt = $db->prepare("SELECT id FROM positions WHERE id=:id");
    $stmt->execute([':id'=>$row['position_id']]);
    if (!$stmt->fetch()) {
        $errors[] = [
            'field'=>'position_id',
            'code'=>'INVALID_FK',
            'message'=>'Invalid position'
        ];
    }

    // Salary structure
    $stmt = $db->prepare("
        SELECT id FROM salary_structures
        WHERE id=:id AND organization_id=:o AND status='active'
    ");
    $stmt->execute([':id'=>$row['structure_id'], ':o'=>$orgId]);
    if (!$stmt->fetch()) {
        $errors[] = [
            'field'=>'structure_id',
            'code'=>'INVALID_FK',
            'message'=>'Invalid or inactive salary structure'
        ];
    }

    return $errors;
}

// =========================================================
// STEP 8 — PREVIEW (NOW VALIDATES)
if ($mode === 'preview') {
    $csvNos = array_column($rows, 'employee_no');
    $preview = [];

    foreach (array_slice($rows, 0, 10) as $i => $row) {
        $errors = validateEmployeeRow($row, $organization_id, $db, $csvNos);

        $preview[] = array_merge($row, [
            'row' => $i + 2,
            'is_valid' => empty($errors),
            'errors' => $errors
        ]);
    }

    echo json_encode([
        'success'=>true,
        'preview'=>$preview,
        'total_rows'=>count($rows),
        'has_errors'=>array_filter($preview, fn($r)=>!$r['is_valid']) ? true : false
    ]);
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
            $failed[] = [
                'row'=>$i+2,
                'employee_no'=>$row['employee_no'],
                'errors'=>$errors
            ];
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

        $db->prepare("
            INSERT INTO employee_salary_structure
            (employee_id, structure_id, assigned_by, effective_from, is_active)
            VALUES (:e,:s,:b,CURDATE(),1)
        ")->execute([
            ':e'=>$employeeId,
            ':s'=>$row['structure_id'],
            ':b'=>$session['user_id']
        ]);

        $db->prepare("
            INSERT INTO employee_users (employee_id, username, password_hash)
            VALUES (:i,:u,:p)
        ")->execute([
            ':i'=>$employeeId,
            ':u'=>$row['work_email'],
            ':p'=>password_hash('Welcome@2025', PASSWORD_DEFAULT)
        ]);

        $inserted[] = $row['employee_no'];
    }

    if (count($inserted) === 0) {
        $db->rollBack();
        echo json_encode([
            'success'=>false,
            'message'=>'No employees were uploaded',
            'failed_rows'=>$failed
        ]);
        exit();
    }

    $db->commit();

} catch (Throwable $e) {
    $db->rollBack();
    echo json_encode([
        'success'=>false,
        'message'=>'Bulk upload failed',
        'error'=>$e->getMessage()
    ]);
    exit();
}

// =========================================================
// STEP 10 — RESPONSE
$status = count($failed) > 0 ? 'partial_success' : 'success';

echo json_encode([
    'success'=>$status === 'success',
    'status'=>$status,
    'summary'=>[
        'total'=>count($rows),
        'inserted'=>count($inserted),
        'failed'=>count($failed)
    ],
    'failed_rows'=>$failed
]);
