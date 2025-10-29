<?php
/**
 * Unified Authentication API
 * Handles login for both employer and employee users with role-based routing
 */

require_once '../config/database_secure.php';
require_once '../middleware/SecurityMiddleware.php';

// Apply security measures
SecurityMiddleware::handleCORS();
SecurityMiddleware::applySecurityHeaders();

header("Content-Type: application/json; charset=UTF-8");

$database = new Database();
$db = $database->getConnection();

$request_method = $_SERVER["REQUEST_METHOD"];

/**
 * Login endpoint - checks both employer and employee tables
 */
if ($request_method == 'POST') {
    $raw_input = file_get_contents("php://input");
    $data = json_decode($raw_input);

    if (!empty($data->username) && !empty($data->password)) {
        try {
            // First, try to find user in employer_users table
            $employer_query = "SELECT 
                        eu.id, eu.username, eu.email, eu.password_hash, eu.role, 
                        eu.organization_id, eu.is_active, 
                        eu.failed_login_attempts, eu.locked_until,
                        eu.first_name, eu.last_name, eu.phone_number,
                        o.organization_name, o.organization_code,
                        'employer' as user_type
                      FROM employer_users eu
                      JOIN organizations o ON eu.organization_id = o.id
                      WHERE eu.username = :username AND eu.is_active = 1 AND o.is_active = 1";

            $stmt = $db->prepare($employer_query);
            $stmt->bindParam(":username", $data->username);
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // If not found in employer_users, try employee_users table
            if (!$user) {
                $employee_query = "SELECT 
                            eu.id, eu.username, eu.email, eu.password_hash, 
                            eu.employee_id, eu.is_active, eu.force_password_change,
                            eu.failed_login_attempts, eu.locked_until,
                            e.first_name, e.last_name, e.organization_id, 
                            e.department_id, e.position_id,
                            d.name as department_name, p.title as position_name,
                            o.organization_name, o.organization_code,
                            'employee' as user_type,
                            'employee' as role
                          FROM employee_users eu
                          JOIN employees e ON eu.employee_id = e.id
                          JOIN organizations o ON e.organization_id = o.id
                          LEFT JOIN departments d ON e.department_id = d.id
                          LEFT JOIN positions p ON e.position_id = p.id
                          WHERE eu.username = :username AND eu.is_active = 1 AND o.is_active = 1";

                $stmt = $db->prepare($employee_query);
                $stmt->bindParam(":username", $data->username);
                $stmt->execute();
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
            }

            if ($user) {
                // Check if account is locked
                if ($user['locked_until'] && strtotime($user['locked_until']) > time()) {
                    http_response_code(403);
                    echo json_encode([
                        "success" => false,
                        "message" => "Account is locked. Please try again later or contact administrator."
                    ]);
                    exit;
                }

                // Verify password
                $password_match = password_verify($data->password, $user['password_hash']);

                if ($password_match) {
                    // Generate token
                    $token = bin2hex(random_bytes(32));
                    $expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));

                    // Store session
                    $session_query = "INSERT INTO user_sessions 
                                    (user_type, user_id, session_token, ip_address, user_agent, expires_at, is_active)
                                    VALUES (:user_type, :user_id, :token, :ip, :user_agent, :expires_at, 1)";
                    $session_stmt = $db->prepare($session_query);
                    $session_stmt->execute([
                        ':user_type' => $user['user_type'],
                        ':user_id' => $user['id'],
                        ':token' => $token,
                        ':ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                        ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
                        ':expires_at' => $expires_at
                    ]);

                    // Update last login
                    $table = ($user['user_type'] === 'employer') ? 'employer_users' : 'employee_users';
                    $update_query = "UPDATE $table 
                                   SET last_login = NOW(), 
                                       failed_login_attempts = 0,
                                       locked_until = NULL
                                   WHERE id = :id";
                    $update_stmt = $db->prepare($update_query);
                    $update_stmt->bindParam(":id", $user['id']);
                    $update_stmt->execute();

                    // Log successful login
                    $log_query = "INSERT INTO login_logs 
                                (user_type, user_id, username, email, login_status, ip_address, user_agent, device_type)
                                VALUES (:user_type, :user_id, :username, :email, 'success', :ip, :user_agent, :device)";
                    $log_stmt = $db->prepare($log_query);
                    $log_stmt->execute([
                        ':user_type' => $user['user_type'],
                        ':user_id' => $user['id'],
                        ':username' => $user['username'],
                        ':email' => $user['email'],
                        ':ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                        ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
                        ':device' => 'web'
                    ]);

                    // Prepare response based on user type
                    $response = [
                        "success" => true,
                        "message" => "Login successful",
                        "token" => $token,
                        "user" => [
                            "id" => $user['id'],
                            "username" => $user['username'],
                            "email" => $user['email'] ?? '',
                            "role" => $user['role'],
                            "full_name" => trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '')),
                            "user_type" => $user['user_type']
                        ]
                    ];

                    // Add employer-specific fields
                    if ($user['user_type'] === 'employer') {
                        $response['user']['organization_id'] = $user['organization_id'] ?? null;
                        $response['user']['organization_name'] = $user['organization_name'] ?? null;
                        $response['user']['organization_code'] = $user['organization_code'] ?? null;
                    }

                    // Add employee-specific fields
                    if ($user['user_type'] === 'employee') {
                        $response['user']['employee_id'] = $user['employee_id'] ?? null;
                        $response['user']['organization_id'] = $user['organization_id'] ?? null;
                        $response['user']['department_id'] = $user['department_id'] ?? null;
                        $response['user']['department_name'] = $user['department_name'] ?? null;
                        $response['user']['position_id'] = $user['position_id'] ?? null;
                        $response['user']['position_name'] = $user['position_name'] ?? null;
                        $response['force_password_change'] = $user['force_password_change'] ?? false;
                    }

                    http_response_code(200);
                    echo json_encode($response);

                } else {
                    // Wrong password - increment failed attempts
                    $failed_attempts = $user['failed_login_attempts'] + 1;
                    $locked_until = null;

                    // Lock account after 5 failed attempts
                    if ($failed_attempts >= 5) {
                        $locked_until = date('Y-m-d H:i:s', strtotime('+30 minutes'));
                    }

                    $table = ($user['user_type'] === 'employer') ? 'employer_users' : 'employee_users';
                    $fail_query = "UPDATE $table 
                                 SET failed_login_attempts = :attempts,
                                     locked_until = :locked_until
                                 WHERE id = :id";
                    $fail_stmt = $db->prepare($fail_query);
                    $fail_stmt->execute([
                        ':attempts' => $failed_attempts,
                        ':locked_until' => $locked_until,
                        ':id' => $user['id']
                    ]);

                    // Log failed attempt
                    $log_query = "INSERT INTO login_logs 
                                (user_type, user_id, username, email, login_status, failure_reason, ip_address, user_agent)
                                VALUES (:user_type, :user_id, :username, :email, 'failed', 'Invalid password', :ip, :user_agent)";
                    $log_stmt = $db->prepare($log_query);
                    $log_stmt->execute([
                        ':user_type' => $user['user_type'],
                        ':user_id' => $user['id'],
                        ':username' => $user['username'],
                        ':email' => $user['email'],
                        ':ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                        ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
                    ]);

                    http_response_code(401);
                    echo json_encode([
                        "success" => false,
                        "message" => "Invalid username or password"
                    ]);
                }
            } else {
                // User not found
                // Log failed attempt
                $log_query = "INSERT INTO login_logs 
                            (user_type, username, login_status, failure_reason, ip_address, user_agent)
                            VALUES ('employer', :username, 'failed', 'User not found', :ip, :user_agent)";
                $log_stmt = $db->prepare($log_query);
                $log_stmt->execute([
                    ':username' => $data->username,
                    ':ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                    ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
                ]);

                http_response_code(401);
                echo json_encode([
                    "success" => false,
                    "message" => "Invalid username or password"
                ]);
            }
        } catch (Exception $e) {
            error_log("[UNIFIED AUTH ERROR] " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "An error occurred during login"
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Username and password are required"
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed"
    ]);
}
?>
