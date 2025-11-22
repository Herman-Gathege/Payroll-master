import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { updateDepartment } from '../services/departmentsService';
import { getPositions, createPosition, deletePosition } from '../services/positionsService';

/**
 * EditDepartmentModal
 * - edit department name / manager / active flag (existing behavior)
 * - list positions belonging to this department
 * - add new positions to this department
 * - delete position (backend will block if employees exist per your API)
 */
export default function EditDepartmentModal({ open, onClose, department, onSuccess }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // positions state (for this department)
  const [positions, setPositions] = useState([]);
  const [posLoading, setPosLoading] = useState(false);
  const [newPositionTitle, setNewPositionTitle] = useState('');
  const [addingPos, setAddingPos] = useState(false);
  const [deletingPosIds, setDeletingPosIds] = useState(new Set());

  useEffect(() => {
    if (department) {
      setName(department.name || '');
      loadPositions(department.id);
    } else {
      setName('');
      setPositions([]);
    }
  }, [department]);

  const loadPositions = async (deptId) => {
    if (!deptId) return;
    setPosLoading(true);
    try {
      const res = await getPositions(); // returns all positions for org
      if (res?.data?.success) {
        const all = res.data.data || [];
        const filtered = all.filter((p) => Number(p.department_id) === Number(deptId));
        setPositions(filtered);
      } else {
        setPositions([]);
      }
    } catch (err) {
      console.error(err);
      setPositions([]);
    } finally {
      setPosLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Department name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await updateDepartment({ id: department.id, name });
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || 'Failed to update department');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || 'Error updating department');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPosition = async () => {
    if (!newPositionTitle.trim()) {
      alert('Position title is required');
      return;
    }
    setAddingPos(true);
    try {
      await createPosition({
        title: newPositionTitle.trim(),
        department_id: department.id
      });
      setNewPositionTitle('');
      await loadPositions(department.id);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to add position');
    } finally {
      setAddingPos(false);
    }
  };

  const handleDeletePosition = async (posId) => {
    if (!window.confirm('Delete this position? This will fail if it has active employees.')) return;
    setDeletingPosIds(prev => new Set(prev).add(posId));
    try {
      await deletePosition(posId);
      // refresh
      await loadPositions(department.id);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to delete position');
    } finally {
      setDeletingPosIds(prev => {
        const next = new Set(prev);
        next.delete(posId);
        return next;
      });
    }
  };

  const handleClose = () => {
    setName('');
    setPositions([]);
    setNewPositionTitle('');
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle>Edit Department</DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          label="Department Name"
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Box mt={3}>
          <Typography variant="subtitle1">Positions</Typography>
          <Divider sx={{ mb: 1 }} />
          {posLoading ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <List dense>
                {positions.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No positions yet" />
                  </ListItem>
                )}
                {positions.map((p) => (
                  <ListItem key={p.id}>
                    <ListItemText
                      primary={p.title}
                      secondary={p.description ? p.description : null}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeletePosition(p.id)}
                        disabled={deletingPosIds.has(p.id)}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              <Box display="flex" gap={1} alignItems="center" mt={1}>
                <TextField
                  label="New position title"
                  value={newPositionTitle}
                  onChange={(e) => setNewPositionTitle(e.target.value)}
                  fullWidth
                />
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  onClick={handleAddPosition}
                  disabled={addingPos}
                >
                  {addingPos ? <CircularProgress size={18} /> : 'Add'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ background: '#1a365d', '&:hover': { background: '#2d4a70' } }}
        >
          {loading ? <CircularProgress size={20} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
