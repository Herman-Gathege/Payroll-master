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

        // Ensure upload directory exists (publicly accessible)
        $uploadDir = __DIR__ . '/../uploads/agents/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Sanitize filename and store file
        $safeName = preg_replace('/[^A-Za-z0-9_\.-]/', '_', basename($file['name']));
        $fileName = uniqid() . '_' . $safeName;
        $filePath = $uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            return ['success' => false, 'message' => 'Failed to save uploaded file'];
        }

        // Save relative path for frontend use
        $relativePath = '/uploads/agents/' . $fileName;

        // Save to database
        require_once __DIR__ . '/../models/AgentDocument.php';
        $doc = new AgentDocument($this->conn);
        $doc->agent_id = $agent_id;
        $doc->doc_type = strtolower($doc_type);
        $doc->file_path = $relativePath;
        $doc->status = 'pending';

        if ($doc->upload()) {
            $agent = new Agent($this->conn);

            // ✅ Update onboarding stage to completed
            $agent->updateStage($agent_id, 'completed');

            // (Optional) Also automatically mark status as 'pending'
            $agent->updateStatus($agent_id, 'pending');

            return [
                'success' => true,
                'message' => 'Document uploaded successfully! Your onboarding is now complete.'
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
}
?>
