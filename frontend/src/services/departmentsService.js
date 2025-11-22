import api from './api';

// Employer: Get departments
export const getDepartments = () =>
  api.get('/employer/departments.php');

// CRUD
export const createDepartment = (payload) =>
  api.post('/employer/departments.php', payload);

export const updateDepartment = (payload) =>
  api.put('/employer/departments.php', payload);

export const deleteDepartment = (id) =>
  api.delete('/employer/departments.php?id=' + id);

// Assign employee
export const assignEmployeeToDepartment = (department_id, employee_id) =>
  api.post('/employer/departments.php?action=assignEmployee', {
    department_id,
    employee_id
  });

// Remove employee
export const removeEmployeeFromDepartment = (employee_id) =>
  api.post('/employer/departments.php?action=removeEmployee', {
    employee_id
  });
