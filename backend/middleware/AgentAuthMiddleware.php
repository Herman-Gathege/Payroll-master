<?php
require_once __DIR__ . '/../config/database.php';

class AgentAuthMiddleware {

    public static function validateAgent() {
        $headers = getallheaders();

        if (!isset($headers['Authorization'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Missing Authorization header']);
            exit;
        }

        $authHeader = trim($headers['Authorization']);

        if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid Authorization format']);
            exit;
        }

        $token = $matches[1];

        // ✅ Token must start with AGENT:
        if (strpos($token, 'AGENT:') !== 0) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not an agent token']);
            exit;
        }

        $payload = substr($token, strlen('AGENT:'));
        $decoded = base64_decode($payload, true);

        if (!$decoded || !str_contains($decoded, ':')) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid token']);
            exit;
        }

        list($agent_id, $timestamp) = explode(':', $decoded, 2);
        $agent_id = intval($agent_id);

        if ($agent_id <= 0) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid agent id']);
            exit;
        }

        // Optional expiration (e.g., 24 h)
        if ((time() - (int)$timestamp) > 86400) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Token expired']);
            exit;
        }

        // ✅ Verify agent still exists and is verified
        $database = new Database();
        $db = $database->getConnection();

        $stmt = $db->prepare("SELECT id, full_name, status FROM agents WHERE id = :id LIMIT 1");
        $stmt->bindParam(':id', $agent_id);
        $stmt->execute();
        $agent = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$agent || $agent['status'] !== 'verified') {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Agent not found or not verified']);
            exit;
        }

        // ✅ Return agent info for use in endpoints
        return $agent;
    }
}
?>
