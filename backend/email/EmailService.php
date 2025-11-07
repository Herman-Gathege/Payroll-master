<?php
namespace Backend\Email;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/MailConfig.php';

use Backend\Config\MailConfig;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    public static function send($to, $subject, $message)
    {
        $mail = new PHPMailer(true);

        try {
            // SMTP configuration
            $mail->isSMTP();
            $mail->Host       = MailConfig::SMTP_HOST;
            $mail->SMTPAuth   = true;
            $mail->Username   = MailConfig::SMTP_USER;
            $mail->Password   = MailConfig::SMTP_PASS;
            $mail->SMTPSecure = MailConfig::SMTP_SECURE; // 'tls' or 'ssl'
            $mail->Port       = MailConfig::SMTP_PORT;   // 465 or 587

            // Sender and recipient settings
            $mail->setFrom(MailConfig::FROM_ADDRESS, MailConfig::FROM_NAME);
            $mail->addReplyTo(MailConfig::REPLY_TO);
            $mail->addAddress($to);

            // Email content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $message;

            // Attempt send
            if ($mail->send()) {
                echo "✅ Email sent successfully!";
                return true;
            } else {
                echo "❌ Failed to send email. Mailer Error: " . $mail->ErrorInfo;
                return false;
            }

        } catch (Exception $e) {
            // Show PHPMailer exception message
            echo "❌ PHPMailer Exception: " . $e->getMessage();
            error_log("PHPMailer Exception: " . $e->getMessage());
            return false;
        }
    }
}
?>
