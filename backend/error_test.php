<?php
// enable full error output temporarily
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Test an API include
echo "Testing API includes...<br>";

require_once __DIR__ . "/api/employee/my_salary_structure.php";

echo "<br>DONE";
