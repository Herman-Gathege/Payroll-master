<?php
/**
 * Secure Database Configuration
 * Uses environment variables and config file
 */

require_once __DIR__ . '/env_loader.php';

class Database {
    private $host;
    private $database_name;
    private $username;
    private $password;
    private $charset = 'utf8mb4';
    public $conn;

    private static $config;

    public function __construct() {
        // Load from environment variables first, then config file
        $this->host = EnvLoader::get('DB_HOST', 'localhost');
        $this->database_name = EnvLoader::get('DB_NAME', 'hr_management_system');
        $this->username = EnvLoader::get('DB_USER', 'root');
        $this->password = EnvLoader::get('DB_PASS', '');
        $this->charset = EnvLoader::get('DB_CHARSET', 'utf8mb4');

        // Load additional configuration if exists
        if (self::$config === null) {
            $configFile = __DIR__ . '/config.php';
            if (file_exists($configFile)) {
                self::$config = require $configFile;
                // Override with config file if set
                if (isset(self::$config['database'])) {
                    $dbConfig = self::$config['database'];
                    $this->host = $dbConfig['host'] ?? $this->host;
                    $this->database_name = $dbConfig['name'] ?? $this->database_name;
                    $this->username = $dbConfig['username'] ?? $this->username;
                    $this->password = $dbConfig['password'] ?? $this->password;
                    $this->charset = $dbConfig['charset'] ?? $this->charset;
                }
            }
        }
    }

    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host={$this->host};dbname={$this->database_name};charset={$this->charset}";
            $this->conn = new PDO($dsn, $this->username, $this->password);

            // Set PDO options from config
            foreach (self::$config['database']['options'] as $key => $value) {
                $this->conn->setAttribute($key, $value);
            }

            // Set timezone to UTC offset for Africa/Nairobi (UTC+3)
            // Using offset to avoid MySQL timezone table dependency
            $this->conn->exec("SET time_zone = '+03:00'");

        } catch(PDOException $exception) {
            // Log error but don't expose details in production
            if (self::$config['app']['debug']) {
                echo "Connection error: " . $exception->getMessage();
            } else {
                error_log("Database connection failed: " . $exception->getMessage());
                throw new Exception("Database connection failed");
            }
        }

        return $this->conn;
    }

    public static function getConfig($key = null) {
        if (self::$config === null) {
            $configFile = __DIR__ . '/config.php';
            if (file_exists($configFile)) {
                self::$config = require $configFile;
            } else {
                self::$config = require __DIR__ . '/config.example.php';
            }
        }

        if ($key === null) {
            return self::$config;
        }

        // Support dot notation: app.debug
        $keys = explode('.', $key);
        $value = self::$config;
        foreach ($keys as $k) {
            if (!isset($value[$k])) {
                return null;
            }
            $value = $value[$k];
        }
        return $value;
    }
}
