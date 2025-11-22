<?php
// backend/models/Department.php

class Department {
    private $conn;
    private $table_name = "departments";

    public $id;
    public $name;
    public $description;
    public $created_at;
    public $updated_at;

    public function __construct(PDO $db) {
        $this->conn = $db;
    }

    // CREATE
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " SET name=:name, description=:description, created_at=NOW(), updated_at=NOW()";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':name', htmlspecialchars(strip_tags($this->name)));
        $stmt->bindParam(':description', htmlspecialchars(strip_tags($this->description)));
        return $stmt->execute();
    }

    // READ ALL
    public function readAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt;
    }

    // READ ONE
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // UPDATE
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET name=:name, description=:description, updated_at=NOW()
                  WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':name', htmlspecialchars(strip_tags($this->name)));
        $stmt->bindParam(':description', htmlspecialchars(strip_tags($this->description)));
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    // DELETE
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
?>
