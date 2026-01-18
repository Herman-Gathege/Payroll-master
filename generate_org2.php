<?php
require 'vendor/autoload.php'; // PhpSpreadsheet

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// Create spreadsheet
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setTitle('Employees');

// Headers
$headers = [
    "employee_no","first_name","last_name","work_email","phone",
    "gender","date_of_birth","hire_date","department_id","position_id","structure_id"
];
$sheet->fromArray($headers, NULL, 'A1');

// Org 2 IDs
$department_id = 8;
$position_id = 8;
$structure_id = 2;

// Sample data
$first_names = ["Herman","James","Mary","John","Grace","Daniel","Alice","Peter","Sarah","David","Lucy"];
$last_names = ["Remington","Mwangi","Otieno","Kamau","Wanjiku","Kiptoo","Cheruiyot","Maina","Njeri","Mutua"];
$genders = ["Male", "Female"];

// Employee numbering
$start_no = 2; // after EMP20260001
$end_no = 50;  // change this if you want more rows

for ($i = $start_no; $i <= $end_no; $i++) {
    $fn = $first_names[array_rand($first_names)];
    $ln = $last_names[array_rand($last_names)];
    $gender = $genders[array_rand($genders)];

    // Random DOB between 1985-01-01 and 2004-01-01
    $dob = date('m-d-Y', rand(strtotime("1985-01-01"), strtotime("2004-01-01")));
    // Random hire date between 2024-01-01 and 2025-12-31
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
    ], NULL, 'A' . ($i - $start_no + 2));
}

// Notes section
$row = $end_no - $start_no + 3;
$notes = [
    "NOTES:",
    "• Do not change column headers",
    "• Date format must be MM-DD-YYYY",
    "• Gender must be Male, Female, or Other",
    "• department_id, position_id, structure_id must already exist",
    "• All rows use Org 2 IDs only"
];

foreach ($notes as $note) {
    $sheet->setCellValue('A' . $row, $note);
    $row++;
}

// Save file
$writer = new Xlsx($spreadsheet);
$filename = 'employee_upload_org2.xlsx';
$writer->save($filename);

echo "File generated: $filename\n";
?>
