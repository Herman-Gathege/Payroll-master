// frontend/src/pages/Dashboard.jsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  LinearProgress
} from '@mui/material'
import {
  People,
  TrendingUp,
  AttachMoney,
  EventAvailable,
  AccessTime,
  Assessment,
  Work,
  CheckCircle,
  Warning,
  ArrowForward
} from '@mui/icons-material'
import { employeeService } from '../services/employeeService'
import payrollService from '../services/payrollService'

export default function Dashboard() {
  const navigate = useNavigate()
  const [payrollSummary, setPayrollSummary] = useState(null)
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const { data: employeesData } = useQuery('employees', employeeService.getAllEmployees)
  const employees = employeesData?.records || []

  useEffect(() => {
    loadPayrollSummary()
  }, [])

  const loadPayrollSummary = async () => {
    try {
      const response = await payrollService.getPayrollSummary(currentMonth, currentYear)
      if (response.success) {
        setPayrollSummary(response.data)
      }
    } catch (error) {
      console.error('Error loading summary:', error)
    }
  }

  // Calculate metrics
  const activeEmployees = employees.filter(e => e.employment_status === 'active').length
  const totalEmployees = employees.length
  const onLeaveEmployees = employees.filter(e => e.employment_status === 'on_leave').length

  const totalPayroll = employees
    .filter(e => e.employment_status === 'active')
    .reduce((sum, emp) => sum + (parseFloat(emp.basic_salary) || 0), 0)

  // Mock data for dashboard - in production these would come from API
  const recentActivities = [
    { id: 1, action: 'New Employee Added', name: 'John Doe', time: '2 hours ago', type: 'employee' },
    { id: 2, action: 'Leave Request Approved', name: 'Jane Smith', time: '3 hours ago', type: 'leave' },
    { id: 3, action: 'Payroll Generated', name: 'October 2025', time: '1 day ago', type: 'payroll' },
    { id: 4, action: 'Performance Review', name: 'Bob Johnson', time: '2 days ago', type: 'performance' },
  ]

  const quickStats = [
    { title: 'Total Employees', value: totalEmployees, icon: <People sx={{ fontSize: 40 }} />, color: '#1a365d', change: '+5%' },
    { title: 'Active Employees', value: activeEmployees, icon: <CheckCircle sx={{ fontSize: 40 }} />, color: '#2e7d32', change: '+2%' },
    { title: 'Monthly Payroll', value: `KES ${totalPayroll.toLocaleString()}`, icon: <AttachMoney sx={{ fontSize: 40 }} />, color: '#d4af37', change: '+3%' },
    { title: 'On Leave', value: onLeaveEmployees, icon: <EventAvailable sx={{ fontSize: 40 }} />, color: '#ed6c02', change: '-1%' },
  ]

  const departmentOverview = [
    { name: 'IT', employees: 25, budget: 2500000, utilization: 85 },
    { name: 'Finance', employees: 15, budget: 1800000, utilization: 92 },
    { name: 'HR', employees: 10, budget: 1200000, utilization: 78 },
    { name: 'Operations', employees: 30, budget: 2800000, utilization: 88 },
  ]

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>Dashboard Overview</Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back! Here's what's happening with your organization today.
        </Typography>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {quickStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{
              background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <TrendingUp sx={{ fontSize: 16 }} />
                      <Typography variant="caption">{stat.change} from last month</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ opacity: 0.3 }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Department Overview */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Department Overview</Typography>
              <IconButton size="small" onClick={() => navigate('/employees')}>
                <ArrowForward />
              </IconButton>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Department</TableCell>
                    <TableCell align="right">Employees</TableCell>
                    <TableCell align="right">Monthly Budget</TableCell>
                    <TableCell align="right">Utilization</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {departmentOverview.map((dept) => (
                    <TableRow key={dept.name}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Work color="action" />
                          <Typography variant="body2" fontWeight={600}>{dept.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{dept.employees}</TableCell>
                      <TableCell align="right">KES {dept.budget.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={dept.utilization}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                          />
                          <Typography variant="body2">{dept.utilization}%</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Recent Activity</Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {recentActivities.map((activity) => (
                <Box
                  key={activity.id}
                  display="flex"
                  gap={2}
                  p={2}
                  sx={{
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {activity.type === 'employee' && <People />}
                    {activity.type === 'leave' && <EventAvailable />}
                    {activity.type === 'payroll' && <AttachMoney />}
                    {activity.type === 'performance' && <Assessment />}
                  </Box>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={600}>
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.name}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Payroll Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>This Month's Payroll</Typography>
              <IconButton size="small" onClick={() => navigate('/security')}>
                <ArrowForward />
              </IconButton>
            </Box>
            {payrollSummary ? (
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between" p={2} sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="body2">Gross Pay</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    KES {parseFloat(payrollSummary.total_gross_pay || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" p={2} sx={{ bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="body2">Total Deductions</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    KES {parseFloat(payrollSummary.total_deductions || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" p={2} sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
                  <Typography variant="body1" fontWeight={600}>Net Pay</Typography>
                  <Typography variant="body1" fontWeight={700}>
                    KES {parseFloat(payrollSummary.total_net_pay || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="body2" color="text.secondary">
                  No payroll data for this month
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Quick Actions</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
                    transition: 'all 0.3s'
                  }}
                  onClick={() => navigate('/employees/new')}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <People sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body2" fontWeight={600}>Add Employee</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
                    transition: 'all 0.3s'
                  }}
                  onClick={() => navigate('/security')}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AttachMoney sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body2" fontWeight={600}>Process Payroll</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
                    transition: 'all 0.3s'
                  }}
                  onClick={() => navigate('/leave')}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <EventAvailable sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body2" fontWeight={600}>Manage Leave</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
                    transition: 'all 0.3s'
                  }}
                  onClick={() => navigate('/reports')}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Assessment sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body2" fontWeight={600}>View Reports</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
