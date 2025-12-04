import api from "./api";

/**
from frontend/src/services/payrollService.js
 */
class PayrollService {
  async getPayroll(month, year) {
    try {
      const response = await api.get("/payroll.php", {
        params: { action: "get_payroll", month, year },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching payroll:", error);
      throw error;
    }
  }

  async getPayslip(employeeId, month, year) {
    try {
      const response = await api.get("/payroll.php", {
        params: { action: "get_payslip", employee_id: employeeId, month, year },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching payslip:", error);
      throw error;
    }
  }

  async downloadPayslip(employeeId, month, year) {
    try {
      const response = await api.get("/payroll.php", {
        params: {
          action: "download_payslip",
          employee_id: employeeId,
          month,
          year,
        },
        responseType: "blob",
      });
      return response;
    } catch (error) {
      console.error("Error downloading payslip:", error);
      throw error;
    }
  }

  async generateEmployeePayroll(employeeId, month, year) {
    try {
      const response = await api.post("/payroll.php", {
        action: "generate_payroll",
        employee_id: employeeId,
        month,
        year,
      });
      return response.data;
    } catch (error) {
      console.error("Error generating employee payroll:", error);
      throw error;
    }
  }

  async generateBulkPayroll(month, year) {
    try {
      const response = await api.post("/payroll.php", {
        action: "generate_bulk_payroll",
        month,
        year,
      });
      return response.data;
    } catch (error) {
      console.error("Error generating bulk payroll:", error);
      throw error;
    }
  }

  async approvePayroll(payrollId) {
    try {
      const response = await api.put("/payroll.php", {
        action: "approve_payroll",
        payroll_id: payrollId,
      });
      return response.data;
    } catch (error) {
      console.error("Error approving payroll:", error);
      throw error;
    }
  }

  async processPayment(payrollId, paymentMethod = "bank_transfer") {
    try {
      const response = await api.put("/payroll.php", {
        action: "process_payment",
        payroll_id: payrollId,
        payment_method: paymentMethod,
      });
      return response.data;
    } catch (error) {
      console.error("Error processing payment:", error);
      throw error;
    }
  }

  async sendPayslip(employeeId, month, year) {
    try {
      const response = await api.post("/payroll.php", {
        action: "send_payslip",
        employee_id: employeeId,
        month,
        year,
      });
      return response.data;
    } catch (error) {
      console.error("Error sending payslip:", error);
      throw error;
    }
  }

  async getPayrollSummary(month, year) {
    try {
      const response = await api.get("/payroll.php", {
        params: { action: "get_summary", month, year },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching payroll summary:", error);
      throw error;
    }
  }

  async generateReport(reportType, month, year) {
    try {
      const response = await api.get("/payroll.php", {
        params: {
          action: "generate_report",
          report_type: reportType,
          month,
          year,
        },
        responseType: "blob",
      });
      return response;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  }

  async getMyPayslips() {
    const response = await api.get("/payroll.php?action=my_payslips");
    return (response.data.data = response.data.data || []);
    return response.data;
  }

  // BULK APPROVE
  async bulkApprove(ids) {
    try {
      const response = await api.put("/payroll.php", {
        action: "approve_bulk",
        payroll_ids: ids,
      });
      return response.data;
    } catch (error) {
      console.error("Error approving bulk payroll:", error);
      throw error;
    }
  }

  // BULK MARK PAID
  async bulkMarkPaid(ids, paymentMethod = "bank_transfer") {
    try {
      const response = await api.put("/payroll.php", {
        action: "process_bulk_payment",
        payroll_ids: ids,
        payment_method: paymentMethod,
      });
      return response.data;
    } catch (error) {
      console.error("Error processing bulk payment:", error);
      throw error;
    }
  }

  // BULK SEND PAYSLIPS
  async bulkSendPayslips(ids, month, year) {
    try {
      const response = await api.post("/payroll.php", {
        action: "send_bulk_payslips",
        payroll_ids: ids,
        month,
        year,
      });
      return response.data;
    } catch (error) {
      console.error("Error sending bulk payslips:", error);
      throw error;
    }
  }
}

export default new PayrollService();
