import { useState } from 'react'
import { useQuery } from 'react-query'
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem
} from '@mui/material'
import {
  Download,
  PictureAsPdf,
  InsertDriveFile,
  Assessment
} from '@mui/icons-material'
import { employeeService } from '../services/employeeService'

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '14px',
  },
  '& .MuiOutlinedInput-input': {
    padding: '8px 12px',
  },
}

const buttonStyles = {
  borderRadius: '6px',
  padding: '6px 16px',
  fontSize: '13px',
  textTransform: 'none',
  fontWeight: 500,
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState(0)
  const [reportPeriod, setReportPeriod] = useState('monthly')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const { data: employeesData } = useQuery('employees', employeeService.getAllEmployees)
  const employees = employeesData?.records || []

  const handleDownloadReport = (type, format) => {
    console.log(`Downloading ${type} report as ${format}`)
    alert(`Generating ${type} report in ${format} format...`)
  }

  const headcountData = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.employment_status === 'active').length,
    byDepartment: employees.reduce((acc, emp) => {
      const dept = emp.department_name || 'Unassigned'
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    }, {}),
    byType: employees.reduce((acc, emp) => {
      const type = emp.employment_type || 'Unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Reports & Analytics</Typography>
        <Box display="flex" gap={1}>
          <TextField
            select
            size="small"
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            sx={{ ...inputStyles, width: 120 }}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
            <MenuItem value="yearly">Yearly</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            sx={{ ...inputStyles, width: 100 }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <MenuItem key={month} value={month}>{new Date(2000, month - 1).toLocaleString('default', { month: 'short' })}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            sx={{ ...inputStyles, width: 90 }}
          >
            {[2024, 2025, 2026].map((year) => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Headcount" />
        <Tab label="Turnover" />
        <Tab label="Payroll Summary" />
        <Tab label="Compliance" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: '12px' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Total Employees</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#1976d2', mt: 1 }}>
                    {headcountData.totalEmployees}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: '12px' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Active Employees</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#2e7d32', mt: 1 }}>
                    {headcountData.activeEmployees}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: '12px' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">New Hires (MTD)</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#ed6c02', mt: 1 }}>
                    0
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ borderRadius: '12px' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Terminations (MTD)</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#d32f2f', mt: 1 }}>
                    0
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: '12px' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>By Department</Typography>
                  <Button
                    size="small"
                    startIcon={<Download />}
                    onClick={() => handleDownloadReport('headcount-department', 'pdf')}
                    sx={{ ...buttonStyles, color: '#1976d2' }}
                  >
                    Export
                  </Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Department</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">%</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(headcountData.byDepartment).map(([dept, count]) => (
                        <TableRow key={dept}>
                          <TableCell>{dept}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                          <TableCell align="right">
                            {((count / headcountData.totalEmployees) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: '12px' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>By Employment Type</Typography>
                  <Button
                    size="small"
                    startIcon={<Download />}
                    onClick={() => handleDownloadReport('headcount-type', 'pdf')}
                    sx={{ ...buttonStyles, color: '#1976d2' }}
                  >
                    Export
                  </Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">%</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(headcountData.byType).map(([type, count]) => (
                        <TableRow key={type}>
                          <TableCell sx={{ textTransform: 'capitalize' }}>{type}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                          <TableCell align="right">
                            {((count / headcountData.totalEmployees) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
          <Assessment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Turnover Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Track employee turnover rates, retention analysis, and exit trends.
          </Typography>
          <Box mt={3} display="flex" gap={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<PictureAsPdf />}
              onClick={() => handleDownloadReport('turnover', 'pdf')}
              sx={{ ...buttonStyles, borderColor: '#1976d2', color: '#1976d2' }}
            >
              Download PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<InsertDriveFile />}
              onClick={() => handleDownloadReport('turnover', 'excel')}
              sx={{ ...buttonStyles, borderColor: '#2e7d32', color: '#2e7d32' }}
            >
              Download Excel
            </Button>
          </Box>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
          <Assessment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Payroll Summary Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Monthly payroll summaries, tax reports, and statutory deductions.
          </Typography>
          <Box mt={3} display="flex" gap={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<PictureAsPdf />}
              onClick={() => handleDownloadReport('payroll', 'pdf')}
              sx={{ ...buttonStyles, borderColor: '#1976d2', color: '#1976d2' }}
            >
              Download PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<InsertDriveFile />}
              onClick={() => handleDownloadReport('payroll', 'excel')}
              sx={{ ...buttonStyles, borderColor: '#2e7d32', color: '#2e7d32' }}
            >
              Download Excel
            </Button>
          </Box>
        </Paper>
      )}

      {activeTab === 3 && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '12px' }}>
          <Assessment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Compliance Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            NSSF, SHIF, Housing Levy, PAYE compliance reports for submission.
          </Typography>
          <Box mt={3} display="flex" gap={2} justifyContent="center">
            <Button
              variant="outlined"
              startIcon={<PictureAsPdf />}
              onClick={() => handleDownloadReport('compliance', 'pdf')}
              sx={{ ...buttonStyles, borderColor: '#1976d2', color: '#1976d2' }}
            >
              Download PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<InsertDriveFile />}
              onClick={() => handleDownloadReport('compliance', 'excel')}
              sx={{ ...buttonStyles, borderColor: '#2e7d32', color: '#2e7d32' }}
            >
              Download Excel
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  )
}
