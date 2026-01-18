<?php
require 'vendor/autoload.php'; // Make sure you have PhpSpreadsheet installed

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

// Valid IDs
$department_ids = [1,2,3,4,5,6,7];
$position_ids = [1,2,3,4,5,6,7];
$structure_id = 1; // active structure

// Sample realistic data
$first_names = ["James","Mary","John","Grace","Daniel","Alice","Peter","Sarah","David","Lucy","Brian","Faith"];
$last_names = ["Mwangi","Otieno","Kamau","Wanjiku","Kiptoo","Cheruiyot","Maina","Njeri","Mutua","Achieng","Kariuki","Moraa"];
$genders = ["Male", "Female"];

$start_no = 232;
$end_no = 300;

$dept_idx = 0;
$pos_idx = 0;

for ($i = $start_no; $i <= $end_no; $i++) {
    $fn = $first_names[array_rand($first_names)];
    $ln = $last_names[array_rand($last_names)];
    $gender = $genders[array_rand($genders)];

    // Random DOB between 1985-01-01 and 2004-01-01
    $dob = date('m-d-Y', rand(strtotime("1985-01-01"), strtotime("2004-01-01")));
    // Random hire date between 2024-01-01 and 2024-12-31
    $hire = date('m-d-Y', rand(strtotime("2024-01-01"), strtotime("2024-12-31")));

    $sheet->fromArray([
        sprintf("EVOLVE-2026-%04d", $i),
        $fn,
        $ln,
        strtolower($fn) . '.' . strtolower($ln) . $i . "@company.com",
        "07" . rand(10000000, 99999999),
        $gender,
        $dob,
        $hire,
        $department_ids[$dept_idx],
        $position_ids[$pos_idx],
        $structure_id
    ], NULL, 'A' . ($i - $start_no + 2));

    $dept_idx = ($dept_idx + 1) % count($department_ids);
    $pos_idx = ($pos_idx + 1) % count($position_ids);
}

// Notes section
$row = $end_no - $start_no + 3;
$notes = [
    "NOTES:",
    "• Do not change column headers",
    "• Date format must be MM-DD-YYYY",
    "• Gender must be Male, Female, or Other",
    "• department_id, position_id, structure_id must already exist",
    "• structure_id locked to active salary structure (id = 1)"
];

foreach ($notes as $note) {
    $sheet->setCellValue('A' . $row, $note);
    $row++;
}

// Save file
$writer = new Xlsx($spreadsheet);
$filename = 'employee_upload_0232_to_0300_COMPLETE.xlsx';
$writer->save($filename);

echo "File generated: $filename\n";
?>
