// src/services/authService.js
import api from './api'

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login.php', { username, password })
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  getToken: () => {
    return localStorage.getItem('token')
  }
}
