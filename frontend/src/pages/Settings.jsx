import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Save
} from '@mui/icons-material'
import { primaryButtonStyle } from '../styles/buttonStyles'
import { toast } from 'react-toastify'

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '14px',
  },
  '& .MuiOutlinedInput-input': {
    padding: '8px 12px',
  },
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogType, setDialogType] = useState('')

  const [companyInfo, setCompanyInfo] = useState({
    name: 'Evolve',
    address: 'Nairobi, Kenya',
    phone: '+254 700 000000',
    email: 'info@evolve.com',
    pin: 'P000000000A',
    nssfNumber: 'NSSF1234567',
    shifNumber: 'SHIF7654321'
  })

  const [departments, setDepartments] = useState([
    { id: 1, name: 'Human Resources', code: 'HR', manager: 'John Doe' },
    { id: 2, name: 'Finance', code: 'FIN', manager: 'Jane Smith' },
    { id: 3, name: 'IT', code: 'IT', manager: 'Bob Johnson' },
  ])

  const [positions, setPositions] = useState([
    { id: 1, title: 'HR Manager', department: 'Human Resources', level: 'Management' },
    { id: 2, title: 'Accountant', department: 'Finance', level: 'Professional' },
    { id: 3, title: 'Software Developer', department: 'IT', level: 'Professional' },
  ])

  const [leaveTypes, setLeaveTypes] = useState([
    { id: 1, name: 'Annual Leave', days: 21, carryOver: true },
    { id: 2, name: 'Sick Leave', days: 14, carryOver: false },
    { id: 3, name: 'Maternity Leave', days: 90, carryOver: false },
    { id: 4, name: 'Paternity Leave', days: 14, carryOver: false },
  ])

  const [payrollConfig, setPayrollConfig] = useState(() => {
    const saved = localStorage.getItem('payrollConfig')
    return saved ? JSON.parse(saved) : {
      personalRelief: 2400,
      nssfRate: 6,
      nssfEmployerRate: 6,
      nssfUpperLimit: 36000,
      shifRate: 2.75,
      housingLevyRate: 1.5,
      overtimeRate: 150,
      workingHoursPerMonth: 160,
      workingDaysPerMonth: 22
    }
  })

  const handleSaveCompanyInfo = () => {
    localStorage.setItem('companyInfo', JSON.stringify(companyInfo))
    toast.success('Company information saved!')
  }

  const handleOpenDialog = (type) => {
    setDialogType(type)
    setOpenDialog(true)
  }

  const handleAddItem = () => {
    toast.success(`${dialogType} added successfully!`)
    setOpenDialog(false)
  }

  const handleSavePayrollConfig = () => {
    localStorage.setItem('payrollConfig', JSON.stringify(payrollConfig))
    toast.success('Payroll configuration saved successfully!')
  }

  const handleConfigChange = (field, value) => {
    setPayrollConfig(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>System Settings</Typography>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Company Details" />
        <Tab label="Departments" />
        <Tab label="Positions" />
        <Tab label="Leave Types" />
        <Tab label="Payroll Configuration" />
      </Tabs>

      {activeTab === 0 && (
        <Paper sx={{ p: 4, borderRadius: '12px' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Company Information
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="PIN Number"
                value={companyInfo.pin}
                onChange={(e) => setCompanyInfo({ ...companyInfo, pin: e.target.value })}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={companyInfo.phone}
                onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={companyInfo.email}
                onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="NSSF Number"
                value={companyInfo.nssfNumber}
                onChange={(e) => setCompanyInfo({ ...companyInfo, nssfNumber: e.target.value })}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SHIF Number"
                value={companyInfo.shifNumber}
                onChange={(e) => setCompanyInfo({ ...companyInfo, shifNumber: e.target.value })}
                sx={inputStyles}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveCompanyInfo}
              sx={{
                bgcolor: '#1976d2',
                borderRadius: '6px',
                padding: '6px 20px',
                fontSize: '13px',
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Save Changes
            </Button>
          </Box>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3, borderRadius: '12px' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Departments</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => handleOpenDialog('Department')}
              sx={{
                bgcolor: '#1976d2',
                borderRadius: '6px',
                padding: '6px 16px',
                fontSize: '13px',
                textTransform: 'none',
              }}
            >
              Add Department
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Manager</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>{dept.code}</TableCell>
                    <TableCell>{dept.manager}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3, borderRadius: '12px' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Positions</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => handleOpenDialog('Position')}
              sx={{
                bgcolor: '#1976d2',
                borderRadius: '6px',
                padding: '6px 16px',
                fontSize: '13px',
                textTransform: 'none',
              }}
            >
              Add Position
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {positions.map((pos) => (
                  <TableRow key={pos.id}>
                    <TableCell>{pos.title}</TableCell>
                    <TableCell>{pos.department}</TableCell>
                    <TableCell>{pos.level}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 3 && (
        <Paper sx={{ p: 3, borderRadius: '12px' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Leave Types</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              onClick={() => handleOpenDialog('Leave Type')}
              sx={{
                bgcolor: '#1976d2',
                borderRadius: '6px',
                padding: '6px 16px',
                fontSize: '13px',
                textTransform: 'none',
              }}
            >
              Add Leave Type
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Days Allowed</TableCell>
                  <TableCell>Carry Over</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveTypes.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{leave.name}</TableCell>
                    <TableCell>{leave.days}</TableCell>
                    <TableCell>{leave.carryOver ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary">
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {activeTab === 4 && (
        <Paper sx={{ p: 4, borderRadius: '12px' }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
            Tax & Statutory Deductions
          </Typography>
          <Box sx={{ borderBottom: '2px solid', borderColor: 'divider', mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Personal Relief (Monthly)"
                type="number"
                value={payrollConfig.personalRelief}
                onChange={(e) => handleConfigChange('personalRelief', parseFloat(e.target.value))}
                InputProps={{ startAdornment: 'KES ' }}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="NSSF Rate (%)"
                type="number"
                value={payrollConfig.nssfRate}
                onChange={(e) => handleConfigChange('nssfRate', parseFloat(e.target.value))}
                InputProps={{ endAdornment: '%' }}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="NSSF Upper Limit"
                type="number"
                value={payrollConfig.nssfUpperLimit}
                onChange={(e) => handleConfigChange('nssfUpperLimit', parseFloat(e.target.value))}
                InputProps={{ startAdornment: 'KES ' }}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="SHIF Rate (%)"
                type="number"
                value={payrollConfig.shifRate}
                onChange={(e) => handleConfigChange('shifRate', parseFloat(e.target.value))}
                InputProps={{ endAdornment: '%' }}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Housing Levy Rate (%)"
                type="number"
                value={payrollConfig.housingLevyRate}
                onChange={(e) => handleConfigChange('housingLevyRate', parseFloat(e.target.value))}
                InputProps={{ endAdornment: '%' }}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Overtime Rate (%)"
                type="number"
                value={payrollConfig.overtimeRate}
                onChange={(e) => handleConfigChange('overtimeRate', parseFloat(e.target.value))}
                InputProps={{ endAdornment: '%' }}
                sx={inputStyles}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mt: 4 }}>
            Working Hours
          </Typography>
          <Box sx={{ borderBottom: '2px solid', borderColor: 'divider', mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Working Hours Per Month"
                type="number"
                value={payrollConfig.workingHoursPerMonth}
                onChange={(e) => handleConfigChange('workingHoursPerMonth', parseInt(e.target.value))}
                sx={inputStyles}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Working Days Per Month"
                type="number"
                value={payrollConfig.workingDaysPerMonth}
                onChange={(e) => handleConfigChange('workingDaysPerMonth', parseInt(e.target.value))}
                sx={inputStyles}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSavePayrollConfig}
              sx={primaryButtonStyle}
            >
              Save Configuration
            </Button>
          </Box>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add {dialogType}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              sx={{ ...inputStyles, mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              sx={inputStyles}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddItem}
            sx={{
              bgcolor: '#1976d2',
              borderRadius: '6px',
              fontSize: '13px',
              textTransform: 'none',
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
