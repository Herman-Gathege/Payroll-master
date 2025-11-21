import api from './api'

/**
 * Payroll Service
 * Handles all payroll-related API calls with dual authentication support
 * frontend/src/services/payrollService.js
 */
class PayrollService {
  /**
   * Get payroll records for a specific period (Employer only)
   */
  async getPayroll(month, year) {
    try {
      const response = await api.get('/employer/payroll', {
        params: {
          month,
          year
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching payroll:', error)
      throw error
    }
  }

  /**
   * Get payslips for current employee (Employee only)
   */
  async getMyPayslips(month, year) {
    try {
      const params = {}
      if (month) params.month = month
      if (year) params.year = year
      
      const response = await api.get('/employee/payslips', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching payslips:', error)
      throw error
    }
  }

  /**
   * Get individual payslip (Employer for any employee, Employee for self)
   */
  async getPayslip(employeeId, month, year) {
    try {
      const userType = localStorage.getItem('userType')
      
      if (userType === 'employee') {
        // Employee can only get own payslips
        const response = await api.get('/employee/payslips', {
          params: { month, year }
        })
        return response.data
      }
      
      // Employer can get any employee's payslip
      const response = await api.get(`/employer/payroll/${employeeId}`, {
        params: { month, year }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching payslip:', error)
      throw error
    }
  }

  /**
   * Get payroll summary (Employer only)
   */
  async getPayrollSummary(month, year) {
    try {
      const response = await api.get('/employer/payroll/summary.php', {
        params: { month, year }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching payroll summary:', error)
      throw error
    }
  }

  /**
   * Generate payroll for a single employee (Employer only)
   */
  async generateEmployeePayroll(employeeId, month, year) {
    try {
      const response = await api.post('/employer/payroll/generate', {
        employee_id: employeeId,
        month,
        year
      })
      return response.data
    } catch (error) {
      console.error('Error generating employee payroll:', error)
      throw error
    }
  }

  /**
   * Generate payroll for all active employees (Employer only)
   */
  async generateBulkPayroll(month, year) {
    try {
      const response = await api.post('/employer/payroll/generate/bulk', {
        month,
        year
      })
      return response.data
    } catch (error) {
      console.error('Error generating bulk payroll:', error)
      throw error
    }
  }

  /**
   * Approve payroll (Employer only)
   */
  async approvePayroll(payrollId) {
    try {
      const response = await api.put(`/employer/payroll/${payrollId}/approve`)
      return response.data
    } catch (error) {
      console.error('Error approving payroll:', error)
      throw error
    }
  }

  /**
   * Process payment (Employer only)
   */
  async processPayment(payrollId, paymentMethod = 'bank_transfer') {
    try {
      const response = await api.put(`/employer/payroll/${payrollId}/process`, {
        payment_method: paymentMethod
      })
      return response.data
    } catch (error) {
      console.error('Error processing payment:', error)
      throw error
    }
  }

  /**
   * Download payslip (PDF)
   */
  async downloadPayslip(employeeId, month, year) {
    try {
      const userType = localStorage.getItem('userType')
      const endpoint = userType === 'employee' 
        ? '/employee/payslips/download'
        : `/employer/payroll/${employeeId}/download`
      
      const response = await api.get(endpoint, {
        params: { month, year },
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `payslip_${month}_${year}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      return response.data
    } catch (error) {
      console.error('Error downloading payslip:', error)
      throw error
    }
  }

  /**
   * Generate payroll report (Employer only)
   */
  async generateReport(reportType, month, year) {
    try {
      const response = await api.get('/employer/payroll/report', {
        params: { report_type: reportType, month, year },
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `payroll_report_${reportType}_${month}_${year}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      return response.data
    } catch (error) {
      console.error('Error generating report:', error)
      throw error
    }
  }

  /**
   * Send payslip via email (Employer only)
   */
  async sendPayslip(employeeId, month, year, email = null) {
    try {
      const response = await api.post('/employer/payroll/send-payslip', {
        employee_id: employeeId,
        month,
        year,
        email
      })
      return response.data
    } catch (error) {
      console.error('Error sending payslip:', error)
      throw error
    }
  }

  /**
   * Get statutory deductions summary (Employer only)
   */
  async getStatutoryDeductions(month, year) {
    try {
      const response = await api.get('/employer/payroll/statutory', {
        params: { month, year }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching statutory deductions:', error)
      throw error
    }
  }
}

export default new PayrollService()

