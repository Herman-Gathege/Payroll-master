<?php
// ✅ CORS HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// ✅ Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';


$database = new Database();
$db = $database->getConnection();

$request_method = $_SERVER["REQUEST_METHOD"];

if($request_method == 'POST') {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));

    if(!empty($data->username) && !empty($data->password)) {
        // Query user
        $query = "SELECT id, username, email, password_hash, role, is_active
                  FROM users WHERE username = :username AND is_active = 1";

        $stmt = $db->prepare($query);
        $stmt->bindParam(":username", $data->username);
        $stmt->execute();

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if($user) {
            // Verify password
            if(password_verify($data->password, $user['password_hash'])) {
                // Password is correct
                http_response_code(200);

                // Generate a simple token (in production, use JWT)
                $token = base64_encode($user['username'] . ':' . time());

                // Update last login
                $update_query = "UPDATE users SET last_login = NOW() WHERE id = :id";
                $update_stmt = $db->prepare($update_query);
                $update_stmt->bindParam(":id", $user['id']);
                $update_stmt->execute();

                echo json_encode(array(
                    "message" => "Login successful",
                    "token" => $token,
                    "user" => array(
                        "id" => $user['id'],
                        "username" => $user['username'],
                        "email" => $user['email'],
                        "role" => $user['role']
                    )
                ));
            } else {
                // Wrong password
                http_response_code(401);
                echo json_encode(array("message" => "Invalid username or password"));
            }
        } else {
            // User not found
            http_response_code(401);
            echo json_encode(array("message" => "Invalid username or password"));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Username and password are required"));
    }
} else {
    http_response_code(405);
    echo json_encode(array("message" => "Method not allowed"));
}
?>
