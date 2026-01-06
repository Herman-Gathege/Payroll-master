
<?php
header("Content-Type: application/json");

require_once __DIR__ . '/../../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    $stmt = $conn->query("SELECT id, name, email, position FROM employees");
    $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($employees);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server error", "details" => $e->getMessage()]);
}
?>
