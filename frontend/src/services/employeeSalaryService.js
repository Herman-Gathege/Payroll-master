import api from './api';

export default {
  getEmployeeSalary(employeeId) {
    return api.get(`/salary-structure/employee/${employeeId}`);
  },

  assign(employeeId, payload) {
    return api.post(`/salary-structure/employee/${employeeId}`, payload);
  },

  updateAssignment(assignmentId, payload) {
    return api.put(`/salary-structure/assignment/${assignmentId}`, payload);
  }
};
