// frontend/src/services/departmentsService.js
import api from './api';

// Get departments
export const getDepartments = () => api.get('/departments.php');

// CRUD operations
export const createDepartment = (payload) => api.post('/departments.php', payload);
export const updateDepartment = (payload) => api.put('/departments.php', payload);
export const deleteDepartment = (id) =>
  api.delete('/departments.php?id=' + id);

// Assign ONE employee to a department
export const assignEmployeeToDepartment = (department_id, employee_id) =>
  api.post('/departments.php?action=assignEmployee', {
    department_id,
    employee_id
  });

// Remove ONE employee from department
export const removeEmployeeFromDepartment = (employee_id) =>
  api.post('/departments.php?action=removeEmployee', {
    employee_id
  });
