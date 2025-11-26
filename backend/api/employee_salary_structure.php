<?php
// backend/api/employee_salary_structure.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$database = new Database();
$db = $database->getConnection();

$auth = authenticateRequest();
if (!$auth['success']) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => $auth['message'] ?? 'Authentication required']);
    exit;
}
$user = $auth['user'];
$org_id = $user['organization_id'];
$user_id = $user['id'];

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // assign structure to employee
    $payload = json_decode(file_get_contents("php://input"), true);
    $employee_id = $payload['employee_id'] ?? null;
    $structure_id = $payload['structure_id'] ?? null;
    $effective_from = $payload['effective_from'] ?? null;
    $notes = $payload['notes'] ?? null;

    if (!$employee_id || !$structure_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'employee_id and structure_id required']);
        exit;
    }

    try {
        $db->beginTransaction();

        // check structure exists and belongs to org
        $st = $db->prepare("SELECT id FROM salary_structures WHERE id = :id AND organization_id = :org_id LIMIT 1");
        $st->execute([':id' => $structure_id, ':org_id' => $org_id]);
        if (!$st->fetch()) throw new Exception("Structure not found");

        // deactivate previous active assignment for that employee
        $db->prepare("UPDATE employee_salary_structure SET is_active = 0 WHERE employee_id = :eid AND is_active = 1")
           ->execute([':eid' => $employee_id]);

        // insert new assignment
        $ins = $db->prepare("INSERT INTO employee_salary_structure (employee_id, structure_id, assigned_by, effective_from, is_active, notes) VALUES (:employee_id, :structure_id, :assigned_by, :effective_from, 1, :notes)");
        $ins->execute([
            ':employee_id' => $employee_id,
            ':structure_id' => $structure_id,
            ':assigned_by' => $user_id,
            ':effective_from' => $effective_from,
            ':notes' => $notes
        ]);

        $db->commit();
        echo json_encode(['success' => true, 'message' => 'Structure assigned', 'data' => ['assignment_id' => $db->lastInsertId()]]);
        exit;

    } catch (Exception $e) {
        $db->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Assign failed: ' . $e->getMessage()]);
        exit;
    }
}

if ($method === 'GET') {
    // GET ?employee_id=123 -> returns active assignment + structure details
    $employee_id = $_GET['employee_id'] ?? null;
    if (!$employee_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'employee_id required']);
        exit;
    }

    // get active assignment
    $q = "SELECT es.*, s.title, s.basic_salary, s.description FROM employee_salary_structure es
          LEFT JOIN salary_structures s ON s.id = es.structure_id
          WHERE es.employee_id = :eid AND es.is_active = 1 LIMIT 1";
    $stmt = $db->prepare($q);
    $stmt->execute([':eid' => $employee_id]);
    $assign = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$assign) {
        echo json_encode(['success' => true, 'data' => null, 'message' => 'No active salary structure assigned']);
        exit;
    }

    // fetch allowances + benefits
    $sid = $assign['structure_id'];
    $al = $db->prepare("SELECT id, name, amount, formula, taxable FROM salary_structure_allowances WHERE structure_id = :sid");
    $al->execute([':sid' => $sid]);
    $assign['allowances'] = $al->fetchAll(PDO::FETCH_ASSOC);

    $bt = $db->prepare("SELECT id, name, amount, benefit_type, taxable, notes FROM salary_structure_benefits WHERE structure_id = :sid");
    $bt->execute([':sid' => $sid]);
    $assign['benefits'] = $bt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $assign]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']);
