<?php
/**
 * Check existing users in the database
 */

require_once 'backend/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    echo "=== EMPLOYER USERS ===\n\n";
    $query = "SELECT id, username, email, role, is_active FROM employer_users ORDER BY id";
    $stmt = $db->query($query);
    $employers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($employers) > 0) {
        foreach ($employers as $user) {
            echo "ID: {$user['id']}\n";
            echo "Username: {$user['username']}\n";
            echo "Email: {$user['email']}\n";
            echo "Role: {$user['role']}\n";
            echo "Active: " . ($user['is_active'] ? 'Yes' : 'No') . "\n";
            echo "---\n";
        }
    } else {
        echo "No employer users found\n";
    }

    echo "\n=== EMPLOYEE USERS ===\n\n";
    $query = "SELECT eu.id, eu.username, eu.email, eu.is_active, e.employee_number, e.first_name, e.last_name
              FROM employee_users eu
              JOIN employees e ON eu.employee_id = e.id
              ORDER BY eu.id";
    $stmt = $db->query($query);
    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($employees) > 0) {
        foreach ($employees as $user) {
            echo "ID: {$user['id']}\n";
            echo "Username: {$user['username']}\n";
            echo "Email: {$user['email']}\n";
            echo "Employee #: {$user['employee_number']}\n";
            echo "Name: {$user['first_name']} {$user['last_name']}\n";
            echo "Active: " . ($user['is_active'] ? 'Yes' : 'No') . "\n";
            echo "---\n";
        }
    } else {
        echo "No employee users found\n";
    }

} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
