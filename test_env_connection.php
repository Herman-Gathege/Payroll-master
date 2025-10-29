<?php
require_once 'backend/config/database.php';

echo "=================================================\n";
echo "Testing Database Connection with .env\n";
echo "=================================================\n\n";

try {
    $database = new Database();
    $conn = $database->getConnection();

    if ($conn) {
        echo "✅ Database connection successful!\n\n";

        echo "Connection Details:\n";
        echo "- Host: " . EnvLoader::get('DB_HOST', 'localhost') . "\n";
        echo "- Database: " . EnvLoader::get('DB_NAME', 'hr_management_system') . "\n";
        echo "- User: " . EnvLoader::get('DB_USER', 'root') . "\n";
        echo "- Charset: " . EnvLoader::get('DB_CHARSET', 'utf8mb4') . "\n\n";

        // Test a simple query
        $stmt = $conn->query("SELECT COUNT(*) as count FROM employees");
        $result = $stmt->fetch();
        echo "✅ Test query successful!\n";
        echo "- Employees in database: " . $result['count'] . "\n";
    } else {
        echo "❌ Connection failed\n";
    }
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=================================================\n";
?>
