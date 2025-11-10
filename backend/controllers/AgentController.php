<?php
namespace Backend\Controllers;

use Backend\Models\Agent;
use Backend\Services\FileStorageService;
use PDO;

class AgentController
{
    private $agentModel;
    private $fileService;
    private $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
        $this->agentModel = new Agent($pdo);
        $this->fileService = new FileStorageService();
        session_start();
    }

    public function register(): array
    {
        try {
            $data = $_POST;
            $required = ['first_name', 'last_name', 'email', 'phone_number', 'password', 'university'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    throw new \Exception("Missing required field: $field");
                }
            }

            $uploadedFiles = [];
            if (!empty($_FILES['id_front'])) {
                $uploadedFiles['id_front'] = $this->fileService->upload(0, $_FILES['id_front'], 'id_front');
            }
            if (!empty($_FILES['id_back'])) {
                $uploadedFiles['id_back'] = $this->fileService->upload(0, $_FILES['id_back'], 'id_back');
            }
            if (!empty($_FILES['profile_photo'])) {
                $uploadedFiles['profile_photo'] = $this->fileService->upload(0, $_FILES['profile_photo'], 'profile_photo');
            }

            $agentId = $this->agentModel->create($data);

            foreach ($uploadedFiles as $type => $path) {
                $newPath = str_replace('/0/', '/' . $agentId . '/', $path);
                $dir = dirname($newPath);
                if (!is_dir($dir)) mkdir($dir, 0777, true);
                rename($path, $newPath);
                $uploadedFiles[$type] = $newPath;
            }

            $stmt = $this->pdo->prepare("UPDATE agents SET id_front=?, id_back=?, profile_photo=? WHERE id=?");
            $stmt->execute([
                $uploadedFiles['id_front'] ?? null,
                $uploadedFiles['id_back'] ?? null,
                $uploadedFiles['profile_photo'] ?? null,
                $agentId
            ]);

            return ['success' => true, 'message' => 'Agent registered successfully', 'agent_id' => $agentId];

        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function login(): array
    {
        try {
            $email = $_POST['email'] ?? '';
            $password = $_POST['password'] ?? '';

            if (empty($email) || empty($password)) {
                throw new \Exception("Email and password are required.");
            }

            $stmt = $this->pdo->prepare("SELECT * FROM agents WHERE email = ?");
            $stmt->execute([$email]);
            $agent = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$agent) {
                throw new \Exception("Agent not found.");
            }

            if (!password_verify($password, $agent['password'])) {
                throw new \Exception("Invalid password.");
            }

            if ($agent['status'] !== 'approved') {
                throw new \Exception("Your account is not approved yet.");
            }

            $_SESSION['agent_id'] = $agent['id'];
            $_SESSION['agent_name'] = $agent['first_name'] . ' ' . $agent['last_name'];

            return ['success' => true, 'message' => 'Login successful', 'agent' => $agent];

        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function logout(): array
    {
        session_destroy();
        return ['success' => true, 'message' => 'Logged out successfully'];
    }
}
