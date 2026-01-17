<?php
require_once __DIR__ . '/vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;

if (class_exists(Spreadsheet::class)) {
    echo "PhpSpreadsheet is installed!";
} else {
    echo "PhpSpreadsheet is NOT installed!";
}
