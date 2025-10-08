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
  DialogActions
} from '@mui/material'
import {
  Add,
  AccessTime,
  CheckCircle,
  Cancel
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { employeeService } from '../services/employeeService'
import { primaryButtonStyle } from '../styles/buttonStyles'

export default function Attendance() {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const saved = localStorage.getItem('attendanceRecords')
    return saved ? JSON.parse(saved) : []
  })
  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    clock_in: '',
    clock_out: '',
    overtime_hours: 0,
    status: 'present'
  })

  const { data: employeesData } = useQuery('employees', employeeService.getAllEmployees)
  const employees = employeesData?.records || []

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const calculateHours = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return 0
    const start = new Date(`2000-01-01 ${clockIn}`)
    const end = new Date(`2000-01-01 ${clockOut}`)
    const diff = (end - start) / (1000 * 60 * 60)
    return Math.max(0, diff.toFixed(2))
  }

  const handleSubmit = () => {
    if (!formData.employee_id || !formData.date || !formData.clock_in) {
      toast.error('Please fill in all required fields')
      return
    }

    const employee = employees.find(e => e.id === parseInt(formData.employee_id))
    const hours = calculateHours(formData.clock_in, formData.clock_out)
    const regularHours = Math.min(hours, 8)
    const overtimeHours = Math.max(0, hours - 8)

    const newRecord = {
      id: attendanceRecords.length + 1,
      ...formData,
      employee_name: employee?.full_name || 'Unknown',
      employee_number: employee?.employee_number || 'N/A',
      hours_worked: hours,
      regular_hours: regularHours,
      overtime_hours: overtimeHours
    }

    const updated = [...attendanceRecords, newRecord]
    setAttendanceRecords(updated)
    localStorage.setItem('attendanceRecords', JSON.stringify(updated))

    toast.success('Attendance recorded successfully!')
    setOpenDialog(false)
    setFormData({
      employee_id: '',
      date: new Date().toISOString().split('T')[0],
      clock_in: '',
      clock_out: '',
      overtime_hours: 0,
      status: 'present'
    })
  }

  const handleClockIn = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId)
    const now = new Date()
    const time = now.toTimeString().split(' ')[0].substring(0, 5)

    const newRecord = {
      id: attendanceRecords.length + 1,
      employee_id: employeeId,
      employee_name: employee?.full_name || 'Unknown',
      employee_number: employee?.employee_number || 'N/A',
      date: new Date().toISOString().split('T')[0],
      clock_in: time,
      clock_out: '',
      status: 'present',
      hours_worked: 0,
      regular_hours: 0,
      overtime_hours: 0
    }

    const updated = [...attendanceRecords, newRecord]
    setAttendanceRecords(updated)
    localStorage.setItem('attendanceRecords', JSON.stringify(updated))
    toast.success(`Clock in recorded for ${employee?.full_name} at ${time}`)
  }

  const handleClockOut = (recordId) => {
    const now = new Date()
    const time = now.toTimeString().split(' ')[0].substring(0, 5)

    const updated = attendanceRecords.map(record => {
      if (record.id === recordId) {
        const hours = calculateHours(record.clock_in, time)
        const regularHours = Math.min(hours, 8)
        const overtimeHours = Math.max(0, hours - 8)

        return {
          ...record,
          clock_out: time,
          hours_worked: hours,
          regular_hours: regularHours,
          overtime_hours: overtimeHours
        }
      }
      return record
    })

    setAttendanceRecords(updated)
    localStorage.setItem('attendanceRecords', JSON.stringify(updated))
    toast.success(`Clock out recorded at ${time}`)
  }

  const getStatusColor = (status) => {
    const colors = {
      present: 'success',
      absent: 'error',
      late: 'warning',
      half_day: 'info'
    }
    return colors[status] || 'default'
  }

  const filteredRecords = attendanceRecords.filter(r => r.date === selectedDate)

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Attendance & Time Tracking</Typography>
        <Box display="flex" gap={2}>
          <TextField
            type="date"
            size="small"
            label="Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 180 }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={primaryButtonStyle}
          >
            Mark Attendance
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Quick Clock In/Out</Typography>
        <Grid container spacing={2}>
          {employees.filter(e => e.employment_status === 'active').slice(0, 6).map((employee) => {
            const todayRecord = attendanceRecords.find(
              r => r.employee_id === employee.id && r.date === new Date().toISOString().split('T')[0]
            )

            return (
              <Grid item xs={12} sm={6} md={4} key={employee.id}>
                <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {employee.employee_number} - {employee.full_name}
                  </Typography>
                  {!todayRecord && (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="success"
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={() => handleClockIn(employee.id)}
                    >
                      Clock In
                    </Button>
                  )}
                  {todayRecord && !todayRecord.clock_out && (
                    <>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Clocked in at {todayRecord.clock_in}
                      </Typography>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Cancel />}
                        onClick={() => handleClockOut(todayRecord.id)}
                        sx={{ mt: 1 }}
                      >
                        Clock Out
                      </Button>
                    </>
                  )}
                  {todayRecord && todayRecord.clock_out && (
                    <Typography variant="caption" color="success.main">
                      Completed: {todayRecord.clock_in} - {todayRecord.clock_out}
                      ({todayRecord.hours_worked}h)
                    </Typography>
                  )}
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee #</TableCell>
              <TableCell>Employee Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Clock In</TableCell>
              <TableCell>Clock Out</TableCell>
              <TableCell>Hours Worked</TableCell>
              <TableCell>Regular Hours</TableCell>
              <TableCell>Overtime Hours</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No attendance records for {selectedDate}
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.employee_number}</TableCell>
                  <TableCell>{record.employee_name}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.clock_in}</TableCell>
                  <TableCell>{record.clock_out || '-'}</TableCell>
                  <TableCell>{record.hours_worked}h</TableCell>
                  <TableCell>{record.regular_hours}h</TableCell>
                  <TableCell>{record.overtime_hours}h</TableCell>
                  <TableCell>
                    <Chip
                      label={record.status.toUpperCase()}
                      color={getStatusColor(record.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Attendance</DialogTitle>
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
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Clock In"
                  name="clock_in"
                  type="time"
                  value={formData.clock_in}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Clock Out"
                  name="clock_out"
                  type="time"
                  value={formData.clock_out}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                  <MenuItem value="half_day">Half Day</MenuItem>
                </TextField>
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
            Save Attendance
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
