<?php
/**
 * Database Configuration
 * Uses environment variables from .env file
 */

require_once __DIR__ . '/env_loader.php';

class Database {
    private $host;
    private $database_name;
    private $username;
    private $password;
    private $charset;
    public $conn;

    public function __construct() {
        // Load from environment variables with fallback to defaults
        $this->host = EnvLoader::get('DB_HOST', 'localhost');
        $this->database_name = EnvLoader::get('DB_NAME', 'hr_management_system');
        $this->username = EnvLoader::get('DB_USER', 'root');
        $this->password = EnvLoader::get('DB_PASS', '');
        $this->charset = EnvLoader::get('DB_CHARSET', 'utf8mb4');
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->database_name . ";charset=" . $this->charset;
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        } catch(PDOException $exception) {
            // Log error but don't expose details in production
            if (EnvLoader::getBool('APP_DEBUG', true)) {
                echo "Connection error: " . $exception->getMessage();
            } else {
                error_log("Database connection failed: " . $exception->getMessage());
                throw new Exception("Database connection failed");
            }
        }

        return $this->conn;
    }
}
?>
