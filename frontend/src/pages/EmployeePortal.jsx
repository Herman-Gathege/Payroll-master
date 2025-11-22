import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  AppBar,
  Toolbar
} from '@mui/material'
import {
  Person,
  Email,
  Phone,
  Work,
  CalendarToday,
  AccountBalance,
  Download,
  Add,
  EventAvailable,
  AccessTime,
  RequestQuote,
  Edit,
  Logout,
  Menu as MenuIcon
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { employeeService } from '../services/employeeService'
import payrollService from '../services/payrollService'
import leaveService from '../services/leaveService'
import { useAuth } from '../contexts/AuthContext'
import { primaryButtonStyle } from '../styles/buttonStyles'

const drawerWidth = 240
const leaveTypes = ['Annual Leave', 'Sick Leave', 'Maternity Leave', 'Paternity Leave']

export default function EmployeePortal() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { logout, user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [leaveRequest, setLeaveRequest] = useState({ leaveType: '', startDate: '', endDate: '', reason: '' })

  // Fetch employee profile
  const { data: employeeData, isLoading: loadingEmployee } = useQuery(
    'myProfile',
    employeeService.getMyProfile,
    {
      onError: (err) => toast.error('Failed to load profile')
    }
  )

  const employee = employeeData?.data || employeeData?.employee || employeeData

  // Payroll data
  const { data: payrollData } = useQuery(
    ['employeePayroll', employee?.id],
    () => employee ? payrollService.getEmployeePayroll(employee.id) : null,
    { enabled: !!employee?.id }
  )

  const payslips = payrollData?.records || []

  // Leave requests
  const { data: leaveRequestsData } = useQuery(
    ['leaveRequests', employee?.id],
    () => employee ? leaveService.getLeaveRequestsByEmployee(employee.id) : null,
    { enabled: !!employee?.id }
  )
  const leaveRequests = leaveRequestsData?.records || []

  // Leave balance
  const { data: leaveBalanceData } = useQuery(
    ['leaveBalance', employee?.id],
    () => employee ? leaveService.getLeaveBalance(employee.id) : null,
    { enabled: !!employee?.id }
  )
  const leaveBalance = leaveBalanceData?.balance || {
    annual: { total: 21, used: 0, remaining: 21 },
    sick: { total: 14, used: 0, remaining: 14 },
    maternity: { total: 90, used: 0, remaining: 90 }
  }

  // Mock attendance (replace with API later)
  const attendanceRecords = [
    { id: 1, date: '2025-10-14', checkIn: '08:00 AM', checkOut: '05:00 PM', hours: 9, status: 'Present' },
    { id: 2, date: '2025-10-13', checkIn: '08:05 AM', checkOut: '05:10 PM', hours: 9, status: 'Present' },
    { id: 3, date: '2025-10-12', checkIn: '08:00 AM', checkOut: '05:00 PM', hours: 9, status: 'Present' },
    { id: 4, date: '2025-10-11', checkIn: '08:15 AM', checkOut: '05:00 PM', hours: 8.75, status: 'Late' },
    { id: 5, date: '2025-10-10', checkIn: '08:00 AM', checkOut: '05:00 PM', hours: 9, status: 'Present' },
  ]

  // Leave request mutation
  const createLeaveRequestMutation = useMutation(
    leaveService.createLeaveRequest,
    {
      onSuccess: () => {
        toast.success('Leave request submitted')
        queryClient.invalidateQueries(['leaveRequests', employee?.id])
        setLeaveDialogOpen(false)
        setLeaveRequest({ leaveType: '', startDate: '', endDate: '', reason: '' })
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit leave request')
    }
  )

  const handleLeaveRequest = () => {
    if (!leaveRequest.leaveType || !leaveRequest.startDate || !leaveRequest.endDate || !leaveRequest.reason) {
      return toast.error('Please fill all fields')
    }

    if (!employee?.id) return toast.error('Employee info not available')

    const days = Math.ceil((new Date(leaveRequest.endDate) - new Date(leaveRequest.startDate)) / (1000*60*60*24)) + 1
    createLeaveRequestMutation.mutate({
      employee_id: employee.id,
      leave_type: leaveRequest.leaveType,
      start_date: leaveRequest.startDate,
      end_date: leaveRequest.endDate,
      days,
      reason: leaveRequest.reason,
      status: 'pending'
    })
  }

  const handleDownloadPayslip = (payslipId) => {
    toast.info('Downloading payslip...')
    if (!employee) return
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    payrollService.downloadPayslip(employee.id, currentMonth, currentYear)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/employee/login')
  }

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: <Person /> },
    { id: 'payslips', label: 'Payslips', icon: <RequestQuote /> },
    { id: 'leave', label: 'Leave Management', icon: <EventAvailable /> },
    { id: 'attendance', label: 'Attendance', icon: <AccessTime /> },
  ]

  const drawer = (
    <Box>
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Avatar sx={{ width: 60, height: 60, bgcolor: '#11998e', fontSize: 24, mx: 'auto', mb: 1 }}>
          {employee?.first_name?.charAt(0) || 'E'}
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600}>
          {employee?.first_name} {employee?.last_name}
        </Typography>
        <Typography variant="caption" color="text.secondary">Employee Portal</Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton selected={activeTab === item.id} onClick={() => setActiveTab(item.id)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 2 }} />
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><Logout /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  if (loadingEmployee) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!employee) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>No employee data available</Typography>
          <Button variant="contained" onClick={handleLogout}>Logout</Button>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile AppBar */}
      <AppBar position="fixed" sx={{ display: { sm: 'none' }, width: '100%' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">Employee Portal</Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(!mobileOpen)}
          ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}>
          {drawer}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }} open>
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: { xs: 7, sm: 0 } }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #11998e 0%, #0d7a6f 100%)', color: 'white' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar sx={{ width: 80, height: 80, bgcolor: 'white', color: '#11998e', fontSize: 32 }}>
                {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>{employee.first_name} {employee.last_name}</Typography>
              <Typography variant="body1">{employee.position_title || 'Position'} • {employee.department_name || 'Department'}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Employee ID: {employee.employee_number || 'N/A'}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs content */}
        {activeTab === 'profile' && <ProfileTab employee={employee} />}
        {activeTab === 'payslips' && <PayslipsTab payslips={payslips} onDownload={handleDownloadPayslip} />}
        {activeTab === 'leave' && <LeaveTab leaveRequests={leaveRequests} leaveBalance={leaveBalance} leaveDialogOpen={leaveDialogOpen} setLeaveDialogOpen={setLeaveDialogOpen} leaveRequest={leaveRequest} setLeaveRequest={setLeaveRequest} handleLeaveRequest={handleLeaveRequest} />}
        {activeTab === 'attendance' && <AttendanceTab attendanceRecords={attendanceRecords} />}
      </Box>
    </Box>
  )
}

// You can further split ProfileTab, PayslipsTab, LeaveTab, AttendanceTab as separate components
