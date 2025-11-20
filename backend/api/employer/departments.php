<?php
/**
 * Departments API
 * Handles department CRUD operations
 * backend/api/employer/departments.php
 */

require_once '../../config/database_secure.php';
require_once '../../middleware/SecurityMiddleware.php';

// Apply security measures
SecurityMiddleware::handleCORS();
SecurityMiddleware::applySecurityHeaders();
SecurityMiddleware::checkRateLimit('departments', 100, 60);

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
 * GET - List all departments
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

        // Get departments with employee count
        $query = "SELECT
                    d.id, d.name, d.description, d.manager_id, d.is_active, d.created_at,
                    CONCAT(m.first_name, ' ', m.last_name) as manager_name,
                    COUNT(e.id) as employee_count
                  FROM departments d
                  LEFT JOIN employees m ON d.manager_id = m.id
                  LEFT JOIN employees e ON d.id = e.department_id AND e.employment_status = 'active'
                  WHERE d.organization_id = :organization_id
                  GROUP BY d.id
                  ORDER BY d.name";

        $stmt = $db->prepare($query);
        $stmt->execute([':organization_id' => $organization_id]);
        $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $departments
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to fetch departments',
            'error' => Database::getConfig('app.debug') ? $e->getMessage() : 'Database error'
        ]);
    }
}

/**
 * POST - Create department
 */
elseif ($request_method === 'POST') {
    try {
        $data = json_decode(file_get_contents("php://input"));

        // Validate required fields
        SecurityMiddleware::validateRequired((array)$data, ['name']);

        // Get employer's organization
        $org_query = "SELECT organization_id FROM employer_users WHERE id = :user_id";
        $org_stmt = $db->prepare($org_query);
        $org_stmt->execute([':user_id' => $user_id]);
        $org_data = $org_stmt->fetch(PDO::FETCH_ASSOC);
        $organization_id = $org_data['organization_id'];

        // Check if department name exists
        $check_query = "SELECT id FROM departments WHERE name = :name AND organization_id = :org_id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([':name' => $data->name, ':org_id' => $organization_id]);
        if ($check_stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Department name already exists']);
            exit();
        }

        // Insert department
        $insert_query = "INSERT INTO departments (
            organization_id, name, description, manager_id, is_active, created_at
        ) VALUES (
            :organization_id, :name, :description, :manager_id, 1, NOW()
        )";

        $insert_stmt = $db->prepare($insert_query);
        $insert_stmt->execute([
            ':organization_id' => $organization_id,
            ':name' => $data->name,
            ':description' => $data->description ?? null,
            ':manager_id' => $data->manager_id ?? null
        ]);

        $department_id = $db->lastInsertId();

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Department created successfully',
            'data' => [
                'id' => $department_id,
                'name' => $data->name
            ]
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to create department',
            'error' => Database::getConfig('app.debug') ? $e->getMessage() : 'Database error'
        ]);
    }
}

/**
 * PUT - Update department
 */
elseif ($request_method === 'PUT') {
    try {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Department ID required']);
            exit();
        }

        // Get employer's organization
        $org_query = "SELECT organization_id FROM employer_users WHERE id = :user_id";
        $org_stmt = $db->prepare($org_query);
        $org_stmt->execute([':user_id' => $user_id]);
        $org_data = $org_stmt->fetch(PDO::FETCH_ASSOC);
        $organization_id = $org_data['organization_id'];

        // Verify department belongs to organization
        $check_query = "SELECT id FROM departments WHERE id = :id AND organization_id = :org_id";
        $check_stmt = $db->prepare($check_query);
        $check_stmt->execute([':id' => $data->id, ':org_id' => $organization_id]);
        if (!$check_stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Department not found']);
            exit();
        }

        // Build update query
        $updates = [];
        $params = [':id' => $data->id];

        $updatable_fields = ['name', 'description', 'manager_id', 'is_active'];

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
        $update_query = "UPDATE departments SET " . implode(', ', $updates) . " WHERE id = :id";

        $stmt = $db->prepare($update_query);
        $stmt->execute($params);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Department updated successfully'
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to update department',
            'error' => Database::getConfig('app.debug') ? $e->getMessage() : 'Database error'
        ]);
    }
}

/**
 * DELETE - Delete department
 */
elseif ($request_method === 'DELETE') {
    try {
        $department_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

        if (!$department_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Department ID required']);
            exit();
        }

        // Get employer's organization
        $org_query = "SELECT organization_id FROM employer_users WHERE id = :user_id";
        $org_stmt = $db->prepare($org_query);
        $org_stmt->execute([':user_id' => $user_id]);
        $org_data = $org_stmt->fetch(PDO::FETCH_ASSOC);
        $organization_id = $org_data['organization_id'];

        // Check if department has employees
        $emp_check = "SELECT COUNT(*) as count FROM employees WHERE department_id = :dept_id AND employment_status = 'active'";
        $emp_stmt = $db->prepare($emp_check);
        $emp_stmt->execute([':dept_id' => $department_id]);
        $emp_count = $emp_stmt->fetch(PDO::FETCH_ASSOC)['count'];

        if ($emp_count > 0) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => "Cannot delete department with {$emp_count} active employees"
            ]);
            exit();
        }

        // Delete department
        $delete_query = "DELETE FROM departments WHERE id = :id AND organization_id = :org_id";
        $stmt = $db->prepare($delete_query);
        $stmt->execute([':id' => $department_id, ':org_id' => $organization_id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Department not found']);
            exit();
        }

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Department deleted successfully'
        ]);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete department',
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
