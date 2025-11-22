<?php

class Employee
{
    private $conn;
    private $table_name = "employees";

    // All public model properties (same as yours)
    public $id;
    public $employee_number;
    public $first_name;
    public $middle_name;
    public $last_name;
    public $national_id;
    public $kra_pin;
    public $shif_number;
    public $nssf_number;
    public $date_of_birth;
    public $gender;
    public $phone_number;
    public $personal_email;
    public $work_email;
    public $department_id;
    public $position_id;
    public $manager_id;
    public $employment_type;
    public $employment_status;
    public $hire_date;

    public function __construct($db)
    {
        $this->conn = $db;
    }

    /* ====================================================
        CREATE EMPLOYEE
    ===================================================== */
    public function create()
    {
        $query = "INSERT INTO {$this->table_name}
                  (employee_number, first_name, middle_name, last_name,
                   national_id, kra_pin, shif_number, nssf_number,
                   date_of_birth, gender, phone_number,
                   personal_email, work_email, department_id,
                   position_id, manager_id, employment_type,
                   employment_status, hire_date)
                  VALUES
                  (:employee_number, :first_name, :middle_name, :last_name,
                   :national_id, :kra_pin, :shif_number, :nssf_number,
                   :date_of_birth, :gender, :phone_number,
                   :personal_email, :work_email, :department_id,
                   :position_id, :manager_id, :employment_type,
                   :employment_status, :hire_date)";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            ":employee_number" => $this->employee_number,
            ":first_name" => $this->first_name,
            ":middle_name" => $this->middle_name,
            ":last_name" => $this->last_name,
            ":national_id" => $this->national_id,
            ":kra_pin" => $this->kra_pin,
            ":shif_number" => $this->shif_number,
            ":nssf_number" => $this->nssf_number,
            ":date_of_birth" => $this->date_of_birth,
            ":gender" => $this->gender,
            ":phone_number" => $this->phone_number,
            ":personal_email" => $this->personal_email,
            ":work_email" => $this->work_email,
            ":department_id" => $this->department_id,
            ":position_id" => $this->position_id,
            ":manager_id" => $this->manager_id,
            ":employment_type" => $this->employment_type,
            ":employment_status" => $this->employment_status,
            ":hire_date" => $this->hire_date
        ]);
    }

    /* ====================================================
        READ ALL ACTIVE EMPLOYEES
    ===================================================== */
    public function read()
    {
        $query = "SELECT e.*, d.name AS department_name, p.title AS position_title,
                  CONCAT(m.first_name, ' ', m.last_name) AS manager_name
                  FROM {$this->table_name} e
                  LEFT JOIN departments d ON e.department_id = d.id
                  LEFT JOIN positions p ON e.position_id = p.id
                  LEFT JOIN employees m ON e.manager_id = m.id
                  WHERE e.employment_status = 'active'
                  ORDER BY e.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    /* ====================================================
        READ ONE EMPLOYEE
    ===================================================== */
    public function readOne()
    {
        $query = "SELECT e.*, d.name AS department_name, p.title AS position_title,
                  CONCAT(m.first_name, ' ', m.last_name) AS manager_name
                  FROM {$this->table_name} e
                  LEFT JOIN departments d ON e.department_id = d.id
                  LEFT JOIN positions p ON e.position_id = p.id
                  LEFT JOIN employees m ON e.manager_id = m.id
                  WHERE e.id = :id LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([":id" => $this->id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /* ====================================================
        UPDATE EMPLOYEE (ADMIN)
    ===================================================== */
    public function update()
    {
        $query = "UPDATE {$this->table_name}
                  SET first_name=:first_name, middle_name=:middle_name,
                      last_name=:last_name, national_id=:national_id,
                      kra_pin=:kra_pin, shif_number=:shif_number,
                      nssf_number=:nssf_number, date_of_birth=:date_of_birth,
                      gender=:gender, phone_number=:phone_number,
                      personal_email=:personal_email, work_email=:work_email,
                      department_id=:department_id, position_id=:position_id,
                      manager_id=:manager_id, employment_type=:employment_type,
                      employment_status=:employment_status,
                      updated_at=NOW()
                  WHERE id=:id";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            ":first_name" => $this->first_name,
            ":middle_name" => $this->middle_name,
            ":last_name" => $this->last_name,
            ":national_id" => $this->national_id,
            ":kra_pin" => $this->kra_pin,
            ":shif_number" => $this->shif_number,
            ":nssf_number" => $this->nssf_number,
            ":date_of_birth" => $this->date_of_birth,
            ":gender" => $this->gender,
            ":phone_number" => $this->phone_number,
            ":personal_email" => $this->personal_email,
            ":work_email" => $this->work_email,
            ":department_id" => $this->department_id,
            ":position_id" => $this->position_id,
            ":manager_id" => $this->manager_id,
            ":employment_type" => $this->employment_type,
            ":employment_status" => $this->employment_status,
            ":id" => $this->id
        ]);
    }

    /* ====================================================
        ESS — UPDATE LIMITED FIELDS
    ===================================================== */
    public function updateSelfService()
    {
        $query = "UPDATE {$this->table_name}
                  SET phone_number = :phone_number,
                      personal_email = :personal_email,
                      updated_at = NOW()
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            ":phone_number" => $this->phone_number,
            ":personal_email" => $this->personal_email,
            ":id" => $this->id
        ]);
    }

    /* ====================================================
        SOFT DELETE EMPLOYEE
    ===================================================== */
    public function delete()
    {
        $query = "UPDATE {$this->table_name}
                  SET employment_status='terminated',
                      termination_date = NOW(),
                      updated_at = NOW()
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([":id" => $this->id]);
    }

    /* ====================================================
        SEARCH EMPLOYEES
    ===================================================== */
    public function search($keywords)
    {
        $query = "SELECT e.*, d.name AS department_name, p.title AS position_title
                  FROM {$this->table_name} e
                  LEFT JOIN departments d ON e.department_id = d.id
                  LEFT JOIN positions p ON e.position_id = p.id
                  WHERE e.first_name LIKE :k
                     OR e.last_name LIKE :k
                     OR e.employee_number LIKE :k
                     OR e.national_id LIKE :k
                  ORDER BY e.created_at DESC";

        $stmt = $this->conn->prepare($query);

        $stmt->execute([":k" => "%$keywords%"]);

        return $stmt;
    }
}
