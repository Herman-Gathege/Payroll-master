// frontend/src/services/employeeService.js

import api from './api'

/**
 * Unified Employee Service
 * Correctly matches your actual backend routes.
 */

const EMPLOYER_BASE = '/employer/employees.php';
const ESS_PROFILE = '/employee/profile.php';

export const employeeService = {

  // ---------------------------------------------------------
  // EMPLOYER — GET ALL EMPLOYEES
  // ---------------------------------------------------------
  getAllEmployees: async (params = {}) => {
    try {
      const response = await api.get(EMPLOYER_BASE, { params })
      return response.data   // { success, data, pagination }
    } catch (error) {
      console.error('Error fetching employees:', error)
      throw error
    }
  },

  // ---------------------------------------------------------
  // GET EMPLOYEE (EMPLOYER GETS ANY / EMPLOYEE GETS OWN PROFILE)
  // ---------------------------------------------------------
  getEmployee: async (id = null) => {
    try {
      const userType = localStorage.getItem('userType')

      if (userType === 'employee') {
        const response = await api.get(ESS_PROFILE)
        return response.data
      }

      // employer → ?id=5
      const response = await api.get(EMPLOYER_BASE, { params: { id } })
      return response.data

    } catch (error) {
      console.error('Error fetching employee:', error)
      throw error
    }
  },

  // ---------------------------------------------------------
  // EMPLOYEE ESS GET OWN PROFILE
  // ---------------------------------------------------------
  getMyProfile: async () => {
    try {
      const response = await api.get(ESS_PROFILE)
      return response.data
    } catch (error) {
      console.error('Error fetching profile:', error)
      throw error
    }
  },

  // ---------------------------------------------------------
  // EMPLOYER CREATE EMPLOYEE
  // ---------------------------------------------------------
  createEmployee: async (employeeData) => {
    try {
      const response = await api.post(EMPLOYER_BASE, employeeData)
      return response.data
    } catch (error) {
      console.error('Error creating employee:', error)
      throw error
    }
  },

  // ---------------------------------------------------------
  // UPDATE EMPLOYEE (ESS OR EMPLOYER)
  // ---------------------------------------------------------
  updateEmployee: async (employeeData) => {
    try {
      const userType = localStorage.getItem('userType')

      if (userType === 'employee') {
        const allowed = {
          phone: employeeData.phone,
          personal_email: employeeData.personal_email,
          emergency_contact_name: employeeData.emergency_contact_name,
          emergency_contact_phone: employeeData.emergency_contact_phone
        }
        const response = await api.put(ESS_PROFILE, allowed)
        return response.data
      }

      // Employer updates via PUT body
      const response = await api.put(EMPLOYER_BASE, employeeData)
      return response.data

    } catch (error) {
      console.error('Error updating employee:', error)
      throw error
    }
  },

  // ---------------------------------------------------------
  // DELETE EMPLOYEE (EMPLOYER ONLY)
  // ---------------------------------------------------------
  deleteEmployee: async (id) => {
    try {
      const response = await api.delete(`${EMPLOYER_BASE}?id=${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting employee:', error)
      throw error
    }
  },

  // ---------------------------------------------------------
  // SEARCH EMPLOYEES (EMPLOYER ONLY)
  // ---------------------------------------------------------
  searchEmployees: async (query) => {
    try {
      const response = await api.get(EMPLOYER_BASE, {
        params: { search: query }
      })
      return response.data
    } catch (error) {
      console.error('Error searching employees:', error)
      throw error
    }
  },

  updateMyProfile(data) {
  const allowed = {
    phone: data.phone,
    personal_email: data.personal_email,
    emergency_contact_name: data.emergency_contact_name,
    emergency_contact_phone: data.emergency_contact_phone,
  };
  
  return api.put(ESS_PROFILE, allowed);
}


}

export default employeeService;
