
<?php
header("Content-Type: application/json");

require_once __DIR__ . '/../../config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();

    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['id'], $data['name'], $data['email'], $data['position'])) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE employees SET name = :name, email = :email, position = :position WHERE id = :id");
    $stmt->execute([
        ':name' => $data['name'],
        ':email' => $data['email'],
        ':position' => $data['position'],
        ':id' => $data['id']
    ]);

    echo json_encode(["message" => "Employee updated successfully"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Server error", "details" => $e->getMessage()]);
}
?>
