import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  Grid,
  Stepper,
  Step,
  StepLabel,
  CircularProgress
} from '@mui/material';
import lixnetLogo from '../assets/lixnet2.png';

const subscriptionPlans = [
  { value: 'trial', label: 'Trial (30 days free)', price: 'Free' },
  { value: 'basic', label: 'Basic Plan', price: 'KES 5,000/month' },
  { value: 'professional', label: 'Professional Plan', price: 'KES 15,000/month' },
  { value: 'enterprise', label: 'Enterprise Plan', price: 'Custom pricing' }
];

const steps = ['Organization Details', 'Admin Account', 'Review'];

function OrganizationSignup() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState(null);

  const [formData, setFormData] = useState({
    // Organization details
    organization_name: '',
    organization_code: '',
    subscription_plan: 'trial',
    phone: '',
    address: '',
    
    // Admin account
    admin_first_name: '',
    admin_last_name: '',
    admin_email: '',
    admin_username: '',
    admin_password: '',
    confirm_password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Organization details
        if (!formData.organization_name.trim()) {
          setError('Organization name is required');
          return false;
        }
        if (!formData.organization_code.trim()) {
          setError('Organization code is required');
          return false;
        }
        if (!/^[A-Z0-9]{3,10}$/.test(formData.organization_code)) {
          setError('Organization code must be 3-10 uppercase alphanumeric characters (e.g., ABC123)');
          return false;
        }
        return true;

      case 1: // Admin account
        if (!formData.admin_first_name.trim() || !formData.admin_last_name.trim()) {
          setError('Admin name is required');
          return false;
        }
        if (!formData.admin_email.trim()) {
          setError('Admin email is required');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email)) {
          setError('Invalid email address');
          return false;
        }
        if (!formData.admin_username.trim()) {
          setError('Admin username is required');
          return false;
        }
        if (formData.admin_password.length < 8) {
          setError('Password must be at least 8 characters');
          return false;
        }
        if (formData.admin_password !== formData.confirm_password) {
          setError('Passwords do not match');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost/api/api/organization_signup.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organization_name: formData.organization_name,
          organization_code: formData.organization_code,
          subscription_plan: formData.subscription_plan,
          phone: formData.phone,
          address: formData.address,
          admin_first_name: formData.admin_first_name,
          admin_last_name: formData.admin_last_name,
          admin_email: formData.admin_email,
          admin_username: formData.admin_username,
          admin_password: formData.admin_password
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setCredentials({
          username: data.data.admin_username,
          organization: data.data.organization_name
        });
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0: // Organization Details
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Organization Name"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleChange}
                required
                placeholder="e.g., Acme Corporation Ltd"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Organization Code"
                name="organization_code"
                value={formData.organization_code}
                onChange={handleChange}
                required
                placeholder="e.g., ACME001"
                helperText="3-10 uppercase alphanumeric characters"
                inputProps={{ style: { textTransform: 'uppercase' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Subscription Plan"
                name="subscription_plan"
                value={formData.subscription_plan}
                onChange={handleChange}
              >
                {subscriptionPlans.map((plan) => (
                  <MenuItem key={plan.value} value={plan.value}>
                    {plan.label} - {plan.price}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+254712345678"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="Physical address"
              />
            </Grid>
          </Grid>
        );

      case 1: // Admin Account
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="admin_first_name"
                value={formData.admin_first_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="admin_last_name"
                value={formData.admin_last_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                name="admin_email"
                type="email"
                value={formData.admin_email}
                onChange={handleChange}
                required
                placeholder="admin@company.com"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                name="admin_username"
                value={formData.admin_username}
                onChange={handleChange}
                required
                placeholder="Choose a username"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                name="admin_password"
                type="password"
                value={formData.admin_password}
                onChange={handleChange}
                required
                helperText="At least 8 characters"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirm_password"
                type="password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        );

      case 2: // Review
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Review Your Information</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="primary">Organization Details</Typography>
              <Typography>Name: <strong>{formData.organization_name}</strong></Typography>
              <Typography>Code: <strong>{formData.organization_code}</strong></Typography>
              <Typography>Plan: <strong>{subscriptionPlans.find(p => p.value === formData.subscription_plan)?.label}</strong></Typography>
              
              <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>Admin Account</Typography>
              <Typography>Name: <strong>{formData.admin_first_name} {formData.admin_last_name}</strong></Typography>
              <Typography>Email: <strong>{formData.admin_email}</strong></Typography>
              <Typography>Username: <strong>{formData.admin_username}</strong></Typography>
            </Box>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#ffffff'
        }}
      >
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ mb: 3 }}>
              <img 
                src={lixnetLogo} 
                alt="Lixnet Logo" 
                style={{ width: '180px', height: 'auto' }} 
              />
            </Box>
            
            <Typography variant="h4" gutterBottom color="success.main">
              🎉 Registration Successful!
            </Typography>
            
            <Alert severity="success" sx={{ mt: 2, mb: 3, textAlign: 'left' }}>
              <Typography variant="body1" gutterBottom>
                Your organization <strong>{credentials.organization}</strong> has been registered successfully!
              </Typography>
              <Typography variant="body2">
                A welcome email has been sent to your email address.
              </Typography>
            </Alert>

            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">Your Login Credentials:</Typography>
              <Typography><strong>Username:</strong> {credentials.username}</Typography>
              <Typography variant="caption" color="text.secondary">
                Use the password you created during registration
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => navigate('/')}
              sx={{ 
                bgcolor: '#1976d2',
                '&:hover': { bgcolor: '#1565c0' }
              }}
            >
              Go to Login
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#ffffff',
        py: 4
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <img 
              src={lixnetLogo} 
              alt="Lixnet Logo" 
              style={{ width: '180px', height: 'auto', marginBottom: '20px' }} 
            />
            <Typography variant="h4" gutterBottom>
              Create Your Organization
            </Typography>
            <Typography color="text.secondary">
              Start managing your payroll in minutes
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            {getStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ 
                    bgcolor: '#1976d2',
                    '&:hover': { bgcolor: '#1565c0' }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Complete Registration'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ 
                    bgcolor: '#1976d2',
                    '&:hover': { bgcolor: '#1565c0' }
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Button 
                onClick={() => navigate('/')}
                sx={{ textTransform: 'none' }}
              >
                Login here
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default OrganizationSignup;
