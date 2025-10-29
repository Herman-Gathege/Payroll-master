<?php
/**
 * Create Employee User Account
 * Links an employee record to a user account for self-service portal access
 */

require_once 'backend/config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get the first active employee
$query = "SELECT id, employee_number, first_name, last_name, work_email, organization_id
          FROM employees
          WHERE employment_status = 'active'
          LIMIT 1";
$stmt = $db->query($query);
$employee = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$employee) {
    echo "No active employees found. Creating a sample employee first...\n";

    // Create a sample employee
    $insert_emp = "INSERT INTO employees (
        organization_id,
        employee_number,
        first_name,
        last_name,
        work_email,
        phone_number,
        employment_status,
        hire_date,
        created_at
    ) VALUES (
        1,
        'EMP001',
        'John',
        'Doe',
        'john.doe@company.com',
        '+254712345678',
        'active',
        '2024-01-15',
        NOW()
    )";

    $db->exec($insert_emp);
    $employee_id = $db->lastInsertId();

    $employee = [
        'id' => $employee_id,
        'employee_number' => 'EMP001',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'work_email' => 'john.doe@company.com',
        'organization_id' => 1
    ];

    echo "Created sample employee: {$employee['first_name']} {$employee['last_name']} (ID: {$employee['id']})\n";
} else {
    echo "Found employee: {$employee['first_name']} {$employee['last_name']} (ID: {$employee['id']})\n";
}

// Check if employee_users table exists
$check_table = "SHOW TABLES LIKE 'employee_users'";
$result = $db->query($check_table);

if ($result->rowCount() == 0) {
    echo "Creating employee_users table...\n";

    $create_table = "CREATE TABLE employee_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        organization_id INT NOT NULL,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('employee') DEFAULT 'employee',
        is_active TINYINT(1) DEFAULT 1,
        force_password_change TINYINT(1) DEFAULT 0,
        failed_login_attempts INT DEFAULT 0,
        locked_until DATETIME NULL,
        last_login DATETIME NULL,
        last_login_ip VARCHAR(45) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
        INDEX idx_username (username),
        INDEX idx_employee_id (employee_id)
    )";

    $db->exec($create_table);
    echo "✅ Created employee_users table\n";
}

// Create employee user account
$username = strtolower($employee['first_name']) . '.' . strtolower($employee['last_name']);
$password = 'Employee@2025!';
$password_hash = password_hash($password, PASSWORD_BCRYPT);

// Check if user already exists
$check_user = "SELECT id FROM employee_users WHERE employee_id = :employee_id";
$stmt = $db->prepare($check_user);
$stmt->execute([':employee_id' => $employee['id']]);

if ($stmt->rowCount() > 0) {
    echo "Employee user already exists for this employee.\n";
    echo "Updating password...\n";

    $update = "UPDATE employee_users
               SET password_hash = :password_hash,
                   username = :username,
                   updated_at = NOW()
               WHERE employee_id = :employee_id";
    $stmt = $db->prepare($update);
    $stmt->execute([
        ':password_hash' => $password_hash,
        ':username' => $username,
        ':employee_id' => $employee['id']
    ]);
} else {
    $insert_user = "INSERT INTO employee_users (
        employee_id,
        organization_id,
        username,
        email,
        password_hash,
        role,
        is_active
    ) VALUES (
        :employee_id,
        :organization_id,
        :username,
        :email,
        :password_hash,
        'employee',
        1
    )";

    $stmt = $db->prepare($insert_user);
    $stmt->execute([
        ':employee_id' => $employee['id'],
        ':organization_id' => $employee['organization_id'],
        ':username' => $username,
        ':email' => $employee['work_email'],
        ':password_hash' => $password_hash
    ]);
}

echo "\n=================================================\n";
echo "✅ Employee User Account Created Successfully!\n";
echo "=================================================\n\n";
echo "Employee: {$employee['first_name']} {$employee['last_name']}\n";
echo "Employee Number: {$employee['employee_number']}\n";
echo "Username: $username\n";
echo "Password: $password\n";
echo "\nLogin URL: http://localhost:5173/employee/login\n";
echo "=================================================\n";
?>
