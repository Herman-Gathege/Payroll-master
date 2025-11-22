<?php
// backend/controllers/LeaveController.php
namespace Backend\Controllers;

use Backend\Models\Leave;
use Exception;
use PDO;
use DateTime;

class LeaveController
{
    private $db;
    private $leaveModel;

    public function __construct(PDO $database)
    {
        $this->db = $database;
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->leaveModel = new Leave($this->db);

        // Always return JSON
        header('Content-Type: application/json; charset=utf-8');
    }

    /* -------------------------
       Helper: uniform JSON response
       ------------------------- */
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

    private function sanitizeStr($value)
    {
        return $value === null ? null : trim($value);
    }

    private function isValidDate($date)
    {
        if ($date === null || $date === '') return true;
        try {
            $d = new DateTime($date);
            return $d && $d->format('Y-m-d') === $d->format('Y-m-d');
        } catch (Exception $e) {
            return false;
        }
    }

    /* =====================================================
       LIST all leaves (with pagination & filters)
       GET params: page, limit, employee_id, status
       ===================================================== */
    public function index()
    {
        try {
            $page = max(1, intval($_GET['page'] ?? 1));
            $limit = max(1, min(100, intval($_GET['limit'] ?? 25)));
            $offset = ($page - 1) * $limit;

            $employee_id = isset($_GET['employee_id']) ? intval($_GET['employee_id']) : null;
            $status = isset($_GET['status']) ? $this->sanitizeStr($_GET['status']) : null;

            $stmt = $this->leaveModel->readAll($employee_id, $status, $limit, $offset);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $total = $this->leaveModel->countAll($employee_id, $status);

            $meta = [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ];

            $this->respond(200, true, $rows, 'Leaves retrieved successfully', $meta);
        } catch (Exception $e) {
            error_log("LeaveController@index error: " . $e->getMessage());
            $this->respond(500, false, null, 'Server error while retrieving leaves');
        }
    }

    /* =====================================================
       SHOW single leave
       ===================================================== */
    public function show($id)
    {
        try {
            $id = intval($id);
            if ($id <= 0) return $this->respond(400, false, null, 'Invalid leave id');

            $leave = $this->leaveModel->readOne($id);
            if (!$leave) return $this->respond(404, false, null, 'Leave not found');

            $this->respond(200, true, $leave, 'Leave retrieved successfully');
        } catch (Exception $e) {
            error_log("LeaveController@show error: " . $e->getMessage());
            $this->respond(500, false, null, 'Server error while retrieving leave');
        }
    }

    /* =====================================================
       CREATE leave request
       Expects JSON body
       ===================================================== */
    public function create()
    {
        try {
            $payload = json_decode(file_get_contents('php://input'));
            if (!$payload) return $this->respond(400, false, null, 'Invalid or empty JSON body');

            $employee_id = intval($payload->employee_id ?? 0);
            $start_date = $this->sanitizeStr($payload->start_date ?? null);
            $end_date = $this->sanitizeStr($payload->end_date ?? null);
            $type = $this->sanitizeStr($payload->type ?? null);
            $reason = $this->sanitizeStr($payload->reason ?? null);

            if ($employee_id <= 0 || !$start_date || !$end_date || !$type) {
                return $this->respond(400, false, null, 'Required fields missing: employee_id, start_date, end_date, type');
            }

            if (!$this->isValidDate($start_date) || !$this->isValidDate($end_date)) {
                return $this->respond(400, false, null, 'Invalid date format, expected YYYY-MM-DD');
            }

            $this->leaveModel->employee_id = $employee_id;
            $this->leaveModel->start_date = $start_date;
            $this->leaveModel->end_date = $end_date;
            $this->leaveModel->type = $type;
            $this->leaveModel->reason = $reason;
            $this->leaveModel->status = 'pending';

            if ($this->leaveModel->create()) {
                $this->respond(201, true, null, 'Leave request created successfully');
            } else {
                $this->respond(500, false, null, 'Failed to create leave request');
            }
        } catch (Exception $e) {
            error_log("LeaveController@create error: " . $e->getMessage());
            $this->respond(500, false, null, 'Server error while creating leave request');
        }
    }

    /* =====================================================
       UPDATE leave request (partial updates allowed)
       ===================================================== */
    public function update($id)
    {
        try {
            $id = intval($id);
            if ($id <= 0) return $this->respond(400, false, null, 'Invalid leave id');

            $payload = json_decode(file_get_contents('php://input'));
            if (!$payload) return $this->respond(400, false, null, 'Invalid or empty JSON body');

            $existing = $this->leaveModel->readOne($id);
            if (!$existing) return $this->respond(404, false, null, 'Leave not found');

            $this->leaveModel->start_date = $payload->start_date ?? $existing['start_date'];
            $this->leaveModel->end_date = $payload->end_date ?? $existing['end_date'];
            $this->leaveModel->type = $payload->type ?? $existing['type'];
            $this->leaveModel->reason = $payload->reason ?? $existing['reason'];
            $this->leaveModel->status = $payload->status ?? $existing['status'];

            if ($this->leaveModel->update($id)) {
                $this->respond(200, true, null, 'Leave request updated successfully');
            } else {
                $this->respond(500, false, null, 'Failed to update leave request');
            }
        } catch (Exception $e) {
            error_log("LeaveController@update error: " . $e->getMessage());
            $this->respond(500, false, null, 'Server error while updating leave request');
        }
    }

    /* =====================================================
       DELETE leave request
       ===================================================== */
    public function delete($id)
    {
        try {
            $id = intval($id);
            if ($id <= 0) return $this->respond(400, false, null, 'Invalid leave id');

            $existing = $this->leaveModel->readOne($id);
            if (!$existing) return $this->respond(404, false, null, 'Leave not found');

            if ($this->leaveModel->delete($id)) {
                $this->respond(200, true, null, 'Leave request deleted successfully');
            } else {
                $this->respond(500, false, null, 'Failed to delete leave request');
            }
        } catch (Exception $e) {
            error_log("LeaveController@delete error: " . $e->getMessage());
            $this->respond(500, false, null, 'Server error while deleting leave request');
        }
    }
}
?>
