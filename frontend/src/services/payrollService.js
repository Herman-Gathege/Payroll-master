// src/services/payrollService.js
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const PAYROLL_API = `${API_BASE_URL}/payroll.php`

/**
 * Payroll Service
 * Handles all payroll-related API calls
 */
class PayrollService {
  /**
   * Get payroll records for a specific period
   */
  async getPayroll(month, year) {
    try {
      const response = await axios.get(PAYROLL_API, {
        params: {
          action: 'get_payroll',
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
   * Get individual payslip
   */
  async getPayslip(employeeId, month, year) {
    try {
      const response = await axios.get(PAYROLL_API, {
        params: {
          action: 'get_payslip',
          employee_id: employeeId,
          month,
          year
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching payslip:', error)
      throw error
    }
  }

  /**
   * Get payroll summary
   */
  async getPayrollSummary(month, year) {
    try {
      const response = await axios.get(PAYROLL_API, {
        params: {
          action: 'get_summary',
          month,
          year
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching payroll summary:', error)
      throw error
    }
  }

  /**
   * Generate payroll for a single employee
   */
  async generateEmployeePayroll(employeeId, month, year) {
    try {
      const response = await axios.post(PAYROLL_API, {
        action: 'generate_payroll',
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
   * Generate payroll for all active employees
   */
  async generateBulkPayroll(month, year) {
    try {
      const response = await axios.post(PAYROLL_API, {
        action: 'generate_bulk_payroll',
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
   * Approve payroll
   */
  async approvePayroll(payrollId) {
    try {
      const response = await axios.put(PAYROLL_API, {
        action: 'approve_payroll',
        payroll_id: payrollId
      })
      return response.data
    } catch (error) {
      console.error('Error approving payroll:', error)
      throw error
    }
  }

  /**
   * Process payment
   */
  async processPayment(payrollId, paymentMethod = 'bank_transfer') {
    try {
      const response = await axios.put(PAYROLL_API, {
        action: 'process_payment',
        payroll_id: payrollId,
        payment_method: paymentMethod
      })
      return response.data
    } catch (error) {
      console.error('Error processing payment:', error)
      throw error
    }
  }

  /**
   * Download payslip
   */
  downloadPayslip(employeeId, month, year) {
    const url = `${PAYROLL_API}?action=download_payslip&employee_id=${employeeId}&month=${month}&year=${year}`
    window.open(url, '_blank')
  }

  /**
   * Generate report
   */
  generateReport(reportType, month, year) {
    const url = `${PAYROLL_API}?action=generate_report&report_type=${reportType}&month=${month}&year=${year}`
    window.open(url, '_blank')
  }

  /**
   * Send payslip via email
   */
  async sendPayslip(employeeId, month, year, email = null) {
    try {
      const response = await axios.post(PAYROLL_API, {
        action: 'send_payslip',
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
}

export default new PayrollService()
