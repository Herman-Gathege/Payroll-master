<?php
/**
 * Multi-Tenant Employee Onboarding Controller
 * 
 * Features:
 * - Complete organization isolation
 * - Atomic transactions (no race conditions)
 * - Automatic employee number generation per organization
 * - Employee user account creation
 * - Leave balance initialization
 * - Audit logging
 * - Scalable architecture
 */

require_once '../models/Employee.php';

class EmployeeOnboardingController {
    private $db;
    private $employee;
    private $organization_id;
    private $user_id;
    
    public function __construct($database, $organization_id = null, $user_id = null) {
        $this->db = $database;
        $this->employee = new Employee($this->db);
        $this->organization_id = $organization_id;
        $this->user_id = $user_id;
    }
    
    /**
     * Set organization context from authenticated user
     */
    public function setOrganizationContext($organization_id, $user_id) {
        $this->organization_id = $organization_id;
        $this->user_id = $user_id;
    }
    
    /**
     * Get all employees for current organization only
     * Complete isolation - no cross-organization data
     */
    public function getAllEmployees() {
        if (!$this->organization_id) {
            http_response_code(401);
            echo json_encode(array(
                "success" => false,
                "message" => "Organization context not set"
            ));
            return;
        }
        
        try {
            $query = "SELECT 
                        e.id, e.organization_id, e.employee_number,
                        e.first_name, e.middle_name, e.last_name,
                        e.national_id, e.kra_pin, e.shif_number, e.nssf_number,
                        e.phone_number, e.work_email, e.personal_email,
                        e.employment_type, e.employment_status, e.hire_date,
                        d.name as department_name, d.id as department_id,
                        p.title as position_title, p.id as position_id,
                        CONCAT(m.first_name, ' ', m.last_name) as manager_name
                      FROM employees e
                      LEFT JOIN departments d ON e.department_id = d.id
                      LEFT JOIN positions p ON e.position_id = p.id
                      LEFT JOIN employees m ON e.manager_id = m.id
                      WHERE e.organization_id = :organization_id
                      ORDER BY e.employee_number DESC";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(":organization_id", $this->organization_id);
            $stmt->execute();
            
            $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "data" => $employees,
                "count" => count($employees)
            ));
            
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Failed to fetch employees: " . $e->getMessage()
            ));
        }
    }
    
    /**
     * Generate unique employee number for organization
     * Format: ORG-YEAR-SEQUENCE (e.g., DEMO-2025-001)
     * Thread-safe using database transactions
     */
    private function generateEmployeeNumber() {
        try {
            // Start transaction for thread safety
            $this->db->beginTransaction();
            
            // Get organization code
            $org_query = "SELECT organization_code FROM organizations WHERE id = :org_id FOR UPDATE";
            $org_stmt = $this->db->prepare($org_query);
            $org_stmt->bindParam(":org_id", $this->organization_id);
            $org_stmt->execute();
            $org = $org_stmt->fetch(PDO::FETCH_ASSOC);
            $org_code = $org['organization_code'] ?? 'ORG';
            
            // Get last employee number for this organization this year
            $year = date('Y');
            $pattern = $org_code . '-' . $year . '-%';
            
            $query = "SELECT employee_number 
                      FROM employees 
                      WHERE organization_id = :org_id 
                      AND employee_number LIKE :pattern 
                      ORDER BY employee_number DESC 
                      LIMIT 1 FOR UPDATE";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(":org_id", $this->organization_id);
            $stmt->bindParam(":pattern", $pattern);
            $stmt->execute();
            
            $last_employee = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($last_employee) {
                // Extract sequence number and increment
                $parts = explode('-', $last_employee['employee_number']);
                $sequence = intval(end($parts)) + 1;
            } else {
                // First employee of the year for this organization
                $sequence = 1;
            }
            
            $employee_number = sprintf("%s-%s-%03d", $org_code, $year, $sequence);
            
            $this->db->commit();
            return $employee_number;
            
        } catch (PDOException $e) {
            $this->db->rollBack();
            throw new Exception("Failed to generate employee number: " . $e->getMessage());
        }
    }
    
    /**
     * Create employee with full onboarding
     * Atomic transaction ensures consistency
     */
    public function onboardEmployee($data) {
        if (!$this->organization_id) {
            http_response_code(401);
            echo json_encode(array(
                "success" => false,
                "message" => "Organization context not set"
            ));
            return;
        }
        
        // Validate required fields
        if (empty($data->first_name) || empty($data->last_name) || 
            empty($data->national_id) || empty($data->date_of_birth)) {
            http_response_code(400);
            echo json_encode(array(
                "success" => false,
                "message" => "Required fields missing: first_name, last_name, national_id, date_of_birth"
            ));
            return;
        }
        
        try {
            // Start atomic transaction
            $this->db->beginTransaction();
            
            // 1. Check for duplicate national_id within organization
            $check_query = "SELECT id FROM employees 
                           WHERE organization_id = :org_id 
                           AND national_id = :national_id";
            $check_stmt = $this->db->prepare($check_query);
            $check_stmt->execute([
                ':org_id' => $this->organization_id,
                ':national_id' => $data->national_id
            ]);
            
            if ($check_stmt->fetch()) {
                $this->db->rollBack();
                http_response_code(409);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Employee with this National ID already exists in your organization"
                ));
                return;
            }
            
            // 2. Generate employee number (thread-safe)
            $employee_number = $this->generateEmployeeNumber();
            
            // 3. Create employee record
            $insert_query = "INSERT INTO employees (
                organization_id, employee_number, first_name, middle_name, last_name,
                national_id, kra_pin, shif_number, nssf_number,
                date_of_birth, gender, phone_number, personal_email, work_email,
                postal_address, residential_address, county, sub_county,
                marital_status, nationality, passport_number,
                department_id, position_id, manager_id,
                employment_type, employment_status, hire_date,
                probation_end_date, contract_end_date
            ) VALUES (
                :organization_id, :employee_number, :first_name, :middle_name, :last_name,
                :national_id, :kra_pin, :shif_number, :nssf_number,
                :date_of_birth, :gender, :phone_number, :personal_email, :work_email,
                :postal_address, :residential_address, :county, :sub_county,
                :marital_status, :nationality, :passport_number,
                :department_id, :position_id, :manager_id,
                :employment_type, :employment_status, :hire_date,
                :probation_end_date, :contract_end_date
            )";
            
            $stmt = $this->db->prepare($insert_query);
            $stmt->execute([
                ':organization_id' => $this->organization_id,
                ':employee_number' => $employee_number,
                ':first_name' => $data->first_name,
                ':middle_name' => $data->middle_name ?? null,
                ':last_name' => $data->last_name,
                ':national_id' => $data->national_id,
                ':kra_pin' => $data->kra_pin ?? null,
                ':shif_number' => $data->shif_number ?? null,
                ':nssf_number' => $data->nssf_number ?? null,
                ':date_of_birth' => $data->date_of_birth,
                ':gender' => $data->gender,
                ':phone_number' => $data->phone_number,
                ':personal_email' => $data->personal_email ?? null,
                ':work_email' => $data->work_email ?? null,
                ':postal_address' => $data->postal_address ?? null,
                ':residential_address' => $data->residential_address ?? null,
                ':county' => $data->county ?? null,
                ':sub_county' => $data->sub_county ?? null,
                ':marital_status' => $data->marital_status ?? null,
                ':nationality' => $data->nationality ?? 'Kenyan',
                ':passport_number' => $data->passport_number ?? null,
                ':department_id' => $data->department_id ?? null,
                ':position_id' => $data->position_id ?? null,
                ':manager_id' => $data->manager_id ?? null,
                ':employment_type' => $data->employment_type,
                ':employment_status' => 'active',
                ':hire_date' => $data->hire_date,
                ':probation_end_date' => $data->probation_end_date ?? null,
                ':contract_end_date' => $data->contract_end_date ?? null
            ]);
            
            $employee_id = $this->db->lastInsertId();
            
            // 4. Create employee user account (if create_login = true)
            $username = null;
            $default_password = null;
            
            if (isset($data->create_login) && $data->create_login === true) {
                $username = $data->username ?? strtolower(str_replace(' ', '.', $data->first_name . '.' . $data->last_name));
                $default_password = $data->password ?? 'Welcome@2025!';
                $password_hash = password_hash($default_password, PASSWORD_BCRYPT);
                
                $user_query = "INSERT INTO employee_users (
                    employee_id, username, password_hash, role, is_active
                ) VALUES (
                    :employee_id, :username, :password_hash, 'employee', 1
                )";
                
                $user_stmt = $this->db->prepare($user_query);
                $user_stmt->execute([
                    ':employee_id' => $employee_id,
                    ':username' => $username,
                    ':password_hash' => $password_hash
                ]);
                
                // 4b. Send welcome email if email provided
                $employee_email = $data->work_email ?? $data->personal_email;
                if ($employee_email && isset($data->send_email) && $data->send_email === true) {
                    try {
                        require_once __DIR__ . '/../utils/EmailService.php';
                        
                        // Get organization name
                        $org_query = "SELECT organization_name FROM organizations WHERE id = :org_id";
                        $org_stmt = $this->db->prepare($org_query);
                        $org_stmt->execute([':org_id' => $this->organization_id]);
                        $org_data = $org_stmt->fetch(PDO::FETCH_ASSOC);
                        $org_name = $org_data['organization_name'] ?? 'Your Organization';
                        
                        $emailService = new EmailService();
                        $emailService->sendEmployeeOnboardingEmail(
                            $employee_email,
                            $data->first_name . ' ' . $data->last_name,
                            $employee_number,
                            $username,
                            $default_password,
                            $org_name
                        );
                    } catch (Exception $e) {
                        // Log error but don't fail the onboarding
                        error_log("Failed to send onboarding email: " . $e->getMessage());
                    }
                }
            }
            
            // 5. Initialize leave balances for current year
            $year = date('Y');
            $leave_types_query = "SELECT id, code, days_per_year, gender_specific 
                                  FROM leave_types WHERE is_active = 1";
            $leave_types = $this->db->query($leave_types_query)->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($leave_types as $leave_type) {
                // Check if leave type is gender-specific
                if ($leave_type['gender_specific'] === 'all' || 
                    $leave_type['gender_specific'] === $data->gender) {
                    
                    $balance_query = "INSERT INTO leave_balances (
                        employee_id, leave_type_id, year, 
                        total_days, days_taken, days_pending, days_remaining
                    ) VALUES (
                        :employee_id, :leave_type_id, :year,
                        :total_days, 0, 0, :total_days
                    )";
                    
                    $balance_stmt = $this->db->prepare($balance_query);
                    $balance_stmt->execute([
                        ':employee_id' => $employee_id,
                        ':leave_type_id' => $leave_type['id'],
                        ':year' => $year,
                        ':total_days' => $leave_type['days_per_year']
                    ]);
                }
            }
            
            // 6. Create onboarding checklist
            $checklist_query = "INSERT INTO onboarding_checklists (
                employee_id, onboarding_status, assigned_to
            ) VALUES (
                :employee_id, 'pending', :assigned_to
            )";
            
            $checklist_stmt = $this->db->prepare($checklist_query);
            $checklist_stmt->execute([
                ':employee_id' => $employee_id,
                ':assigned_to' => $this->user_id
            ]);
            
            // 7. Log the onboarding in audit trail
            $audit_query = "INSERT INTO audit_log (
                user_id, user_type, action, table_name, record_id, 
                new_values, ip_address, user_agent
            ) VALUES (
                :user_id, 'employer', 'employee_onboarded', 'employees', :record_id,
                :new_values, :ip_address, :user_agent
            )";
            
            $audit_stmt = $this->db->prepare($audit_query);
            $audit_stmt->execute([
                ':user_id' => $this->user_id,
                ':record_id' => $employee_id,
                ':new_values' => json_encode([
                    'employee_number' => $employee_number,
                    'name' => $data->first_name . ' ' . $data->last_name,
                    'organization_id' => $this->organization_id
                ]),
                ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            ]);
            
            // Commit all changes atomically
            $this->db->commit();
            
            http_response_code(201);
            echo json_encode(array(
                "success" => true,
                "message" => "Employee onboarded successfully",
                "data" => array(
                    "employee_id" => $employee_id,
                    "employee_number" => $employee_number,
                    "username" => $username ?? null,
                    "default_password" => isset($data->create_login) && $data->create_login ? $default_password : null
                )
            ));
            
        } catch (Exception $e) {
            // Rollback on any error
            $this->db->rollBack();
            
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Failed to onboard employee: " . $e->getMessage()
            ));
        }
    }
    
    /**
     * Get employee by ID (organization-scoped)
     */
    public function getEmployee($id) {
        if (!$this->organization_id) {
            http_response_code(401);
            echo json_encode(array(
                "success" => false,
                "message" => "Organization context not set"
            ));
            return;
        }
        
        try {
            $query = "SELECT 
                        e.*, 
                        d.name as department_name,
                        p.title as position_title,
                        CONCAT(m.first_name, ' ', m.last_name) as manager_name
                      FROM employees e
                      LEFT JOIN departments d ON e.department_id = d.id
                      LEFT JOIN positions p ON e.position_id = p.id
                      LEFT JOIN employees m ON e.manager_id = m.id
                      WHERE e.id = :id AND e.organization_id = :organization_id";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                ':id' => $id,
                ':organization_id' => $this->organization_id
            ]);
            
            $employee = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($employee) {
                http_response_code(200);
                echo json_encode(array(
                    "success" => true,
                    "data" => $employee
                ));
            } else {
                http_response_code(404);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Employee not found in your organization"
                ));
            }
            
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Failed to fetch employee: " . $e->getMessage()
            ));
        }
    }
    
    /**
     * Update employee (organization-scoped)
     */
    public function updateEmployee($data) {
        if (!$this->organization_id || empty($data->id)) {
            http_response_code(400);
            echo json_encode(array(
                "success" => false,
                "message" => "Invalid request"
            ));
            return;
        }
        
        try {
            // Verify employee belongs to organization
            $check_query = "SELECT id FROM employees 
                           WHERE id = :id AND organization_id = :org_id";
            $check_stmt = $this->db->prepare($check_query);
            $check_stmt->execute([
                ':id' => $data->id,
                ':org_id' => $this->organization_id
            ]);
            
            if (!$check_stmt->fetch()) {
                http_response_code(404);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Employee not found in your organization"
                ));
                return;
            }
            
            $update_query = "UPDATE employees SET
                first_name = :first_name,
                middle_name = :middle_name,
                last_name = :last_name,
                kra_pin = :kra_pin,
                shif_number = :shif_number,
                nssf_number = :nssf_number,
                phone_number = :phone_number,
                personal_email = :personal_email,
                work_email = :work_email,
                department_id = :department_id,
                position_id = :position_id,
                manager_id = :manager_id,
                employment_status = :employment_status,
                updated_at = NOW()
            WHERE id = :id AND organization_id = :organization_id";
            
            $stmt = $this->db->prepare($update_query);
            $stmt->execute([
                ':id' => $data->id,
                ':organization_id' => $this->organization_id,
                ':first_name' => $data->first_name,
                ':middle_name' => $data->middle_name ?? null,
                ':last_name' => $data->last_name,
                ':kra_pin' => $data->kra_pin ?? null,
                ':shif_number' => $data->shif_number ?? null,
                ':nssf_number' => $data->nssf_number ?? null,
                ':phone_number' => $data->phone_number,
                ':personal_email' => $data->personal_email ?? null,
                ':work_email' => $data->work_email ?? null,
                ':department_id' => $data->department_id ?? null,
                ':position_id' => $data->position_id ?? null,
                ':manager_id' => $data->manager_id ?? null,
                ':employment_status' => $data->employment_status
            ]);
            
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Employee updated successfully"
            ));
            
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Failed to update employee: " . $e->getMessage()
            ));
        }
    }
    
    /**
     * Search employees within organization
     */
    public function searchEmployees($keywords) {
        if (!$this->organization_id) {
            http_response_code(401);
            echo json_encode(array(
                "success" => false,
                "message" => "Organization context not set"
            ));
            return;
        }
        
        try {
            $search = "%{$keywords}%";
            
            $query = "SELECT 
                        e.id, e.employee_number,
                        CONCAT(e.first_name, ' ', e.last_name) as full_name,
                        e.work_email, e.phone_number,
                        d.name as department_name,
                        p.title as position_title,
                        e.employment_status
                      FROM employees e
                      LEFT JOIN departments d ON e.department_id = d.id
                      LEFT JOIN positions p ON e.position_id = p.id
                      WHERE e.organization_id = :organization_id
                      AND (
                          e.first_name LIKE :search
                          OR e.last_name LIKE :search
                          OR e.employee_number LIKE :search
                          OR e.national_id LIKE :search
                          OR e.work_email LIKE :search
                      )
                      ORDER BY e.first_name, e.last_name
                      LIMIT 50";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                ':organization_id' => $this->organization_id,
                ':search' => $search
            ]);
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "data" => $results,
                "count" => count($results)
            ));
            
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(array(
                "success" => false,
                "message" => "Search failed: " . $e->getMessage()
            ));
        }
    }
}
?>
