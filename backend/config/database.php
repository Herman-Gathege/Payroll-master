<?php

namespace Backend\Config;

use PDO;
use PDOException;
use Exception;

require_once __DIR__ . '/env_loader.php';

class Database
{
    private string $host;
    private string $dbName;
    private string $username;
    private string $password;
    private string $charset;
    private ?PDO $conn = null;

    public function __construct()
    {
        // Load from environment variables (with defaults)
        $this->host     = \EnvLoader::get('DB_HOST', 'localhost');
        $this->dbName   = \EnvLoader::get('DB_NAME', 'hr_management_system');
        $this->username = \EnvLoader::get('DB_USER', 'root');
        $this->password = \EnvLoader::get('DB_PASS', '');
        $this->charset  = \EnvLoader::get('DB_CHARSET', 'utf8mb4');
    }

    public function getConnection(): ?PDO
    {
        if ($this->conn) {
            return $this->conn;
        }

        try {
            $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', $this->host, $this->dbName, $this->charset);

            $this->conn = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES {$this->charset} COLLATE {$this->charset}_general_ci"
            ]);

        } catch (PDOException $e) {
            $this->handleError($e);
        }

        return $this->conn;
    }

    private function handleError(PDOException $e): void
    {
        $debug = \EnvLoader::getBool('APP_DEBUG', true);

        if ($debug) {
            echo "⚠️ Database Connection Error: " . htmlspecialchars($e->getMessage());
        } else {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed. Please try again later.");
        }
    }
}
