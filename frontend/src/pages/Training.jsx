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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  LinearProgress
} from '@mui/material'
import {
  Add,
  Edit,
  Download,
  School,
  TrendingUp
} from '@mui/icons-material'
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

export default function Training() {
  const [activeTab, setActiveTab] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)

  const [trainingPrograms, setTrainingPrograms] = useState([
    { id: 1, title: 'Leadership Development', category: 'Management', duration: '3 months', participants: 12, status: 'ongoing' },
    { id: 2, title: 'Technical Skills Workshop', category: 'Technical', duration: '1 month', participants: 25, status: 'completed' },
    { id: 3, title: 'Customer Service Excellence', category: 'Soft Skills', duration: '2 weeks', participants: 30, status: 'upcoming' },
  ])

  const [certificates, setCertificates] = useState([
    { id: 1, employee: 'John Doe', course: 'Project Management', issueDate: '2025-01-15', expiryDate: '2027-01-15' },
    { id: 2, employee: 'Jane Smith', course: 'Safety Training', issueDate: '2025-02-20', expiryDate: '2026-02-20' },
    { id: 3, employee: 'Bob Johnson', course: 'Advanced Excel', issueDate: '2025-03-10', expiryDate: '2027-03-10' },
  ])

  const nitaLevy = {
    totalContribution: 500000,
    utilized: 320000,
    remaining: 180000,
    utilizationRate: 64
  }

  const handleAddProgram = () => {
    toast.success('Training program added successfully!')
    setOpenDialog(false)
  }

  const getStatusColor = (status) => {
    const colors = {
      ongoing: 'info',
      completed: 'success',
      upcoming: 'warning'
    }
    return colors[status] || 'default'
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>Learning & Development</Typography>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Training Programs" />
        <Tab label="NITA Levy" />
        <Tab label="Certificates" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Paper sx={{ p: 3, borderRadius: '12px', mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Training Programs</Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
                sx={{
                  bgcolor: '#1976d2',
                  borderRadius: '6px',
                  padding: '6px 16px',
                  fontSize: '13px',
                  textTransform: 'none',
                }}
              >
                Add Program
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Program Title</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Participants</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trainingPrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>{program.title}</TableCell>
                      <TableCell>{program.category}</TableCell>
                      <TableCell>{program.duration}</TableCell>
                      <TableCell>{program.participants}</TableCell>
                      <TableCell>
                        <Chip
                          label={program.status.toUpperCase()}
                          color={getStatusColor(program.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary">
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="primary">
                          <Download fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 4, borderRadius: '12px' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  NITA Levy Utilization
                </Typography>
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Total Contribution</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2', mt: 1 }}>
                        KES {nitaLevy.totalContribution.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Utilized</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32', mt: 1 }}>
                        KES {nitaLevy.utilized.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Remaining</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#ed6c02', mt: 1 }}>
                        KES {nitaLevy.remaining.toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Utilization Rate: {nitaLevy.utilizationRate}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={nitaLevy.utilizationRate}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, borderRadius: '12px', textAlign: 'center', bgcolor: '#f5f5f5' }}>
                <TrendingUp sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Maximize Your NITA Levy
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Plan training programs to utilize your NITA levy effectively and develop your workforce.
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    mt: 3,
                    borderRadius: '6px',
                    fontSize: '13px',
                    textTransform: 'none',
                    borderColor: '#1976d2',
                    color: '#1976d2',
                  }}
                >
                  View Guidelines
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3, borderRadius: '12px' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Employee Certificates</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<Add />}
              sx={{
                bgcolor: '#1976d2',
                borderRadius: '6px',
                padding: '6px 16px',
                fontSize: '13px',
                textTransform: 'none',
              }}
            >
              Add Certificate
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Course/Certification</TableCell>
                  <TableCell>Issue Date</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell>{cert.employee}</TableCell>
                    <TableCell>{cert.course}</TableCell>
                    <TableCell>{cert.issueDate}</TableCell>
                    <TableCell>{cert.expiryDate}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary">
                        <Download fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Training Program</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Program Title"
                  sx={inputStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  sx={inputStyles}
                >
                  <MenuItem value="management">Management</MenuItem>
                  <MenuItem value="technical">Technical</MenuItem>
                  <MenuItem value="soft-skills">Soft Skills</MenuItem>
                  <MenuItem value="compliance">Compliance</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration"
                  sx={inputStyles}
                  placeholder="e.g. 3 months"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  sx={inputStyles}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddProgram}
            sx={{
              bgcolor: '#1976d2',
              borderRadius: '6px',
              fontSize: '13px',
              textTransform: 'none',
            }}
          >
            Add Program
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
