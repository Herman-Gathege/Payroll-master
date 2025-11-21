<?php

// backend/controllers/EmployeeController.php

require_once '../models/Employee.php';

class EmployeeController {
    private $db;
    private $employee;

    public function __construct($database) {
        $this->db = $database;
        $this->employee = new Employee($this->db);
    }

    public function getAllEmployees() {
        $stmt = $this->employee->read();
        $num = $stmt->rowCount();

        if($num > 0) {
            $employees_arr = array();
            $employees_arr["records"] = array();

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                $employee_item = array(
                    "id" => $id,
                    "employee_number" => $employee_number,
                    "first_name" => $first_name,
                    "middle_name" => $middle_name,
                    "last_name" => $last_name,
                    "full_name" => $first_name . ' ' . $last_name,
                    "national_id" => $national_id,
                    "kra_pin" => $kra_pin,
                    "shif_number" => $shif_number,
                    "nssf_number" => $nssf_number,
                    "phone_number" => $phone_number,
                    "work_email" => $work_email,
                    "department_name" => $department_name,
                    "position_title" => $position_title,
                    "employment_type" => $employment_type,
                    "employment_status" => $employment_status,
                    "hire_date" => $hire_date,
                    "manager_name" => $manager_name
                );
                array_push($employees_arr["records"], $employee_item);
            }

            http_response_code(200);
            echo json_encode($employees_arr);
        } else {
            http_response_code(200);
            echo json_encode(array("message" => "No employees found.", "records" => array()));
        }
    }

    public function getEmployee($id) {
        $this->employee->id = $id;
        $this->employee->readOne();

        if($this->employee->employee_number != null) {
            $employee_arr = array(
                "id" => $this->employee->id,
                "employee_number" => $this->employee->employee_number,
                "first_name" => $this->employee->first_name,
                "middle_name" => $this->employee->middle_name,
                "last_name" => $this->employee->last_name,
                "national_id" => $this->employee->national_id,
                "kra_pin" => $this->employee->kra_pin,
                "shif_number" => $this->employee->shif_number,
                "nssf_number" => $this->employee->nssf_number,
                "date_of_birth" => $this->employee->date_of_birth,
                "gender" => $this->employee->gender,
                "phone_number" => $this->employee->phone_number,
                "personal_email" => $this->employee->personal_email,
                "work_email" => $this->employee->work_email,
                "department_id" => $this->employee->department_id,
                "position_id" => $this->employee->position_id,
                "manager_id" => $this->employee->manager_id,
                "employment_type" => $this->employee->employment_type,
                "employment_status" => $this->employee->employment_status,
                "hire_date" => $this->employee->hire_date
            );

            http_response_code(200);
            echo json_encode($employee_arr);
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Employee does not exist."));
        }
    }

    public function createEmployee($data) {
        if(!empty($data->first_name) && !empty($data->last_name) &&
           !empty($data->national_id) && !empty($data->kra_pin)) {

            $this->employee->employee_number = $data->employee_number ?? $this->generateEmployeeNumber();
            $this->employee->first_name = $data->first_name;
            $this->employee->middle_name = $data->middle_name ?? null;
            $this->employee->last_name = $data->last_name;
            $this->employee->national_id = $data->national_id;
            $this->employee->kra_pin = $data->kra_pin;
            $this->employee->shif_number = $data->shif_number ?? null;
            $this->employee->nssf_number = $data->nssf_number ?? null;
            $this->employee->date_of_birth = $data->date_of_birth;
            $this->employee->gender = $data->gender;
            $this->employee->phone_number = $data->phone_number;
            $this->employee->personal_email = $data->personal_email ?? null;
            $this->employee->work_email = $data->work_email ?? null;
            $this->employee->department_id = $data->department_id ?? null;
            $this->employee->position_id = $data->position_id ?? null;
            $this->employee->manager_id = $data->manager_id ?? null;
            $this->employee->employment_type = $data->employment_type;
            $this->employee->employment_status = 'active';
            $this->employee->hire_date = $data->hire_date;

            if($this->employee->create()) {
                http_response_code(201);
                echo json_encode(array("message" => "Employee was created successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create employee."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to create employee. Data is incomplete."));
        }
    }

    public function updateEmployee($data) {
        if(!empty($data->id)) {
            $this->employee->id = $data->id;
            $this->employee->first_name = $data->first_name;
            $this->employee->middle_name = $data->middle_name ?? null;
            $this->employee->last_name = $data->last_name;
            $this->employee->national_id = $data->national_id;
            $this->employee->kra_pin = $data->kra_pin;
            $this->employee->shif_number = $data->shif_number ?? null;
            $this->employee->nssf_number = $data->nssf_number ?? null;
            $this->employee->date_of_birth = $data->date_of_birth;
            $this->employee->gender = $data->gender;
            $this->employee->phone_number = $data->phone_number;
            $this->employee->personal_email = $data->personal_email ?? null;
            $this->employee->work_email = $data->work_email ?? null;
            $this->employee->department_id = $data->department_id ?? null;
            $this->employee->position_id = $data->position_id ?? null;
            $this->employee->manager_id = $data->manager_id ?? null;
            $this->employee->employment_type = $data->employment_type;
            $this->employee->employment_status = $data->employment_status;

            if($this->employee->update()) {
                http_response_code(200);
                echo json_encode(array("message" => "Employee was updated."));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update employee."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Unable to update employee. Missing ID."));
        }
    }

    public function deleteEmployee($id) {
        $this->employee->id = $id;

        if($this->employee->delete()) {
            http_response_code(200);
            echo json_encode(array("message" => "Employee was terminated."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to terminate employee."));
        }
    }

    public function searchEmployees($keywords) {
        $stmt = $this->employee->search($keywords);
        $num = $stmt->rowCount();

        if($num > 0) {
            $employees_arr = array();
            $employees_arr["records"] = array();

            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                extract($row);
                $employee_item = array(
                    "id" => $id,
                    "employee_number" => $employee_number,
                    "full_name" => $first_name . ' ' . $last_name,
                    "department_name" => $department_name,
                    "position_title" => $position_title,
                    "phone_number" => $phone_number,
                    "work_email" => $work_email
                );
                array_push($employees_arr["records"], $employee_item);
            }

            http_response_code(200);
            echo json_encode($employees_arr);
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "No employees found."));
        }
    }

    private function generateEmployeeNumber() {
        $year = date('Y');
        $query = "SELECT COUNT(*) as count FROM employees WHERE YEAR(created_at) = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(1, $year);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $count = $row['count'] + 1;
        return 'EMP' . $year . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
?>
