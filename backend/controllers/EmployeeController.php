<?php
// backend/controllers/EmployeeController.php

require_once __DIR__ . '/../models/Employee.php';

class EmployeeController
{
    private $db;
    private $employeeModel;

    public function __construct(PDO $database)
    {
        $this->db = $database;
        $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->employeeModel = new Employee($this->db);

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

    /* -------------------------
       Helper: basic validators
    ------------------------- */
    private function isValidEmail($email)
    {
        return $email === null || $email === '' ? true : filter_var($email, FILTER_VALIDATE_EMAIL);
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

    private function sanitizeStr($value)
    {
        if ($value === null) return null;
        return trim($value);
    }

    /* -------------------------
       Helper: uniqueness checks
    ------------------------- */
    private function existsByEmail($email, $excludeId = null)
    {
        if (empty($email)) return false;
        $sql = "SELECT id FROM employees WHERE (personal_email = :email OR work_email = :email)";
        if ($excludeId) $sql .= " AND id != :excludeId";
        $stmt = $this->db->prepare($sql);
        $params = [':email' => $email];
        if ($excludeId) $params[':excludeId'] = $excludeId;
        $stmt->execute($params);
        return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function existsByNationalId($nationalId, $excludeId = null)
    {
        if (empty($nationalId)) return false;
        $sql = "SELECT id FROM employees WHERE national_id = :nid";
        if ($excludeId) $sql .= " AND id != :excludeId";
        $stmt = $this->db->prepare($sql);
        $params = [':nid' => $nationalId];
        if ($excludeId) $params[':excludeId'] = $excludeId;
        $stmt->execute($params);
        return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
    }

    /* -------------------------
       Employee number generator
    ------------------------- */
    private function generateEmployeeNumber()
    {
        $year = date('Y');
        return 'EMP' . $year . strtoupper(substr(uniqid('', true), -6)) . rand(100, 999);
    }

    /* =====================================================
       LIST / INDEX EMPLOYEES (pagination & filters)
       GET params: page, limit, q, department_id, position_id, employment_status
    ===================================================== */
    public function index()
    {
        try {
            $page = max(1, intval($_GET['page'] ?? 1));
            $limit = max(1, min(100, intval($_GET['limit'] ?? 25)));
            $offset = ($page - 1) * $limit;

            $q = isset($_GET['q']) ? $this->sanitizeStr($_GET['q']) : null;
            $department_id = isset($_GET['department_id']) ? intval($_GET['department_id']) : null;
            $position_id = isset($_GET['position_id']) ? intval($_GET['position_id']) : null;
            $status = isset($_GET['employment_status']) ? $this->sanitizeStr($_GET['employment_status']) : 'active';

            $where = ["e.employment_status = :status"];
            $params = [':status' => $status];

            if ($department_id) { $where[] = "e.department_id = :department_id"; $params[':department_id'] = $department_id; }
            if ($position_id) { $where[] = "e.position_id = :position_id"; $params[':position_id'] = $position_id; }
            if ($q) { $where[] = "(e.first_name LIKE :q OR e.last_name LIKE :q OR e.employee_number LIKE :q OR e.national_id LIKE :q)"; $params[':q'] = "%$q%"; }

            $whereSql = implode(' AND ', $where);

            $countSql = "SELECT COUNT(*) as total FROM employees e
                         LEFT JOIN departments d ON e.department_id = d.id
                         LEFT JOIN positions p ON e.position_id = p.id
                         LEFT JOIN employees m ON e.manager_id = m.id
                         WHERE $whereSql";

            $stmtCount = $this->db->prepare($countSql);
            $stmtCount->execute($params);
            $total = (int)$stmtCount->fetch(PDO::FETCH_ASSOC)['total'];

            $sql = "SELECT e.*, d.name AS department_name, p.title AS position_title,
                           CONCAT(m.first_name, ' ', m.last_name) AS manager_name
                    FROM employees e
                    LEFT JOIN departments d ON e.department_id = d.id
                    LEFT JOIN positions p ON e.position_id = p.id
                    LEFT JOIN employees m ON e.manager_id = m.id
                    WHERE $whereSql
                    ORDER BY e.created_at DESC
                    LIMIT :limit OFFSET :offset";

            $stmt = $this->db->prepare($sql);
            foreach ($params as $k => $v) { $stmt->bindValue($k, $v); }
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();

            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $meta = ['total' => $total, 'page' => $page, 'limit' => $limit, 'pages' => ceil($total / $limit)];

            $this->respond(200, true, $rows, 'Employees retrieved', $meta);

        } catch (Exception $e) {
            error_log("EmployeeController@index error: " . $e->getMessage());
            $this->respond(500, false, null, 'Server error while retrieving employees');
        }
    }

    /* =====================================================
       SHOW SINGLE EMPLOYEE
    ===================================================== */
    public function show($id)
    {
        try {
            $id = intval($id);
            if ($id <= 0) return $this->respond(400, false, null, 'Invalid employee id');

            $this->employeeModel->id = $id;
            $employee = $this->employeeModel->readOne();

            if (!$employee) return $this->respond(404, false, null, 'Employee not found');

            $this->respond(200, true, $employee, 'Employee retrieved');
        } catch (Exception $e) {
            error_log("EmployeeController@show error: " . $e->getMessage());
            $this->respond(500, false, null, 'Server error while retrieving employee');
        }
    }

    /* =====================================================
       CREATE EMPLOYEE
    ===================================================== */
    public function create()
    {
        try {
            $payload = json_decode(file_get_contents('php://input'));
            if (!$payload) return $this->respond(400, false, null, 'Invalid or empty JSON body');

            // Basic validations
            $first_name = $this->sanitizeStr($payload->first_name ?? null);
            $last_name = $this->sanitizeStr($payload->last_name ?? null);
            $national_id = $this->sanitizeStr($payload->national_id ?? null);
            $kra_pin = $this->sanitizeStr($payload->kra_pin ?? null);

            if (empty($first_name) || empty($last_name)) return $this->respond(400, false, null, 'first_name and last_name are required');
            if (!$this->isValidEmail($payload->personal_email ?? null) || !$this->isValidEmail($payload->work_email ?? null)) return $this->respond(400, false, null, 'Invalid email format');
            if (isset($payload->date_of_birth) && !$this->isValidDate($payload->date_of_birth)) return $this->respond(400, false, null, 'Invalid date_of_birth, expected YYYY-MM-DD');

            // Duplicates
            if (!empty($payload->personal_email) && $this->existsByEmail($payload->personal_email)) return $this->respond(409, false, null, 'Personal email already exists');
            if (!empty($payload->work_email) && $this->existsByEmail($payload->work_email)) return $this->respond(409, false, null, 'Work email already exists');
            if (!empty($national_id) && $this->existsByNationalId($national_id)) return $this->respond(409, false, null, 'National ID already exists');

            // Map payload
            $this->employeeModel->employee_number = $payload->employee_number ?? $this->generateEmployeeNumber();
            $this->employeeModel->first_name = $first_name;
            $this->employeeModel->middle_name = $this->sanitizeStr($payload->middle_name ?? null);
            $this->employeeModel->last_name = $last_name;
            $this->employeeModel->national_id = $national_id;
            $this->employeeModel->kra_pin = $kra_pin;
            $this->employeeModel->shif_number = $this->sanitizeStr($payload->shif_number ?? null);
            $this->employeeModel->nssf_number = $this->sanitizeStr($payload->nssf_number ?? null);
            $this->employeeModel->date_of_birth = $payload->date_of_birth ?? null;
            $this->employeeModel->gender = $this->sanitizeStr($payload->gender ?? null);
            $this->employeeModel->phone_number = $this->sanitizeStr($payload->phone_number ?? null);
            $this->employeeModel->personal_email = $this->sanitizeStr($payload->personal_email ?? null);
            $this->employeeModel->work_email = $this->sanitizeStr($payload->work_email ?? null);
            $this->employeeModel->department_id = $payload->department_id ?? null;
            $this->employeeModel->position_id = $payload->position_id ?? null;
            $this->employeeModel->manager_id = $payload->manager_id ?? null;
            $this->employeeModel->employment_type = $this->sanitizeStr($payload->employment_type ?? 'permanent');
            $this->employeeModel->employment_status = 'active';
            $this->employeeModel->hire_date = $payload->hire_date ?? null;

            if ($this->employeeModel->create()) {
                $this->respond(201, true, null, 'Employee created successfully');
            } else {
                error_log('EmployeeController@create: failed. Payload: ' . json_encode($payload));
                $this->respond(500, false, null, 'Failed to create employee');
            }

        } catch (Exception $e) {
            error_log("EmployeeController@create error: " . $e->getMessage());
            $this->respond(500, false, null, 'Server error while creating employee');
        }
    }

    /* =====================================================
       UPDATE EMPLOYEE (partial allowed)
    ===================================================== */
    public function update($idFromRoute = null)
    {
        try {
            $payload = json_decode(file_get_contents('php://input'));
            if (!$payload) return $this->respond(400, false, null, 'Invalid or empty JSON body');

            $id = $idFromRoute ?? ($payload->id ?? null);
            if (!$id) return $this->respond(400, false, null, 'Employee id is required');
            $id = intval($id);

            $this->employeeModel->id = $id;
            $existing = $this->employeeModel->readOne();
            if (!$existing) return $this->respond(404, false, null, 'Employee not found');

            // Duplicates checks
            $newPersonalEmail = $this->sanitizeStr($payload->personal_email ?? $existing['personal_email'] ?? null);
            $newWorkEmail = $this->sanitizeStr($payload->work_email ?? $existing['work_email'] ?? null);
            $newNationalId = $this->sanitizeStr($payload->national_id ?? $existing['national_id'] ?? null);

            if (!$this->isValidEmail($newPersonalEmail) || !$this->isValidEmail($newWorkEmail)) return $this->respond(400, false, null, 'Invalid email format');
            if (isset($payload->date_of_birth) && !$this->isValidDate($payload->date_of_birth)) return $this->respond(400, false, null, 'Invalid date_of_birth');

            if (!empty($newPersonalEmail) && $this->existsByEmail($newPersonalEmail, $id)) return $this->respond(409, false, null, 'Personal email already in use');
            if (!empty($newWorkEmail) && $this->existsByEmail($newWorkEmail, $id)) return $this->respond(409, false, null, 'Work email already in use');
            if (!empty($newNationalId) && $this->existsByNationalId($newNationalId, $id)) return $this->respond(409, false, null, 'National ID already in use');

            // Map updates
            $fields = [
                'first_name','middle_name','last_name','national_id','kra_pin','shif_number','nssf_number',
                'date_of_birth','gender','phone_number','personal_email','work_email','department_id',
                'position_id','manager_id','employment_type','employment_status','hire_date'
            ];

            foreach ($fields as $f) {
                if (property_exists($this->employeeModel, $f)) {
                    $this->employeeModel->$f = $this->sanitizeStr($payload->$f ?? $existing[$f] ?? null);
                }
            }

            if ($this->employeeModel->update()) {
                $this->respond(200, true, null, 'Employee updated successfully');
            } else {
                error_log('EmployeeController@update failed. ID: ' . $id);
                $this->respond(500, false, null, 'Failed to update employee');
            }

        } catch (Exception $e) {
            error_log("EmployeeController@update error: " . $e->getMessage());
            $this->respond(500, false, null, 'Server error while updating employee');
        }
    }

    /* =====================================================
       SOFT DELETE (terminate) EMPLOYEE
    ===================================================== */
    public function delete($id)
    {
        try {
            $id = intval($id);
            if ($id <= 0) return $this->respond(400, false, null, 'Invalid employee id');

            $this->employeeModel->id = $id;
            $existing = $this->employeeModel->readOne();
            if (!$existing) return $this->respond(404, false, null, 'Employee not found');

            if ($this->employeeModel->delete()) {
                $this->respond(200, true, null, 'Employee terminated');
            } else {
                error_log("EmployeeController@delete: failed to terminate employee id $id");
                $this->respond(500, false, null, 'Failed to terminate employee');
            }
        } catch (Exception $e) {
            error_log("EmployeeController@delete error: " . $e->getMessage());
            $this->respond(500, false, null, 'Server error while terminating employee');
        }
    }

    /* =====================================================
       SEARCH EMPLOYEES
    ===================================================== */
    public function search()
    {
        $q = $this->sanitizeStr($_GET['q'] ?? '');
        if ($q === '') return $this->index();

        try {
            $page = max(1, intval($_GET['page'] ?? 1));
            $limit = max(1, min(100, intval($_GET['limit'] ?? 25)));
            $offset = ($page - 1) * $limit;

            $stmt = $this->employeeModel->search($q);
            $all = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $total = count($all);
            $pageRows = array_slice($all, $offset, $limit);

            $meta = ['total'=>$total,'page'=>$page,'limit'=>$limit,'pages'=>ceil($total/$limit)];

            $this->respond(200, true, $pageRows, 'Search results', $meta);
        } catch (Exception $e) {
            error_log("EmployeeController@search error: " . $e->getMessage());
            $this->respond(500, false, null, 'Server error while searching employees');
        }
    }

    /* =====================================================
       FULL EMPLOYEE DETAILS
       Includes documents, department, position, manager
    ===================================================== */
    public function fullDetails($employeeId)
    {
        try {
            $employeeId = intval($employeeId);
            if ($employeeId <= 0) return $this->respond(400, false, null, "Invalid employee id");

            $this->employeeModel->id = $employeeId;
            $employee = $this->employeeModel->readOne();

            if (!$employee) return $this->respond(404, false, null, "Employee not found");

            $data = [
                'id'=>$employee['id'],
                'employee_number'=>$employee['employee_number'],
                'full_name'=>trim($employee['first_name'].' '.($employee['middle_name']??'').' '.$employee['last_name']),
                'first_name'=>$employee['first_name'],
                'middle_name'=>$employee['middle_name'],
                'last_name'=>$employee['last_name'],
                'national_id'=>$employee['national_id'],
                'kra_pin'=>$employee['kra_pin'],
                'shif_number'=>$employee['shif_number'],
                'nssf_number'=>$employee['nssf_number'],
                'date_of_birth'=>$employee['date_of_birth'],
                'gender'=>$employee['gender'],
                'phone_number'=>$employee['phone_number'],
                'personal_email'=>$employee['personal_email'],
                'work_email'=>$employee['work_email'],
                'hire_date'=>$employee['hire_date'],
                'employment_type'=>$employee['employment_type'],
                'employment_status'=>$employee['employment_status'],
                'department'=>['id'=>$employee['department_id'],'name'=>$employee['department_name']??null],
                'position'=>['id'=>$employee['position_id'],'title'=>$employee['position_title']??null],
                'manager'=>['id'=>$employee['manager_id'],'full_name'=>$employee['manager_name']??null],
                'documents'=>[],
                'leave_balance'=>null,
                'attendance_summary'=>null
            ];

            // Fetch documents
            $stmtDocs = $this->db->prepare("SELECT id,type,filename,uploaded_at FROM employee_documents WHERE employee_id = :eid");
            $stmtDocs->execute([':eid'=>$employeeId]);
            $data['documents'] = $stmtDocs->fetchAll(PDO::FETCH_ASSOC);

            $this->respond(200,true,$data,"Employee full details retrieved successfully");

        } catch (Exception $e) {
            error_log("EmployeeController@fullDetails error: ".$e->getMessage());
            $this->respond(500,false,null,"Server error while fetching employee details");
        }
    }
}
