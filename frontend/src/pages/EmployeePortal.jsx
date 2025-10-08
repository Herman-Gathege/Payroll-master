import { Box, Typography, Grid, Paper } from '@mui/material'

export default function EmployeePortal() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Employee Self-Service Portal</Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">My Profile</Typography>
            <Typography variant="body2">View and update personal information</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Leave Requests</Typography>
            <Typography variant="body2">Apply for leave and view balance</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Payslips</Typography>
            <Typography variant="body2">Download payslips</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Attendance</Typography>
            <Typography variant="body2">View attendance records</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
