import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAgentById, reviewAgentAdmin } from '../services/agentAdminService';
import { Box, Paper, Button, TextField, Link } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function AdminAgentDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [comment, setComment] = useState('');
  const { user } = useAuth(); // reviewer info
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    const res = await fetchAgentById(id);
    if (res.success) setData(res.data);
  };

  const handleDecision = async (decision) => {
    if (!user) {
      alert("You must be logged in as a reviewer");
      return;
    }
    const res = await reviewAgentAdmin({
      agent_id: id,
      reviewer_id: user.id,
      decision,
      comment
    });
    if (res.success) {
      alert(res.message);
      navigate('/employer/agents');
    } else {
      alert(res.message || 'Failed');
    }
  };

  if (!data) return <p>Loading...</p>;

  const { agent, profile, documents, reviews } = data;

  return (
    <Box p={3}>
      <Button onClick={() => navigate(-1)}>Back</Button>
      <Paper sx={{ p: 2, mb: 2 }}>
        <h2>{agent.full_name} — {agent.email}</h2>
        <p>Phone: {agent.phone}</p>
        <p>Stage: {agent.onboarding_stage} — Status: {agent.status}</p>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <h3>Profile</h3>
        {profile ? (
          <div>
            <p>ID: {profile.id_number}</p>
            <p>Address: {profile.address}</p>
            <p>Gender: {profile.gender}</p>
          </div>
        ) : <p>No profile yet</p>}
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <h3>Documents</h3>
        {documents.length ? documents.map(d => (
          <div key={d.id} style={{ marginBottom: 8 }}>
            <strong>{d.doc_type}</strong> — <a href={d.file_path} target="_blank" rel="noreferrer">View</a> — {d.status}
          </div>
        )) : <p>No docs</p>}
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <h3>Review</h3>
        <TextField
          label="Comment (optional)"
          multiline
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
        />
        <Box mt={2} display="flex" gap={2}>
          <Button color="success" variant="contained" onClick={() => handleDecision('approved')}>Approve</Button>
          <Button color="error" variant="outlined" onClick={() => handleDecision('rejected')}>Reject</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <h3>History</h3>
        {reviews.length ? reviews.map(r => (
          <div key={r.id}>
            <p>{r.reviewer_username} — {r.action} — {new Date(r.created_at).toLocaleString()}</p>
            {r.comment && <p>Note: {r.comment}</p>}
            <hr />
          </div>
        )) : <p>No reviews yet</p>}
      </Paper>
    </Box>
  );
}
