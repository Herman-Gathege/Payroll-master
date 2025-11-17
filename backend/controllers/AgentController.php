<?php
namespace Backend\Controllers;

use Backend\Models\Agent;
use Backend\Models\AgentProfile;
use Backend\Models\AgentDocument;
use Backend\Services\FileStorageService;
use PDO;

class AgentController
{
    private $pdo;
    private $agentModel;
    private $fileService;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->agentModel = new Agent($pdo);
        $this->fileService = new FileStorageService();
        session_start();
        error_reporting(E_ALL);
        ini_set('display_errors', 1);
    }

    /**
     * 1️⃣ Register new agent
     */
    public function register(array $data): array
    {
        try {
            $required = ['full_name', 'email', 'phone'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    throw new \Exception("Missing required field: $field");
                }
            }

            $agent = new Agent($this->pdo);
            $agent->stack_user_id = $data['stack_user_id'] ?? null;
            $agent->full_name = $data['full_name'];
            $agent->email = $data['email'];
            $agent->phone = $data['phone'];
            $agent->status = 'pending';
            $agent->onboarding_stage = 'registered';

            $agentId = $agent->create();

            // Handle file uploads
            $uploadedFiles = [];
            $fileKeys = ['id_front', 'id_back', 'profile_photo'];
            foreach ($fileKeys as $key) {
                if (!empty($_FILES[$key])) {
                    $uploadedFiles[$key] = $this->fileService->upload($agentId, $_FILES[$key], $key);
                }
            }

            return ['success' => true, 'message' => 'Agent registered successfully', 'agent_id' => $agentId];

        } catch (\PDOException $e) {
            if ($e->getCode() === 23000) {
                return ['success' => false, 'message' => 'Email already registered'];
            }
            return ['success' => false, 'message' => 'Database Error: ' . $e->getMessage()];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * 2️⃣ Complete agent profile
     */
    public function completeProfile(int $agentId, array $data): array
    {
        $profile = new AgentProfile($this->pdo);
        $profile->agent_id = $agentId;
        $profile->date_of_birth = $data['date_of_birth'] ?? null;
        $profile->id_number = $data['id_number'] ?? null;
        $profile->address = $data['address'] ?? '';
        $profile->gender = $data['gender'] ?? '';
        $profile->education_level = $data['education_level'] ?? '';
        $profile->referred_by = $data['referred_by'] ?? '';
        $profile->university_name = $data['university_name'] ?? '';
        $profile->university_email = $data['university_email'] ?? '';
        $profile->university_id = $data['university_id'] ?? '';

        if ($profile->upsert()) {
            $agent = new Agent($this->pdo);
            $agent->updateStage($agentId, 'profile_completed');

            return ['success' => true, 'message' => 'Profile saved successfully'];
        }

        return ['success' => false, 'message' => 'Failed to save profile'];
    }

    /**
     * 3️⃣ Upload agent document
     */
    public function uploadDocument(int $agentId, string $docType, array $file): array
    {
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            return ['success' => false, 'message' => 'Invalid or missing file'];
        }

        $allowedTypes = [
            'id_front' => 'National ID (Front)',
            'id_back' => 'National ID (Back)',
            'school_front' => 'School ID (Front)',
            'school_back' => 'School ID (Back)',
            'passport' => 'Passport',
            'license' => 'Driving License',
            'birth_certificate' => 'Birth Certificate',
        ];

        if (!array_key_exists(strtolower($docType), $allowedTypes)) {
            return ['success' => false, 'message' => 'Invalid document type'];
        }

        $uploadDir = __DIR__ . '/../uploads/agents/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $safeName = preg_replace('/[^A-Za-z0-9_\.-]/', '_', basename($file['name']));
        $fileName = uniqid($docType . '_') . '_' . $safeName;
        $filePath = $uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            return ['success' => false, 'message' => 'Failed to save uploaded file'];
        }

        $relativePath = '/uploads/agents/' . $fileName;

        $doc = new AgentDocument($this->pdo);
        $doc->agent_id = $agentId;
        $doc->doc_type = strtolower($docType);
        $doc->file_path = $relativePath;
        $doc->status = 'pending';
        $doc->label = $allowedTypes[strtolower($docType)];

        if ($doc->upload()) {
            $agent = new Agent($this->pdo);
            $agent->updateStage($agentId, 'documents_uploaded');

            return [
                'success' => true,
                'message' => "Uploaded {$allowedTypes[strtolower($docType)]} successfully!",
                'file' => $relativePath
            ];
        }

        return ['success' => false, 'message' => 'Database record failed to save'];
    }

    /**
     * 4️⃣ Verify or reject agent
     */
    public function reviewAgent(int $agentId, int $reviewerId, string $action, ?string $comment = null): array
    {
        if (!in_array($action, ['approved', 'rejected'])) {
            return ['success' => false, 'message' => 'Invalid action'];
        }

        $stmt = $this->pdo->prepare("INSERT INTO agent_reviews (agent_id, reviewer_id, action, comment)
                                     VALUES (:agent_id, :reviewer_id, :action, :comment)");
        $stmt->execute([
            ':agent_id' => $agentId,
            ':reviewer_id' => $reviewerId,
            ':action' => $action,
            ':comment' => $comment
        ]);

        $newStatus = $action === 'approved' ? 'verified' : 'rejected';
        $newStage = $action === 'approved' ? 'completed' : 'documents_rejected';

        $agent = new Agent($this->pdo);
        $agent->updateStatus($agentId, $newStatus);
        $agent->updateStage($agentId, $newStage);

        // Send email if exists
        $stmt = $this->pdo->prepare("SELECT a.email, a.full_name, p.id_number
                                     FROM agents a
                                     LEFT JOIN agent_profiles p ON a.id = p.agent_id
                                     WHERE a.id = :id LIMIT 1");
        $stmt->execute([':id' => $agentId]);
        $agentData = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!empty($agentData['email'])) {
            $this->sendReviewEmail($agentData, $newStatus, $comment);
        }

        return ['success' => true, 'message' => "Agent {$action} and notified via email", 'status' => $newStatus];
    }

    /**
     * ✉️ Send email notification
     */
    private function sendReviewEmail(array $agentData, string $status, ?string $comment = null): void
    {
        require_once __DIR__ . '/../config/mailer.php';

        $to = trim($agentData['email']);
        $name = $agentData['full_name'] ?? 'Agent';
        $idNumber = $agentData['id_number'] ?? 'N/A';
        $baseUrl = getEnvValue('APP_BASE_URL', 'http://localhost:3000');
        $loginUrl = rtrim($baseUrl, '/') . '/agent/login';

        $subject = $status === 'verified'
            ? "🎉 Your Agent Account Has Been Approved!"
            : "❌ Your Agent Application Was Not Approved";

        $message = $status === 'verified'
            ? "<p>Dear <strong>{$name}</strong>,</p>
               <p>Congratulations! Your agent account has been <strong>approved</strong>.</p>
               <p>Login: <a href='{$loginUrl}'>here</a>.</p>"
            : "<p>Dear <strong>{$name}</strong>,</p>
               <p>Your agent application was <strong>not approved</strong>.</p>
               <p>Reason: " . ($comment ?? "No reason provided.") . "</p>";

        $mail = getMailer();
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $message;

        try {
            if (!empty($to)) {
                $mail->addAddress($to, $name);
                $mail->send();
            }
        } catch (\Exception $e) {
            error_log("Email sending failed for {$to}: " . $e->getMessage());
        }
    }

    /**
     * 5️⃣ Agent login
     */
    public function login(): array
    {
        try {
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';
            if (!$email || !$password) throw new \Exception("Email and password required");

            $stmt = $this->pdo->prepare("SELECT * FROM agents WHERE email=?");
            $stmt->execute([$email]);
            $agent = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$agent) throw new \Exception("Agent not found");
            if (!password_verify($password, $agent['password'])) throw new \Exception("Invalid password");
            if ($agent['status'] !== 'approved') throw new \Exception("Account not approved yet");

            $_SESSION['agent_id'] = $agent['id'];
            $_SESSION['agent_name'] = $agent['full_name'] ?? '';
            return ['success' => true, 'message' => 'Login successful', 'agent' => $agent];

        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function logout(): array
    {
        session_destroy();
        return ['success' => true, 'message' => 'Logged out successfully'];
    }
}
?>
