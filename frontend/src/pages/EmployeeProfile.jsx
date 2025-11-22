import { useQuery } from 'react-query';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { essService } from '../services/essService'; // Updated path since file moved

export default function ESSProfile() {
  const navigate = useNavigate();

  // Fetch logged-in employee's own ESS profile
  const { data, isLoading, error } = useQuery('ess-profile', () =>
    essService.getProfile()
  );

  const employee = data?.record;

  const getStatusColor = (status) => {
    const statusColors = {
      active: 'success',
      on_leave: 'warning',
      suspended: 'error',
      terminated: 'default',
    };
    return statusColors[status] || 'default';
  };

  if (isLoading) return <Typography>Loading...</Typography>;
  if (error || !employee) return <Typography>Error loading profile</Typography>;

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          My Profile
        </Typography>

        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => navigate('/ess/edit-profile')}
          sx={{
            bgcolor: '#1976d2',
            '&:hover': { bgcolor: '#1565c0' },
          }}
        >
          Edit Profile
        </Button>
      </Box>

      {/* Profile Card */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>

          {/* Profile Image */}
          <Grid item xs={12} sm={12} md={3}>
            <Avatar
              src={employee.profile_photo_url || '/default-user.png'}
              sx={{ width: 120, height: 120, borderRadius: '12px' }}
            />
          </Grid>

          {/* Basic Info */}
          <Grid item xs={12} sm={12} md={9}>
            <Typography variant="h5">
              {employee.first_name} {employee.last_name}
            </Typography>
            <Typography color="text.secondary">{employee.position_title}</Typography>

            <Chip
              label={employee.employment_status}
              color={getStatusColor(employee.employment_status)}
              size="small"
              sx={{ mt: 1 }}
            />
          </Grid>
        </Grid>

        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Email</Typography>
              <Typography>{employee.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Phone</Typography>
              <Typography>{employee.phone}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">National ID</Typography>
              <Typography>{employee.national_id}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Gender</Typography>
              <Typography>{employee.gender}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Date of Birth</Typography>
              <Typography>{employee.dob}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Job Information
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Department</Typography>
              <Typography>{employee.department}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Position</Typography>
              <Typography>{employee.position_title}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Employment Status</Typography>
              <Chip
                label={employee.employment_status}
                color={getStatusColor(employee.employment_status)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Date Joined</Typography>
              <Typography>{employee.date_joined}</Typography>
            </Grid>
          </Grid>
        </Box>

      </Paper>
    </Box>
  );
}
