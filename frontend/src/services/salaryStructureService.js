// frontend/src/services/salaryStructureService.js

import api from './api';

const SalaryStructureService = {
  list: () => api.get('/salary_structures.php'),

  get: (id) => api.get(`/salary_structures.php?id=${id}`),

  create: (data) => api.post('/salary_structures.php', data),

  update: (id, data) => api.put(`/salary_structures.php?id=${id}`, data),

  // Employee assignment
  assignToEmployee: (payload) => api.post('/employee_salary_structure.php', payload),

  getEmployeeStructure: (employeeId) =>
    api.get(`/employee_salary_structure.php?employee_id=${employeeId}`),
};

export default SalaryStructureService;
