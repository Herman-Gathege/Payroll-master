import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState(null) // 'employer' or 'employee'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    const storedUserType = localStorage.getItem('userType')

    if (token && userData) {
      setUser(JSON.parse(userData))
      setUserType(storedUserType)
    }
    setLoading(false)
  }, [])

  // Employer login
  const employerLogin = async (username, password) => {
    try {
      console.log('AuthContext: Calling employer login API...')
      const response = await authService.employerLogin(username, password)
      console.log('AuthContext: API response:', response)
      
      if (!response.success) {
        throw new Error(response.message || 'Login failed')
      }
      
      if (!response.token || !response.user) {
        throw new Error('Invalid response format from server')
      }
      
      console.log('AuthContext: Setting user state...')
      setUser(response.user)
      setUserType('employer')
      
      console.log('AuthContext: Storing in localStorage...')
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('userType', 'employer')
      
      console.log('AuthContext: Login complete')
      return response
    } catch (error) {
      console.error('AuthContext: Login error:', error)
      throw error
    }
  }

  // Employee login
  const employeeLogin = async (username, password) => {
    try {
      const response = await authService.employeeLogin(username, password)
      setUser(response.user)
      setUserType('employee')
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('userType', 'employee')
      localStorage.setItem('forcePasswordChange', response.force_password_change)
      return response
    } catch (error) {
      throw error
    }
  }

  // Generic login (legacy support)
  const login = async (username, password) => {
    try {
      console.log('AuthContext: Unified login attempt...')
      const response = await authService.employerLogin(username, password)
      console.log('AuthContext: Login response:', response)
      
      if (!response.success) {
        throw new Error(response.message || 'Login failed')
      }
      
      if (!response.token || !response.user) {
        throw new Error('Invalid response format from server')
      }
      
      // Determine user type based on role
      const role = response.user.role
      let userTypeValue = 'employee' // default
      
      // Employer roles: super_admin, admin, employer, hr_manager, payroll_officer, etc.
      const employerRoles = ['super_admin', 'admin', 'employer', 'hr_manager', 'payroll_officer', 'department_manager', 'recruiter']
      
      if (employerRoles.includes(role)) {
        userTypeValue = 'employer'
      } else if (role === 'employee') {
        userTypeValue = 'employee'
      }
      
      console.log('AuthContext: Setting user state with role:', role, 'type:', userTypeValue)
      setUser(response.user)
      setUserType(userTypeValue)
      
      console.log('AuthContext: Storing in localStorage...')
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      localStorage.setItem('userType', userTypeValue)
      
      if (response.force_password_change) {
        localStorage.setItem('forcePasswordChange', response.force_password_change)
      }
      
      console.log('AuthContext: Login complete')
      return response
    } catch (error) {
      console.error('AuthContext: Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout(userType)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setUserType(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userType')
      localStorage.removeItem('forcePasswordChange')
    }
  }

  const value = {
    user,
    userType,
    login,
    employerLogin,
    employeeLogin,
    logout,
    loading,
    isEmployer: userType === 'employer',
    isEmployee: userType === 'employee'
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
