<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<pre>=== FULL SYSTEM DEBUG ===\n";

/* -------------------------------------------------
 * 1. Basic Server Info
 * ------------------------------------------------- */
echo "PHP VERSION: " . phpversion() . "\n";
echo "DOCUMENT ROOT: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
echo "CURRENT FILE DIR: " . __DIR__ . "\n";

/* -------------------------------------------------
 * 2. .env checks
 * ------------------------------------------------- */
$envPath = __DIR__ . "/.env";
echo "\nENV PATH CHECK: $envPath\n";
echo "ENV EXISTS: " . (file_exists($envPath) ? "YES" : "NO") . "\n";

if (file_exists($envPath)) {
    echo "\n=== .env FILE CONTENT (masked) ===\n";
    foreach (file($envPath, FILE_IGNORE_NEW_LINES) as $line) {
        if (stripos($line, "PASS") !== false) {
            echo "DB_PASS=********\n";
        } else {
            echo $line . "\n";
        }
    }
}

/* -------------------------------------------------
 * 3. Load EnvLoader
 * ------------------------------------------------- */
$envLoaderFile = __DIR__ . "/config/env_loader.php";
echo "\nEnvLoader Path: $envLoaderFile\n";
echo "EnvLoader Exists: " . (file_exists($envLoaderFile) ? "YES" : "NO") . "\n";

require_once $envLoaderFile;
EnvLoader::load($envPath);

echo "\n=== LOADED ENV VALUES ===\n";
var_dump([
    "DB_HOST" => EnvLoader::get("DB_HOST"),
    "DB_NAME" => EnvLoader::get("DB_NAME"),
    "DB_USER" => EnvLoader::get("DB_USER"),
    "DB_PASS" => "***MASKED***"
]);

/* -------------------------------------------------
 * 4. Load database_secure.php
 * ------------------------------------------------- */
$dbFile = __DIR__ . "/config/database.php";
echo "\nDB File Path: $dbFile\n";
echo "DB File Exists: " . (file_exists($dbFile) ? "YES" : "NO") . "\n";

require_once $dbFile;

$db = new Database();

echo "Database class loaded.\n";

/* -------------------------------------------------
 * 5. DB Test Connection
 * ------------------------------------------------- */
echo "\n=== DATABASE CONNECTION TEST ===\n";
try {
    $pdo = $db->getConnection();
    echo "DB CONNECTION: SUCCESS ✓\n";
    $ts = $pdo->query("SELECT NOW() AS nowtime")->fetch();
    echo "SERVER TIME: " . $ts["nowtime"] . "\n";
} catch (Exception $e) {
    echo "DB CONNECTION FAILED ✗\n";
    echo $e->getMessage() . "\n";
}

/* -------------------------------------------------
 * 6. Check important tables exist
 * ------------------------------------------------- */
echo "\n=== CHECK CRITICAL TABLES ===\n";

$tables = [
    "employer_users",
    "employee_users",
    "user_sessions",
    "organizations"
];

foreach ($tables as $t) {
    try {
        $c = $pdo->query("SELECT COUNT(*) AS count FROM $t")->fetch();
        echo "$t: " . $c["count"] . " rows\n";
    } catch (Exception $e) {
        echo "$t: DOES NOT EXIST or ERROR → " . $e->getMessage() . "\n";
    }
}

/* -------------------------------------------------
 * 7. Check Admin Account Exists
 * ------------------------------------------------- */
echo "\n=== ADMIN USER CHECK ===\n";

try {
    $stmt = $pdo->query("SELECT id, username, email, role FROM employer_users LIMIT 5");
    $rows = $stmt->fetchAll();
    print_r($rows);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

/* -------------------------------------------------
 * 8. Check unified_auth.php file
 * ------------------------------------------------- */
$authFile = __DIR__ . "/api/unified_auth.php";
echo "\n=== AUTH FILE CHECK ===\n";
echo "AUTH FILE PATH: $authFile\n";
echo "AUTH FILE EXISTS: " . (file_exists($authFile) ? "YES" : "NO") . "\n";

/* -------------------------------------------------
 * 9. Confirm include paths
 * ------------------------------------------------- */
echo "\n=== PHP INCLUDE PATH ===\n";
print_r(explode(":", get_include_path()));

/* -------------------------------------------------
 * 10. Permissions check
 * ------------------------------------------------- */
echo "\n=== PERMISSIONS CHECK ===\n";

$dirs = [
    __DIR__,
    __DIR__ . "/config",
    __DIR__ . "/api",
    $authFile
];

foreach ($dirs as $d) {
    echo "$d → " . (is_readable($d) ? "READABLE" : "NOT READABLE") . "\n";
}

echo "\n=== END FULL DEBUG ===</pre>";
