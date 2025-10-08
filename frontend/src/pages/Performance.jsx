import { useState } from 'react'
import { useQuery } from 'react-query'
import {
  Box,
  Typography,
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
  Tabs,
  Tab,
  LinearProgress,
  Rating,
  Divider
} from '@mui/material'
import {
  Add,
  Edit,
  Visibility,
  TrendingUp,
  Assessment
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import { employeeService } from '../services/employeeService'
import { primaryButtonStyle } from '../styles/buttonStyles'

export default function Performance() {
  const [activeTab, setActiveTab] = useState(0)
  const [openReviewDialog, setOpenReviewDialog] = useState(false)
  const [openGoalDialog, setOpenGoalDialog] = useState(false)

  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('performanceReviews')
    return saved ? JSON.parse(saved) : []
  })

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('employeeGoals')
    return saved ? JSON.parse(saved) : []
  })

  const [reviewFormData, setReviewFormData] = useState({
    employee_id: '',
    review_period: '',
    review_type: 'annual',
    performance_score: 3,
    technical_skills: 3,
    communication: 3,
    teamwork: 3,
    leadership: 3,
    attendance: 3,
    strengths: '',
    areas_for_improvement: '',
    goals_achieved: '',
    comments: '',
    status: 'completed'
  })

  const [goalFormData, setGoalFormData] = useState({
    employee_id: '',
    title: '',
    description: '',
    category: 'performance',
    target_date: '',
    progress: 0,
    status: 'in_progress'
  })

  const { data: employeesData } = useQuery('employees', employeeService.getAllEmployees)
  const employees = employeesData?.records || []

  const handleReviewChange = (e) => {
    const { name, value } = e.target
    setReviewFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleGoalChange = (e) => {
    const { name, value } = e.target
    setGoalFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleReviewSubmit = () => {
    if (!reviewFormData.employee_id || !reviewFormData.review_period) {
      toast.error('Please fill in all required fields')
      return
    }

    const employee = employees.find(e => e.id === parseInt(reviewFormData.employee_id))
    const overallScore = (
      parseFloat(reviewFormData.performance_score) +
      parseFloat(reviewFormData.technical_skills) +
      parseFloat(reviewFormData.communication) +
      parseFloat(reviewFormData.teamwork) +
      parseFloat(reviewFormData.leadership) +
      parseFloat(reviewFormData.attendance)
    ) / 6

    const newReview = {
      id: reviews.length + 1,
      ...reviewFormData,
      employee_name: employee?.full_name || 'Unknown',
      employee_number: employee?.employee_number || 'N/A',
      overall_score: overallScore.toFixed(1),
      review_date: new Date().toISOString().split('T')[0]
    }

    const updated = [...reviews, newReview]
    setReviews(updated)
    localStorage.setItem('performanceReviews', JSON.stringify(updated))

    toast.success('Performance review submitted successfully!')
    setOpenReviewDialog(false)
    setReviewFormData({
      employee_id: '',
      review_period: '',
      review_type: 'annual',
      performance_score: 3,
      technical_skills: 3,
      communication: 3,
      teamwork: 3,
      leadership: 3,
      attendance: 3,
      strengths: '',
      areas_for_improvement: '',
      goals_achieved: '',
      comments: '',
      status: 'completed'
    })
  }

  const handleGoalSubmit = () => {
    if (!goalFormData.employee_id || !goalFormData.title || !goalFormData.target_date) {
      toast.error('Please fill in all required fields')
      return
    }

    const employee = employees.find(e => e.id === parseInt(goalFormData.employee_id))

    const newGoal = {
      id: goals.length + 1,
      ...goalFormData,
      employee_name: employee?.full_name || 'Unknown',
      employee_number: employee?.employee_number || 'N/A',
      created_date: new Date().toISOString().split('T')[0]
    }

    const updated = [...goals, newGoal]
    setGoals(updated)
    localStorage.setItem('employeeGoals', JSON.stringify(updated))

    toast.success('Goal created successfully!')
    setOpenGoalDialog(false)
    setGoalFormData({
      employee_id: '',
      title: '',
      description: '',
      category: 'performance',
      target_date: '',
      progress: 0,
      status: 'in_progress'
    })
  }

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'success'
    if (score >= 3.5) return 'info'
    if (score >= 2.5) return 'warning'
    return 'error'
  }

  const getStatusColor = (status) => {
    const colors = {
      completed: 'success',
      in_progress: 'info',
      pending: 'warning',
      cancelled: 'error'
    }
    return colors[status] || 'default'
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>Performance Management</Typography>
        <Box display="flex" gap={2}>
          {activeTab === 0 && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenReviewDialog(true)}
              sx={primaryButtonStyle}
            >
              New Review
            </Button>
          )}
          {activeTab === 1 && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenGoalDialog(true)}
              sx={primaryButtonStyle}
            >
              Set Goal
            </Button>
          )}
        </Box>
      </Box>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Performance Reviews" />
        <Tab label="Goals & KPIs" />
        <Tab label="360° Feedback" />
      </Tabs>

      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Employee #</TableCell>
                <TableCell>Employee Name</TableCell>
                <TableCell>Review Period</TableCell>
                <TableCell>Review Type</TableCell>
                <TableCell>Overall Score</TableCell>
                <TableCell>Review Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">No performance reviews found</TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.id}</TableCell>
                    <TableCell>{review.employee_number}</TableCell>
                    <TableCell>{review.employee_name}</TableCell>
                    <TableCell>{review.review_period}</TableCell>
                    <TableCell>{review.review_type}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Rating value={parseFloat(review.overall_score)} readOnly precision={0.1} size="small" />
                        <Typography variant="body2" fontWeight={600}>
                          {review.overall_score}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{review.review_date}</TableCell>
                    <TableCell>
                      <Chip
                        label={review.status.toUpperCase()}
                        color={getStatusColor(review.status)}
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

      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Goal Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Target Date</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {goals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">No goals set</TableCell>
                </TableRow>
              ) : (
                goals.map((goal) => (
                  <TableRow key={goal.id}>
                    <TableCell>{goal.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{goal.employee_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{goal.employee_number}</Typography>
                    </TableCell>
                    <TableCell>{goal.title}</TableCell>
                    <TableCell>{goal.category}</TableCell>
                    <TableCell>{goal.target_date}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={goal.progress}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2">{goal.progress}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={goal.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(goal.status)}
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

      {activeTab === 2 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Assessment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            360° Feedback System Coming Soon
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This feature will allow comprehensive feedback collection from peers, subordinates, and supervisors.
          </Typography>
        </Paper>
      )}

      {/* Performance Review Dialog */}
      <Dialog open={openReviewDialog} onClose={() => setOpenReviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Performance Review</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Employee"
                  name="employee_id"
                  value={reviewFormData.employee_id}
                  onChange={handleReviewChange}
                  required
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.employee_number} - {emp.full_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Review Period"
                  name="review_period"
                  value={reviewFormData.review_period}
                  onChange={handleReviewChange}
                  placeholder="e.g. Q1 2025, Jan-Jun 2025"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Review Type"
                  name="review_type"
                  value={reviewFormData.review_type}
                  onChange={handleReviewChange}
                  required
                >
                  <MenuItem value="probation">Probation Review</MenuItem>
                  <MenuItem value="quarterly">Quarterly Review</MenuItem>
                  <MenuItem value="annual">Annual Review</MenuItem>
                  <MenuItem value="project">Project Review</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="overline">Performance Ratings</Typography>
                </Divider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" gutterBottom>Overall Performance</Typography>
                <Rating
                  name="performance_score"
                  value={parseFloat(reviewFormData.performance_score)}
                  onChange={(e, value) => handleReviewChange({ target: { name: 'performance_score', value } })}
                  precision={0.5}
                  size="large"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" gutterBottom>Technical Skills</Typography>
                <Rating
                  name="technical_skills"
                  value={parseFloat(reviewFormData.technical_skills)}
                  onChange={(e, value) => handleReviewChange({ target: { name: 'technical_skills', value } })}
                  precision={0.5}
                  size="large"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" gutterBottom>Communication</Typography>
                <Rating
                  name="communication"
                  value={parseFloat(reviewFormData.communication)}
                  onChange={(e, value) => handleReviewChange({ target: { name: 'communication', value } })}
                  precision={0.5}
                  size="large"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" gutterBottom>Teamwork</Typography>
                <Rating
                  name="teamwork"
                  value={parseFloat(reviewFormData.teamwork)}
                  onChange={(e, value) => handleReviewChange({ target: { name: 'teamwork', value } })}
                  precision={0.5}
                  size="large"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" gutterBottom>Leadership</Typography>
                <Rating
                  name="leadership"
                  value={parseFloat(reviewFormData.leadership)}
                  onChange={(e, value) => handleReviewChange({ target: { name: 'leadership', value } })}
                  precision={0.5}
                  size="large"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" gutterBottom>Attendance & Punctuality</Typography>
                <Rating
                  name="attendance"
                  value={parseFloat(reviewFormData.attendance)}
                  onChange={(e, value) => handleReviewChange({ target: { name: 'attendance', value } })}
                  precision={0.5}
                  size="large"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Key Strengths"
                  name="strengths"
                  value={reviewFormData.strengths}
                  onChange={handleReviewChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Areas for Improvement"
                  name="areas_for_improvement"
                  value={reviewFormData.areas_for_improvement}
                  onChange={handleReviewChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Goals Achieved"
                  name="goals_achieved"
                  value={reviewFormData.goals_achieved}
                  onChange={handleReviewChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Comments"
                  name="comments"
                  value={reviewFormData.comments}
                  onChange={handleReviewChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleReviewSubmit}
            sx={primaryButtonStyle}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Goal Setting Dialog */}
      <Dialog open={openGoalDialog} onClose={() => setOpenGoalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Set Employee Goal</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Employee"
                  name="employee_id"
                  value={goalFormData.employee_id}
                  onChange={handleGoalChange}
                  required
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.employee_number} - {emp.full_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Goal Title"
                  name="title"
                  value={goalFormData.title}
                  onChange={handleGoalChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={goalFormData.description}
                  onChange={handleGoalChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  name="category"
                  value={goalFormData.category}
                  onChange={handleGoalChange}
                  required
                >
                  <MenuItem value="performance">Performance</MenuItem>
                  <MenuItem value="skill_development">Skill Development</MenuItem>
                  <MenuItem value="project">Project</MenuItem>
                  <MenuItem value="personal">Personal</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Date"
                  name="target_date"
                  type="date"
                  value={goalFormData.target_date}
                  onChange={handleGoalChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Initial Progress (%)"
                  name="progress"
                  type="number"
                  value={goalFormData.progress}
                  onChange={handleGoalChange}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGoalDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleGoalSubmit}
            sx={primaryButtonStyle}
          >
            Create Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
