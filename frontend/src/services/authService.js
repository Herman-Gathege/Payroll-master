// frontend/src/services/authService.js

import api from './api'

export const authService = {
  // Unified login - handles both employer and employee
  login: async (username, password) => {
    console.log('[authService.login] Starting unified login request')
    console.log('[authService.login] Username:', username)
    console.log('[authService.login] Password length:', password?.length)
    console.log('[authService.login] API endpoint: /unified_auth.php')

    try {
      const response = await api.post('/unified_auth.php', { username, password })
      console.log('[authService.login] Response received:', response)
      console.log('[authService.login] Response data:', response.data)
      return response.data
    } catch (error) {
      console.error('[authService.login] Error occurred:', error)
      console.error('[authService.login] Error response:', error.response)
      console.error('[authService.login] Error response data:', error.response?.data)
      throw error
    }
  },

  // Employer login (backward compatibility)
  employerLogin: async (username, password) => {
    console.log('[authService.employerLogin] Using unified login endpoint')
    return await authService.login(username, password)
  },

  // Employee login (backward compatibility)
  employeeLogin: async (username, password) => {
    console.log('[authService.employeeLogin] Using unified login endpoint')
    return await authService.login(username, password)
  },

  // Logout
  logout: async (userType) => {
    const endpoint = userType === 'employer' ? '/employer/auth.php?action=logout' : '/employee/auth.php?action=logout'
    try {
      await api.post(endpoint)
    } catch (error) {
      console.error('Logout error:', error)
    }
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

