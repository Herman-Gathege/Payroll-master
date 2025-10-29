<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Get single leave request
                $id = $_GET['id'];
                $query = "SELECT l.*, e.full_name as employee_name, e.employee_number,
                          e.department_name, e.position_title
                          FROM leave_requests l
                          INNER JOIN employees e ON l.employee_id = e.id
                          WHERE l.id = :id";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':id', $id);
                $stmt->execute();
                $record = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($record) {
                    echo json_encode([
                        'success' => true,
                        'record' => $record
                    ]);
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => 'Leave request not found'
                    ]);
                }
            } elseif (isset($_GET['employee_id'])) {
                // Get leave requests by employee
                $employee_id = $_GET['employee_id'];
                $query = "SELECT l.*, e.full_name as employee_name, e.employee_number
                          FROM leave_requests l
                          INNER JOIN employees e ON l.employee_id = e.id
                          WHERE l.employee_id = :employee_id
                          ORDER BY l.created_at DESC";
                $stmt = $db->prepare($query);
                $stmt->bindParam(':employee_id', $employee_id);
                $stmt->execute();
                $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'success' => true,
                    'records' => $records,
                    'count' => count($records)
                ]);
            } else {
                // Get all leave requests
                $query = "SELECT l.*, e.full_name as employee_name, e.employee_number,
                          e.department_name, e.position_title
                          FROM leave_requests l
                          INNER JOIN employees e ON l.employee_id = e.id
                          ORDER BY l.created_at DESC";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode([
                    'success' => true,
                    'records' => $records,
                    'count' => count($records)
                ]);
            }
            break;

        case 'POST':
            $data = json_decode(file_get_contents("php://input"), true);

            if (!isset($data['employee_id']) || !isset($data['leave_type']) ||
                !isset($data['start_date']) || !isset($data['end_date'])) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required fields'
                ]);
                exit();
            }

            $query = "INSERT INTO leave_requests
                      (employee_id, leave_type, start_date, end_date, days, reason, status, created_at)
                      VALUES
                      (:employee_id, :leave_type, :start_date, :end_date, :days, :reason, :status, NOW())";

            $stmt = $db->prepare($query);
            $stmt->bindParam(':employee_id', $data['employee_id']);
            $stmt->bindParam(':leave_type', $data['leave_type']);
            $stmt->bindParam(':start_date', $data['start_date']);
            $stmt->bindParam(':end_date', $data['end_date']);
            $stmt->bindParam(':days', $data['days']);
            $stmt->bindParam(':reason', $data['reason']);

            $status = isset($data['status']) ? $data['status'] : 'pending';
            $stmt->bindParam(':status', $status);

            if ($stmt->execute()) {
                $last_id = $db->lastInsertId();

                echo json_encode([
                    'success' => true,
                    'message' => 'Leave request created successfully',
                    'id' => $last_id
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to create leave request'
                ]);
            }
            break;

        case 'PUT':
            $data = json_decode(file_get_contents("php://input"), true);
            $id = $_GET['id'] ?? null;

            if (!$id) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Leave request ID is required'
                ]);
                exit();
            }

            // Build update query dynamically based on provided fields
            $fields = [];
            $params = [':id' => $id];

            if (isset($data['status'])) {
                $fields[] = "status = :status";
                $params[':status'] = $data['status'];
            }
            if (isset($data['leave_type'])) {
                $fields[] = "leave_type = :leave_type";
                $params[':leave_type'] = $data['leave_type'];
            }
            if (isset($data['start_date'])) {
                $fields[] = "start_date = :start_date";
                $params[':start_date'] = $data['start_date'];
            }
            if (isset($data['end_date'])) {
                $fields[] = "end_date = :end_date";
                $params[':end_date'] = $data['end_date'];
            }
            if (isset($data['days'])) {
                $fields[] = "days = :days";
                $params[':days'] = $data['days'];
            }
            if (isset($data['reason'])) {
                $fields[] = "reason = :reason";
                $params[':reason'] = $data['reason'];
            }

            if (empty($fields)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'No fields to update'
                ]);
                exit();
            }

            $fields[] = "updated_at = NOW()";
            $query = "UPDATE leave_requests SET " . implode(', ', $fields) . " WHERE id = :id";

            $stmt = $db->prepare($query);

            if ($stmt->execute($params)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Leave request updated successfully'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to update leave request'
                ]);
            }
            break;

        case 'DELETE':
            $id = $_GET['id'] ?? null;

            if (!$id) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Leave request ID is required'
                ]);
                exit();
            }

            $query = "DELETE FROM leave_requests WHERE id = :id";
            $stmt = $db->prepare($query);
            $stmt->bindParam(':id', $id);

            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Leave request deleted successfully'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Failed to delete leave request'
                ]);
            }
            break;

        default:
            echo json_encode([
                'success' => false,
                'message' => 'Method not allowed'
            ]);
            break;
    }
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
