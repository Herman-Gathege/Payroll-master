<?php
namespace Backend\Services;

class FileStorageService
{
    private $uploadDir;

    public function __construct()
    {
        // Path where all agent uploads will be stored
        $this->uploadDir = __DIR__ . '/../../uploads/agents/';
    }

    /**
     * Upload a file for a specific agent
     *
     * @param int $agentId
     * @param array $file - from $_FILES
     * @param string $type - e.g., 'id_front', 'id_back', 'profile_photo'
     * @return string - relative path to the uploaded file
     * @throws \Exception
     */
    public function upload($agentId, $file, $type)
    {
        // Allowed file types
        $allowedTypes = ['image/jpeg', 'image/png'];
        $maxSize = 5 * 1024 * 1024; // 5 MB

        if (!in_array($file['type'], $allowedTypes)) {
            throw new \Exception("Invalid file type. Only JPG and PNG are allowed.");
        }

        if ($file['size'] > $maxSize) {
            throw new \Exception("File too large. Maximum 5MB allowed.");
        }

        // Create agent-specific directory if it doesn't exist
        $agentDir = $this->uploadDir . $agentId . '/';
        if (!file_exists($agentDir)) {
            mkdir($agentDir, 0777, true);
        }

        // Generate unique file name
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = $type . '_' . time() . '.' . $extension;
        $targetPath = $agentDir . $fileName;

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new \Exception("Failed to upload file.");
        }

        // Return relative path for database storage
        return 'uploads/agents/' . $agentId . '/' . $fileName;
    }
}
