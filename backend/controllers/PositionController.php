<?php
namespace Backend\Controllers;

use Backend\Models\Position;
use Exception;
use PDO;

class PositionController
{
    private $position;

    public function __construct(PDO $db)
    {
        $this->position = new Position($db);
        header('Content-Type: application/json; charset=utf-8');
    }

    /**
     * Standard JSON response helper
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
     * GET /positions
     */
    public function index()
    {
        try {
            $stmt = $this->position->readAll();
            $positions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $meta = ['count' => count($positions)];
            $this->respond(200, true, $positions, 'Positions retrieved', $meta);
        } catch (Exception $e) {
            $this->respond(500, false, null, 'Server error retrieving positions');
        }
    }

    /**
     * GET /positions/{id}
     */
    public function show($id)
    {
        try {
            $id = intval($id);
            if ($id <= 0) $this->respond(400, false, null, 'Invalid position ID');

            $this->position->id = $id;
            $row = $this->position->readOne();

            if (!$row) {
                $this->respond(404, false, null, 'Position not found');
            }

            $this->respond(200, true, $row, 'Position retrieved');
        } catch (Exception $e) {
            $this->respond(500, false, null, 'Server error retrieving position');
        }
    }

    /**
     * GET /positions/department/{deptId}
     */
    public function getByDepartment($deptId)
    {
        try {
            $deptId = intval($deptId);
            if ($deptId <= 0) $this->respond(400, false, null, 'Invalid department ID');

            $stmt = $this->position->readByDepartment($deptId);
            $positions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $meta = ['count' => count($positions)];
            $this->respond(200, true, $positions, 'Positions retrieved for department', $meta);
        } catch (Exception $e) {
            $this->respond(500, false, null, 'Server error retrieving positions by department');
        }
    }

    /**
     * POST /positions
     */
    public function create()
    {
        try {
            $payload = json_decode(file_get_contents('php://input'));
            if (!$payload || empty(trim($payload->title ?? ''))) {
                $this->respond(400, false, null, 'Position title is required');
            }

            $this->position->title = trim($payload->title);
            $this->position->description = trim($payload->description ?? '');
            $this->position->department_id = intval($payload->department_id ?? 0) ?: null;

            if ($this->position->create()) {
                $this->respond(201, true, null, 'Position created successfully');
            } else {
                $this->respond(500, false, null, 'Failed to create position');
            }
        } catch (Exception $e) {
            $this->respond(500, false, null, 'Server error while creating position');
        }
    }

    /**
     * PUT /positions/{id}
     */
    public function update($id)
    {
        try {
            $id = intval($id);
            if ($id <= 0) $this->respond(400, false, null, 'Invalid position ID');

            $payload = json_decode(file_get_contents('php://input'));
            if (!$payload || empty(trim($payload->title ?? ''))) {
                $this->respond(400, false, null, 'Position title is required');
            }

            $this->position->id = $id;
            $this->position->title = trim($payload->title);
            $this->position->description = trim($payload->description ?? '');
            $this->position->department_id = intval($payload->department_id ?? 0) ?: null;

            if ($this->position->update()) {
                $this->respond(200, true, null, 'Position updated successfully');
            } else {
                $this->respond(500, false, null, 'Failed to update position');
            }
        } catch (Exception $e) {
            $this->respond(500, false, null, 'Server error while updating position');
        }
    }

    /**
     * DELETE /positions/{id}
     */
    public function delete($id)
    {
        try {
            $id = intval($id);
            if ($id <= 0) $this->respond(400, false, null, 'Invalid position ID');

            $this->position->id = $id;

            if ($this->position->delete()) {
                $this->respond(200, true, null, 'Position deleted successfully');
            } else {
                $this->respond(500, false, null, 'Failed to delete position');
            }
        } catch (Exception $e) {
            $this->respond(500, false, null, 'Server error while deleting position');
        }
    }
}
?>
