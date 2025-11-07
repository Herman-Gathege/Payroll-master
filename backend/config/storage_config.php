<?php

namespace Backend\Config;

class StorageConfig
{
    public const UPLOAD_DIR = __DIR__ . '/../uploads/';
    public const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
    public const ALLOWED_TYPES = ['pdf','jpg','png','jpeg','docx'];
}
