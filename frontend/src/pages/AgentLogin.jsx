import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { loginAgent } from '../services/authService';

export default function AgentLogin() {
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginAgent(fullName, idNumber);
      localStorage.setItem('agent_token', res.token);
      localStorage.setItem('agent', JSON.stringify(res.agent));

      await new Promise((r) => setTimeout(r, 100)); // small delay
      navigate('/agent/dashboard', { replace: true });
    } catch (err) {
      console.error('Agent login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

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
      <Container component="main" maxWidth="xs" sx={{ maxWidth: 360 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Logo (optional) */}
          {/* <Box
            component="img"
            src="/src/assets/lixnet2.png"
            alt="Evolve Logo"
            sx={{
              width: 120,
              height: 'auto',
              mb: 2,
              objectFit: 'contain',
            }}
          /> */}

          {/* Page Title */}
          <Typography
            variant="h6"
            sx={{
              mb: 3,
              color: theme.palette.primary.main,
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            Evolve Agent Portal
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mb: 3,
              color: '#666',
              textAlign: 'center',
            }}
          >
            Log in with your full name and ID number to access your dashboard
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                width: '100%',
                borderRadius: 1,
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
              id="fullName"
              label="Full Name"
              name="fullName"
              autoComplete="name"
              autoFocus
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: '#fafafa',
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="idNumber"
              label="Personal ID Number"
              name="idNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              disabled={loading}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  backgroundColor: '#fafafa',
                },
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
                backgroundColor: theme.palette.primary.main,
                color: '#ffffff',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                borderRadius: 1,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  boxShadow: 'none',
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0',
                },
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>

          {/* Footer / CTA */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              New to Evolve?{' '}
              <Button
                onClick={() => navigate('/agent/onboarding/register')}
                sx={{
                  textTransform: 'none',
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                Register as an Agent
              </Button>
            </Typography>
          </Box>

          <Typography
            variant="caption"
            sx={{
              mt: 3,
              color: '#999',
              textAlign: 'center',
            }}
          >
            Empowering student agents across Kenya 🇰🇪
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
