<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/middleware/Auth.php';
require_once __DIR__ . '/controllers/EmployeeController.php';
require_once __DIR__ . '/controllers/DepartmentController.php';
require_once __DIR__ . '/controllers/PositionController.php';
require_once __DIR__ . '/controllers/PayrollController.php';

use Backend\Controllers\EmployeeController;
use Backend\Controllers\DepartmentController;
use Backend\Controllers\PositionController;
use Backend\Controllers\PayrollController;
use Backend\Middleware\AuthMiddleware;

header('Content-Type: application/json');

$uri = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
$method = $_SERVER['REQUEST_METHOD'];

$db = Database::connect();
$employeeCtrl = new EmployeeController($db);
$departmentCtrl = new DepartmentController($db);
$positionCtrl = new PositionController($db);
$payrollCtrl = new PayrollController($db);

switch($uri[0]) {
    case 'employees':
        if($method === 'GET' && isset($uri[1])) $employeeCtrl->show($uri[1]);
        elseif($method === 'GET') $employeeCtrl->index();
        elseif($method === 'POST') $employeeCtrl->create();
        elseif($method === 'PUT' && isset($uri[1])) $employeeCtrl->update($uri[1]);
        elseif($method === 'DELETE' && isset($uri[1])) $employeeCtrl->delete($uri[1]);
        break;

    case 'departments':
        if($method === 'GET' && isset($uri[1])) $departmentCtrl->getOne($uri[1]);
        elseif($method === 'GET') $departmentCtrl->getAll();
        break;

    case 'positions':
        if($method === 'GET' && isset($uri[1])) $positionCtrl->getByDepartment($uri[1]);
        elseif($method === 'GET') $positionCtrl->getAll();
        break;

    case 'payroll':
        if($method === 'POST' && isset($uri[1]) && $uri[1] === 'generate') {
            $data = json_decode(file_get_contents('php://input'), true);
            echo json_encode($payrollCtrl->generateEmployeePayroll($data['employee_id'], $data['month'], $data['year']));
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Endpoint not found']);
        break;
}
?>
