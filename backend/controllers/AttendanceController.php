<?php
// backend/controllers/AttendanceController.php
namespace Backend\Controllers;

use Backend\Models\Attendance;
use Exception;
use PDO;
use DateTime;

class AttendanceController
{
    private $db;
    private $attendanceModel;

    public function __construct(PDO $database)
    {
        $this->db = $database;
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->attendanceModel = new Attendance($this->db);

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

    private function isValidTime($time)
    {
        if ($time === null || $time === '') return true;
        return preg_match('/^(?:2[0-3]|[01][0-9]):[0-5][0-9](:[0-5][0-9])?$/', $time);
    }

    /* =====================================================
       LIST attendance records with pagination & filters
       GET params: page, limit, employee_id, date
       ===================================================== */
    public function index()
    {
        try {
            $page = max(1, intval($_GET['page'] ?? 1));
            $limit = max(1, min(100, intval($_GET['limit'] ?? 25)));
            $offset = ($page - 1) * $limit;

            $employee_id = isset($_GET['employee_id']) ? intval($_GET['employee_id']) : null;
            $date = isset($_GET['date']) ? $this->sanitizeStr($_GET['date']) : null;

            if ($date && !$this->isValidDate($date)) {
                return $this->respond(400, false, null, 'Invalid date format, expected YYYY-MM-DD');
            }

            $stmt = $this->attendanceModel->readAll($employee_id, $date, $limit, $offset);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $total = $this->attendanceModel->countAll($employee_id, $date);

            $meta = [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ];

            $this->respond(200, true, $rows, 'Attendance records retrieved', $meta);
        } catch (Exception $e) {
            error_log("AttendanceController@index error: " . $e->getMessage());
            $this->respond(500, false, null, 'Server error while retrieving attendance');
        }
    }

    /* =====================================================
       SHOW single attendance record
       ===================================================== */
    public function show($id)
    {
        try {
            $id = intval($id);
            if ($id <= 0) return $this->respond(400, false, null, 'Invalid attendance id');

            $record = $this->attendanceModel->readOne($id);
            if (!$record) return $this->respond(404, false, null, 'Attendance record not found');

            $this->respond(200, true, $record, 'Attendance record retrieved');
        } catch (Exception $e) {
            error_log("AttendanceController@show error: " . $e->getMessage());
            $this->respond(500, false, null, 'Server error while retrieving attendance');
        }
    }

    /* =====================================================
       CREATE attendance record
       Expects JSON body
       ===================================================== */
    public function create()
    {
        try {
            $payload = json_decode(file_get_contents('php://input'));
            if (!$payload) return $this->respond(400, false, null, 'Invalid or empty JSON body');

            $employee_id = intval($payload->employee_id ?? 0);
            $date = $this->sanitizeStr($payload->date ?? null);
            $check_in = $this->sanitizeStr($payload->check_in ?? null);
            $check_out = $this->sanitizeStr($payload->check_out ?? null);

            if ($employee_id <= 0 || !$date) {
                return $this->respond(400, false, null, 'employee_id and date are required');
            }

            if (!$this->isValidDate($date) || !$this->isValidTime($check_in) || ($check_out && !$this->isValidTime($check_out))) {
                return $this->respond(400, false, null, 'Invalid date or time format');
            }

            $this->attendanceModel->employee_id = $employee_id;
            $this->attendanceModel->date = $date;
            $this->attendanceModel->check_in = $check_in;
            $this->attendanceModel->check_out = $check_out;

            if ($this->attendanceModel->create()) {
                $this->respond(201, true, null, 'Attendance record created');
            } else {
                $this->respond(500, false, null, 'Failed to create attendance record');
            }
        } catch (Exception $e) {
            error_log("AttendanceController@create error: " . $e->getMessage());
            $this->respond(500, false, null, 'Server error while creating attendance record');
        }
    }

    /* =====================================================
       UPDATE attendance record (partial updates allowed)
       ===================================================== */
    public function update($id)
    {
        try {
            $id = intval($id);
            if ($id <= 0) return $this->respond(400, false, null, 'Invalid attendance id');

            $payload = json_decode(file_get_contents('php://input'));
            if (!$payload) return $this->respond(400, false, null, 'Invalid or empty JSON body');

            $existing = $this->attendanceModel->readOne($id);
            if (!$existing) return $this->respond(404, false, null, 'Attendance record not found');

            $this->attendanceModel->date = $payload->date ?? $existing['date'];
            $this->attendanceModel->check_in = $payload->check_in ?? $existing['check_in'];
            $this->attendanceModel->check_out = $payload->check_out ?? $existing['check_out'];

            if (!$this->isValidDate($this->attendanceModel->date) || !$this->isValidTime($this->attendanceModel->check_in) || ($this->attendanceModel->check_out && !$this->isValidTime($this->attendanceModel->check_out))) {
                return $this->respond(400, false, null, 'Invalid date or time format');
            }

            if ($this->attendanceModel->update($id)) {
                $this->respond(200, true, null, 'Attendance record updated');
            } else {
                $this->respond(500, false, null, 'Failed to update attendance record');
            }
        } catch (Exception $e) {
            error_log("AttendanceController@update error: " . $e->getMessage());
            $this->respond(500, false, null, 'Server error while updating attendance record');
        }
    }

    /* =====================================================
       DELETE attendance record
       ===================================================== */
    public function delete($id)
    {
        try {
            $id = intval($id);
            if ($id <= 0) return $this->respond(400, false, null, 'Invalid attendance id');

            $existing = $this->attendanceModel->readOne($id);
            if (!$existing) return $this->respond(404, false, null, 'Attendance record not found');

            if ($this->attendanceModel->delete($id)) {
                $this->respond(200, true, null, 'Attendance record deleted');
            } else {
                $this->respond(500, false, null, 'Failed to delete attendance record');
            }
        } catch (Exception $e) {
            error_log("AttendanceController@delete error: " . $e->getMessage());
            $this->respond(500, false, null, 'Server error while deleting attendance record');
        }
    }
}
?>
