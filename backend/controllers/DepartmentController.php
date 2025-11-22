<?php
// backend/controllers/DepartmentController.php
namespace Backend\Controllers;

use Backend\Models\Department;
use Exception;
use PDO;

class DepartmentController
{
    private $department;

    public function __construct(PDO $db)
    {
        $this->department = new Department($db);
        header('Content-Type: application/json; charset=utf-8');
    }

    /**
     * Standardized JSON response
     */
    private function respond(int $statusCode, bool $success, $data = null, string $message = '', array $meta = [])
    {
        http_response_code($statusCode);
        $payload = [
            'success' => $success,
            'message' => $message,
        ];
        if ($data !== null) $payload['data'] = $data;
        if (!empty($meta)) $payload['meta'] = $meta;
        echo json_encode($payload);
        exit;
    }

    /**
     * GET /departments
     * Fetch all departments
     */
    public function index()
    {
        try {
            $stmt = $this->department->readAll();
            $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $meta = ['count' => count($departments)];
            $this->respond(200, true, $departments, 'Departments retrieved', $meta);
        } catch (Exception $e) {
            $this->respond(500, false, null, 'Server error retrieving departments');
        }
    }

    /**
     * GET /departments/{id}
     * Fetch single department
     */
    public function show($id)
    {
        try {
            $id = intval($id);
            if ($id <= 0) $this->respond(400, false, null, 'Invalid department ID');

            $this->department->id = $id;
            $row = $this->department->readOne();

            if (!$row) {
                $this->respond(404, false, null, 'Department not found');
            }

            $this->respond(200, true, $row, 'Department retrieved');
        } catch (Exception $e) {
            $this->respond(500, false, null, 'Server error retrieving department');
        }
    }

    /**
     * POST /departments
     * Create a new department
     */
    public function create()
    {
        try {
            $payload = json_decode(file_get_contents('php://input'));
            if (!$payload || empty(trim($payload->name ?? ''))) {
                $this->respond(400, false, null, 'Department name is required');
            }

            $this->department->name = trim($payload->name);
            $this->department->description = trim($payload->description ?? '');

            if ($this->department->create()) {
                $this->respond(201, true, null, 'Department created successfully');
            } else {
                $this->respond(500, false, null, 'Failed to create department');
            }
        } catch (Exception $e) {
            $this->respond(500, false, null, 'Server error while creating department');
        }
    }

    /**
     * PUT /departments/{id}
     * Update an existing department
     */
    public function update($id)
    {
        try {
            $id = intval($id);
            if ($id <= 0) $this->respond(400, false, null, 'Invalid department ID');

            $payload = json_decode(file_get_contents('php://input'));
            if (!$payload || empty(trim($payload->name ?? ''))) {
                $this->respond(400, false, null, 'Department name is required');
            }

            $this->department->id = $id;
            $this->department->name = trim($payload->name);
            $this->department->description = trim($payload->description ?? '');

            if ($this->department->update()) {
                $this->respond(200, true, null, 'Department updated successfully');
            } else {
                $this->respond(500, false, null, 'Failed to update department');
            }
        } catch (Exception $e) {
            $this->respond(500, false, null, 'Server error while updating department');
        }
    }

    /**
     * DELETE /departments/{id}
     * Delete a department
     */
    public function delete($id)
    {
        try {
            $id = intval($id);
            if ($id <= 0) $this->respond(400, false, null, 'Invalid department ID');

            $this->department->id = $id;

            if ($this->department->delete()) {
                $this->respond(200, true, null, 'Department deleted successfully');
            } else {
                $this->respond(500, false, null, 'Failed to delete department');
            }
        } catch (Exception $e) {
            $this->respond(500, false, null, 'Server error while deleting department');
        }
    }
}
?>
