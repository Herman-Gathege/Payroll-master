<?php
class AgentDocument {
    private $conn;
    private $table = "agent_documents";

    public $id;
    public $agent_id;
    public $doc_type;
    public $file_path;
    public $label;
    public $status;
    public $uploaded_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function upload() {
        $query = "INSERT INTO {$this->table} (agent_id, doc_type, file_path, status, uploaded_at)
                  VALUES (:agent_id, :doc_type, :file_path, :status, NOW())";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':agent_id', $this->agent_id);
        $stmt->bindParam(':doc_type', $this->doc_type);
        $stmt->bindParam(':file_path', $this->file_path);
        $stmt->bindParam(':status', $this->status);

        return $stmt->execute();
    }

    public function getByAgent($agent_id) {
        $query = "SELECT id, doc_type, file_path, status, uploaded_at
                  FROM {$this->table}
                  WHERE agent_id = :agent_id
                  ORDER BY uploaded_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':agent_id', $agent_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Verify document
    public function updateStatus($id, $status) {
        $query = "UPDATE " . $this->table . " SET status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $id);
        return $stmt->execute();
    }
}
?>
