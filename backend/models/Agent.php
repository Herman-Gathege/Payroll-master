<?php
namespace Backend\Models;

use PDO;

class Agent
{
    private $pdo;
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

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Create a new agent record
     * Returns: inserted agent ID or false
     */
    public function create(array $data = []): int|false
    {
        // Use master fields if $data is empty
        $stack_user_id = $data['stack_user_id'] ?? $this->stack_user_id ?? null;
        $full_name = $data['full_name'] ?? $this->full_name ?? '';
        $email = $data['email'] ?? $this->email ?? '';
        $phone = $data['phone'] ?? $this->phone ?? '';
        $status = $data['status'] ?? $this->status ?? 'pending';
        $stage = $data['onboarding_stage'] ?? $this->onboarding_stage ?? 'registered';

        $query = "INSERT INTO {$this->table} 
                  (stack_user_id, full_name, email, phone, status, onboarding_stage)
                  VALUES (:stack_user_id, :full_name, :email, :phone, :status, :onboarding_stage)";

        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(":stack_user_id", $stack_user_id);
        $stmt->bindParam(":full_name", $full_name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":phone", $phone);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":onboarding_stage", $stage);

        if ($stmt->execute()) {
            return (int)$this->pdo->lastInsertId();
        }

        return false;
    }

    /**
     * Get single agent by ID
     */
    public function find(int $id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = :id LIMIT 1");
        $stmt->bindParam(":id", $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get all agents
     */
    public function getAll(): array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} ORDER BY created_at DESC");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Update agent status
     */
    public function updateStatus(int $id, string $status): bool
    {
        $stmt = $this->pdo->prepare("UPDATE {$this->table} 
                                     SET status = :status, updated_at = NOW() 
                                     WHERE id = :id");
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }

    /**
     * Update onboarding stage
     */
    public function updateStage(int $id, string $stage): bool
    {
        $stmt = $this->pdo->prepare("UPDATE {$this->table} 
                                     SET onboarding_stage = :stage, updated_at = NOW() 
                                     WHERE id = :id");
        $stmt->bindParam(":stage", $stage);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }
}
?>
