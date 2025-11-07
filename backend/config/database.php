<?php
namespace Backend\Config;

use PDO;
use PDOException;

class Database
{
    private static $host = 'localhost';
    private static $db_name = 'hr_management_system';
    private static $username = 'hruser'; 
    private static $password = 'Hrm@2025!Secure'; 
    private static $conn;

    public static function connect()
    {
        if (!self::$conn) {
            try {
                self::$conn = new PDO(
                    'mysql:host=' . self::$host . ';dbname=' . self::$db_name,
                    self::$username,
                    self::$password
                );
                self::$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch (PDOException $e) {
                die(json_encode([
                    'status' => 'error',
                    'message' => 'Database Connection Failed: ' . $e->getMessage()
                ]));
            }
        }

        return self::$conn;
    }
}
?>
