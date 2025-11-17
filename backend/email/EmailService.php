<?php
namespace Backend\Email;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/MailConfig.php';

use Backend\Config\MailConfig;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    private static $templatePath = __DIR__ . '/Templates/';

    private static function sendEmail($to, $subject, $templateFile, $data = [])
    {
        $mail = new PHPMailer(true);

        try {
            // Load template
            $template = file_get_contents(self::$templatePath . $templateFile);
            foreach ($data as $key => $value) {
                $template = str_replace('{{' . $key . '}}', $value, $template);
            }

            // SMTP configuration
            $mail->isSMTP();
            $mail->Host       = MailConfig::SMTP_HOST;
            $mail->SMTPAuth   = true;
            $mail->Username   = MailConfig::SMTP_USER;
            $mail->Password   = MailConfig::SMTP_PASS;
            $mail->SMTPSecure = MailConfig::SMTP_SECURE; 
            $mail->Port       = MailConfig::SMTP_PORT;

            // Sender and recipient
            $mail->setFrom(MailConfig::FROM_ADDRESS, MailConfig::FROM_NAME);
            $mail->addReplyTo(MailConfig::REPLY_TO);
            $mail->addAddress($to);

            // Email content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $template;

            return $mail->send();

        } catch (Exception $e) {
            error_log("PHPMailer Exception: " . $e->getMessage());
            return false;
        }
    }

    public static function sendApprovalEmail($to, $data)
    {
        return self::sendEmail($to, 'Agent Application Approved', 'approval.html', $data);
    }

    public static function sendRejectionEmail($to, $data)
    {
        return self::sendEmail($to, 'Agent Application Rejected', 'rejection.html', $data);
    }
}
