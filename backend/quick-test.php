<?php
require_once __DIR__ . '/env_loader.php';

$host = EnvLoader::get('DB_HOST');
$db   = EnvLoader::get('DB_NAME');
$user = EnvLoader::get('DB_USER');
$pass = EnvLoader::get('DB_PASS');

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    echo "Database connection successful!";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
