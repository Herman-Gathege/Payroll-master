<?php
/**
 * backend/api/employer/employees.php
 * Rewritten: single-dispatch, organization-scoped employee CRUD + pagination/search.
 */

require_once '../../config/database_secure.php';
require_once '../../middleware/SecurityMiddleware.php';

// CORS + headers
SecurityMiddleware::handleCORS();
SecurityMiddleware::applySecurityHeaders();
SecurityMiddleware::checkRateLimit('employees', 100, 60);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$database = new Database();
$db = $database->getConnection();

// Authenticate
try {
    $session = SecurityMiddleware::verifyToken();
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit();
}

$user_id = $session['user_id'] ?? null;
$user_type = $session['user_type'] ?? null;

if ($user_type !== 'employer') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    // resolve organization id
    $org_stmt = $db->prepare("SELECT organization_id FROM employer_users WHERE id = :user_id");
    $org_stmt->execute([':user_id' => $user_id]);
    $org_data = $org_stmt->fetch(PDO::FETCH_ASSOC);
    if (!$org_data) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Organization not found']);
        exit();
    }
    $organization_id = (int)$org_data['organization_id'];

    if ($method === 'GET') {
        // support: /employees.php?id=123 or list with pagination/search
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        if ($id) {
            $q = "SELECT e.*, d.name as department_name, p.title as position_title, bc.name as bank_name
                  FROM employees e
                  LEFT JOIN departments d ON e.department_id = d.id
                  LEFT JOIN positions p ON e.position_id = p.id
                  LEFT JOIN bank_codes bc ON e.bank_code_id = bc.id
                  WHERE e.id = :id AND e.organization_id = :org_id
                  LIMIT 1";
            $stmt = $db->prepare($q);
            $stmt->execute([':id' => $id, ':org_id' => $organization_id]);
            $emp = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$emp) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Employee not found']);
                exit();
            }
            $emp['full_name'] = trim($emp['first_name'].' '.($emp['middle_name'] ? $emp['middle_name'].' ' : '').$emp['last_name']);
            echo json_encode(['success' => true, 'data' => $emp]);
            exit();
        }

        // list
        $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
        $limit = isset($_GET['limit']) ? min(100, (int)$_GET['limit']) : 50;
        $offset = ($page - 1) * $limit;
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';
        $status = isset($_GET['status']) ? $_GET['status'] : 'active';
        $department_id = isset($_GET['department_id']) ? (int)$_GET['department_id'] : null;

        $where = ["e.organization_id = :organization_id"];
        $params = [':organization_id' => $organization_id];

        if ($search !== '') {
            $where[] = "(e.first_name LIKE :search OR e.last_name LIKE :search OR e.employee_number LIKE :search OR e.work_email LIKE :search)";
            $params[':search'] = "%{$search}%";
        }
        if ($status) {
            $where[] = "e.employment_status = :status";
            $params[':status'] = $status;
        }
        if ($department_id) {
            $where[] = "e.department_id = :department_id";
            $params[':department_id'] = $department_id;
        }

        $where_clause = implode(' AND ', $where);

        $count_q = "SELECT COUNT(*) as total FROM employees e WHERE {$where_clause}";
        $count_stmt = $db->prepare($count_q);
        $count_stmt->execute($params);
        $total = (int)$count_stmt->fetch(PDO::FETCH_ASSOC)['total'];

        $q = "SELECT
                e.id, e.employee_number, e.first_name, e.middle_name, e.last_name,
                e.date_of_birth, e.gender, e.phone_number, e.work_email,
                e.employment_status, e.date_hired, e.date_terminated,
                e.profile_photo, e.created_at,
                d.name as department_name, d.id as department_id,
                p.title as position_title, p.id as position_id,
                bc.name as bank_name, e.bank_account_number
              FROM employees e
              LEFT JOIN departments d ON e.department_id = d.id
              LEFT JOIN positions p ON e.position_id = p.id
              LEFT JOIN bank_codes bc ON e.bank_code_id = bc.id
              WHERE {$where_clause}
              ORDER BY e.created_at DESC
              LIMIT :limit OFFSET :offset";
        $stmt = $db->prepare($q);
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($employees as &$e) {
            $e['full_name'] = trim($e['first_name'].' '.($e['middle_name'] ? $e['middle_name'].' ' : '').$e['last_name']);
        }
        echo json_encode([
            'success' => true,
            'data' => $employees,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => $limit ? ceil($total / $limit) : 0
            ]
        ]);
        exit();
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"));
        if (!is_object($data)) $data = json_decode('{}');

        // required fields
        $required = ['employee_number', 'first_name', 'last_name', 'date_of_birth', 'gender', 'phone_number', 'work_email', 'date_hired', 'department_id', 'position_id'];
        foreach ($required as $r) {
            if (empty($data->$r)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => "$r is required"]);
                exit();
            }
        }

        // validate duplicate employee_number
        $check = $db->prepare("SELECT id FROM employees WHERE employee_number = :emp_num AND organization_id = :org_id");
        $check->execute([':emp_num' => $data->employee_number, ':org_id' => $organization_id]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Employee number already exists']);
            exit();
        }

        $insert = $db->prepare("INSERT INTO employees (
            organization_id, employee_number, first_name, middle_name, last_name,
            date_of_birth, gender, phone_number, work_email, personal_email,
            id_number, kra_pin, nssf_number, nhif_number,
            department_id, position_id, employment_status, date_hired,
            salary, allowances, created_at
        ) VALUES (
            :organization_id, :employee_number, :first_name, :middle_name, :last_name,
            :date_of_birth, :gender, :phone_number, :work_email, :personal_email,
            :id_number, :kra_pin, :nssf_number, :nhif_number,
            :department_id, :position_id, 'active', :date_hired,
            :salary, :allowances, NOW()
        )");

        $insert->execute([
            ':organization_id' => $organization_id,
            ':employee_number' => $data->employee_number,
            ':first_name' => $data->first_name,
            ':middle_name' => $data->middle_name ?? null,
            ':last_name' => $data->last_name,
            ':date_of_birth' => $data->date_of_birth,
            ':gender' => $data->gender,
            ':phone_number' => $data->phone_number,
            ':work_email' => $data->work_email,
            ':personal_email' => $data->personal_email ?? null,
            ':id_number' => $data->id_number ?? null,
            ':kra_pin' => $data->kra_pin ?? null,
            ':nssf_number' => $data->nssf_number ?? null,
            ':nhif_number' => $data->nhif_number ?? null,
            ':department_id' => $data->department_id,
            ':position_id' => $data->position_id,
            ':date_hired' => $data->date_hired,
            ':salary' => $data->salary ?? 0,
            ':allowances' => isset($data->allowances) ? json_encode($data->allowances) : null
        ]);

        $employee_id = $db->lastInsertId();

        // optionally create employee user
        if (!empty($data->create_user_account)) {
            $username = strtolower(str_replace(' ', '.', $data->first_name . '.' . $data->last_name));
            $default_password = 'Welcome@' . date('Y');
            $password_hash = password_hash($default_password, PASSWORD_BCRYPT);
            $user_q = $db->prepare("INSERT INTO employee_users (employee_id, username, email, password_hash, is_active, force_password_change, created_at) VALUES (:employee_id, :username, :email, :password_hash, 1, 1, NOW())");
            $user_q->execute([
                ':employee_id' => $employee_id,
                ':username' => $username,
                ':email' => $data->work_email,
                ':password_hash' => $password_hash
            ]);
        }

        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Employee created successfully', 'data' => ['id' => $employee_id, 'employee_number' => $data->employee_number]]);
        exit();
    }

    if ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"));
        if (empty($data->id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Employee ID required']);
            exit();
        }
        $employee_id = (int)$data->id;

        $check = $db->prepare("SELECT id FROM employees WHERE id = :id AND organization_id = :org_id");
        $check->execute([':id' => $employee_id, ':org_id' => $organization_id]);
        if (!$check->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Employee not found']);
            exit();
        }

        $updatable = ['first_name','middle_name','last_name','date_of_birth','gender','phone_number','work_email','personal_email','id_number','kra_pin','nssf_number','nhif_number','department_id','position_id','employment_status','date_hired','date_terminated','salary'];
        $sets = [];
        $params = [':id' => $employee_id];
        foreach ($updatable as $f) {
            if (isset($data->$f)) {
                $sets[] = "$f = :$f";
                $params[":$f"] = $data->$f;
            }
        }
        if (empty($sets)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            exit();
        }
        $sets[] = "updated_at = NOW()";
        $sql = "UPDATE employees SET ".implode(', ', $sets)." WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);

        echo json_encode(['success' => true, 'message' => 'Employee updated successfully']);
        exit();
    }

    if ($method === 'DELETE') {
        $employee_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        if (!$employee_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Employee ID required']);
            exit();
        }

        $check = $db->prepare("SELECT id FROM employees WHERE id = :id AND organization_id = :org_id");
        $check->execute([':id' => $employee_id, ':org_id' => $organization_id]);
        if (!$check->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Employee not found']);
            exit();
        }

        $del = $db->prepare("UPDATE employees SET employment_status = 'terminated', date_terminated = NOW(), updated_at = NOW() WHERE id = :id AND organization_id = :org_id");
        $del->execute([':id' => $employee_id, ':org_id' => $organization_id]);

        // deactivate user account
        $ud = $db->prepare("UPDATE employee_users SET is_active = 0 WHERE employee_id = :employee_id");
        $ud->execute([':employee_id' => $employee_id]);

        echo json_encode(['success' => true, 'message' => 'Employee deleted successfully']);
        exit();
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();

} catch (PDOException $e) {
    http_response_code(500);
    $err = (defined('APP_DEBUG') && APP_DEBUG) ? $e->getMessage() : 'Database error';
    echo json_encode(['success' => false, 'message' => 'Server error', 'error' => $err]);
    exit();
}
?>
