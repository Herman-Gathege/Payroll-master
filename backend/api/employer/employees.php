<?php
/**
 * Employer Employees API
 * Handles employee CRUD operations for employers
 */

require_once '../../config/database_secure.php';
require_once '../../middleware/SecurityMiddleware.php';

// Apply security measures
SecurityMiddleware::handleCORS();
SecurityMiddleware::applySecurityHeaders();

// Rate limiting
SecurityMiddleware::checkRateLimit('employees', 100, 60);

$database = new Database();
$db = $database->getConnection();

$request_method = $_SERVER["REQUEST_METHOD"];

// Verify authentication
$session = SecurityMiddleware::verifyToken();
$user_id = $session['user_id'];
$user_type = $session['user_type'];

// Only employers can access
if ($user_type !== 'employer') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit();
}

/**
 * GET - List all employees
 */
if ($request_method === 'GET') {
    try {
        // Get employer's organization
        $org_query = "SELECT organization_id FROM employer_users WHERE id = :user_id";
        $org_stmt = $db->prepare($org_query);
        $org_stmt->execute([':user_id' => $user_id]);
        $org_data = $org_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$org_data) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Organization not found']);
            exit();
        }

        $organization_id = $org_data['organization_id'];

        // Get query parameters
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 100) : 50;
        $offset = ($page - 1) * $limit;
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        $status = isset($_GET['status']) ? $_GET['status'] : 'active';
        $department_id = isset($_GET['department_id']) ? (int)$_GET['department_id'] : null;

        // Build query
        $where_conditions = ["e.organization_id = :organization_id"];
        $params = [':organization_id' => $organization_id];

        if ($search) {
            $where_conditions[] = "(e.first_name LIKE :search OR e.last_name LIKE :search OR e.employee_number LIKE :search OR e.work_email LIKE :search)";
            $params[':search'] = "%{$search}%";
        }

        if ($status) {
            $where_conditions[] = "e.employment_status = :status";
            $params[':status'] = $status;
        }

        if ($department_id) {
            $where_conditions[] = "e.department_id = :department_id";
            $params[':department_id'] = $department_id;
        }

        $where_clause = implode(' AND ', $where_conditions);

        // Get total count
        $count_query = "SELECT COUNT(*) as total FROM employees e WHERE {$where_clause}";
        $count_stmt = $db->prepare($count_query);
        $count_stmt->execute($params);
        $total = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // Get employees
        $query = "SELECT
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

        $stmt = $db->prepare($query);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format data
        foreach ($employees as &$employee) {
            $employee['full_name'] = trim($employee['first_name'] . ' ' . ($employee['middle_name'] ? $employee['middle_name'] . ' ' : '') . $employee['last_name']);
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $employees,
            'pagination' => [
                'total' => (int)$total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ]
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch employees',
            'error' => Database::getConfig('app.debug') ? $e->getMessage() : 'Database error'
        ]);
    }
}

/**
 * POST - Create new employee
 */
elseif ($request_method === 'POST') {
    try {
        $data = json_decode(file_get_contents("php://input"));

        // Validate required fields
        $required = ['employee_number', 'first_name', 'last_name', 'date_of_birth', 'gender', 'phone_number', 'work_email', 'date_hired', 'department_id', 'position_id'];
        SecurityMiddleware::validateRequired((array)$data, $required);

        // Validate email
        if (!SecurityMiddleware::validateEmail($data->work_email)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid email address']);
            exit();
        }

        // Get employer's organization
        $org_query = "SELECT organization_id FROM employer_users WHERE id = :user_id";
        $org_stmt = $db->prepare($org_query);
        $org_stmt->execute([':user_id' => $user_id]);
        $org_data = $org_stmt->fetch(PDO::FETCH_ASSOC);
        $organization_id = $org_data['organization_id'];

        // Check if employee number exists
        $check_query = "SELECT id FROM employees WHERE employee_number = :emp_num AND organization_id = :org_id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([':emp_num' => $data->employee_number, ':org_id' => $organization_id]);
        if ($check_stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Employee number already exists']);
            exit();
        }

        // Insert employee
        $insert_query = "INSERT INTO employees (
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
        )";

        $insert_stmt = $db->prepare($insert_query);
        $insert_stmt->execute([
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

        // Create employee user account if requested
        if (isset($data->create_user_account) && $data->create_user_account) {
            $username = strtolower(str_replace(' ', '.', $data->first_name . '.' . $data->last_name));
            $default_password = 'Welcome@' . date('Y');
            $password_hash = password_hash($default_password, PASSWORD_BCRYPT);

            $user_query = "INSERT INTO employee_users (
                employee_id, username, email, password_hash,
                is_active, force_password_change, created_at
            ) VALUES (
                :employee_id, :username, :email, :password_hash,
                1, 1, NOW()
            )";

            $user_stmt = $db->prepare($user_query);
            $user_stmt->execute([
                ':employee_id' => $employee_id,
                ':username' => $username,
                ':email' => $data->work_email,
                ':password_hash' => $password_hash
            ]);
        }

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Employee created successfully',
            'data' => [
                'id' => $employee_id,
                'employee_number' => $data->employee_number
            ]
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to create employee',
            'error' => Database::getConfig('app.debug') ? $e->getMessage() : 'Database error'
        ]);
    }
}

/**
 * PUT - Update employee
 */
elseif ($request_method === 'PUT') {
    try {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Employee ID required']);
            exit();
        }

        // Get employer's organization
        $org_query = "SELECT organization_id FROM employer_users WHERE id = :user_id";
        $org_stmt = $db->prepare($org_query);
        $org_stmt->execute([':user_id' => $user_id]);
        $org_data = $org_stmt->fetch(PDO::FETCH_ASSOC);
        $organization_id = $org_data['organization_id'];

        // Verify employee belongs to organization
        $check_query = "SELECT id FROM employees WHERE id = :id AND organization_id = :org_id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([':id' => $data->id, ':org_id' => $organization_id]);
        if (!$check_stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Employee not found']);
            exit();
        }

        // Build update query dynamically
        $updates = [];
        $params = [':id' => $data->id];

        $updatable_fields = [
            'first_name', 'middle_name', 'last_name', 'date_of_birth', 'gender',
            'phone_number', 'work_email', 'personal_email', 'id_number',
            'kra_pin', 'nssf_number', 'nhif_number', 'department_id', 'position_id',
            'employment_status', 'date_hired', 'date_terminated', 'salary'
        ];

        foreach ($updatable_fields as $field) {
            if (isset($data->$field)) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $data->$field;
            }
        }

        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'No fields to update']);
            exit();
        }

        $updates[] = "updated_at = NOW()";
        $update_query = "UPDATE employees SET " . implode(', ', $updates) . " WHERE id = :id";

        $stmt = $db->prepare($update_query);
        $stmt->execute($params);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Employee updated successfully'
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update employee',
            'error' => Database::getConfig('app.debug') ? $e->getMessage() : 'Database error'
        ]);
    }
}

/**
 * DELETE - Soft delete employee
 */
elseif ($request_method === 'DELETE') {
    try {
        $employee_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

        if (!$employee_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Employee ID required']);
            exit();
        }

        // Get employer's organization
        $org_query = "SELECT organization_id FROM employer_users WHERE id = :user_id";
        $org_stmt = $db->prepare($org_query);
        $org_stmt->execute([':user_id' => $user_id]);
        $org_data = $org_stmt->fetch(PDO::FETCH_ASSOC);
        $organization_id = $org_data['organization_id'];

        // Soft delete (set status to terminated)
        $delete_query = "UPDATE employees
                        SET employment_status = 'terminated',
                            date_terminated = NOW(),
                            updated_at = NOW()
                        WHERE id = :id AND organization_id = :org_id";

        $stmt = $db->prepare($delete_query);
        $stmt->execute([':id' => $employee_id, ':org_id' => $organization_id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Employee not found']);
            exit();
        }

        // Deactivate user account
        $user_query = "UPDATE employee_users SET is_active = 0 WHERE employee_id = :employee_id";
        $user_stmt = $db->prepare($user_query);
        $user_stmt->execute([':employee_id' => $employee_id]);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Employee deleted successfully'
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete employee',
            'error' => Database::getConfig('app.debug') ? $e->getMessage() : 'Database error'
        ]);
    }
}

/**
 * Invalid method
 */
else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
