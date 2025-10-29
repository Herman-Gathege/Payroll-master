import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material'
import { Visibility, VisibilityOff, Business, AdminPanelSettings } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

export default function EmployerLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { employerLogin } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Attempting employer login...')
      const response = await employerLogin(username, password)
      console.log('Login response:', response)

      // Small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100))

      console.log('Navigating to employer dashboard...')
      navigate('/employer/dashboard', { replace: true })
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.message || err.message || 'Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: '#f5f7fa',
        py: 4
      }}
    >
      <Container component="main" maxWidth="sm">
        <Paper elevation={10} sx={{ p: 5, borderRadius: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <AdminPanelSettings sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
            <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>
              Employer Portal
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to access the HR Management System
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                },
                mb: 2
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Are you an employee?
              </Typography>
              <Link to="/employee/login" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Business />}
                  sx={{ mt: 1 }}
                >
                  Employee Login
                </Button>
              </Link>
            </Box>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" display="block" color="text.secondary">
              HR Management System - Kenya Compliant
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              PAYE | NSSF | SHIF | Housing Levy
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
