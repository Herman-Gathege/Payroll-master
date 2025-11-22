import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Divider,
  Button,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { employeeService } from '../services/employeeService';
import { primaryButtonStyle } from '../styles/buttonStyles';

export default function ESSEditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch logged-in employee’s profile
  const { isLoading } = useQuery('me', employeeService.getMyProfile, {
    onSuccess: (res) => {
      setFormData({
        phone: res.record.phone_number || '',
        personal_email: res.record.personal_email || '',
        physical_address: res.record.physical_address || '',
        date_of_birth: res.record.date_of_birth || '',
        gender: res.record.gender || '',
        emergency_contact_name: res.record.emergency_contact_name || '',
        emergency_contact_phone: res.record.emergency_contact_phone || '',

        // Read-only fields (display only)
        full_name: res.record.full_name,
        department_name: res.record.department_name,
        position_title: res.record.position_title,
        hire_date: res.record.hire_date,
        work_email: res.record.work_email,
      });
    },
  });

  // Update mutation (Employee can update only own limited fields)
  const updateMutation = useMutation(employeeService.updateEmployee, {
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      navigate('/employee/profile');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!/^\+?[\d\s-()]+$/.test(formData.phone))
      newErrors.phone = 'Invalid phone number format';

    if (formData.personal_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personal_email))
      newErrors.personal_email = 'Invalid email format';

    if (!formData.date_of_birth)
      newErrors.date_of_birth = 'Date of birth is required';

    if (!formData.gender)
      newErrors.gender = 'Gender is required';

    if (!formData.emergency_contact_name)
      newErrors.emergency_contact_name = 'Emergency contact name is required';

    if (!formData.emergency_contact_phone)
      newErrors.emergency_contact_phone = 'Emergency contact phone is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please correct the highlighted errors');
      return;
    }

    // Build backend-safe payload
    const payload = {
      phone: formData.phone,
      personal_email: formData.personal_email,
      physical_address: formData.physical_address,
      gender: formData.gender,
      date_of_birth: formData.date_of_birth,
      emergency_contact_name: formData.emergency_contact_name,
      emergency_contact_phone: formData.emergency_contact_phone,
    };

    updateMutation.mutate(payload);
  };

  if (isLoading || !formData) return <Typography>Loading profile...</Typography>;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Edit Profile
      </Typography>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          {/* Editable Personal Info */}
          <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>
            Personal Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Personal Email"
                name="personal_email"
                value={formData.personal_email}
                onChange={handleChange}
                error={!!errors.personal_email}
                helperText={errors.personal_email}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Physical Address"
                name="physical_address"
                value={formData.physical_address}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                InputLabelProps={{ shrink: true }}
                onChange={handleChange}
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
                error={!!errors.gender}
                helperText={errors.gender}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Emergency Contact */}
          <Typography variant="h6" sx={{ color: 'primary.main', mt: 4, mb: 1 }}>
            Emergency Contact
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Name"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                error={!!errors.emergency_contact_name}
                helperText={errors.emergency_contact_name}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Phone"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
                error={!!errors.emergency_contact_phone}
                helperText={errors.emergency_contact_phone}
              />
            </Grid>
          </Grid>

          {/* Read-only Employment Info */}
          <Typography variant="h6" sx={{ color: 'primary.main', mt: 4, mb: 1 }}>
            Employment Information (Read-Only)
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Full Name" value={formData.full_name} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Work Email" value={formData.work_email} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Department" value={formData.department_name} InputProps={{ readOnly: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Position" value={formData.position_title} InputProps={{ readOnly: true }} />
            </Grid>
          </Grid>

          {/* Action buttons */}
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => navigate('/employee/profile')}
              disabled={updateMutation.isLoading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              sx={primaryButtonStyle}
              disabled={updateMutation.isLoading}
            >
              {updateMutation.isLoading ? 'Saving…' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
