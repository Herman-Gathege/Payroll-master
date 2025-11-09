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

// add this to your existing authService
const API_BASE = import.meta.env.VITE_API_BASE_LINK || 'http://localhost:8000';

export async function loginAgent(full_name, id_number) {
  const res = await fetch(`${API_BASE}/api/agent/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name, id_number })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Agent login failed');
  return data;
}
