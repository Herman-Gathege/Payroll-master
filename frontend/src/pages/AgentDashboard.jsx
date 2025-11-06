import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Button } from '@mui/material';

export default function AgentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Optionally fetch agent record by stack user id or mapped agent id.
    // For now assume user object has agent_status if you saved that at registration.
    if (!user) navigate('/login');
    setStatus(user?.agent_status || 'pending'); // fallback
  }, [user, navigate]);

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <h2>Agent Dashboard</h2>
        <p>Your verification status: <strong>{status}</strong></p>
        {status === 'verified' ? (
          <p>Welcome — you can now access your dashboard features.</p>
        ) : (
          <p>We're processing your application. You will be notified via email when verification completes.</p>
        )}
        <Button onClick={() => navigate('/')}>Back to home</Button>
      </Paper>
    </Box>
  );
}
