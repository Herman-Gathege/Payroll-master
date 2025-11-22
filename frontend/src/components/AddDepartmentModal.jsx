import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { createDepartment } from '../services/departmentsService';
import { createPosition } from '../services/positionsService';

/**
 * AddDepartmentModal
 * - create department
 * - optionally create many positions for that department immediately
 */
export default function AddDepartmentModal({ open, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [positions, setPositions] = useState(['']);
  const [loading, setLoading] = useState(false);

  const addPositionField = () => setPositions(prev => [...prev, '']);
  const removePositionField = (idx) =>
    setPositions(prev => prev.filter((_, i) => i !== idx));
  const updatePosition = (idx, val) => {
    setPositions(prev => {
      const copy = [...prev];
      copy[idx] = val;
      return copy;
    });
  };

  const resetAndClose = () => {
    setName('');
    setPositions(['']);
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Department name is required');
      return;
    }

    setLoading(true);
    try {
      // create department
      const res = await createDepartment({ name });
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || 'Failed to create department');
      }

      const deptId = res.data?.data?.id;
      // create positions (if any non-empty)
      const valid = positions.map(p => p?.trim()).filter(Boolean);

      // create positions sequentially (keeping it simple)
      for (const title of valid) {
        // backend expects { title, department_id }
        await createPosition({ title, department_id: deptId });
      }

      // success
      if (onSuccess) onSuccess();
      resetAndClose();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || 'Error creating department');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={resetAndClose}>
      <DialogTitle>Add Department</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          label="Department Name"
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Box mt={2} mb={1} display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1">Positions (optional)</Typography>
          <Button size="small" startIcon={<Add />} onClick={addPositionField}>
            Add field
          </Button>
        </Box>

        {positions.map((val, idx) => (
          <Box key={idx} display="flex" gap={1} alignItems="center" mb={1}>
            <TextField
              label={`Position #${idx + 1}`}
              fullWidth
              value={val}
              onChange={(e) => updatePosition(idx, e.target.value)}
            />
            {positions.length > 1 && (
              <IconButton onClick={() => removePositionField(idx)} aria-label="remove position">
                <Delete />
              </IconButton>
            )}
          </Box>
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={resetAndClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ background: '#1a365d', '&:hover': { background: '#2d4a70' } }}
        >
          {loading ? <CircularProgress size={20} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
