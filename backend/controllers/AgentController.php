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
     * 6️⃣ Review agent verification (approve/reject) with comments
     */
    public function reviewAgent($agent_id, $reviewer_id, $action, $comment = null) {
        if (!in_array($action, ['approved', 'rejected'])) {
            return ['success' => false, 'message' => 'Invalid action'];
        }

        try {
            $this->conn->beginTransaction();

            // 1️⃣ Insert review record
            $query = "INSERT INTO agent_reviews (agent_id, reviewer_id, action, comment) 
                    VALUES (:agent_id, :reviewer_id, :action, :comment)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':agent_id', $agent_id);
            $stmt->bindParam(':reviewer_id', $reviewer_id);
            $stmt->bindParam(':action', $action);
            $stmt->bindParam(':comment', $comment);
            $stmt->execute();

            // 2️⃣ Update agent status & stage
            $newStatus = ($action === 'approved') ? 'verified' : 'rejected';
            $newStage = ($action === 'approved') ? 'completed' : 'documents_rejected';

            $agent = new Agent($this->conn);
            $agent->updateStatus($agent_id, $newStatus);
            $agent->updateStage($agent_id, $newStage);

            // 3️⃣ Update all agent documents’ statuses
            $docStatus = ($action === 'approved') ? 'verified' : 'rejected';
            $updateDocs = $this->conn->prepare("
                UPDATE agent_documents 
                SET status = :status 
                WHERE agent_id = :agent_id
            ");
            $updateDocs->bindParam(':status', $docStatus);
            $updateDocs->bindParam(':agent_id', $agent_id);
            $updateDocs->execute();

            $this->conn->commit();

            // ✅ Return success response
            return [
                'success' => true,
                'message' => 'Agent ' . $action . ' and documents updated successfully.',
                'status' => $newStatus
            ];

        } catch (Exception $e) {
            $this->conn->rollBack();
            return [
                'success' => false,
                'message' => 'Error during review: ' . $e->getMessage()
            ];
        }
    }


}
?>
