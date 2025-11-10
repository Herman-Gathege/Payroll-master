<?php

namespace Backend\Models;

require_once __DIR__ . '/../config/Database.php';

use PDO;

class User
{
    private $conn;

    public function __construct()
    {
        $database = new \Backend\Config\Database();
        $this->conn = $database->connect();
    }

    public function createUser($name, $email, $password, $token)
    {
        $query = "INSERT INTO users (name, email, password, verification_token, email_verified)
                  VALUES (:name, :email, :password, :token, 0)";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':password' => password_hash($password, PASSWORD_BCRYPT),
            ':token' => $token
        ]);
    }

    public function verifyEmailToken($token)
    {
        $query = "SELECT * FROM users WHERE verification_token = :token LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':token' => $token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            $update = "UPDATE users SET email_verified = 1, verification_token = NULL WHERE id = :id";
            $stmt = $this->conn->prepare($update);
            return $stmt->execute([':id' => $user['id']]);
        }

        return false;
    }

    public function findByEmail($email)
    {
        $query = "SELECT * FROM users WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':email' => $email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
