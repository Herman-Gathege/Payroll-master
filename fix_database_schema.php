<?php
/**
 * Fix database schema for production endpoints
 */

require_once 'backend/config/database.php';

echo "=================================================\n";
echo "Fixing Database Schema\n";
echo "=================================================\n\n";

$database = new Database();
$db = $database->getConnection();

try {
    // Fix 1: Add missing columns to departments table
    echo "1. Fixing departments table...\n";
    $db->exec("ALTER TABLE departments ADD COLUMN IF NOT EXISTS manager_id INT NULL");
    $db->exec("ALTER TABLE departments ADD COLUMN IF NOT EXISTS description TEXT NULL");
    echo "   ✅ Added manager_id and description columns\n\n";

    // Fix 2: Add missing columns to positions table
    echo "2. Fixing positions table...\n";
    $db->exec("ALTER TABLE positions ADD COLUMN IF NOT EXISTS description TEXT NULL");
    $db->exec("ALTER TABLE positions ADD COLUMN IF NOT EXISTS min_salary DECIMAL(10,2) NULL");
    $db->exec("ALTER TABLE positions ADD COLUMN IF NOT EXISTS max_salary DECIMAL(10,2) NULL");
    echo "   ✅ Added description and salary range columns\n\n";

    // Fix 3: Create bank_codes table
    echo "3. Creating bank_codes table...\n";
    $db->exec("CREATE TABLE IF NOT EXISTS bank_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bank_name VARCHAR(100) NOT NULL,
        bank_code VARCHAR(10) NOT NULL UNIQUE,
        swift_code VARCHAR(20) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "   ✅ Created bank_codes table\n\n";

    // Fix 4: Add common Kenyan banks
    echo "4. Adding Kenyan banks...\n";
    $banks = [
        ['KCB Bank Kenya', '01', 'KCBLKENX'],
        ['Equity Bank', '68', 'EQBLKENA'],
        ['Co-operative Bank', '11', 'KCOOKENA'],
        ['Absa Bank Kenya', '03', 'BARCKENX'],
        ['Standard Chartered', '02', 'SCBLKENX'],
        ['NCBA Bank', '07', 'CBAFKENX'],
        ['Stanbic Bank', '31', 'SBICKENX'],
        ['Diamond Trust Bank', '63', 'DTKEKENA'],
        ['I&M Bank', '57', 'IMBLKENA'],
        ['Family Bank', '70', 'FABLKENX']
    ];

    $insert_query = "INSERT IGNORE INTO bank_codes (bank_name, bank_code, swift_code) VALUES (?, ?, ?)";
    $stmt = $db->prepare($insert_query);

    foreach ($banks as $bank) {
        $stmt->execute($bank);
    }
    echo "   ✅ Added " . count($banks) . " Kenyan banks\n\n";

    // Fix 5: Check payroll table structure
    echo "5. Checking payroll table...\n";
    $result = $db->query("SHOW COLUMNS FROM payroll LIKE 'gross_salary'");
    if ($result->rowCount() == 0) {
        // If gross_salary doesn't exist, we need to check what columns exist
        echo "   ⚠️  'gross_salary' column not found. Checking payroll table structure...\n";
        $columns = $db->query("SHOW COLUMNS FROM payroll")->fetchAll(PDO::FETCH_COLUMN);
        echo "   Existing columns: " . implode(', ', $columns) . "\n";

        // Add gross_salary column
        $db->exec("ALTER TABLE payroll ADD COLUMN gross_salary DECIMAL(10,2) NOT NULL DEFAULT 0");
        echo "   ✅ Added gross_salary column\n\n";
    } else {
        echo "   ✅ Payroll table structure is correct\n\n";
    }

    echo "=================================================\n";
    echo "✅ Database schema fixed successfully!\n";
    echo "=================================================\n\n";

    echo "Now run: php test_endpoints_curl.php\n";

} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
?>
