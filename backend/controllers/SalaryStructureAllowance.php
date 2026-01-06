<?php
// backend/controllers/SalaryStructureAllowance.php

class SalaryStructureAllowance {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll($structure_id) {
        $stmt = $this->db->prepare("SELECT * FROM salary_structure_allowances WHERE structure_id=:sid");
        $stmt->execute([':sid'=>$structure_id]);
        echo json_encode(["success"=>true, "data"=>$stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function create($structure_id, $data) {
        $stmt = $this->db->prepare("INSERT INTO salary_structure_allowances (structure_id, name, amount, formula, taxable) VALUES (:sid, :name, :amount, :formula, :taxable)");
        $stmt->execute([
            ':sid'=>$structure_id,
            ':name'=>$data['name'],
            ':amount'=>$data['amount'] ?? 0,
            ':formula'=>$data['formula'] ?? null,
            ':taxable'=>$data['taxable'] ?? 0
        ]);
        echo json_encode(["success"=>true, "message"=>"Allowance added"]);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM salary_structure_allowances WHERE id=:id");
        $stmt->execute([':id'=>$id]);
        echo json_encode(["success"=>true, "message"=>"Allowance deleted"]);
    }
}
