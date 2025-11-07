<?php
namespace Backend\Services;

require_once __DIR__ . '/../config/Database.php';


use Backend\Config\Database;
use PDO;
use Exception;

class FileStorageService
{
    private PDO $db;
    private string $uploadDir;

    public function __construct()
    {
        $this->db = Database::connect();

        $this->uploadDir = __DIR__ . '/../../uploads/';

        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0777, true);
        }
    }

    public function uploadFile(array $file, string $uploadedBy): array
    {
        if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
            return ['status' => 'error', 'message' => 'No valid file uploaded.'];
        }

        $filename = basename($file['name']);
        $targetPath = $this->uploadDir . $filename;
        $fileType = mime_content_type($file['tmp_name']);

        try {
            if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
                throw new Exception('Failed to move uploaded file.');
            }

            $stmt = $this->db->prepare("
                INSERT INTO files (filename, path, type, uploaded_by, created_at)
                VALUES (:filename, :path, :type, :uploaded_by, NOW())
            ");
            $stmt->execute([
                ':filename' => $filename,
                "path" => realpath($targetPath),
                ':type' => $fileType,
                ':uploaded_by' => $uploadedBy
            ]);

            return [
                'status' => 'success',
                'message' => 'File uploaded successfully.',
                'file' => [
                    'name' => $filename,
                    'type' => $fileType,
                    "path" => realpath($targetPath)
                ]
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Upload failed: ' . $e->getMessage()
            ];
        }
    }

    public function getAllFiles(): array
    {
        $stmt = $this->db->query("SELECT * FROM files ORDER BY created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
