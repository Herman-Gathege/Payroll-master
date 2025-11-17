<?php
namespace Backend\Controllers;

use Backend\Email\EmailService;
use Backend\Email\Templates\ApprovalTemplate;
use PDO;

class AdminApprovalController
{
    private $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function approveAgent($agentId)
    {
        $stmt = $this->pdo->prepare("SELECT first_name, email FROM agents WHERE id = ?");
        $stmt->execute([$agentId]);
        $agent = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$agent) {
            return ['success' => false, 'error' => 'Agent not found'];
        }

        $this->pdo->prepare("UPDATE agents SET status = 'approved' WHERE id = ?")->execute([$agentId]);

        $subject = "Your Lixnet Sales Agent Application has been Approved!";
        $body = ApprovalTemplate::approved($agent['first_name']);
        EmailService::send($agent['email'], $subject, $body);

        return ['success' => true, 'message' => 'Agent approved and notified'];
    }

    public function rejectAgent($agentId, $reason)
    {
        $stmt = $this->pdo->prepare("SELECT first_name, email FROM agents WHERE id = ?");
        $stmt->execute([$agentId]);
        $agent = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$agent) {
            return ['success' => false, 'error' => 'Agent not found'];
        }

        $this->pdo->prepare("UPDATE agents SET status = 'rejected' WHERE id = ?")->execute([$agentId]);

        $subject = "Lixnet Sales Agent Application - Update";
        $body = ApprovalTemplate::rejected($agent['first_name'], $reason);
        EmailService::send($agent['email'], $subject, $body);

        return ['success' => true, 'message' => 'Agent rejected and notified'];
    }
}
