<?php
require_once 'utils/EmailService.php';

$emailService = new EmailService();

echo "Testing SMTP connection to lixnet.net...\n";
$result = $emailService->testConnection();

if ($result['success']) {
    echo "SUCCESS! Email is 100% working!\n";
    echo "You can now send payslips to all employees.\n";
} else {
    echo "FAILED: " . $result['message'] . "\n";
}
