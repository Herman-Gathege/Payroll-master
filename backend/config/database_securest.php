<?php
class Database {
    private $host = "localhost";
    private $db_name = "evolve_payroll";
    private $username = "evolve_user";           // or "evolve_user" if you prefer
    private $password = "Evolve2025!";               // ← PUT YOUR REAL PASSWORD HERE IF root HAS PASSWORD
                                          // Example: private $password = "your_actual_password";

    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=$this->host;dbname=$this->db_name", $this->username, $this->password);
            $this->conn->exec("set names utf8mb4");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
            die();
        }
        return $this->conn;
    }

    // This fixes all the "array offset" warnings
    public static function getConfig($key = null) {
        $default = [
            'cors' => ['allowed_origins' => ['*'], 'allow_credentials' => true, 'allowed_methods' => ['*'], 'allowed_headers' => ['*'], 'max_age' => 86400],
            'rate_limit' => ['enabled' => false],
            'app' => ['env' => 'development']
        ];
        return $key ? ($default[$key] ?? []) : $default;
    }
}
?>