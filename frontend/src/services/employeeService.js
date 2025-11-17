// src/services/employeeService.js
import api from './api'

/**
 * Employee Service
 * Handles employee-related API calls with dual authentication support
 */
export const employeeService = {
  /**
   * Get all employees (Employer only)
   */
  getAllEmployees: async () => {
    try {
      const response = await api.get('/employer/employees.php')
      return response.data
    } catch (error) {
      console.error('Error fetching employees:', error)
      throw error
    }
  },

  /**
   * Get employee by ID (Employer) or own profile (Employee)
   */
  getEmployee: async (id) => {
    try {
      const userType = localStorage.getItem('userType')
      
      // If employee, always get own profile
      if (userType === 'employee') {
        const response = await api.get('/employee/profile.php')
        return response.data
      }
      
      // If employer, get specific employee
      const response = await api.get(`/employer/employees/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching employee:', error)
      throw error
    }
  },

  /**
   * Get current user's profile (Employee)
   */
  getMyProfile: async () => {
    try {
      console.log('[employeeService] Fetching employee profile from /employee/profile.php')
      const response = await api.get('/employee/profile.php')
      console.log('[employeeService] Profile response:', response.data)
      return response.data
    } catch (error) {
      console.error('[employeeService] Error fetching profile:', error)
      throw error
    }
  },

  /**
   * Create new employee (Employer only)
   */
  createEmployee: async (employeeData) => {
    try {
      const response = await api.post('/employer/employees', employeeData)
      return response.data
    } catch (error) {
      console.error('Error creating employee:', error)
      throw error
    }
  },

  /**
   * Update employee (Employer updates any, Employee updates own)
   */
  updateEmployee: async (employeeData) => {
    try {
      const userType = localStorage.getItem('userType')
      
      if (userType === 'employee') {
        // Employee can only update own profile (limited fields)
        const response = await api.put('/employee/profile.php', {
          phone: employeeData.phone,
          personal_email: employeeData.personal_email,
          emergency_contact_name: employeeData.emergency_contact_name,
          emergency_contact_phone: employeeData.emergency_contact_phone,
        })
        return response.data
      }
      
      // Employer can update full employee record
      const response = await api.put(`/employer/employees/${employeeData.id}`, employeeData)
      return response.data
    } catch (error) {
      console.error('Error updating employee:', error)
      throw error
    }
  },

  /**
   * Delete/Deactivate employee (Employer only)
   */
  deleteEmployee: async (id) => {
    try {
      const response = await api.delete(`/employer/employees/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting employee:', error)
      throw error
    }
  },

  /**
   * Search employees (Employer only)
   */
  searchEmployees: async (searchTerm) => {
    try {
      const response = await api.get('/employer/employees/search', {
        params: { q: searchTerm }
      })
      return response.data
    } catch (error) {
      console.error('Error searching employees:', error)
      throw error
    }
  },

  /**
   * Get employees by department (Employer only)
   */
  getEmployeesByDepartment: async (departmentId) => {
    try {
      const response = await api.get(`/employer/departments/${departmentId}/employees`)
      return response.data
    } catch (error) {
      console.error('Error fetching employees by department:', error)
      throw error
    }
  }
}

