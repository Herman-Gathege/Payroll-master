<?php
// backend/api/agent/login.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

// basic input validation
if (empty($data['full_name']) || empty($data['id_number'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Full name and ID number are required']);
    exit;
}

// normalize inputs
$full_name = trim($data['full_name']);
$id_number = trim($data['id_number']);

try {
    $database = new Database();
    $db = $database->getConnection();

    // Use a case-insensitive match for full_name and exact for id_number.
    // Join agent_profiles to confirm id_number and ensure agent is verified.
    $query = "
        SELECT a.id, a.full_name, a.email, a.phone, a.status, ap.id_number
        FROM agents a
        INNER JOIN agent_profiles ap ON a.id = ap.agent_id
        WHERE LOWER(TRIM(a.full_name)) = LOWER(TRIM(:full_name))
          AND TRIM(ap.id_number) = :id_number
          AND a.status = 'verified'
        LIMIT 1
    ";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':full_name', $full_name);
    $stmt->bindParam(':id_number', $id_number);
    $stmt->execute();

    $agent = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($agent) {
        // Build a simple token. In production: issue JWT with role=agent.
        $tokenPayload = $agent['id'] . ':' . time();
        $token = 'AGENT:' . base64_encode($tokenPayload);

        // Optionally: update last_login on agents table if you have that column
        // (uncomment if present):
        // $upd = $db->prepare("UPDATE agents SET last_login = NOW() WHERE id = :id");
        // $upd->execute([':id' => $agent['id']]);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'agent' => [
                'id' => (int)$agent['id'],
                'full_name' => $agent['full_name'],
                'email' => $agent['email'],
                'phone' => $agent['phone']
            ]
        ]);
        exit;
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid name or ID number, or account not verified']);
        exit;
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    exit;
}
?>
