// src/services/authService.js
import api from './api'

export const authService = {
  // Unified login - handles both employer and employee
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    localStorage.removeItem('forcePasswordChange')
  },

  // Verify token
  verifyToken: async (userType) => {
    const endpoint = userType === 'employer' ? '/employer/auth.php?action=verify' : '/employee/auth.php?action=verify'
    const response = await api.get(endpoint)
    return response.data
  },

  // Change password (employee only)
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/employee/auth.php?action=change-password', {
      current_password: currentPassword,
      new_password: newPassword
    })
    return response.data
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  getUserType: () => {
    return localStorage.getItem('userType')
  },

  getToken: () => {
    return localStorage.getItem('token')
  },

  isForcePasswordChange: () => {
    return localStorage.getItem('forcePasswordChange') === 'true'
  }
}
