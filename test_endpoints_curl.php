<?php
/**
 * Test Production Endpoints Using cURL
 */

echo "=================================================\n";
echo "Testing Production Endpoints\n";
echo "=================================================\n\n";

// Test 1: Login to get token
echo "Test 1: Employer Login\n";
echo "-------------------\n";

$ch = curl_init('http://localhost/backend/api/employer/auth.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'username' => 'admin',
    'password' => 'Admin@2025!'
]));

$result = curl_exec($ch);
$response = json_decode($result, true);
curl_close($ch);

if (!$response || !$response['success']) {
    echo "❌ FAILED: Login unsuccessful\n";
    echo "   Response: $result\n\n";
    exit(1);
}

$token = $response['token'];
echo "✅ PASSED: Login successful\n";
echo "   Token: " . substr($token, 0, 20) . "...\n";
echo "   User: {$response['user']['username']} ({$response['user']['role']})\n\n";

// Test 2: Employees endpoint
echo "Test 2: Employees Endpoint\n";
echo "-------------------\n";

$ch = curl_init('http://localhost/backend/api/employer/employees.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token"
]);

$result = curl_exec($ch);
$response = json_decode($result, true);
curl_close($ch);

if (!$response || !$response['success']) {
    echo "❌ FAILED: Could not fetch employees\n";
    echo "   Response: $result\n\n";
} else {
    echo "✅ PASSED: Employees endpoint working\n";
    echo "   Total employees: " . ($response['pagination']['total'] ?? 0) . "\n";
    echo "   Returned: " . count($response['data'] ?? []) . " employees\n\n";
}

// Test 3: Payroll Summary endpoint
echo "Test 3: Payroll Summary Endpoint\n";
echo "-------------------\n";

$ch = curl_init('http://localhost/backend/api/employer/payroll/summary.php?month=10&year=2025');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token"
]);

$result = curl_exec($ch);
$response = json_decode($result, true);
curl_close($ch);

if (!$response || !$response['success']) {
    echo "❌ FAILED: Could not fetch payroll summary\n";
    echo "   Response: $result\n\n";
} else {
    echo "✅ PASSED: Payroll summary endpoint working\n";
    echo "   Period: {$response['data']['period']['month_name']} {$response['data']['period']['year']}\n";
    echo "   Total employees: {$response['data']['employees']['total']}\n";
    echo "   Gross salary: KES " . number_format($response['data']['payroll']['gross_salary'], 2) . "\n\n";
}

// Test 4: Departments endpoint
echo "Test 4: Departments Endpoint\n";
echo "-------------------\n";

$ch = curl_init('http://localhost/backend/api/employer/departments.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token"
]);

$result = curl_exec($ch);
$response = json_decode($result, true);
curl_close($ch);

if (!$response || !$response['success']) {
    echo "❌ FAILED: Could not fetch departments\n";
    echo "   Response: $result\n\n";
} else {
    echo "✅ PASSED: Departments endpoint working\n";
    echo "   Total departments: " . count($response['data'] ?? []) . "\n";
    if (!empty($response['data'])) {
        echo "   Sample: {$response['data'][0]['name']} ({$response['data'][0]['employee_count']} employees)\n";
    }
    echo "\n";
}

// Test 5: Positions endpoint
echo "Test 5: Positions Endpoint\n";
echo "-------------------\n";

$ch = curl_init('http://localhost/backend/api/employer/positions.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token"
]);

$result = curl_exec($ch);
$response = json_decode($result, true);
curl_close($ch);

if (!$response || !$response['success']) {
    echo "❌ FAILED: Could not fetch positions\n";
    echo "   Response: $result\n\n";
} else {
    echo "✅ PASSED: Positions endpoint working\n";
    echo "   Total positions: " . count($response['data'] ?? []) . "\n";
    if (!empty($response['data'])) {
        echo "   Sample: {$response['data'][0]['title']} ({$response['data'][0]['employee_count']} employees)\n";
    }
    echo "\n";
}

echo "=================================================\n";
echo "Test Summary\n";
echo "=================================================\n";
echo "All critical endpoints tested!\n\n";
echo "Next steps:\n";
echo "1. Open http://localhost:5173/employer/login in browser\n";
echo "2. Login with: admin / Admin@2025!\n";
echo "3. Verify dashboard loads without CORS errors\n";
echo "4. Check browser console for errors\n\n";
echo "=================================================\n";
?>
