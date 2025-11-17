<?php
namespace Backend\Config;

class MailConfig
{
    public const SMTP_HOST = 'mail.lixnet.co.ke'; 
    public const SMTP_USER = 'no-reply@lixnet.co.ke';
    public const SMTP_PASS = 'your-email-password-or-app-password';
    public const SMTP_PORT = 465; 
    public const SMTP_SECURE = 'ssl';

    public const FROM_ADDRESS = 'no-reply@lixnet.co.ke';
    public const FROM_NAME = 'Lixnet Technologies';
    public const REPLY_TO = 'no-reply@lixnet.co.ke'; 
}
?>
