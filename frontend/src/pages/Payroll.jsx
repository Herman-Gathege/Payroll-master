import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent
} from '@mui/material'
import {
  PlayArrow,
  Download,
  Email,
  Check,
  Settings as SettingsIcon,
  Save
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import payrollService from '../services/payrollService'
import { employeeService } from '../services/employeeService'
import { primaryButtonStyle } from '../styles/buttonStyles'

export default function Payroll() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Configuration state
  const [config, setConfig] = useState({
    personalRelief: 2400,
    nssfRate: 6,
    nssfEmployerRate: 6,
    nssfUpperLimit: 36000,
    shifRate: 2.75,
    housingLevyRate: 1.5,
    overtimeRate: 150,
    workingHoursPerMonth: 160,
    workingDaysPerMonth: 22,
    companyName: 'Evolve',
    companyAddress: 'Nairobi, Kenya',
    companyPin: 'P000000000A',
    companyEmail: 'payroll@evolve.com',
    companyPhone: '+254 700 000000'
  })

  const { data: employeesData } = useQuery('employees', employeeService.getAllEmployees)
  const employees = employeesData?.records || []

  const generatePayrollMutation = useMutation(
    () => payrollService.generateBulkPayroll(selectedMonth, selectedYear),
    {
      onSuccess: () => {
        toast.success('Payroll generated successfully!')
        queryClient.invalidateQueries('payroll')
      },
      onError: () => {
        toast.error('Failed to generate payroll')
      }
    }
  )

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveConfig = () => {
    localStorage.setItem('payrollConfig', JSON.stringify(config))
    toast.success('Configuration saved successfully!')
  }

  const handleGeneratePayroll = () => {
    if (window.confirm(`Generate payroll for ${getMonthName(selectedMonth)} ${selectedYear}?`)) {
      generatePayrollMutation.mutate()
    }
  }

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[month - 1]
  }

  const calculatePayrollPreview = (employee) => {
    const basicSalary = parseFloat(employee.basic_salary) || 0
    const grossPay = basicSalary

    const nssf = Math.min(grossPay, config.nssfUpperLimit) * (config.nssfRate / 100)
    const shif = grossPay * (config.shifRate / 100)
    const housingLevy = grossPay * (config.housingLevyRate / 100)

    let paye = 0
    const taxablePay = grossPay - nssf
    if (taxablePay <= 24000) {
      paye = taxablePay * 0.10
    } else if (taxablePay <= 32333) {
      paye = 24000 * 0.10 + (taxablePay - 24000) * 0.25
    } else if (taxablePay <= 500000) {
      paye = 24000 * 0.10 + 8333 * 0.25 + (taxablePay - 32333) * 0.30
    } else if (taxablePay <= 800000) {
      paye = 24000 * 0.10 + 8333 * 0.25 + 467667 * 0.30 + (taxablePay - 500000) * 0.325
    } else {
      paye = 24000 * 0.10 + 8333 * 0.25 + 467667 * 0.30 + 300000 * 0.325 + (taxablePay - 800000) * 0.35
    }
    paye = Math.max(0, paye - config.personalRelief)

    const totalDeductions = nssf + shif + housingLevy + paye
    const netPay = grossPay - totalDeductions

    return {
      grossPay: grossPay.toFixed(2),
      nssf: nssf.toFixed(2),
      shif: shif.toFixed(2),
      housingLevy: housingLevy.toFixed(2),
      paye: paye.toFixed(2),
      totalDeductions: totalDeductions.toFixed(2),
      netPay: netPay.toFixed(2)
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Payroll Management</Typography>
        <Box display="flex" gap={2}>
          <TextField
            select
            size="small"
            label="Month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            sx={{ width: 120 }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <MenuItem key={month} value={month}>{getMonthName(month)}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            sx={{ width: 100 }}
          >
            {[2024, 2025, 2026].map((year) => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Process Payroll" />
        <Tab label="Configuration" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h6">
                  Payroll Period: {getMonthName(selectedMonth)} {selectedYear}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {employees.filter(e => e.employment_status === 'active').length} active employees
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={handleGeneratePayroll}
                  disabled={generatePayrollMutation.isLoading}
                  sx={primaryButtonStyle}
                >
                  {generatePayrollMutation.isLoading ? 'Processing...' : 'Generate Payroll'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee #</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Gross Pay</TableCell>
                  <TableCell align="right">NSSF</TableCell>
                  <TableCell align="right">SHIF</TableCell>
                  <TableCell align="right">Housing Levy</TableCell>
                  <TableCell align="right">PAYE</TableCell>
                  <TableCell align="right">Total Deductions</TableCell>
                  <TableCell align="right">Net Pay</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.filter(e => e.employment_status === 'active').map((employee) => {
                  const payroll = calculatePayrollPreview(employee)
                  return (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.employee_number}</TableCell>
                      <TableCell>{employee.full_name}</TableCell>
                      <TableCell align="right">KES {payroll.grossPay}</TableCell>
                      <TableCell align="right">KES {payroll.nssf}</TableCell>
                      <TableCell align="right">KES {payroll.shif}</TableCell>
                      <TableCell align="right">KES {payroll.housingLevy}</TableCell>
                      <TableCell align="right">KES {payroll.paye}</TableCell>
                      <TableCell align="right">KES {payroll.totalDeductions}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>KES {payroll.netPay}</TableCell>
                      <TableCell align="center">
                        <Chip label="Draft" size="small" color="warning" />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" title="Download Payslip">
                          <Download />
                        </IconButton>
                        <IconButton size="small" title="Email Payslip">
                          <Email />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {employees.filter(e => e.employment_status === 'active').length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} align="center">No active employees found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
            Tax & Statutory Deductions
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Personal Relief (Monthly)"
                type="number"
                value={config.personalRelief}
                onChange={(e) => handleConfigChange('personalRelief', parseFloat(e.target.value))}
                InputProps={{ startAdornment: 'KES ' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="NSSF Rate (%)"
                type="number"
                value={config.nssfRate}
                onChange={(e) => handleConfigChange('nssfRate', parseFloat(e.target.value))}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="NSSF Upper Limit"
                type="number"
                value={config.nssfUpperLimit}
                onChange={(e) => handleConfigChange('nssfUpperLimit', parseFloat(e.target.value))}
                InputProps={{ startAdornment: 'KES ' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="SHIF Rate (%)"
                type="number"
                value={config.shifRate}
                onChange={(e) => handleConfigChange('shifRate', parseFloat(e.target.value))}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Housing Levy Rate (%)"
                type="number"
                value={config.housingLevyRate}
                onChange={(e) => handleConfigChange('housingLevyRate', parseFloat(e.target.value))}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Overtime Rate (%)"
                type="number"
                value={config.overtimeRate}
                onChange={(e) => handleConfigChange('overtimeRate', parseFloat(e.target.value))}
                InputProps={{ endAdornment: '%' }}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mt: 4 }}>
            Working Hours
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Working Hours Per Month"
                type="number"
                value={config.workingHoursPerMonth}
                onChange={(e) => handleConfigChange('workingHoursPerMonth', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Working Days Per Month"
                type="number"
                value={config.workingDaysPerMonth}
                onChange={(e) => handleConfigChange('workingDaysPerMonth', parseInt(e.target.value))}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mt: 4 }}>
            Company Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={config.companyName}
                onChange={(e) => handleConfigChange('companyName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company PIN"
                value={config.companyPin}
                onChange={(e) => handleConfigChange('companyPin', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Address"
                value={config.companyAddress}
                onChange={(e) => handleConfigChange('companyAddress', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Email"
                type="email"
                value={config.companyEmail}
                onChange={(e) => handleConfigChange('companyEmail', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Phone"
                value={config.companyPhone}
                onChange={(e) => handleConfigChange('companyPhone', e.target.value)}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveConfig}
              sx={primaryButtonStyle}
            >
              Save Configuration
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  )
}
