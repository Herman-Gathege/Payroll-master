import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from 'react-query'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Divider,
  Alert
} from '@mui/material'
import { Save, Cancel } from '@mui/icons-material'
import { toast } from 'react-toastify'
import { employeeService } from '../services/employeeService'
import { primaryButtonStyle } from '../styles/buttonStyles'

export default function AddEmployee() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    employee_number: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    national_id: '',
    kra_pin: '',
    date_of_birth: '',
    gender: '',
    phone_number: '',
    personal_email: '',
    work_email: '',
    physical_address: '',
    employment_type: 'permanent',
    hire_date: '',
    department_id: '',
    position_id: '',
    basic_salary: '',
    employment_status: 'active'
  })

  const [errors, setErrors] = useState({})

  const createMutation = useMutation(employeeService.createEmployee, {
    onSuccess: () => {
      toast.success('Employee added successfully!')
      navigate('/employees')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add employee')
    }
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.first_name) newErrors.first_name = 'First name is required'
    if (!formData.last_name) newErrors.last_name = 'Last name is required'
    if (!formData.employee_number) newErrors.employee_number = 'Employee number is required'
    if (!formData.national_id) newErrors.national_id = 'National ID is required'
    if (!formData.phone_number) newErrors.phone_number = 'Phone number is required'
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required'
    if (!formData.gender) newErrors.gender = 'Gender is required'
    if (!formData.hire_date) newErrors.hire_date = 'Hire date is required'
    if (!formData.employment_type) newErrors.employment_type = 'Employment type is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      createMutation.mutate(formData)
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  const handleCancel = () => {
    navigate('/employees')
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Add New Employee</Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
            Personal Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Employee Number"
                name="employee_number"
                value={formData.employee_number}
                onChange={handleChange}
                required
                error={!!errors.employee_number}
                helperText={errors.employee_number}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                error={!!errors.first_name}
                helperText={errors.first_name}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Middle Name"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                error={!!errors.last_name}
                helperText={errors.last_name}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="National ID"
                name="national_id"
                value={formData.national_id}
                onChange={handleChange}
                required
                error={!!errors.national_id}
                helperText={errors.national_id}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="KRA PIN"
                name="kra_pin"
                value={formData.kra_pin}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                error={!!errors.date_of_birth}
                helperText={errors.date_of_birth}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                error={!!errors.gender}
                helperText={errors.gender}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+254712345678"
                required
                error={!!errors.phone_number}
                helperText={errors.phone_number}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Personal Email"
                name="personal_email"
                type="email"
                value={formData.personal_email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Work Email"
                name="work_email"
                type="email"
                value={formData.work_email}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Physical Address"
                name="physical_address"
                value={formData.physical_address}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>

          {/* Employment Information */}
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mt: 4 }}>
            Employment Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Employment Type"
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                required
                error={!!errors.employment_type}
                helperText={errors.employment_type}
              >
                <MenuItem value="permanent">Permanent</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
                <MenuItem value="temporary">Temporary</MenuItem>
                <MenuItem value="intern">Intern</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Hire Date"
                name="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                error={!!errors.hire_date}
                helperText={errors.hire_date}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Basic Salary"
                name="basic_salary"
                type="number"
                value={formData.basic_salary}
                onChange={handleChange}
                placeholder="50000"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                select
                label="Employment Status"
                name="employment_status"
                value={formData.employment_status}
                onChange={handleChange}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="on_leave">On Leave</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="terminated">Terminated</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              disabled={createMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={createMutation.isLoading}
              sx={primaryButtonStyle}
            >
              {createMutation.isLoading ? 'Saving...' : 'Save Employee'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  )
}
