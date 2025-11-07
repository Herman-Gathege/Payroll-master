<?php
namespace Backend\Models;

use PDO;

class FileModel
{
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
    }

    public function saveFile($filename, $path, $type, $uploadedBy)
    {
        $stmt = $this->db->prepare("
            INSERT INTO files (filename, path, type, uploaded_by, created_at)
            VALUES (:filename, :path, :type, :uploaded_by, NOW())
        ");
        $stmt->execute([
            ':filename' => $filename,
            ':path' => $path,
            ':type' => $type,
            ':uploaded_by' => $uploadedBy
        ]);
    }

    public function getFiles()
    {
        $stmt = $this->db->query("SELECT * FROM files ORDER BY created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

