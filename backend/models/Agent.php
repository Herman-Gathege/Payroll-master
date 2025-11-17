<?php
class Agent {
    private $conn;
    private $table = "agents";

    public $id;
    public $stack_user_id;
    public $full_name;
    public $email;
    public $phone;
    public $status;
    public $onboarding_stage;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Create a new agent record
     * Returns: inserted agent ID or false
     */
    public function create() {
        $query = "INSERT INTO {$this->table} 
                  (stack_user_id, full_name, email, phone, status, onboarding_stage)
                  VALUES (:stack_user_id, :full_name, :email, :phone, :status, :onboarding_stage)";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":stack_user_id", $this->stack_user_id);
        $stmt->bindParam(":full_name", $this->full_name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":onboarding_stage", $this->onboarding_stage);

        if ($stmt->execute()) {
            return $this->conn->lastInsertId(); // ✅ return agent ID
        }

        return false;
    }

    /**
     * Get single agent by ID
     */
    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get all agents
     */
    public function getAll() {
        $query = "SELECT * FROM {$this->table} ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    /**
     * Update agent status
     */
    public function updateStatus($id, $status) {
        $query = "UPDATE {$this->table} 
                  SET status = :status, updated_at = NOW() 
                  WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }

    /**
     * Update onboarding stage
     */
    public function updateStage($id, $stage) {
        $query = "UPDATE {$this->table} 
                  SET onboarding_stage = :stage, updated_at = NOW() 
                  WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":stage", $stage);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }
}
?>
