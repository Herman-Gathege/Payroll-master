import { useState, useEffect } from 'react'
import payrollService from '../services/payrollService'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('tax')
  const [showFundModal, setShowFundModal] = useState(false)
  const [payrollData, setPayrollData] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear] = useState(new Date().getFullYear())
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadPayrollData()
    loadSummary()
  }, [])

  const loadPayrollData = async () => {
    try {
      setLoading(true)
      const response = await payrollService.getPayroll(currentMonth, currentYear)
      if (response.success) {
        setPayrollData(response.data || [])
      }
    } catch (error) {
      console.error('Error loading payroll:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = async () => {
    try {
      const response = await payrollService.getPayrollSummary(currentMonth, currentYear)
      if (response.success) {
        setSummary(response.data)
      }
    } catch (error) {
      console.error('Error loading summary:', error)
    }
  }

  const handleGeneratePayroll = async () => {
    if (!confirm('Generate payroll for all active employees? This may take a few moments.')) {
      return
    }

    try {
      setGenerating(true)
      const response = await payrollService.generateBulkPayroll(currentMonth, currentYear)

      if (response.success) {
        alert('Payroll generated successfully!')
        await loadPayrollData()
        await loadSummary()
      } else {
        alert('Failed to generate payroll: ' + response.message)
      }
    } catch (error) {
      console.error('Error generating payroll:', error)
      alert('Error generating payroll. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownloadPayslip = (employeeId) => {
    payrollService.downloadPayslip(employeeId, currentMonth, currentYear)
  }

  const handleSendPayslip = async (employeeId, email) => {
    try {
      const response = await payrollService.sendPayslip(employeeId, currentMonth, currentYear, email)
      if (response.success) {
        alert('Payslip sent successfully!')
      } else {
        alert('Failed to send payslip: ' + response.message)
      }
    } catch (error) {
      alert('Error sending payslip')
    }
  }

  const handleGenerateReport = (reportType) => {
    payrollService.generateReport(reportType, currentMonth, currentYear)
  }

  const handleSaveConfig = () => {
    alert('Configuration saved successfully!')
  }

  return (
    <>
      <style>{`
        :root {
            --primary: #1a365d;
            --secondary: #d4af37;
            --accent: #2d3748;
            --light-blue: #3182ce;
            --light: #FFFFFF;
            --gray: #718096;
            --light-gray: #f7fafc;
            --shadow: 0 4px 12px rgba(0,0,0,0.1);
            --radius: 8px;
            --transition: all 0.3s ease;
        }

        .dashboard-page {
            background-color: #f0f2f5;
            color: var(--accent);
            line-height: 1.6;
        }

        .dashboard-header {
            font-size: 24px;
            color: var(--accent);
            margin-bottom: 30px;
        }

        .stats-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: var(--light);
            border-radius: var(--radius);
            padding: 20px;
            box-shadow: var(--shadow);
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .stat-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }

        .stat-icon.primary {
            background: rgba(26, 54, 93, 0.1);
            color: var(--primary);
        }

        .stat-icon.secondary {
            background: rgba(212, 175, 55, 0.1);
            color: var(--secondary);
        }

        .stat-icon.accent {
            background: rgba(45, 55, 72, 0.1);
            color: var(--accent);
        }

        .stat-info h3 {
            font-size: 24px;
            margin-bottom: 5px;
        }

        .stat-info p {
            color: var(--gray);
            font-size: 14px;
            margin: 0;
        }

        .dashboard-content {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
        }

        .card {
            background: var(--light);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            padding: 20px;
            margin-bottom: 30px;
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }

        .card-header h2 {
            font-size: 18px;
            color: var(--accent);
            margin: 0;
        }

        .btn {
            padding: 8px 15px;
            border-radius: var(--radius);
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            border: none;
            font-size: 14px;
        }

        .btn-primary {
            background: var(--primary);
            color: white;
        }

        .btn-primary:hover {
            background: #152642;
        }

        .btn-secondary {
            background: var(--secondary);
            color: var(--accent);
        }

        .btn-secondary:hover {
            background: #c19d2e;
        }

        .btn-outline {
            background: transparent;
            border: 1px solid var(--primary);
            color: var(--primary);
        }

        .btn-outline:hover {
            background: var(--primary);
            color: white;
        }

        .employee-table {
            width: 100%;
            border-collapse: collapse;
        }

        .employee-table th {
            text-align: left;
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
            color: var(--gray);
            font-weight: 600;
        }

        .employee-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
        }

        .employee-table tr:last-child td {
            border-bottom: none;
        }

        .employee-table tr:hover {
            background: #f9f9f9;
        }

        .status {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }

        .status.active {
            background: rgba(26, 54, 93, 0.1);
            color: var(--primary);
        }

        .status.pending {
            background: rgba(212, 175, 55, 0.1);
            color: #a08629;
        }

        .action-buttons {
            display: flex;
            gap: 5px;
        }

        .action-btn {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f0f0f0;
            color: var(--dark);
            cursor: pointer;
            transition: var(--transition);
            border: none;
        }

        .action-btn:hover {
            background: var(--primary);
            color: white;
        }

        .wallet-section {
            background: linear-gradient(135deg, var(--primary), var(--light-blue));
            color: white;
            border-radius: var(--radius);
            padding: 20px;
            margin-bottom: 20px;
        }

        .wallet-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .wallet-balance {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .wallet-info {
            font-size: 14px;
            opacity: 0.9;
        }

        .wallet-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        .wallet-transactions {
            margin-top: 20px;
        }

        .wallet-transactions h3 {
            margin-bottom: 15px;
        }

        .transaction-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255,255,255,0.2);
        }

        .transaction-item:last-child {
            border-bottom: none;
        }

        .transaction-type {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .transaction-amount.credit {
            color: #68d391;
        }

        .transaction-amount.debit {
            color: #fc8181;
        }

        .config-section {
            background: var(--light);
            border-radius: var(--radius);
            padding: 20px;
            margin-bottom: 20px;
        }

        .config-tabs {
            display: flex;
            border-bottom: 1px solid #eee;
            margin-bottom: 20px;
        }

        .config-tab {
            padding: 10px 20px;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            background: none;
            border-left: none;
            border-right: none;
            border-top: none;
        }

        .config-tab.active {
            border-bottom-color: var(--secondary);
            color: var(--primary);
            font-weight: 600;
        }

        .config-content {
            display: none;
        }

        .config-content.active {
            display: block;
        }

        .config-item {
            margin-bottom: 15px;
        }

        .config-item label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }

        .config-item input, .config-item select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: var(--radius);
        }

        .config-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }

        .activity-list {
            list-style: none;
            padding: 0;
        }

        .activity-item {
            display: flex;
            gap: 15px;
            padding: 15px 0;
            border-bottom: 1px solid #eee;
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(26, 54, 93, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
        }

        .activity-content h4 {
            font-size: 14px;
            margin-bottom: 5px;
            margin-top: 0;
        }

        .activity-content p {
            font-size: 12px;
            color: var(--gray);
            margin: 0;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }

        .modal.show {
            display: flex;
        }

        .modal-content {
            background: white;
            border-radius: var(--radius);
            width: 90%;
            max-width: 500px;
            padding: 30px;
            box-shadow: var(--shadow);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .modal-header h2 {
            margin: 0;
        }

        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: var(--gray);
        }

        @media (max-width: 1200px) {
            .stats-cards {
                grid-template-columns: repeat(2, 1fr);
            }

            .dashboard-content {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .stats-cards {
                grid-template-columns: 1fr;
            }

            .config-grid {
                grid-template-columns: 1fr;
            }
        }
      `}</style>

      <div className="dashboard-page">
        <h1 className="dashboard-header">Payroll Dashboard</h1>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon primary">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <h3>{summary?.total_employees || 0}</h3>
              <p>Total Employees</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon secondary">
              <i className="fas fa-wallet"></i>
            </div>
            <div className="stat-info">
              <h3>KSh 1,245,680</h3>
              <p>Wallet Balance</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon accent">
              <i className="fas fa-money-bill-wave"></i>
            </div>
            <div className="stat-info">
              <h3>KSh {summary?.total_gross_pay ? parseFloat(summary.total_gross_pay).toLocaleString() : '0'}</h3>
              <p>This Month's Payroll</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon primary">
              <i className="fas fa-calendar-day"></i>
            </div>
            <div className="stat-info">
              <h3>{payrollData.filter(p => p.status === 'draft').length}</h3>
              <p>Pending Actions</p>
            </div>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="dashboard-content">
          {/* Left Column */}
          <div className="left-column">
            {/* Wallet Section */}
            <div className="wallet-section">
              <div className="wallet-header">
                <div>
                  <div className="wallet-label">Payroll Wallet Balance</div>
                  <div className="wallet-balance">KSh 1,245,680</div>
                  <div className="wallet-info">Last updated: Today, 10:30 AM</div>
                </div>
                <div>
                  <button className="btn btn-secondary" onClick={() => setShowFundModal(true)}>
                    <i className="fas fa-plus"></i> Fund Wallet
                  </button>
                </div>
              </div>

              <div className="wallet-actions">
                <button className="btn btn-outline" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'white' }}>
                  <i className="fas fa-mobile-alt"></i> Mobile Money
                </button>
                <button className="btn btn-outline" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'white' }}>
                  <i className="fas fa-university"></i> Bank Transfer
                </button>
                <button className="btn btn-outline" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'white' }}>
                  <i className="fas fa-history"></i> Transaction History
                </button>
              </div>

              <div className="wallet-transactions">
                <h3>Recent Transactions</h3>
                <div className="transaction-item">
                  <div className="transaction-type">
                    <i className="fas fa-arrow-down" style={{ color: '#68d391' }}></i>
                    <span>Wallet Top-up</span>
                  </div>
                  <div className="transaction-amount credit">+ KSh 500,000</div>
                  <div className="transaction-date">Today, 09:15 AM</div>
                </div>
                <div className="transaction-item">
                  <div className="transaction-type">
                    <i className="fas fa-arrow-up" style={{ color: '#fc8181' }}></i>
                    <span>Salary Disbursement</span>
                  </div>
                  <div className="transaction-amount debit">- KSh 254,320</div>
                  <div className="transaction-date">Yesterday, 02:30 PM</div>
                </div>
                <div className="transaction-item">
                  <div className="transaction-type">
                    <i className="fas fa-arrow-down" style={{ color: '#68d391' }}></i>
                    <span>Wallet Top-up</span>
                  </div>
                  <div className="transaction-amount credit">+ KSh 1,000,000</div>
                  <div className="transaction-date">Mar 15, 2023</div>
                </div>
              </div>
            </div>

            {/* Payroll Actions */}
            <div className="config-section">
              <div className="card-header">
                <h2>Payroll Actions</h2>
                <button
                  className="btn btn-primary"
                  onClick={handleGeneratePayroll}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate Payroll'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <button className="btn btn-outline" onClick={() => handleGenerateReport('summary')}>
                  <i className="fas fa-file-alt"></i> Summary Report
                </button>
                <button className="btn btn-outline" onClick={() => handleGenerateReport('detailed')}>
                  <i className="fas fa-table"></i> Detailed Report
                </button>
                <button className="btn btn-outline" onClick={() => handleGenerateReport('tax')}>
                  <i className="fas fa-file-invoice"></i> Tax Report
                </button>
              </div>
            </div>

            {/* Payroll Configuration */}
            <div className="config-section">
              <div className="card-header">
                <h2>Payroll Configuration</h2>
                <button className="btn btn-primary" onClick={handleSaveConfig}>Save Changes</button>
              </div>

              <div className="config-tabs">
                <button className={`config-tab ${activeTab === 'tax' ? 'active' : ''}`} onClick={() => setActiveTab('tax')}>Tax Settings</button>
                <button className={`config-tab ${activeTab === 'deductions' ? 'active' : ''}`} onClick={() => setActiveTab('deductions')}>Deductions</button>
                <button className={`config-tab ${activeTab === 'allowances' ? 'active' : ''}`} onClick={() => setActiveTab('allowances')}>Allowances</button>
                <button className={`config-tab ${activeTab === 'disbursement' ? 'active' : ''}`} onClick={() => setActiveTab('disbursement')}>Disbursement</button>
              </div>

              <div className={`config-content ${activeTab === 'tax' ? 'active' : ''}`}>
                <div className="config-grid">
                  <div className="config-item">
                    <label htmlFor="paye-rate">PAYE Rate (%)</label>
                    <input type="number" id="paye-rate" defaultValue="30" step="0.1" />
                  </div>
                  <div className="config-item">
                    <label htmlFor="nssf-rate">NSSF Employee Contribution (%)</label>
                    <input type="number" id="nssf-rate" defaultValue="6" step="0.1" />
                  </div>
                  <div className="config-item">
                    <label htmlFor="nssf-employer">NSSF Employer Contribution (%)</label>
                    <input type="number" id="nssf-employer" defaultValue="6" step="0.1" />
                  </div>
                  <div className="config-item">
                    <label htmlFor="nhif-rate">NHIF Rate (%)</label>
                    <input type="number" id="nhif-rate" defaultValue="1.5" step="0.1" />
                  </div>
                  <div className="config-item">
                    <label htmlFor="housing-levy">Housing Levy (%)</label>
                    <input type="number" id="housing-levy" defaultValue="1.5" step="0.1" />
                  </div>
                  <div className="config-item">
                    <label htmlFor="personal-relief">Personal Relief (KSh)</label>
                    <input type="number" id="personal-relief" defaultValue="2400" step="100" />
                  </div>
                </div>
              </div>

              <div className={`config-content ${activeTab === 'deductions' ? 'active' : ''}`}>
                <div className="config-grid">
                  <div className="config-item">
                    <label htmlFor="pension-rate">Pension Contribution (%)</label>
                    <input type="number" id="pension-rate" defaultValue="5" step="0.1" />
                  </div>
                  <div className="config-item">
                    <label htmlFor="loan-deduction">Maximum Loan Deduction (%)</label>
                    <input type="number" id="loan-deduction" defaultValue="33" step="1" />
                  </div>
                  <div className="config-item">
                    <label htmlFor="insurance">Insurance Deduction (KSh)</label>
                    <input type="number" id="insurance" defaultValue="500" step="50" />
                  </div>
                </div>
              </div>

              <div className={`config-content ${activeTab === 'allowances' ? 'active' : ''}`}>
                <div className="config-grid">
                  <div className="config-item">
                    <label htmlFor="transport-allowance">Transport Allowance (KSh)</label>
                    <input type="number" id="transport-allowance" defaultValue="5000" step="100" />
                  </div>
                  <div className="config-item">
                    <label htmlFor="housing-allowance">Housing Allowance (KSh)</label>
                    <input type="number" id="housing-allowance" defaultValue="10000" step="100" />
                  </div>
                  <div className="config-item">
                    <label htmlFor="medical-allowance">Medical Allowance (KSh)</label>
                    <input type="number" id="medical-allowance" defaultValue="3000" step="100" />
                  </div>
                </div>
              </div>

              <div className={`config-content ${activeTab === 'disbursement' ? 'active' : ''}`}>
                <div className="config-grid">
                  <div className="config-item">
                    <label htmlFor="default-method">Default Disbursement Method</label>
                    <select id="default-method">
                      <option value="bank">Bank Transfer</option>
                      <option value="mobile" selected>Mobile Money</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                  <div className="config-item">
                    <label htmlFor="payday">Default Payday</label>
                    <select id="payday">
                      <option value="last">Last Day of Month</option>
                      <option value="25">25th of Month</option>
                      <option value="15">15th of Month</option>
                      <option value="custom">Custom Date</option>
                    </select>
                  </div>
                  <div className="config-item">
                    <label htmlFor="currency">Currency</label>
                    <select id="currency">
                      <option value="KES" selected>Kenyan Shilling (KES)</option>
                      <option value="USD">US Dollar (USD)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Payroll List Card */}
            <div className="card">
              <div className="card-header">
                <h2>Employee Payroll ({payrollData.length})</h2>
                <button className="btn btn-primary" onClick={handleGeneratePayroll} disabled={generating}>
                  {generating ? 'Generating...' : 'Generate All'}
                </button>
              </div>
              <div className="card-body">
                {loading ? (
                  <p>Loading payroll data...</p>
                ) : payrollData.length === 0 ? (
                  <p>No payroll data available. Click "Generate All" to create payroll.</p>
                ) : (
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Gross Pay</th>
                        <th>Net Pay</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrollData.slice(0, 10).map((payroll) => (
                        <tr key={payroll.id}>
                          <td>{payroll.employee_name}</td>
                          <td>{payroll.department}</td>
                          <td>KSh {parseFloat(payroll.gross_pay).toLocaleString()}</td>
                          <td>KSh {parseFloat(payroll.net_pay).toLocaleString()}</td>
                          <td>
                            <span className={`status ${payroll.status === 'paid' ? 'active' : 'pending'}`}>
                              {payroll.status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="action-btn"
                                onClick={() => handleDownloadPayslip(payroll.employee_id)}
                                title="Download Payslip"
                              >
                                <i className="fas fa-download"></i>
                              </button>
                              <button
                                className="action-btn"
                                onClick={() => {
                                  const email = prompt('Enter email address:', payroll.email || '')
                                  if (email) handleSendPayslip(payroll.employee_id, email)
                                }}
                                title="Send via Email"
                              >
                                <i className="fas fa-envelope"></i>
                              </button>
                              <button
                                className="action-btn"
                                onClick={() => handleDownloadPayslip(payroll.employee_id)}
                                title="View Details"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Payroll Summary Card */}
            <div className="card">
              <div className="card-header">
                <h2>This Month's Payroll Summary</h2>
                <button className="btn btn-outline" onClick={() => handleGenerateReport('summary')}>
                  View Details
                </button>
              </div>
              <div className="card-body">
                {summary ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                      <span>Basic Salary</span>
                      <span>KSh {parseFloat(summary.total_basic_salary || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                      <span>Allowances</span>
                      <span>KSh {parseFloat(summary.total_allowances || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                      <span>Overtime</span>
                      <span>KSh {parseFloat(summary.total_overtime || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                      <span>Deductions (PAYE, NSSF, SHIF)</span>
                      <span>KSh {parseFloat(summary.total_deductions || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingTop: '10px', borderTop: '2px solid #eee', fontWeight: 'bold' }}>
                      <span>Net Pay</span>
                      <span>KSh {parseFloat(summary.total_net_pay || 0).toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <p>No payroll data available</p>
                )}
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="card">
              <div className="card-header">
                <h2>Recent Activity</h2>
              </div>
              <div className="card-body">
                <ul className="activity-list">
                  <li className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-wallet"></i>
                    </div>
                    <div className="activity-content">
                      <h4>Wallet funded</h4>
                      <p>KSh 500,000 added to payroll wallet</p>
                      <p>2 hours ago</p>
                    </div>
                  </li>
                  <li className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-money-check"></i>
                    </div>
                    <div className="activity-content">
                      <h4>Payroll processed</h4>
                      <p>February payroll completed successfully</p>
                      <p>1 day ago</p>
                    </div>
                  </li>
                  <li className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-cog"></i>
                    </div>
                    <div className="activity-content">
                      <h4>Configuration updated</h4>
                      <p>PAYE rates adjusted for new fiscal year</p>
                      <p>2 days ago</p>
                    </div>
                  </li>
                  <li className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-file-invoice"></i>
                    </div>
                    <div className="activity-content">
                      <h4>Tax filing completed</h4>
                      <p>January PAYE returns submitted to KRA</p>
                      <p>3 days ago</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="card">
              <div className="card-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button className="btn btn-outline" style={{ marginBottom: '10px' }} onClick={() => handleGenerateReport('detailed')}>
                    <i className="fas fa-download"></i> Export Data
                  </button>
                  <button className="btn btn-outline" style={{ marginBottom: '10px' }} onClick={handleGeneratePayroll} disabled={generating}>
                    <i className="fas fa-calculator"></i> Run Payroll
                  </button>
                  <button className="btn btn-outline" style={{ marginBottom: '10px' }} onClick={() => handleGenerateReport('summary')}>
                    <i className="fas fa-file-invoice"></i> Generate Reports
                  </button>
                  <button className="btn btn-outline" style={{ marginBottom: '10px' }} onClick={() => handleGenerateReport('tax')}>
                    <i className="fas fa-file-alt"></i> Tax Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fund Wallet Modal */}
      <div className={`modal ${showFundModal ? 'show' : ''}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Fund Payroll Wallet</h2>
            <button className="modal-close" onClick={() => setShowFundModal(false)}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="config-item">
              <label htmlFor="fund-amount">Amount (KES)</label>
              <input type="number" id="fund-amount" placeholder="Enter amount" />
            </div>
            <div className="config-item">
              <label htmlFor="fund-method">Payment Method</label>
              <select id="fund-method">
                <option value="bank">Bank Transfer</option>
                <option value="mpesa">M-Pesa</option>
                <option value="card">Credit/Debit Card</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }}>Proceed to Payment</button>
          </div>
        </div>
      </div>
    </>
  )
}
