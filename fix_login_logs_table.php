<?php
/**
 * Fix login_logs table schema to allow NULL user_id
 * Run this script to fix the login issue
 */

require_once 'backend/config/database.php';

echo "Fixing login_logs table...\n\n";

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        die("ERROR: Could not connect to database\n");
    }

    echo "Connected to database successfully\n";

    // Check current column definition
    echo "Checking current table structure...\n";
    $check_query = "SHOW COLUMNS FROM login_logs WHERE Field = 'user_id'";
    $stmt = $db->query($check_query);
    $column = $stmt->fetch(PDO::FETCH_ASSOC);

    echo "Current user_id column:\n";
    echo "  Type: " . $column['Type'] . "\n";
    echo "  Null: " . $column['Null'] . "\n";
    echo "  Key: " . $column['Key'] . "\n";
    echo "  Default: " . $column['Default'] . "\n\n";

    if ($column['Null'] === 'YES') {
        echo "✓ Column already allows NULL values. No changes needed.\n";
    } else {
        echo "Modifying user_id column to allow NULL...\n";

        // Alter the table
        $alter_query = "ALTER TABLE login_logs MODIFY COLUMN user_id INT NULL";
        $db->exec($alter_query);

        echo "✓ Successfully modified user_id column to allow NULL\n\n";

        // Verify the change
        $stmt = $db->query($check_query);
        $column = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "New column definition:\n";
        echo "  Type: " . $column['Type'] . "\n";
        echo "  Null: " . $column['Null'] . "\n\n";
    }

    echo "✓ Fix completed successfully!\n";
    echo "\nYou can now try logging in again.\n";

} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>
