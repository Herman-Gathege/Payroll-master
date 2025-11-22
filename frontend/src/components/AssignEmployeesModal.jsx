import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';

import { employeeService } from '../services/employeeService';
import { assignEmployeeToDepartment } from '../services/departmentsService';

/**
 * AssignEmployeesModal
 * - Search employees
 * - Select multiple
 * - Assign all to the department (1-by-1 requests - backend requirement)
 */
export default function AssignEmployeesModal({ open, onClose, department, onSuccess }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // -----------------------------------------------------
  // Search employees
  // -----------------------------------------------------
  const handleSearch = async (value) => {
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await employeeService.searchEmployees(value);

      const employees =
        res?.data?.records ||
        res?.data?.data ||
        [];

      // Normalize results
      const normalized = employees.map(e => ({
        id: e.id,
        full_name: e.full_name || `${e.first_name} ${e.last_name}`,
        position: e.position_title || '',
        department: e.department_name || ''
      }));

      setResults(normalized);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------------
  // Toggling selected employees
  // -----------------------------------------------------
  const toggleSelect = (id) => {
    setSelected(prev => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  // -----------------------------------------------------
  // Assign employees -> backend requires 1-by-1 POST calls
  // -----------------------------------------------------
  const handleAssign = async () => {
    if (!department || selected.size === 0) {
      return alert('Select at least one employee.');
    }

    setAssigning(true);
    try {
      for (const employeeId of selected) {
        await assignEmployeeToDepartment(department.id, employeeId);
      }

      onSuccess && onSuccess();

    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to assign employees');
    } finally {
      setAssigning(false);
    }
  };

  // -----------------------------------------------------
  // Reset everything on close
  // -----------------------------------------------------
  const handleClose = () => {
    setQuery('');
    setResults([]);
    setSelected(new Set());
    onClose && onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle>
        Assign Employees to {department?.name || ''}
      </DialogTitle>

      <DialogContent>
        <TextField
          label="Search employees (name, email, number)"
          fullWidth
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          margin="normal"
        />

        {loading && (
          <Box textAlign="center" my={1}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!loading && results.length === 0 && query.length >= 2 && (
          <Typography variant="body2" color="text.secondary">
            No employees found.
          </Typography>
        )}

        <List dense sx={{ maxHeight: 320, overflowY: 'auto', mt: 1 }}>
          {results.map((emp) => (
            <ListItem
              key={emp.id}
              button
              onClick={() => toggleSelect(emp.id)}
              sx={{ borderBottom: '1px solid #eee' }}
            >
              <Checkbox checked={selected.has(emp.id)} />
              <ListItemText
                primary={emp.full_name}
                secondary={`${emp.position} — ${emp.department}`}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>

        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={assigning || selected.size === 0}
          sx={{ background: '#1a365d', '&:hover': { background: '#2d4a70' } }}
        >
          {assigning ? 'Assigning...' : `Assign (${selected.size})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
