<?php
class VerificationEmail
{
    private $recipient;
    private $verificationLink;

    public function __construct($recipient, $token)
    {
        $this->recipient = $recipient;
        $this->verificationLink = $_ENV['APP_URL'] . "/auth/verify-email?token=" . urlencode($token);
    }

    public function getSubject()
    {
        return "Verify Your Email Address";
    }

    public function getBody()
    {
        return "
        <html>
            <body style='font-family: Arial, sans-serif; color: #333;'>
                <h2>Welcome to Lixnet Software Marketplace!</h2>
                <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
                <p>
                    <a href='{$this->verificationLink}' 
                       style='background-color: #007bff; color: white; padding: 10px 20px; 
                              text-decoration: none; border-radius: 5px;'>
                        Verify Email
                    </a>
                </p>
                <p>If you did not create this account, you can ignore this email.</p>
                <br>
                <p>Best regards,<br><strong>The Lixnet Team</strong></p>
            </body>
        </html>
        ";
    }
}
