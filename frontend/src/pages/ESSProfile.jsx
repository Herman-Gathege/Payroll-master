import { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { primaryButtonStyle } from '../styles/buttonStyles';
import { employeeService } from '../services/employeeService';

export default function ESSProfile() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  const { data, isLoading } = useQuery('myProfile', employeeService.getMyProfile, {
    onSuccess: (res) => setEmployee(res.record || res.data || res.employee),
    onError: (err) => console.error('Failed to fetch profile:', err),
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No profile data available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please contact HR for assistance.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 4, display: 'flex', alignItems: 'center', gap: 3, background: 'linear-gradient(135deg, #11998e 0%, #0d7a6f 100%)', color: 'white' }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'white', color: '#11998e', fontSize: 32 }}>
          {employee.first_name?.charAt(0) || 'E'}
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {employee.first_name} {employee.last_name}
          </Typography>
          <Typography variant="body1">
            {employee.position_title || 'Position'} • {employee.department_name || 'Department'}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Employee ID: {employee.employee_number || 'N/A'}
          </Typography>
        </Box>
      </Paper>

      {/* Personal Information */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}>
          Personal Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Full Name:</strong> {employee.full_name || `${employee.first_name} ${employee.last_name}`}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>First Name:</strong> {employee.first_name || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Last Name:</strong> {employee.last_name || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Middle Name:</strong> {employee.middle_name || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>National ID:</strong> {employee.national_id || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>KRA PIN:</strong> {employee.kra_pin || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Date of Birth:</strong> {employee.date_of_birth || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Gender:</strong> {employee.gender || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Phone Number:</strong> {employee.phone_number || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Personal Email:</strong> {employee.personal_email || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Work Email:</strong> {employee.work_email || '-'}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography><strong>Physical Address:</strong> {employee.physical_address || '-'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Employment Information */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}>
          Employment Information
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Department:</strong> {employee.department_name || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Position:</strong> {employee.position_title || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Employment Type:</strong> {employee.employment_type || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Hire Date:</strong> {employee.hire_date || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Basic Salary:</strong> {employee.basic_salary || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography><strong>Status:</strong> {employee.employment_status || '-'}</Typography>
          </Grid>
        </Grid>

        {/* Edit Profile Button */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            sx={primaryButtonStyle}
            onClick={() => navigate('/ess/edit-profile')}
          >
            Edit Profile
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
