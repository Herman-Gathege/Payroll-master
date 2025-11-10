<?php
namespace Backend\Models;

use PDO;

class Agent
{
    private $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Create a new agent in the database
     *
     * @param array $data
     * @return int - inserted agent ID
     */
    public function create(array $data): int
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO agents 
            (first_name, last_name, email, phone_number, password, university, campus, course, year_of_study, id_front, id_back, profile_photo, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $data['first_name'],
            $data['last_name'],
            $data['email'],
            $data['phone_number'],
            password_hash($data['password'], PASSWORD_BCRYPT),
            $data['university'],
            $data['campus'] ?? null,
            $data['course'] ?? null,
            $data['year_of_study'] ?? null,
            $data['id_front'] ?? null,
            $data['id_back'] ?? null,
            $data['profile_photo'] ?? null,
            'pending'
        ]);

        return (int)$this->pdo->lastInsertId();
    }

    /**
     * Find agent by ID
     */
    public function find(int $id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM agents WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
