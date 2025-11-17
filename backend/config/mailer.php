<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

/**
 * ✅ Helper to safely read env vars
 */
function getEnvValue($key, $default = null) {
    $value = getenv($key);
    if ($value === false && isset($_ENV[$key])) {
        $value = $_ENV[$key];
    }
    return $value ?: $default;
}

/**
 * ✅ Returns a fully configured PHPMailer instance.
 * If MAIL_HOST is missing, it logs emails instead of sending.
 */
function getMailer() {
    $smtpHost = getEnvValue('MAIL_HOST');
    $localMode = empty($smtpHost);

    $mail = new PHPMailer(true);
    $mail->isHTML(true);
    $mail->setFrom(
        getEnvValue('MAIL_FROM_ADDRESS', 'no-reply@evolvepayroll.com'),
        getEnvValue('MAIL_FROM_NAME', 'Evolve Payroll')
    );

    if ($localMode) {
        // ✅ Local mode — fully mock sending
        $mockMailer = new class extends PHPMailer {
            public function send() {
                $logDir = __DIR__ . '/../logs';
                if (!is_dir($logDir)) mkdir($logDir, 0777, true);
                $logFile = $logDir . '/email.log';

                $toAddresses = array_map(fn($a) => $a[0], $this->getToAddresses());
                $subject = $this->Subject ?: '(no subject)';
                $body = $this->Body ?: '(no body)';

                $content = "[" . date('Y-m-d H:i:s') . "] LOCAL EMAIL (mock send)\n";
                $content .= "To: " . implode(', ', $toAddresses) . "\n";
                $content .= "Subject: " . $subject . "\n";
                $content .= "Body:\n" . strip_tags($body) . "\n\n";

                file_put_contents($logFile, $content, FILE_APPEND);
                error_log("📨 Mock email logged to /backend/logs/email.log");
                return true;
            }
        };
        $mockMailer->isHTML(true);
        $mockMailer->setFrom(
            getEnvValue('MAIL_FROM_ADDRESS', 'no-reply@evolvepayroll.com'),
            getEnvValue('MAIL_FROM_NAME', 'Evolve Payroll')
        );
        return $mockMailer;
    }

    // 📬 Production mode
    $mail->isSMTP();
    $mail->Host = $smtpHost;
    $mail->SMTPAuth = true;
    $mail->Username = getEnvValue('MAIL_USERNAME');
    $mail->Password = getEnvValue('MAIL_PASSWORD');
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = getEnvValue('MAIL_PORT', 587);

    return $mail;
}


