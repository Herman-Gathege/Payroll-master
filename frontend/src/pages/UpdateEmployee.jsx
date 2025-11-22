import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Divider,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { employeeService } from '../services/employeeService';
import { primaryButtonStyle } from '../styles/buttonStyles';

export default function UpdateEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch employee data by ID
  const { data, isLoading: isFetching } = useQuery(['employee', id], () =>
    employeeService.getEmployeeById(id)
  );

  // Initialize formData when employee data is loaded
  useEffect(() => {
    if (data?.record) {
      setFormData({
        ...data.record,
        // Ensure required fields are present
        employment_type: data.record.employment_type || 'permanent',
        employment_status: data.record.employment_status || 'active',
      });
    }
  }, [data]);

  const updateMutation = useMutation(
    (updatedData) => employeeService.updateEmployee(id, updatedData),
    {
      onSuccess: () => {
        toast.success('Employee updated successfully!');
        navigate('/employees');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update employee');
      },
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const stringFields = ['first_name', 'last_name', 'employee_number', 'national_id'];
    stringFields.forEach((field) => {
      if (!formData[field]) newErrors[field] = 'This field is required';
    });

    // Phone validation
    if (!formData.phone_number) newErrors.phone_number = 'Phone number is required';
    else if (!/^\+?[\d\s-()]+$/.test(formData.phone_number))
      newErrors.phone_number = 'Invalid phone number format';
    else if (formData.phone_number.replace(/\D/g, '').length < 10)
      newErrors.phone_number = 'Phone number must be at least 10 digits';

    // Email validation
    ['personal_email', 'work_email'].forEach((email) => {
      if (formData[email] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[email])) {
        newErrors[email] = 'Invalid email format';
      }
    });

    // Date validation
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    else {
      const dob = new Date(formData.date_of_birth);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 18) newErrors.date_of_birth = 'Employee must be at least 18 years old';
      else if (age > 100) newErrors.date_of_birth = 'Invalid date of birth';
    }

    if (!formData.hire_date) newErrors.hire_date = 'Hire date is required';
    else if (new Date(formData.hire_date) > new Date())
      newErrors.hire_date = 'Hire date cannot be in the future';

    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.employment_type) newErrors.employment_type = 'Employment type is required';

    if (formData.basic_salary && parseFloat(formData.basic_salary) < 0)
      newErrors.basic_salary = 'Salary must be a positive number';

    if (formData.kra_pin && !/^[A-Z]\d{9}[A-Z]$/.test(formData.kra_pin))
      newErrors.kra_pin = 'Invalid KRA PIN format (e.g., A000000000B)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) updateMutation.mutate(formData);
    else toast.error('Please fix the errors in the form');
  };

  const handleCancel = () => navigate('/employees');

  if (isFetching || !formData) return <Typography>Loading employee data...</Typography>;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Update Employee
      </Typography>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}>
            Personal Information
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Middle Name"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="KRA PIN"
                name="kra_pin"
                value={formData.kra_pin}
                onChange={handleChange}
                placeholder="A000000000B"
                error={!!errors.kra_pin}
                helperText={errors.kra_pin}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                error={!!errors.date_of_birth}
                helperText={errors.date_of_birth}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
                error={!!errors.personal_email}
                helperText={errors.personal_email}
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
                error={!!errors.work_email}
                helperText={errors.work_email}
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
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mt: 4, mb: 2 }}>
            Employment Information
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Hire Date"
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
                error={!!errors.hire_date}
                helperText={errors.hire_date}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Basic Salary"
                type="number"
                name="basic_salary"
                value={formData.basic_salary}
                onChange={handleChange}
                placeholder="50000"
                error={!!errors.basic_salary}
                helperText={errors.basic_salary}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
              disabled={updateMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={updateMutation.isLoading}
              sx={primaryButtonStyle}
            >
              {updateMutation.isLoading ? 'Updating...' : 'Update Employee'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
