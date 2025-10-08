<?php
// Test database connection and verify admin user
header("Content-Type: application/json");

require_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

$response = array();

if($db) {
    $response['database'] = 'Connected successfully';

    // Check if users table exists
    try {
        $query = "SELECT COUNT(*) as count FROM users";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $response['users_table'] = 'Exists with ' . $result['count'] . ' users';

        // Check for admin user
        $query = "SELECT id, username, email, role FROM users WHERE username = 'admin'";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if($admin) {
            $response['admin_user'] = 'Found';
            $response['admin_details'] = $admin;
        } else {
            $response['admin_user'] = 'NOT FOUND - Run create_admin_simple.sql';
        }

        // Test password verification
        $test_password = 'admin123';
        $stored_hash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

        if(password_verify($test_password, $stored_hash)) {
            $response['password_test'] = 'Password hash is correct for: admin123';
        } else {
            $response['password_test'] = 'Password hash verification FAILED';
        }

    } catch(PDOException $e) {
        $response['error'] = $e->getMessage();
    }
} else {
    $response['database'] = 'Connection failed';
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
