<?php
/**
 * Unified Authentication API
 * Handles login for both employer and employee users
 */
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/SecurityMiddleware.php';

// Apply security & headers
SecurityMiddleware::handleCORS();
SecurityMiddleware::applySecurityHeaders();
header("Content-Type: application/json; charset=UTF-8");

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER["REQUEST_METHOD"];

if ($method !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);
    exit;
}

// Read raw JSON input
$input = json_decode(file_get_contents("php://input"));

if (empty($input->username) || empty($input->password)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Username and password are required"
    ]);
    exit;
}

$username = $input->username;
$password = $input->password;

try {

    // --------------------------------------------------------
    // 1. TRY EMPLOYER USER
    // --------------------------------------------------------
    $sqlEmployer = "
        SELECT 
            eu.id, eu.username, eu.email, eu.password_hash, eu.role,
            eu.organization_id, eu.is_active, eu.failed_login_attempts, eu.locked_until,
            eu.first_name, eu.last_name, eu.phone_number,
            o.organization_name, o.organization_code,
            'employer' AS role,
            'employer' AS user_type
        FROM employer_users eu
        JOIN organizations o ON eu.organization_id = o.id
        WHERE eu.username = :username 
          AND eu.is_active = 1 
          AND o.is_active = 1
        LIMIT 1";

    $stmt = $db->prepare($sqlEmployer);
    $stmt->execute([":username" => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // // --------------------------------------------------------
    // // 2. IF NOT FOUND → TRY EMPLOYEE USER
    // // --------------------------------------------------------
    if (!$user) {
        $sqlEmployee = "
            SELECT
                eu.id, eu.username, eu.email, eu.password_hash,
                eu.employee_id, eu.is_active, eu.force_password_change,
                eu.failed_login_attempts, eu.locked_until,
                e.first_name, e.last_name, e.organization_id, 
                e.department_id, e.position_id,
                d.name AS department_name, p.title AS position_name,
                o.organization_name, o.organization_code,
                'employee' AS user_type,
                'employee' AS role
            FROM employee_users eu
            JOIN employees e ON eu.employee_id = e.id
            JOIN organizations o ON e.organization_id = o.id
            LEFT JOIN departments d ON e.department_id = d.id
            LEFT JOIN positions p ON e.position_id = p.id
            WHERE eu.username = :username
              AND eu.is_active = 1
              AND o.is_active = 1
            LIMIT 1";

        $stmt = $db->prepare($sqlEmployee);
        $stmt->execute([":username" => $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    }

        // --------------------------------------------------------
    

    // --------------------------------------------------------
    // 3. USER NOT FOUND
    // --------------------------------------------------------
    if (!$user) {

        // Determine possible type
        $guessedType = preg_match('/@/', $username) ? 'employee' : 'unknown';

        $log = $db->prepare("
            INSERT INTO login_logs 
                (user_type, username, login_status, failure_reason, ip_address, user_agent)
            VALUES 
                (:type, :username, 'failed', 'User not found', :ip, :agent)
        ");
        $log->execute([
            ":type" => $guessedType,
            ":username" => $username,
            ":ip" => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            ":agent" => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);

        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid username or password"
        ]);
        exit;
    }

    // --------------------------------------------------------
    // 4. ACCOUNT LOCKED?
    // --------------------------------------------------------
    if (!empty($user['locked_until']) && strtotime($user['locked_until']) > time()) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Account is locked. Try again later."
        ]);
        exit;
    }

    // --------------------------------------------------------
    // 5. VERIFY PASSWORD
    // --------------------------------------------------------
    if (!password_verify($password, $user['password_hash'])) {

        $attempts = $user['failed_login_attempts'] + 1;
        $lockUntil = ($attempts >= 5)
            ? date('Y-m-d H:i:s', strtotime('+30 minutes'))
            : null;

        $table = ($user['user_type'] === "employer") ? "employer_users" : "employee_users";

        $fail = $db->prepare("
            UPDATE $table 
            SET failed_login_attempts = :a, locked_until = :l 
            WHERE id = :id
        ");
        $fail->execute([
            ":a" => $attempts,
            ":l" => $lockUntil,
            ":id" => $user['id']
        ]);

        // Log failed attempt
        $log = $db->prepare("
            INSERT INTO login_logs 
                (user_type, user_id, username, email, login_status, failure_reason, ip_address, user_agent)
            VALUES 
                (:type, :uid, :uname, :email, 'failed', 'Invalid password', :ip, :agent)
        ");
        $log->execute([
            ":type" => $user['user_type'],
            ":uid" => $user['id'],
            ":uname" => $user['username'],
            ":email" => $user['email'] ?? '',
            ":ip" => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            ":agent" => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);

        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid username or password"
        ]);
        exit;
    }

    // --------------------------------------------------------
    // 6. SUCCESSFUL LOGIN — GENERATE SESSION TOKEN
    // --------------------------------------------------------
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));

    $session = $db->prepare("
        INSERT INTO user_sessions
            (user_type, user_id, session_token, ip_address, user_agent, expires_at, is_active)
        VALUES
            (:type, :uid, :token, :ip, :agent, :exp, 1)
    ");
    $session->execute([
        ":type" => $user['user_type'],
        ":uid" => $user['id'],
        ":token" => $token,
        ":ip" => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        ":agent" => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        ":exp" => $expires
    ]);

    // Reset failed attempts + update last_login
    $table = ($user['user_type'] == "employer") ? "employer_users" : "employee_users";

    $update = $db->prepare("
        UPDATE $table 
        SET failed_login_attempts = 0, locked_until = NULL, last_login = NOW()
        WHERE id = :id
    ");
    $update->execute([":id" => $user['id']]);

    // Log success
    $log = $db->prepare("
        INSERT INTO login_logs 
            (user_type, user_id, username, email, login_status, ip_address, user_agent, device_type)
        VALUES
            (:type, :uid, :uname, :email, 'success', :ip, :agent, 'web')
    ");
    $log->execute([
        ":type" => $user['user_type'],
        ":uid" => $user['id'],
        ":uname" => $user['username'],
        ":email" => $user['email'] ?? '',
        ":ip" => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        ":agent" => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ]);

    // --------------------------------------------------------
    // 7. PREPARE RESPONSE
    // --------------------------------------------------------
    $response = [
        "success" => true,
        "message" => "Login successful",
        "token" => $token,
        "user" => [
            "id" => $user['id'],
            "username" => $user['username'],
            "email" => $user['email'] ?? "",
            "role" => $user['role'] ?? "employee",
            "user_type" => $user['user_type'],
            "full_name" => trim(($user['first_name'] ?? '') . " " . ($user['last_name'] ?? '')),
        ]
    ];

    if ($user['user_type'] === "employer") {
        $response["user"]["organization_id"] = $user['organization_id'];
        $response["user"]["organization_name"] = $user['organization_name'];
        $response["user"]["organization_code"] = $user['organization_code'];
    } else {
        $response["user"]["employee_id"] = $user['employee_id'];
        $response["user"]["organization_id"] = $user['organization_id'];
        $response["user"]["department_id"] = $user['department_id'];
        $response["user"]["department_name"] = $user['department_name'];
        $response["user"]["position_id"] = $user['position_id'];
        $response["user"]["position_name"] = $user['position_name'];
        $response["force_password_change"] = $user['force_password_change'] ?? 0;
    }

    http_response_code(200);
    echo json_encode($response);

} catch (Exception $e) {
    error_log("[UNIFIED LOGIN ERROR] " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An internal error occurred"
    ]);
}
?>