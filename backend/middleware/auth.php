<?php

// backend/middleware/auth.php
class AuthMiddleware {
    public static function validateToken() {
        $headers = getallheaders();

        if(!isset($headers['Authorization'])) {
            http_response_code(401);
            echo json_encode(array("message" => "No authorization token provided"));
            exit();
        }

        $authHeader = $headers['Authorization'];
        $token = str_replace('Bearer ', '', $authHeader);

        // In production, validate JWT token properly
        // For now, just check if token exists and is not empty
        if(empty($token)) {
            http_response_code(401);
            echo json_encode(array("message" => "Invalid token"));
            exit();
        }

        return true;
    }

    public static function checkRole($required_role = 'user') {
        // Add role checking logic here
        // For now, just pass through
        return true;
    }
}
?>
