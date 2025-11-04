<?php
require_once __DIR__ . '/../models/Agent.php';
require_once __DIR__ . '/../models/AgentProfile.php';
require_once __DIR__ . '/../models/AgentDocument.php';

class AgentController {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * 1️⃣ Register new agent (Stack Auth user completes onboarding step 1)
     */
    public function registerAgent($data) {
        $agent = new Agent($this->conn);
        $agent->stack_user_id = $data['stack_user_id'] ?? null;
        $agent->full_name = $data['full_name'] ?? '';
        $agent->email = $data['email'] ?? '';
        $agent->phone = $data['phone'] ?? '';
        $agent->status = 'pending';
        $agent->onboarding_stage = 'registration';

        if ($agent->create()) {
            return ['success' => true, 'message' => 'Agent registered successfully'];
        }
        return ['success' => false, 'message' => 'Failed to register agent'];
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
            // Update agent onboarding stage
            $agent = new Agent($this->conn);
            $agent->updateStage($agent_id, 'profile_completed');
            return ['success' => true, 'message' => 'Profile saved successfully'];
        }
        return ['success' => false, 'message' => 'Failed to save profile'];
    }

    /**
     * 3️⃣ Upload agent document (e.g. ID, KRA, etc.)
     */
    public function uploadDocument($agent_id, $doc_type, $file_path) {
        $doc = new AgentDocument($this->conn);
        $doc->agent_id = $agent_id;
        $doc->doc_type = $doc_type;
        $doc->file_path = $file_path;
        $doc->status = 'pending';

        if ($doc->upload()) {
            $agent = new Agent($this->conn);
            $agent->updateStage($agent_id, 'documents_uploaded');
            return ['success' => true, 'message' => 'Document uploaded successfully'];
        }
        return ['success' => false, 'message' => 'Failed to upload document'];
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
            $agent->updateStage($agent_id, $status === 'verified' ? 'completed' : 'rejected');
            return ['success' => true, 'message' => "Agent status updated to $status"];
        }
        return ['success' => false, 'message' => 'Failed to update agent status'];
    }
}
?>
