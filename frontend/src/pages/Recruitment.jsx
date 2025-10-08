import { useState } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material'
import {
  Add,
  Edit,
  Visibility,
  CheckCircle,
  Cancel
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { primaryButtonStyle } from '../styles/buttonStyles'

export default function Recruitment() {
  const [tab, setTab] = useState(0)
  const [openJobDialog, setOpenJobDialog] = useState(false)
  const [openApplicantDialog, setOpenApplicantDialog] = useState(false)

  const [jobPostings, setJobPostings] = useState(() => {
    const saved = localStorage.getItem('jobPostings')
    return saved ? JSON.parse(saved) : []
  })

  const [applicants, setApplicants] = useState(() => {
    const saved = localStorage.getItem('applicants')
    return saved ? JSON.parse(saved) : []
  })

  const [jobFormData, setJobFormData] = useState({
    title: '',
    department: '',
    location: '',
    employment_type: 'full_time',
    salary_range: '',
    description: '',
    requirements: '',
    deadline: '',
    status: 'open'
  })

  const [applicantFormData, setApplicantFormData] = useState({
    job_id: '',
    full_name: '',
    email: '',
    phone: '',
    experience_years: '',
    education: '',
    resume_link: '',
    status: 'pending'
  })

  const handleJobChange = (e) => {
    const { name, value } = e.target
    setJobFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleApplicantChange = (e) => {
    const { name, value } = e.target
    setApplicantFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleJobSubmit = () => {
    if (!jobFormData.title || !jobFormData.department || !jobFormData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    const newJob = {
      id: jobPostings.length + 1,
      ...jobFormData,
      posted_date: new Date().toISOString().split('T')[0],
      applicants_count: 0
    }

    const updated = [...jobPostings, newJob]
    setJobPostings(updated)
    localStorage.setItem('jobPostings', JSON.stringify(updated))

    toast.success('Job posting created successfully!')
    setOpenJobDialog(false)
    setJobFormData({
      title: '',
      department: '',
      location: '',
      employment_type: 'full_time',
      salary_range: '',
      description: '',
      requirements: '',
      deadline: '',
      status: 'open'
    })
  }

  const handleApplicantSubmit = () => {
    if (!applicantFormData.job_id || !applicantFormData.full_name || !applicantFormData.email) {
      toast.error('Please fill in all required fields')
      return
    }

    const job = jobPostings.find(j => j.id === parseInt(applicantFormData.job_id))

    const newApplicant = {
      id: applicants.length + 1,
      ...applicantFormData,
      job_title: job?.title || 'Unknown',
      applied_date: new Date().toISOString().split('T')[0]
    }

    const updated = [...applicants, newApplicant]
    setApplicants(updated)
    localStorage.setItem('applicants', JSON.stringify(updated))

    // Update job applicants count
    const updatedJobs = jobPostings.map(j =>
      j.id === parseInt(applicantFormData.job_id)
        ? { ...j, applicants_count: (j.applicants_count || 0) + 1 }
        : j
    )
    setJobPostings(updatedJobs)
    localStorage.setItem('jobPostings', JSON.stringify(updatedJobs))

    toast.success('Applicant added successfully!')
    setOpenApplicantDialog(false)
    setApplicantFormData({
      job_id: '',
      full_name: '',
      email: '',
      phone: '',
      experience_years: '',
      education: '',
      resume_link: '',
      status: 'pending'
    })
  }

  const handleApproveApplicant = (id) => {
    const updated = applicants.map(app =>
      app.id === id ? { ...app, status: 'shortlisted' } : app
    )
    setApplicants(updated)
    localStorage.setItem('applicants', JSON.stringify(updated))
    toast.success('Applicant shortlisted!')
  }

  const handleRejectApplicant = (id) => {
    const updated = applicants.map(app =>
      app.id === id ? { ...app, status: 'rejected' } : app
    )
    setApplicants(updated)
    localStorage.setItem('applicants', JSON.stringify(updated))
    toast.success('Applicant rejected!')
  }

  const getStatusColor = (status) => {
    const colors = {
      open: 'success',
      closed: 'error',
      pending: 'warning',
      shortlisted: 'info',
      rejected: 'error',
      hired: 'success'
    }
    return colors[status] || 'default'
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Recruitment Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => tab === 0 ? setOpenJobDialog(true) : setOpenApplicantDialog(true)}
          sx={primaryButtonStyle}
        >
          {tab === 0 ? 'Post Job' : 'Add Applicant'}
        </Button>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Job Postings" />
        <Tab label="Applicants" />
        <Tab label="Interviews" />
      </Tabs>

      {tab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Job Title</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Salary Range</TableCell>
                <TableCell>Posted Date</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Applicants</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobPostings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">No job postings found</TableCell>
                </TableRow>
              ) : (
                jobPostings.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{job.id}</TableCell>
                    <TableCell>{job.title}</TableCell>
                    <TableCell>{job.department}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>{job.employment_type}</TableCell>
                    <TableCell>{job.salary_range}</TableCell>
                    <TableCell>{job.posted_date}</TableCell>
                    <TableCell>{job.deadline}</TableCell>
                    <TableCell>{job.applicants_count || 0}</TableCell>
                    <TableCell>
                      <Chip
                        label={job.status.toUpperCase()}
                        color={getStatusColor(job.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" title="View Details">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" title="Edit">
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Job Applied</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Education</TableCell>
                <TableCell>Applied Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applicants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">No applicants found</TableCell>
                </TableRow>
              ) : (
                applicants.map((applicant) => (
                  <TableRow key={applicant.id}>
                    <TableCell>{applicant.id}</TableCell>
                    <TableCell>{applicant.full_name}</TableCell>
                    <TableCell>{applicant.email}</TableCell>
                    <TableCell>{applicant.phone}</TableCell>
                    <TableCell>{applicant.job_title}</TableCell>
                    <TableCell>{applicant.experience_years} years</TableCell>
                    <TableCell>{applicant.education}</TableCell>
                    <TableCell>{applicant.applied_date}</TableCell>
                    <TableCell>
                      <Chip
                        label={applicant.status.toUpperCase()}
                        color={getStatusColor(applicant.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {applicant.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApproveApplicant(applicant.id)}
                            title="Shortlist"
                          >
                            <CheckCircle />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRejectApplicant(applicant.id)}
                            title="Reject"
                          >
                            <Cancel />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 2 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Interview Scheduling Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This feature will allow you to schedule and manage interviews with shortlisted candidates.
          </Typography>
        </Paper>
      )}

      {/* Job Posting Dialog */}
      <Dialog open={openJobDialog} onClose={() => setOpenJobDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Post New Job</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Job Title"
                  name="title"
                  value={jobFormData.title}
                  onChange={handleJobChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={jobFormData.department}
                  onChange={handleJobChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={jobFormData.location}
                  onChange={handleJobChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Employment Type"
                  name="employment_type"
                  value={jobFormData.employment_type}
                  onChange={handleJobChange}
                  required
                >
                  <MenuItem value="full_time">Full Time</MenuItem>
                  <MenuItem value="part_time">Part Time</MenuItem>
                  <MenuItem value="contract">Contract</MenuItem>
                  <MenuItem value="intern">Internship</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salary Range"
                  name="salary_range"
                  value={jobFormData.salary_range}
                  onChange={handleJobChange}
                  placeholder="e.g. KES 50,000 - 80,000"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Application Deadline"
                  name="deadline"
                  type="date"
                  value={jobFormData.deadline}
                  onChange={handleJobChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Job Description"
                  name="description"
                  value={jobFormData.description}
                  onChange={handleJobChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Requirements"
                  name="requirements"
                  value={jobFormData.requirements}
                  onChange={handleJobChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJobDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleJobSubmit}
            sx={primaryButtonStyle}
          >
            Post Job
          </Button>
        </DialogActions>
      </Dialog>

      {/* Applicant Dialog */}
      <Dialog open={openApplicantDialog} onClose={() => setOpenApplicantDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Applicant</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Job Position"
                  name="job_id"
                  value={applicantFormData.job_id}
                  onChange={handleApplicantChange}
                  required
                >
                  {jobPostings.map((job) => (
                    <MenuItem key={job.id} value={job.id}>
                      {job.title} - {job.department}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={applicantFormData.full_name}
                  onChange={handleApplicantChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={applicantFormData.email}
                  onChange={handleApplicantChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={applicantFormData.phone}
                  onChange={handleApplicantChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Years of Experience"
                  name="experience_years"
                  type="number"
                  value={applicantFormData.experience_years}
                  onChange={handleApplicantChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Education Level"
                  name="education"
                  value={applicantFormData.education}
                  onChange={handleApplicantChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Resume/CV Link"
                  name="resume_link"
                  value={applicantFormData.resume_link}
                  onChange={handleApplicantChange}
                  placeholder="https://..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApplicantDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleApplicantSubmit}
            sx={primaryButtonStyle}
          >
            Add Applicant
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
