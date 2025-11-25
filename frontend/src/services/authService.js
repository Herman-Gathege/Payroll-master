// frontend/src/services/authService.js

import api from './api'

export const authService = {
  // Unified login - handles both employer and employee
  login: async (username, password) => {
  console.log('[authService.login] Starting unified login request')

  try {
    const response = await api.post('/unified_auth.php', { username, password })
    const data = response.data

    if (!data?.success || !data.token || !data.user) {
      throw new Error(data?.message || 'Login failed')
    }

    // Save auth data
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    // Use backend-provided user_type
    localStorage.setItem('userType', data.user.user_type)

    // Save force_password_change if present
    if (data.user.force_password_change !== undefined) {
      localStorage.setItem(
        'forcePasswordChange',
        data.user.force_password_change.toString()
      )
    }

    console.log('[authService.login] Stored auth info in localStorage:', {
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
      userType: localStorage.getItem('userType'),
      forcePasswordChange: localStorage.getItem('forcePasswordChange')
    })

    return data
  } catch (error) {
    console.error('[authService.login] Error occurred:', error)
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

