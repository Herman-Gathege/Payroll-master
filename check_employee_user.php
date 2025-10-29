<?php
require_once 'backend/config/database.php';

$database = new Database();
$db = $database->getConnection();

echo "=================================================\n";
echo "Employee User Accounts\n";
echo "=================================================\n\n";

$query = "SELECT
            eu.id,
            eu.username,
            eu.email,
            eu.is_active,
            e.employee_number,
            e.first_name,
            e.last_name
          FROM employee_users eu
          LEFT JOIN employees e ON eu.employee_id = e.id";

$stmt = $db->query($query);
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($users)) {
    echo "No employee users found.\n";
} else {
    foreach ($users as $user) {
        echo "ID: {$user['id']}\n";
        echo "Username: {$user['username']}\n";
        echo "Email: {$user['email']}\n";
        echo "Employee: {$user['first_name']} {$user['last_name']} ({$user['employee_number']})\n";
        echo "Active: " . ($user['is_active'] ? 'Yes' : 'No') . "\n";
        echo "---\n";
    }
}

echo "\n=================================================\n";
echo "Login Credentials:\n";
echo "=================================================\n";
echo "Username: john.doe\n";
echo "Password: Employee@2025!\n";
echo "Login URL: http://localhost:5173/employee/login\n";
echo "=================================================\n";
?>
