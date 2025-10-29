<?php
/**
 * Test Production Endpoints
 * Verifies all newly created endpoints are working
 */

echo "=================================================\n";
echo "Testing Production Endpoints\n";
echo "=================================================\n\n";

// Test 1: Login to get token
echo "Test 1: Employer Login\n";
echo "-------------------\n";

$login_url = 'http://localhost/backend/api/employer/auth.php';
$login_data = json_encode(['username' => 'admin', 'password' => 'Admin@2025!']);

$login_options = [
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => $login_data
    ]
];

$context = stream_context_create($login_options);
$result = @file_get_contents($login_url, false, $context);

if (!$result) {
    echo "❌ FAILED: Could not connect to login endpoint\n";
    echo "   Check if Apache is running\n\n";
    exit(1);
}

$response = json_decode($result, true);

if (!$response || !$response['success']) {
    echo "❌ FAILED: Login unsuccessful\n";
    echo "   Response: " . ($result ?: 'No response') . "\n\n";
    exit(1);
}

$token = $response['token'];
echo "✅ PASSED: Login successful\n";
echo "   Token: " . substr($token, 0, 20) . "...\n";
echo "   User: {$response['user']['username']} ({$response['user']['role']})\n\n";

// Test 2: Employees endpoint
echo "Test 2: Employees Endpoint\n";
echo "-------------------\n";

$employees_url = 'http://localhost/backend/api/employer/employees.php';
$headers = [
    'http' => [
        'method' => 'GET',
        'header' => "Authorization: Bearer $token"
    ]
];

$context = stream_context_create($headers);
$result = @file_get_contents($employees_url, false, $context);
$response = json_decode($result, true);

if (!$response || !$response['success']) {
    echo "❌ FAILED: Could not fetch employees\n";
    echo "   Response: " . ($result ?: 'No response') . "\n\n";
} else {
    echo "✅ PASSED: Employees endpoint working\n";
    echo "   Total employees: " . ($response['pagination']['total'] ?? 0) . "\n";
    echo "   Returned: " . count($response['data'] ?? []) . " employees\n\n";
}

// Test 3: Payroll Summary endpoint
echo "Test 3: Payroll Summary Endpoint\n";
echo "-------------------\n";

$payroll_url = 'http://localhost/backend/api/employer/payroll/summary.php?month=10&year=2025';
$headers = [
    'http' => [
        'method' => 'GET',
        'header' => "Authorization: Bearer $token"
    ]
];

$context = stream_context_create($headers);
$result = @file_get_contents($payroll_url, false, $context);
$response = json_decode($result, true);

if (!$response || !$response['success']) {
    echo "❌ FAILED: Could not fetch payroll summary\n";
    echo "   Response: " . ($result ?: 'No response') . "\n\n";
} else {
    echo "✅ PASSED: Payroll summary endpoint working\n";
    echo "   Period: {$response['data']['period']['month_name']} {$response['data']['period']['year']}\n";
    echo "   Total employees: {$response['data']['employees']['total']}\n";
    echo "   Gross salary: KES " . number_format($response['data']['payroll']['gross_salary'], 2) . "\n\n";
}

// Test 4: Departments endpoint
echo "Test 4: Departments Endpoint\n";
echo "-------------------\n";

$dept_url = 'http://localhost/backend/api/employer/departments.php';
$headers = [
    'http' => [
        'method' => 'GET',
        'header' => "Authorization: Bearer $token"
    ]
];

$context = stream_context_create($headers);
$result = @file_get_contents($dept_url, false, $context);
$response = json_decode($result, true);

if (!$response || !$response['success']) {
    echo "❌ FAILED: Could not fetch departments\n";
    echo "   Response: " . ($result ?: 'No response') . "\n\n";
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

$pos_url = 'http://localhost/backend/api/employer/positions.php';
$headers = [
    'http' => [
        'method' => 'GET',
        'header' => "Authorization: Bearer $token"
    ]
];

$context = stream_context_create($headers);
$result = @file_get_contents($pos_url, false, $context);
$response = json_decode($result, true);

if (!$response || !$response['success']) {
    echo "❌ FAILED: Could not fetch positions\n";
    echo "   Response: " . ($result ?: 'No response') . "\n\n";
} else {
    echo "✅ PASSED: Positions endpoint working\n";
    echo "   Total positions: " . count($response['data'] ?? []) . "\n";
    if (!empty($response['data'])) {
        echo "   Sample: {$response['data'][0]['title']} ({$response['data'][0]['employee_count']} employees)\n";
    }
    echo "\n";
}

// Test 6: Security Headers
echo "Test 6: Security Headers\n";
echo "-------------------\n";

$headers_check = get_headers($employees_url . '?test=1');
$security_headers = [
    'X-Frame-Options',
    'X-Content-Type-Options',
    'X-XSS-Protection',
];

$headers_found = 0;
foreach ($security_headers as $header) {
    foreach ($headers_check as $h) {
        if (stripos($h, $header) !== false) {
            $headers_found++;
            echo "   ✓ $header found\n";
            break;
        }
    }
}

if ($headers_found >= 2) {
    echo "✅ PASSED: Security headers present\n\n";
} else {
    echo "⚠️  WARNING: Some security headers missing\n\n";
}

// Summary
echo "=================================================\n";
echo "Test Summary\n";
echo "=================================================\n";
echo "All critical endpoints tested!\n";
echo "\nNext steps:\n";
echo "1. Open http://localhost:5173/employer/login in browser\n";
echo "2. Login with: admin / Admin@2025!\n";
echo "3. Verify dashboard loads without CORS errors\n";
echo "4. Check browser console for errors\n\n";
echo "Production Readiness: 40%\n";
echo "=================================================\n";
?>
