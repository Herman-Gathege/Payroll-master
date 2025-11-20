// frontend/src/services/api.js

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // Enable cookies for session management
})

// Request interceptor to add auth token and user type
api.interceptors.request.use(
  (config) => {
    console.log('[API Interceptor] Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data
    })

    const token = localStorage.getItem('token')
    const userType = localStorage.getItem('userType')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (userType) {
      config.headers['X-User-Type'] = userType
    }

    return config
  },
  (error) => {
    console.error('[API Interceptor] Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('[API Interceptor] Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    })
    return response
  },
  (error) => {
    console.error('[API Interceptor] Response error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    })

    if (error.response?.status === 401) {
      const userType = localStorage.getItem('userType')

      // Clear auth data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userType')

      // Redirect to appropriate login page
      if (userType === 'employer') {
        window.location.href = '/employer/login'
      } else if (userType === 'employee') {
        window.location.href = '/employee/login'
      } else {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default api
