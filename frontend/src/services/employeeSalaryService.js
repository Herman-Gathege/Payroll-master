// frontend/src/services/employeeSalaryService.js
import api from "./api";

// backend endpoint direct file names
export default {
  getEmployeeSalary(employeeId) {
    return api.get(`/employee_salary_structure.php?employee_id=${employeeId}`);
  },

  assign(employeeId, payload) {
    // The backend employee_salary_structure.php POST expects { employee_id, structure_id, ... }
    return api.post(`/employee_salary_structure.php`, payload);
  },

  updateAssignment(assignmentId, payload) {
    return api.put(
      `/employee_salary_structure.php?id=${assignmentId}`,
      payload
    );
  },
};
