// src/services/employeeService.js
import api from './api'

// Mock data storage
let mockEmployees = JSON.parse(localStorage.getItem('employees') || '[]')

const saveMockData = () => {
  localStorage.setItem('employees', JSON.stringify(mockEmployees))
}

// Use mock service for demonstration
const useMock = true

export const employeeService = {
  getAllEmployees: async () => {
    if (useMock) {
      // Return mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            records: mockEmployees,
            total: mockEmployees.length
          })
        }, 300)
      })
    }
    const response = await api.get('/employees')
    return response.data
  },

  getEmployee: async (id) => {
    if (useMock) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const employee = mockEmployees.find(emp => emp.id === parseInt(id))
          if (employee) {
            resolve({ employee })
          } else {
            reject(new Error('Employee not found'))
          }
        }, 300)
      })
    }
    const response = await api.get(`/employees?id=${id}`)
    return response.data
  },

  createEmployee: async (employeeData) => {
    if (useMock) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newEmployee = {
            id: mockEmployees.length > 0 ? Math.max(...mockEmployees.map(e => e.id)) + 1 : 1,
            ...employeeData,
            full_name: `${employeeData.first_name} ${employeeData.middle_name || ''} ${employeeData.last_name}`.trim(),
            department_name: 'N/A',
            position_title: 'N/A',
            created_at: new Date().toISOString()
          }
          mockEmployees.push(newEmployee)
          saveMockData()
          resolve({ message: 'Employee created successfully', employee: newEmployee })
        }, 300)
      })
    }
    const response = await api.post('/employees', employeeData)
    return response.data
  },

  updateEmployee: async (employeeData) => {
    if (useMock) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockEmployees.findIndex(emp => emp.id === employeeData.id)
          if (index !== -1) {
            mockEmployees[index] = {
              ...mockEmployees[index],
              ...employeeData,
              full_name: `${employeeData.first_name} ${employeeData.middle_name || ''} ${employeeData.last_name}`.trim(),
            }
            saveMockData()
            resolve({ message: 'Employee updated successfully', employee: mockEmployees[index] })
          } else {
            reject(new Error('Employee not found'))
          }
        }, 300)
      })
    }
    const response = await api.put('/employees', employeeData)
    return response.data
  },

  deleteEmployee: async (id) => {
    if (useMock) {
      return new Promise((resolve) => {
        setTimeout(() => {
          mockEmployees = mockEmployees.filter(emp => emp.id !== parseInt(id))
          saveMockData()
          resolve({ message: 'Employee deleted successfully' })
        }, 300)
      })
    }
    const response = await api.delete(`/employees?id=${id}`)
    return response.data
  },

  searchEmployees: async (keywords) => {
    if (useMock) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const filtered = mockEmployees.filter(emp =>
            emp.full_name?.toLowerCase().includes(keywords.toLowerCase()) ||
            emp.employee_number?.toLowerCase().includes(keywords.toLowerCase())
          )
          resolve({ records: filtered, total: filtered.length })
        }, 300)
      })
    }
    const response = await api.get(`/employees?search=${keywords}`)
    return response.data
  }
}
