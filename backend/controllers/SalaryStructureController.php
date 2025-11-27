<?php
// backend/controllers/SalaryStructureController.php

class SalaryStructureController
{
    private $db;
    private $org_id;

    public function __construct($db, $org_id)
    {
        $this->db = $db;
        $this->org_id = $org_id;
    }

    /* ============================================================
        SALARY STRUCTURES CRUD
    ============================================================ */

    public function getAll()
    {
        $sql = "SELECT id, title, basic_salary, description, created_at 
                FROM salary_structures 
                WHERE organization_id = :org 
                ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':org' => $this->org_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getOne($id)
    {
        // Main structure
        $sql = "SELECT id, title, basic_salary, description, created_at 
                FROM salary_structures 
                WHERE id = :id AND organization_id = :org LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id, ':org' => $this->org_id]);
        $structure = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$structure) return null;

        // Allowances
        $al = $this->db->prepare(
            "SELECT id, name, amount, formula, taxable 
             FROM salary_structure_allowances 
             WHERE structure_id = :sid"
        );
        $al->execute([':sid' => $id]);
        $structure['allowances'] = $al->fetchAll(PDO::FETCH_ASSOC);

        // Benefits
        $bt = $this->db->prepare(
            "SELECT id, name, amount, benefit_type, taxable, notes 
             FROM salary_structure_benefits 
             WHERE structure_id = :sid"
        );
        $bt->execute([':sid' => $id]);
        $structure['benefits'] = $bt->fetchAll(PDO::FETCH_ASSOC);

        return $structure;
    }

    public function create($data)
    {
        $sql = "INSERT INTO salary_structures 
                (organization_id, title, basic_salary, description) 
                VALUES (:org, :title, :basic_salary, :description)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':org' => $this->org_id,
            ':title' => $data['title'],
            ':basic_salary' => $data['basic_salary'],
            ':description' => $data['description'] ?? null
        ]);

        return $this->db->lastInsertId();
    }

    public function update($id, $data)
    {
        $sql = "UPDATE salary_structures SET 
                    title = :title, 
                    basic_salary = :basic_salary, 
                    description = :description
                WHERE id = :id AND organization_id = :org";

        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':title' => $data['title'],
            ':basic_salary' => $data['basic_salary'],
            ':description' => $data['description'] ?? null,
            ':id' => $id,
            ':org' => $this->org_id
        ]);
    }

    public function delete($id)
    {
        $sql = "DELETE FROM salary_structures 
                WHERE id = :id AND organization_id = :org";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':id' => $id, ':org' => $this->org_id]);
    }

    /* ============================================================
        ALLOWANCES CRUD
    ============================================================ */

    public function saveAllowances($structure_id, $allowances)
    {
        // Remove old allowances
        $this->db->prepare("DELETE FROM salary_structure_allowances WHERE structure_id = :sid")
                 ->execute([':sid' => $structure_id]);

        // Insert fresh ones
        $sql = "INSERT INTO salary_structure_allowances 
                (structure_id, name, amount, formula, taxable)
                VALUES (:sid, :name, :amount, :formula, :taxable)";
        $stmt = $this->db->prepare($sql);

        foreach ($allowances as $a) {
            $stmt->execute([
                ':sid' => $structure_id,
                ':name' => $a['name'],
                ':amount' => $a['amount'] ?? 0,
                ':formula' => $a['formula'] ?? null,
                ':taxable' => $a['taxable'] ?? 0
            ]);
        }
    }

    /* ============================================================
        BENEFITS CRUD
    ============================================================ */

    public function saveBenefits($structure_id, $benefits)
    {
        // Remove old benefits
        $this->db->prepare("DELETE FROM salary_structure_benefits WHERE structure_id = :sid")
                 ->execute([':sid' => $structure_id]);

        // Insert updated benefits
        $sql = "INSERT INTO salary_structure_benefits 
                (structure_id, name, amount, benefit_type, taxable, notes)
                VALUES (:sid, :name, :amount, :type, :taxable, :notes)";
        $stmt = $this->db->prepare($sql);

        foreach ($benefits as $b) {
            $stmt->execute([
                ':sid' => $structure_id,
                ':name' => $b['name'],
                ':amount' => $b['amount'] ?? 0,
                ':type' => $b['benefit_type'] ?? 'fixed',
                ':taxable' => $b['taxable'] ?? 0,
                ':notes' => $b['notes'] ?? null
            ]);
        }
    }
}
