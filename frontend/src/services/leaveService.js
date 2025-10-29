import api from './api'

/**
 * Leave Service
 * Handles leave-related API calls with dual authentication support
 */
const leaveService = {
  /**
   * Get all leave requests (Employer only)
   */
  getAllLeaveRequests: async () => {
    try {
      const response = await api.get('/employer/leave/applications')
      return response.data
    } catch (error) {
      console.error('Error fetching leave requests:', error)
      throw error
    }
  },

  /**
   * Get own leave requests (Employee only)
   */
  getMyLeaveRequests: async () => {
    try {
      const response = await api.get('/employee/leave/applications')
      return response.data
    } catch (error) {
      console.error('Error fetching my leave requests:', error)
      throw error
    }
  },

  /**
   * Get leave requests by employee ID (Employer only)
   */
  getLeaveRequestsByEmployee: async (employeeId) => {
    try {
      const response = await api.get(`/employer/leave/applications`, {
        params: { employee_id: employeeId }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching employee leave requests:', error)
      throw error
    }
  },

  /**
   * Get single leave request
   */
  getLeaveRequestById: async (id) => {
    try {
      const userType = localStorage.getItem('userType')
      const endpoint = userType === 'employer'
        ? `/employer/leave/applications/${id}`
        : `/employee/leave/applications/${id}`
      
      const response = await api.get(endpoint)
      return response.data
    } catch (error) {
      console.error('Error fetching leave request:', error)
      throw error
    }
  },

  /**
   * Create leave request (Employee only)
   */
  createLeaveRequest: async (leaveData) => {
    try {
      const response = await api.post('/employee/leave/apply', leaveData)
      return response.data
    } catch (error) {
      console.error('Error creating leave request:', error)
      throw error
    }
  },

  /**
   * Update leave request
   */
  updateLeaveRequest: async (id, leaveData) => {
    try {
      const userType = localStorage.getItem('userType')
      const endpoint = userType === 'employer'
        ? `/employer/leave/applications/${id}`
        : `/employee/leave/applications/${id}`
      
      const response = await api.put(endpoint, leaveData)
      return response.data
    } catch (error) {
      console.error('Error updating leave request:', error)
      throw error
    }
  },

  /**
   * Approve leave request (Employer only)
   */
  approveLeaveRequest: async (id, comments = '') => {
    try {
      const response = await api.put(`/employer/leave/${id}/approve`, {
        status: 'approved',
        reviewer_comments: comments
      })
      return response.data
    } catch (error) {
      console.error('Error approving leave request:', error)
      throw error
    }
  },

  /**
   * Reject leave request (Employer only)
   */
  rejectLeaveRequest: async (id, reason = '') => {
    try {
      const response = await api.put(`/employer/leave/${id}/reject`, {
        status: 'rejected',
        reviewer_comments: reason
      })
      return response.data
    } catch (error) {
      console.error('Error rejecting leave request:', error)
      throw error
    }
  },

  /**
   * Cancel leave request (Employee only)
   */
  cancelLeaveRequest: async (id) => {
    try {
      const response = await api.put(`/employee/leave/applications/${id}/cancel`)
      return response.data
    } catch (error) {
      console.error('Error cancelling leave request:', error)
      throw error
    }
  },

  /**
   * Delete leave request
   */
  deleteLeaveRequest: async (id) => {
    try {
      const userType = localStorage.getItem('userType')
      const endpoint = userType === 'employer'
        ? `/employer/leave/applications/${id}`
        : `/employee/leave/applications/${id}`
      
      const response = await api.delete(endpoint)
      return response.data
    } catch (error) {
      console.error('Error deleting leave request:', error)
      throw error
    }
  },

  /**
   * Get leave balance for employee
   */
  getLeaveBalance: async (employeeId = null) => {
    try {
      const userType = localStorage.getItem('userType')
      
      if (userType === 'employee') {
        // Employee gets own balance
        const response = await api.get('/employee/leave/balance')
        return response.data
      }
      
      // Employer can get any employee's balance
      const response = await api.get(`/employer/leave/balance/${employeeId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching leave balance:', error)
      throw error
    }
  },

  /**
   * Get leave types
   */
  getLeaveTypes: async () => {
    try {
      const userType = localStorage.getItem('userType')
      const endpoint = userType === 'employer'
        ? '/employer/leave/types'
        : '/employee/leave/types'
      
      const response = await api.get(endpoint)
      return response.data
    } catch (error) {
      console.error('Error fetching leave types:', error)
      throw error
    }
  },

  /**
   * Get leave statistics (Employer only)
   */
  getLeaveStatistics: async (year = new Date().getFullYear()) => {
    try {
      const response = await api.get('/employer/leave/statistics', {
        params: { year }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching leave statistics:', error)
      throw error
    }
  },

  /**
   * Get upcoming leaves (Employer only)
   */
  getUpcomingLeaves: async () => {
    try {
      const response = await api.get('/employer/leave/upcoming')
      return response.data
    } catch (error) {
      console.error('Error fetching upcoming leaves:', error)
      throw error
    }
  }
}

export default leaveService

