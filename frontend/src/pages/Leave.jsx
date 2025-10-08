import { useState } from 'react'
import { useQuery } from 'react-query'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material'
import {
  Add,
  Check,
  Close,
  Visibility
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { employeeService } from '../services/employeeService'
import { primaryButtonStyle, inputFieldStyle } from '../styles/buttonStyles'

const leaveTypes = [
  { value: 'annual', label: 'Annual Leave', days: 21 },
  { value: 'sick', label: 'Sick Leave', days: 14 },
  { value: 'maternity', label: 'Maternity Leave', days: 90 },
  { value: 'paternity', label: 'Paternity Leave', days: 14 },
  { value: 'unpaid', label: 'Unpaid Leave', days: 0 }
]

export default function Leave() {
  const [openDialog, setOpenDialog] = useState(false)
  const [leaveApplications, setLeaveApplications] = useState(() => {
    const saved = localStorage.getItem('leaveApplications')
    return saved ? JSON.parse(saved) : []
  })
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    reason: '',
    status: 'pending'
  })

  const { data: employeesData } = useQuery('employees', employeeService.getAllEmployees)
  const employees = employeesData?.records || []

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    if (!formData.employee_id || !formData.start_date || !formData.end_date || !formData.reason) {
      toast.error('Please fill in all required fields')
      return
    }

    const employee = employees.find(e => e.id === parseInt(formData.employee_id))
    const startDate = new Date(formData.start_date)
    const endDate = new Date(formData.end_date)
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1

    const newApplication = {
      id: leaveApplications.length + 1,
      ...formData,
      employee_name: employee?.full_name || 'Unknown',
      employee_number: employee?.employee_number || 'N/A',
      days,
      applied_date: new Date().toISOString(),
      status: 'pending'
    }

    const updated = [...leaveApplications, newApplication]
    setLeaveApplications(updated)
    localStorage.setItem('leaveApplications', JSON.stringify(updated))

    toast.success('Leave application submitted successfully!')
    setOpenDialog(false)
    setFormData({
      employee_id: '',
      leave_type: 'annual',
      start_date: '',
      end_date: '',
      reason: '',
      status: 'pending'
    })
  }

  const handleApprove = (id) => {
    const updated = leaveApplications.map(app =>
      app.id === id ? { ...app, status: 'approved' } : app
    )
    setLeaveApplications(updated)
    localStorage.setItem('leaveApplications', JSON.stringify(updated))
    toast.success('Leave application approved!')
  }

  const handleReject = (id) => {
    const updated = leaveApplications.map(app =>
      app.id === id ? { ...app, status: 'rejected' } : app
    )
    setLeaveApplications(updated)
    localStorage.setItem('leaveApplications', JSON.stringify(updated))
    toast.success('Leave application rejected!')
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error'
    }
    return colors[status] || 'default'
  }

  const calculateLeaveBalance = (employeeId) => {
    const empLeaves = leaveApplications.filter(
      app => app.employee_id === employeeId && app.status === 'approved'
    )

    const balances = leaveTypes.reduce((acc, type) => {
      const used = empLeaves
        .filter(app => app.leave_type === type.value)
        .reduce((sum, app) => sum + app.days, 0)
      acc[type.value] = { total: type.days, used, remaining: type.days - used }
      return acc
    }, {})

    return balances
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Leave Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
          sx={primaryButtonStyle}
        >
          Apply for Leave
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Employee #</TableCell>
              <TableCell>Employee Name</TableCell>
              <TableCell>Leave Type</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">No leave applications found</TableCell>
              </TableRow>
            ) : (
              leaveApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.id}</TableCell>
                  <TableCell>{application.employee_number}</TableCell>
                  <TableCell>{application.employee_name}</TableCell>
                  <TableCell>
                    {leaveTypes.find(t => t.value === application.leave_type)?.label}
                  </TableCell>
                  <TableCell>{application.start_date}</TableCell>
                  <TableCell>{application.end_date}</TableCell>
                  <TableCell>{application.days}</TableCell>
                  <TableCell>{application.reason}</TableCell>
                  <TableCell>
                    <Chip
                      label={application.status.toUpperCase()}
                      color={getStatusColor(application.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {application.status === 'pending' && (
                      <>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleApprove(application.id)}
                          title="Approve"
                        >
                          <Check />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleReject(application.id)}
                          title="Reject"
                        >
                          <Close />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Employee"
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleChange}
                  required
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.employee_number} - {emp.full_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Leave Type"
                  name="leave_type"
                  value={formData.leave_type}
                  onChange={handleChange}
                  required
                >
                  {leaveTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label} ({type.days} days)
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={primaryButtonStyle}
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
