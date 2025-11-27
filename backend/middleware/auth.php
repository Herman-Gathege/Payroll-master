<?php
// backend/middleware/auth.php

require_once __DIR__ . '/../config/database.php';

class Auth {
    public static function getBearerToken() {
        $headers = getallheaders();
        if (!isset($headers['Authorization'])) {
            return null;
        }
        return str_replace('Bearer ', '', $headers['Authorization']);
    }

    public static function decodeToken($token) {
        /**
         * 🚨 IMPORTANT:
         * Right now the token is NOT a JWT — it's stored JSON from Login:
         * localStorage.setItem("user", JSON.stringify(data.user))
         *
         * So backend receives ONLY "token" (random or static)
         * But not the user data.
         *
         * To match your Phase 1 → we store user JSON in another header.
         *
         * Frontend ALWAYS sends:
         * - Authorization: Bearer {token}
         * - X-User: JSON user object
         */

        $headers = getallheaders();
        if (!isset($headers['X-User'])) {
            return null;
        }

        $user = json_decode($headers['X-User'], true);
        return $user;
    }
}

/**
 * Unified Backend Authentication
 * Used across ALL employer/* and employee/* routes
 */
function authenticateRequest() {
    $token = Auth::getBearerToken();

    if (!$token) {
        return [
            "success" => false,
            "message" => "Missing token"
        ];
    }

    // Decode user (frontend sends X-User header)
    $user = Auth::decodeToken($token);

    if (!$user) {
        return [
            "success" => false,
            "message" => "Invalid or missing X-User header"
        ];
    }

    return [
        "success" => true,
        "user" => $user,
        "token" => $token,
        "user_type" => $user['user_type'] ?? null
    ];
}