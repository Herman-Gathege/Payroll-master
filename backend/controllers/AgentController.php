<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../models/Agent.php';
require_once __DIR__ . '/../models/AgentProfile.php';
require_once __DIR__ . '/../models/AgentDocument.php';

class AgentController {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * 1️⃣ Register new agent
     */
    public function registerAgent($data) {
        try {
            $agent = new Agent($this->conn);
            $agent->stack_user_id = $data['stack_user_id'] ?? null;
            $agent->full_name = $data['full_name'] ?? '';
            $agent->email = $data['email'] ?? '';
            $agent->phone = $data['phone'] ?? '';
            $agent->status = 'pending';
            $agent->onboarding_stage = 'registered';

            $agent_id = $agent->create();

            if ($agent_id) {
                return [
                    'success' => true,
                    'message' => 'Agent registered successfully',
                    'agent_id' => $agent_id
                ];
            }

            return ['success' => false, 'message' => 'Failed to register agent'];
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                return [
                    'success' => false,
                    'message' => 'This email is already registered. Please use a different email.'
                ];
            }
            return ['success' => false, 'message' => 'Database Error: ' . $e->getMessage()];
        }
    }

    /**
     * 2️⃣ Complete agent profile
     */
    public function completeProfile($agent_id, $data) {
        $profile = new AgentProfile($this->conn);
        $profile->agent_id = $agent_id;
        $profile->date_of_birth = $data['date_of_birth'] ?? null;
        $profile->id_number = $data['id_number'] ?? null;
        $profile->address = $data['address'] ?? '';
        $profile->gender = $data['gender'] ?? '';
        $profile->education_level = $data['education_level'] ?? '';
        $profile->referred_by = $data['referred_by'] ?? '';

        // ✅ new fields
        $profile->university_name = $data['university_name'] ?? '';
        $profile->university_email = $data['university_email'] ?? '';
        $profile->university_id = $data['university_id'] ?? '';

        if ($profile->upsert()) {
            $agent = new Agent($this->conn);
            $agent->updateStage($agent_id, 'profile_completed');

            return [
                'success' => true,
                'message' => 'Profile saved successfully'
            ];
        }

        return ['success' => false, 'message' => 'Failed to save profile'];
    }


    /**
 * 3️⃣ Upload agent document
 */
    public function uploadDocument($agent_id, $doc_type, $file) {
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'Invalid or missing file'];
        }

        // ✅ Validate document type (allow only known keys)
        $allowedTypes = [
            'id_front' => 'National ID (Front)',
            'id_back' => 'National ID (Back)',
            'school_front' => 'School ID (Front)',
            'school_back' => 'School ID (Back)',
            'passport' => 'Passport',
            'license' => 'Driving License',
            'birth_certificate' => 'Birth Certificate',
        ];

        if (!array_key_exists(strtolower($doc_type), $allowedTypes)) {
            return ['success' => false, 'message' => 'Invalid document type'];
        }

        // ✅ Ensure upload directory exists (publicly accessible)
        $uploadDir = __DIR__ . '/../uploads/agents/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // ✅ Sanitize and move file
        $safeName = preg_replace('/[^A-Za-z0-9_\.-]/', '_', basename($file['name']));
        $fileName = uniqid($doc_type . '_') . '_' . $safeName;
        $filePath = $uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            return ['success' => false, 'message' => 'Failed to save uploaded file'];
        }

        $relativePath = '/uploads/agents/' . $fileName;

        // ✅ Save to database
        require_once __DIR__ . '/../models/AgentDocument.php';
        $doc = new AgentDocument($this->conn);
        $doc->agent_id = $agent_id;
        $doc->doc_type = strtolower($doc_type);
        $doc->file_path = $relativePath;
        $doc->status = 'pending';
        $doc->label = $allowedTypes[strtolower($doc_type)];

        if ($doc->upload()) {
            // Update agent stage to documents_uploaded if not already done
            $agent = new Agent($this->conn);
            $agent->updateStage($agent_id, 'documents_uploaded');

            return [
                'success' => true,
                'message' => "Uploaded {$allowedTypes[strtolower($doc_type)]} successfully!",
                'file' => $relativePath
            ];
        }

        return ['success' => false, 'message' => 'Database record failed to save'];
    }




    /**
     * 4️⃣ Fetch pending verification agents
     */
    public function getPendingVerifications() {
        $query = "SELECT * FROM agents WHERE status = 'pending' ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * 5️⃣ Verify or reject agent
     */
    public function verifyAgent($agent_id, $status) {
        $agent = new Agent($this->conn);

        if ($agent->updateStatus($agent_id, $status)) {
            $agent->updateStage(
                $agent_id,
                $status === 'verified' ? 'completed' : 'rejected'
            );

            return [
                'success' => true,
                'message' => "Agent status updated to $status"
            ];
        }

        return ['success' => false, 'message' => 'Failed to update agent status'];
    }

    // inside AgentController class

/**
 * Return list of agents with basic fields (admin list)
 */
public function getAllAgents($filter = null) {
    $query = "SELECT a.id, a.full_name, a.email, a.phone, a.status, a.onboarding_stage, a.created_at
              FROM agents a";

    if ($filter === 'pending') {
        $query .= " WHERE a.status = 'pending' OR a.onboarding_stage != 'completed'";
    } elseif ($filter === 'verified') {
        $query .= " WHERE a.status = 'verified'";
    } elseif ($filter === 'rejected') {
        $query .= " WHERE a.status = 'rejected'";
    }

    $query .= " ORDER BY a.created_at DESC";

    $stmt = $this->conn->prepare($query);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Get a single agent full details including profile and documents
 */
public function getAgentById($agent_id) {
    // Agent core
    $query = "SELECT * FROM agents WHERE id = :id LIMIT 1";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $agent_id);
    $stmt->execute();
    $agent = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$agent) return null;

    // Profile
    $query = "SELECT * FROM agent_profiles WHERE agent_id = :id LIMIT 1";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $agent_id);
    $stmt->execute();
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    // Documents
    $query = "SELECT id, doc_type, file_path, status, uploaded_at FROM agent_documents WHERE agent_id = :id ORDER BY uploaded_at DESC";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $agent_id);
    $stmt->execute();
    $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Reviews
    $query = "SELECT r.*, u.username as reviewer_username FROM agent_reviews r LEFT JOIN users u ON r.reviewer_id = u.id WHERE r.agent_id = :id ORDER BY r.created_at DESC";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':id', $agent_id);
    $stmt->execute();
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    return [
        'agent' => $agent,
        'profile' => $profile,
        'documents' => $documents,
        'reviews' => $reviews
    ];
}

    /**
 * ✅ Review (approve/reject) an agent and send email notification
 */
public function reviewAgent($agent_id, $reviewer_id, $action, $comment = null) {
    if (!in_array($action, ['approved', 'rejected'])) {
        return ['success' => false, 'message' => 'Invalid action'];
    }

    // Record the review
    $query = "INSERT INTO agent_reviews (agent_id, reviewer_id, action, comment)
              VALUES (:agent_id, :reviewer_id, :action, :comment)";
    $stmt = $this->conn->prepare($query);
    $stmt->bindParam(':agent_id', $agent_id);
    $stmt->bindParam(':reviewer_id', $reviewer_id);
    $stmt->bindParam(':action', $action);
    $stmt->bindParam(':comment', $comment);
    $stmt->execute();

    // Update main agent record
    $newStatus = ($action === 'approved') ? 'verified' : 'rejected';
    $newStage = ($action === 'approved') ? 'completed' : 'documents_rejected';

    $agent = new Agent($this->conn);
    $agent->updateStatus($agent_id, $newStatus);
    $agent->updateStage($agent_id, $newStage);

    // 🔹 Get agent email + name
    $stmt = $this->conn->prepare("SELECT email, full_name FROM agents WHERE id = :id LIMIT 1");
    $stmt->execute([':id' => $agent_id]);
    $agentData = $stmt->fetch(PDO::FETCH_ASSOC);

    // 🔹 Get ID number from profile (if exists)
    $stmt = $this->conn->prepare("SELECT id_number FROM agent_profiles WHERE agent_id = :id LIMIT 1");
    $stmt->execute([':id' => $agent_id]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($profile) {
        $agentData['id_number'] = $profile['id_number'];
    }

    // ✅ Send email only if email exists
    if (!empty($agentData) && !empty($agentData['email'])) {
        $this->sendReviewEmail($agentData, $newStatus, $comment);
    } else {
        error_log("⚠️ Skipped email: No agent email found for ID {$agent_id}");
    }

    return [
        'success' => true,
        'message' => "Agent {$action} and notified via email (if available)",
        'status' => $newStatus
    ];
}


/**
 * ✉️ Send email notification to agent after review
 */
private function sendReviewEmail($agentData, $status, $comment = null) {
    require_once __DIR__ . '/../config/mailer.php';

    $to = trim($agentData['email']);
    $name = $agentData['full_name'] ?? 'Agent';
    $idNumber = $agentData['id_number'] ?? 'N/A';

    // 🚀 Load app URL from env (defaults to localhost)
    $baseUrl = getEnvValue('APP_BASE_URL', 'http://localhost:3000');
    $loginUrl = rtrim($baseUrl, '/') . '/agent/login';

    $subject = '';
    $message = '';

    if ($status === 'verified') {
        $subject = "🎉 Your Agent Account Has Been Approved!";
        $message = "
            <p>Dear <strong>{$name}</strong>,</p>
            <p>Congratulations! Your agent account has been <strong>approved</strong> and verified successfully.</p>
            <p>You can now log in to your dashboard using the following credentials:</p>
            <ul>
                <li><strong>Username:</strong> {$name}</li>
                <li><strong>Password:</strong> Your Personal ID Number ({$idNumber})</li>
            </ul>
            <p><a href='{$loginUrl}' style='color:#1a73e8'>Click here to log in</a>.</p>
            <p>Welcome aboard!</p>
            <p>– The Evolve Payroll Team</p>
        ";
    } else {
        $subject = "❌ Your Agent Application Was Not Approved";
        $message = "
            <p>Dear <strong>{$name}</strong>,</p>
            <p>We regret to inform you that your agent application was <strong>not approved</strong> at this time.</p>
            <p>Reason: " . ($comment ?: "No specific reason provided.") . "</p>
            <p>You may update and resubmit your documents after reviewing the feedback.</p>
            <p>– The Evolve Payroll Team</p>
        ";
    }

    // 📨 Send via PHPMailer
    $mail = getMailer();
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $message;

    try {
        if (!empty($to)) {
            $mail->addAddress($to, $name);
            $mail->send();
        } else {
            error_log("⚠️ Email not sent: Missing recipient address for agent {$name}");
        }
    } catch (Exception $e) {
        error_log("❌ Email sending failed for {$to}: " . $e->getMessage());
    }
}






}
?>
