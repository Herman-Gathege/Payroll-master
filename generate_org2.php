<?php
require 'vendor/autoload.php'; // PhpSpreadsheet

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// Create spreadsheet
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setTitle('Employees');

// Headers (MUST match backend import)
$headers = [
    "employee_no",
    "first_name",
    "last_name",
    "work_email",
    "phone",
    "gender",
    "date_of_birth",
    "hire_date",
    "department_id",
    "position_id",
    "structure_id"
];
$sheet->fromArray($headers, null, 'A1');

/**
 * Org 4 valid department → position mapping
 */
$departmentPositions = [
    10 => [10, 11], // Human Resource
    11 => [12, 13], // Finance
    12 => [14, 15], // Technology
    13 => [16, 17], // Operations
];

// Org 4 salary structure
$structure_id = 3; // Technology

// Sample data
$first_names = ["Herman","James","Mary","John","Grace","Daniel","Alice","Peter","Sarah","David","Lucy"];
$last_names  = ["Remington","Mwangi","Otieno","Kamau","Wanjiku","Kiptoo","Cheruiyot","Maina","Njeri","Mutua"];
$genders     = ["Male", "Female"];

// Employee numbering
$start_no = 51;
$end_no   = 70;

$row = 2;

for ($i = $start_no; $i <= $end_no; $i++) {

    $fn = $first_names[array_rand($first_names)];
    $ln = $last_names[array_rand($last_names)];
    $gender = $genders[array_rand($genders)];

    // Random valid department
    $department_id = array_rand($departmentPositions);

    // Random valid position under that department
    $position_id = $departmentPositions[$department_id][array_rand($departmentPositions[$department_id])];

    // Dates (MM-DD-YYYY as required)
    $dob  = date('m-d-Y', rand(strtotime("1985-01-01"), strtotime("2004-01-01")));
    $hire = date('m-d-Y', rand(strtotime("2024-01-01"), strtotime("2025-12-31")));

    $sheet->fromArray([
        sprintf("EMP2026%04d", $i),
        $fn,
        $ln,
        strtolower($fn) . '.' . strtolower($ln) . $i . "@company.com",
        "+2547" . rand(10000000, 99999999),
        $gender,
        $dob,
        $hire,
        $department_id,
        $position_id,
        $structure_id
    ], null, 'A' . $row);

    $row++;
}

// Notes section
$notes = [
    "NOTES:",
    "• Do not change column headers",
    "• Date format must be MM-DD-YYYY",
    "• Gender must be Male or Female",
    "• department_id, position_id, structure_id must exist",
    "• department_id and position_id MUST match",
    "• All rows use Organization ID = 4"
];

foreach ($notes as $note) {
    $sheet->setCellValue('A' . $row, $note);
    $row++;
}

// Save file
$writer = new Xlsx($spreadsheet);
$filename = 'employee_upload_org4.xlsx';
$writer->save($filename);

echo "File generated successfully: $filename\n";
