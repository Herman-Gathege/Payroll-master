<?php
namespace Backend\Controllers;

use Backend\Services\FileStorageService;
use Backend\Models\FileModel;

class FileController
{
    private $fileModel;

    public function __construct($db)
    {
        $this->fileModel = new FileModel($db);
    }

    public function uploadFile($file, $uploadedBy)
    {
        $stored = FileStorageService::storeFile($file);
        $this->fileModel->saveFile($stored['name'], $stored['path'], $stored['type'], $uploadedBy);
        return ['message' => 'File uploaded successfully', 'file' => $stored];
    }

    public function getFiles()
    {
        return $this->fileModel->getFiles();
    }
}
