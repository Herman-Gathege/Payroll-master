<?php
// backend/api/employee_salary_structure.php

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../middleware/SecurityMiddleware.php';



SecurityMiddleware::handleCORS();
SecurityMiddleware::applySecurityHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$database = new Database();
$db = $database->getConnection();

// authentication check
$auth = authenticateRequest();
if (!$auth['success']) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $auth['message'] ?? 'Authentication required'
    ]);
    exit;
}

$user = $auth['user'];
$org_id = $user['organization_id'];
$user_id = $user['id'];

$method = $_SERVER['REQUEST_METHOD'];

// ---------------------------------------------------------
// ASSIGN STRUCTURE TO EMPLOYEE
// ---------------------------------------------------------
if ($method === 'POST') {

    $payload = json_decode(file_get_contents("php://input"), true);

    $employee_id   = $payload['employee_id'] ?? null;
    $structure_id  = $payload['structure_id'] ?? null;
    $effective_from = $payload['effective_from'] ?? null;
    $notes          = $payload['notes'] ?? null;

    if (!$employee_id || !$structure_id) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'employee_id and structure_id are required'
        ]);
        exit;
    }

    try {
        $db->beginTransaction();

        // Ensure structure belongs to organization
        $check = $db->prepare("
            SELECT id 
            FROM salary_structures 
            WHERE id = :sid AND organization_id = :org 
            LIMIT 1
        ");
        $check->execute([
            ':sid' => $structure_id,
            ':org' => $org_id
        ]);

        if (!$check->fetch()) {
            throw new Exception("Salary structure not found or unauthorized");
        }

        // Deactivate old active assignment
        $db->prepare("
            UPDATE employee_salary_structure 
            SET is_active = 0 
            WHERE employee_id = :eid AND is_active = 1
        ")->execute([':eid' => $employee_id]);

        // Insert new assignment
        $stmt = $db->prepare("
            INSERT INTO employee_salary_structure 
                (employee_id, structure_id, assigned_by, effective_from, is_active, notes)
            VALUES
                (:eid, :sid, :uid, :eff, 1, :notes)
        ");

        $stmt->execute([
            ':eid'   => $employee_id,
            ':sid'   => $structure_id,
            ':uid'   => $user_id,
            ':eff'   => $effective_from,
            ':notes' => $notes
        ]);

        $assignment_id = $db->lastInsertId();
        $db->commit();

        echo json_encode([
            'success' => true,
            'message' => 'Salary structure assigned successfully',
            'assignment_id' => $assignment_id
        ]);
        exit;

    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Assignment failed: ' . $e->getMessage()
        ]);
        exit;
    }
}

// ---------------------------------------------------------
// GET ACTIVE SALARY STRUCTURE FOR EMPLOYEE
// ---------------------------------------------------------
if ($method === 'GET') {

    $employee_id = $_GET['employee_id'] ?? null;

    if (!$employee_id) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'employee_id is required'
        ]);
        exit;
    }

    // Fetch active assignment + structure details
    $stmt = $db->prepare("
        SELECT 
            es.id AS assignment_id,
            es.employee_id,
            es.structure_id,
            es.effective_from,
            es.notes,
            s.title,
            s.basic_salary,
            s.description
        FROM employee_salary_structure es
        LEFT JOIN salary_structures s ON s.id = es.structure_id
        WHERE es.employee_id = :eid 
        AND es.is_active = 1
        LIMIT 1
    ");
    $stmt->execute([':eid' => $employee_id]);

    $assign = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$assign) {
        echo json_encode([
            'success' => true,
            'data' => null,
            'message' => 'No active salary structure assigned'
        ]);
        exit;
    }

    // Fetch allowances
    $al = $db->prepare("
        SELECT id, name, amount, formula, taxable 
        FROM salary_structure_allowances 
        WHERE structure_id = :sid
    ");
    $al->execute([':sid' => $assign['structure_id']]);
    $assign['allowances'] = $al->fetchAll(PDO::FETCH_ASSOC);

    // Fetch benefits
    $bt = $db->prepare("
        SELECT id, name, amount, benefit_type, taxable, notes 
        FROM salary_structure_benefits 
        WHERE structure_id = :sid
    ");
    $bt->execute([':sid' => $assign['structure_id']]);
    $assign['benefits'] = $bt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $assign]);
    exit;
}

// ---------------------------------------------------------
// UPDATE ACTIVE ASSIGNMENT (CHANGE STRUCTURE ONLY)
// ---------------------------------------------------------
if ($method === 'PUT') {

    parse_str($_SERVER['QUERY_STRING'], $query);
    $assignment_id = $query['id'] ?? null;

    if (!$assignment_id) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Assignment ID is required'
        ]);
        exit;
    }

    $payload = json_decode(file_get_contents("php://input"), true);
    $structure_id = $payload['structure_id'] ?? null;

    if (!$structure_id) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'structure_id is required'
        ]);
        exit;
    }

    try {
        // Validate structure belongs to organization
        $check = $db->prepare("
            SELECT id FROM salary_structures
            WHERE id = :sid AND organization_id = :org
            LIMIT 1
        ");
        $check->execute([
            ':sid' => $structure_id,
            ':org' => $org_id
        ]);

        if (!$check->fetch()) {
            throw new Exception("Invalid or unauthorized structure");
        }

        // Update
        $stmt = $db->prepare("
            UPDATE employee_salary_structure
            SET structure_id = :sid
            WHERE id = :id
            LIMIT 1
        ");

        $stmt->execute([
            ':sid' => $structure_id,
            ':id'  => $assignment_id
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Salary assignment updated successfully'
        ]);
        exit;

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Update failed: ' . $e->getMessage()
        ]);
        exit;
    }
}


http_response_code(405);
echo json_encode([
    'success' => false,
    'message' => 'Method not allowed'
]);
