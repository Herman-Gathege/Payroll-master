<?php
// backend/controllers/SalaryStructureBenefit.php

class SalaryStructureBenefit {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll($structure_id) {
        $stmt = $this->db->prepare("SELECT * FROM salary_structure_benefits WHERE structure_id=:sid");
        $stmt->execute([':sid'=>$structure_id]);
        echo json_encode(["success"=>true, "data"=>$stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    public function create($structure_id, $data) {
        $stmt = $this->db->prepare("INSERT INTO salary_structure_benefits (structure_id, name, amount, benefit_type, taxable, notes) VALUES (:sid, :name, :amount, :type, :taxable, :notes)");
        $stmt->execute([
            ':sid'=>$structure_id,
            ':name'=>$data['name'],
            ':amount'=>$data['amount'] ?? 0,
            ':type'=>$data['benefit_type'] ?? 'fixed',
            ':taxable'=>$data['taxable'] ?? 0,
            ':notes'=>$data['notes'] ?? null
        ]);
        echo json_encode(["success"=>true, "message"=>"Benefit added"]);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM salary_structure_benefits WHERE id=:id");
        $stmt->execute([':id'=>$id]);
        echo json_encode(["success"=>true, "message"=>"Benefit deleted"]);
    }
}
