import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import { employeeService } from '../services/employeeService';
import { primaryButtonStyle } from '../styles/buttonStyles';

export default function ESSHome() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  // Fetch logged-in employee's info
  const { data, isLoading } = useQuery('me', employeeService.getMyProfile, {
    onSuccess: (res) => setEmployee(res.record),
  });

  if (isLoading || !employee) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Welcome, {employee.first_name}!
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Profile Summary
              </Typography>
              <Typography>Full Name: {employee.full_name}</Typography>
              <Typography>Employee #: {employee.employee_number}</Typography>
              <Typography>Department: {employee.department_name}</Typography>
              <Typography>Position: {employee.position_title}</Typography>
              <Typography>Status: {employee.employment_status}</Typography>

              <Button
                variant="contained"
                sx={{ mt: 2, ...primaryButtonStyle }}
                onClick={() => navigate('/ess/profile')}
              >
                View Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Leave & Payroll Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Quick Actions
              </Typography>

              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                onClick={() => navigate('/ess/leave')}
              >
                View Leave
              </Button>

              <Button
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                onClick={() => navigate('/ess/payroll')}
              >
                Payroll Information
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/ess/documents')}
              >
                Upload Documents
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
