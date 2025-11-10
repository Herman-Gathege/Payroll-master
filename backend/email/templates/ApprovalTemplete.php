<?php
namespace Backend\Email\Templates;

class ApprovalTemplate
{
    public static function approved($agentName)
    {
        return "
        <html>
        <body style='font-family: Arial, sans-serif; color: #333;'>
            <h2 style='color: #2E8B57;'>🎉 Welcome aboard, {$agentName}!</h2>
            <p>Congratulations! Your application to become a <b>Lixnet Sales Agent</b> has been approved.</p>
            <p>You can now log in to your dashboard and start representing our software solutions.</p>
            <a href='http://localhost/Payroll-master/frontend/login' 
               style='background-color:#2E8B57; color:#fff; padding:10px 15px; text-decoration:none; border-radius:5px;'>
               Go to Dashboard
            </a>
            <p>— Lixnet Technologies Team</p>
        </body>
        </html>
        ";
    }

    public static function rejected($agentName, $reason)
    {
        return "
        <html>
        <body style='font-family: Arial, sans-serif; color: #333;'>
            <h2 style='color: #B22222;'>😞 Application Update for {$agentName}</h2>
            <p>Thank you for applying to become a Lixnet Sales Agent.</p>
            <p>Unfortunately, your application was not approved.</p>
            <p><b>Reason:</b> {$reason}</p>
            <p>You may review your details and reapply if possible.</p>
            <p>— Lixnet Technologies Team</p>
        </body>
        </html>
        ";
    }
}
