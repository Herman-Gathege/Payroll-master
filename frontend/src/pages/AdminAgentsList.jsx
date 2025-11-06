import { useEffect, useState } from "react";
import { fetchAgents } from '../services/agentAdminService';
import { useNavigate } from 'react-router-dom';
import { Button, Select, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, Paper, Box } from '@mui/material';

export default function AdminAgentsList() {
  const [filter, setFilter] = useState('pending');
  const [agents, setAgents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [filter]);

  const load = async () => {
    try {
      const res = await fetchAgents(filter);
      if (res.success) setAgents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box p={3}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <h2>Agent Applications</h2>
          <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="verified">Verified</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="">All</MenuItem>
          </Select>
        </Box>
      </Paper>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Stage</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map(a => (
              <TableRow key={a.id}>
                <TableCell>{a.full_name}</TableCell>
                <TableCell>{a.email}</TableCell>
                <TableCell>{a.phone}</TableCell>
                <TableCell>{a.onboarding_stage}</TableCell>
                <TableCell>{new Date(a.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Button variant="outlined" onClick={() => navigate(`/employer/agents/${a.id}`)}>View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}
