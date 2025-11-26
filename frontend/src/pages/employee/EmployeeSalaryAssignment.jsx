import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';

import SalaryStructureService from '../../services/salaryStructureService';
import employeeSalaryService from '../../services/employeeSalaryService';
import { toast } from 'react-toastify';

export default function EmployeeSalaryAssignment() {
  const { id: employeeId } = useParams();

  const [loading, setLoading] = useState(true);
  const [structures, setStructures] = useState([]);
  const [selected, setSelected] = useState('');
  const [currentAssignment, setCurrentAssignment] = useState(null);

  useEffect(() => {
    Promise.all([
      SalaryStructureService.list().then(res => res.data.structures),
      employeeSalaryService.getEmployeeSalary(employeeId).then(res => res.data)
    ])
      .then(([allStructures, employee]) => {
        setStructures(allStructures);

        if (employee.assignment) {
          setCurrentAssignment(employee.assignment);
          setSelected(employee.assignment.structure_id);
        }

        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load salary structure assignment");
        setLoading(false);
      });
  }, [employeeId]);

  const handleAssign = () => {
    if (!selected) return toast.error("Please select a structure");

    const payload = {
      structure_id: selected,
      effective_from: new Date().toISOString().split("T")[0]
    };

    employeeSalaryService
      .assign(employeeId, payload)
      .then(() => {
        toast.success("Salary structure assigned");
      })
      .catch(() => toast.error("Assignment failed"));
  };

  const handleUpdate = () => {
    if (!currentAssignment) return;

    const payload = { structure_id: selected };

    employeeSalaryService
      .updateAssignment(currentAssignment.id, payload)
      .then(() => toast.success("Updated successfully"))
      .catch(() => toast.error("Update failed"));
  };

  if (loading)
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Salary Structure Assignment
        </Typography>

        <TextField
          select
          label="Select Salary Structure"
          value={selected}
          onChange={e => setSelected(e.target.value)}
          fullWidth
        >
          {structures.map(s => (
            <MenuItem key={s.id} value={s.id}>
              {s.title} — {s.basic_salary}
            </MenuItem>
          ))}
        </TextField>

        <Box mt={3}>
          {currentAssignment ? (
            <Button variant="contained" onClick={handleUpdate}>
              Update Assignment
            </Button>
          ) : (
            <Button variant="contained" onClick={handleAssign}>
              Assign Structure
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
