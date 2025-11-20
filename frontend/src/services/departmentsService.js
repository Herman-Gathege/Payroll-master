// frontend/src/services/departmentsService.js
import api from './api';

export const getDepartments = () => api.get('/departments.php');
export const createDepartment = (payload) => api.post('/departments.php', payload);
export const updateDepartment = (payload) => api.put('/departments.php', payload);
export const deleteDepartment = (id) => api.delete('/departments.php?id=' + id);

// Bulk assign employees to department
export const assignEmployeesToDepartment = (department_id, employee_ids) =>
  api.post('/departments_assign.php', { department_id, employee_ids });
