import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, List, ListItem, ListItemText,
  Checkbox, CircularProgress
} from '@mui/material';

import { employeeService } from '../services/employeeService';
import { assignEmployeeToDepartment } from '../services/departmentsService';

export default function AssignEmployeesModal({ open, onClose, department, onSuccess }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const handleSearch = async (q) => {
    setQuery(q);

    if (!q || q.length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await employeeService.searchEmployees(q);
      const items = res?.data?.records || res?.data?.data || [];
      setResults(items);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    const copy = new Set(selected);
    copy.has(id) ? copy.delete(id) : copy.add(id);
    setSelected(copy);
  };

  const handleAssign = async () => {
    if (!department || selected.size === 0)
      return alert('Select at least one employee.');

    try {
      setAssigning(true);

      // Assign one employee at a time (backend requirement)
      for (let id of Array.from(selected)) {
        await assignEmployeeToDepartment(department.id, id);
      }

      onSuccess && onSuccess();

    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setSelected(new Set());
    onClose && onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle>Assign Employees to {department?.name}</DialogTitle>

      <DialogContent>
        <TextField
          label="Search employees (name, email, number)"
          fullWidth
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          margin="normal"
        />

        {loading && <CircularProgress size={20} />}

        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
          {results.map((r) => (
            <ListItem key={r.id} button onClick={() => toggleSelect(r.id)}>
              <Checkbox checked={selected.has(r.id)} />
              <ListItemText
                primary={r.full_name || `${r.first_name} ${r.last_name}`}
                secondary={`${r.position_title || ''} — ${r.department_name || ''}`}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>

        <Button
          variant="contained"
          disabled={assigning || selected.size === 0}
          onClick={handleAssign}
        >
          {assigning ? 'Assigning...' : `Assign (${selected.size})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
