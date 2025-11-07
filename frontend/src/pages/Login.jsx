import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
// import lixnetLogo from '../assets/lixnet3.png'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login(username, password)
      
      // Small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100))

      // Check user role and navigate accordingly
      const userData = response.user
      const role = userData.role
      
      // Employer roles: employer, admin, super_admin, hr_manager, payroll_officer, etc.
      if (role === 'employer' || role === 'admin' || role === 'super_admin' || 
          role === 'hr_manager' || role === 'payroll_officer' || 
          role === 'department_manager' || role === 'recruiter') {
        console.log('Navigating to employer dashboard...')
        navigate('/employer/dashboard', { replace: true })
      } else if (role === 'employee') {
        console.log('Navigating to employee portal...')
        navigate('/employee/portal', { replace: true })
      } else {
        console.log('Unknown role, redirecting to root...')
        navigate('/')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
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
        justifyContent: 'center',
        background: '#ffffff',
      }}
    >
      <Container component="main" maxWidth="xs" sx={{ maxWidth: '360px' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo */}
          {/* <Box
            component="img"
            src={lixnetLogo}
            alt="Lixnet Logo"
            sx={{
              width: 140,
              height: 'auto',
              mb: 2,
              objectFit: 'contain'
            }}
          /> */}

          {/* System Title */}
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              color: '#1976d2',
              fontWeight: 600,
              textAlign: 'center'
            }}
          >
            Evolve Payroll and HR Management System
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mb: 3,
              color: '#666',
              textAlign: 'center'
            }}
          >
            Sign in to continue
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                width: '100%',
                borderRadius: 1
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
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
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: '#fafafa'
                }
              }}
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
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: '#fafafa'
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                backgroundColor: '#1976d2',
                color: '#ffffff',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: 1,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#1565c0',
                  boxShadow: 'none',
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0'
                }
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an organization account?{' '}
              <Button 
                onClick={() => navigate('/signup')}
                sx={{ 
                  textTransform: 'none',
                  color: '#1976d2',
                  fontWeight: 500,
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline'
                  }
                }}
              >
                Create one here
              </Button>
            </Typography>
          </Box>

          <Typography
            variant="caption"
            sx={{
              mt: 3,
              color: '#999',
              textAlign: 'center'
            }}
          >
            Compliant with Employment Act 2007, SHIF, NSSF, KRA
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}