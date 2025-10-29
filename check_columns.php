<?php
require 'backend/config/database.php';
$db = new Database();
$conn = $db->getConnection();

echo "Employees columns:\n";
$cols = $conn->query('SHOW COLUMNS FROM employees')->fetchAll(PDO::FETCH_COLUMN);
echo implode(', ', $cols) . "\n\n";

echo "Positions columns:\n";
$cols = $conn->query('SHOW COLUMNS FROM positions')->fetchAll(PDO::FETCH_COLUMN);
echo implode(', ', $cols) . "\n\n";
?>
