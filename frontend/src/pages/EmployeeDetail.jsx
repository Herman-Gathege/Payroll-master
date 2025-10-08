import { Box, Typography } from '@mui/material'

export default function EmployeeDetail() {
  return (
    <Box>
      <Typography variant="h4">Employee Details</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Employee detail view with tabs for personal info, employment history, documents, etc.
      </Typography>
    </Box>
  )
}
