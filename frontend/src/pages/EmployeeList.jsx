import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

import employeeService from '../services/employeeService';
import AssignEmployeesModal from './AssignEmployeesModal';
import { primaryButtonStyle } from '../styles/buttonStyles';

export default function EmployeeList({ department }) {
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery('employees', employeeService.getAllEmployees);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await employeeService.deleteEmployee(id);
      refetch();
    } catch (err) {
      console.error(err);
      alert('Failed to delete employee');
    }
  };

  if (isLoading) return <Typography>Loading employees...</Typography>;
  if (error) return <Typography>Error fetching employees.</Typography>;

  const employees = data?.data?.records || data?.records || [];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4">Employees</Typography>
        <Button
          variant="contained"
          sx={primaryButtonStyle}
          onClick={() => setAssignModalOpen(true)}
        >
          Assign to {department?.name || 'Department'}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id}>
                <TableCell>{emp.employee_number}</TableCell>
                <TableCell>{emp.full_name || `${emp.first_name} ${emp.last_name}`}</TableCell>
                <TableCell>{emp.department_name}</TableCell>
                <TableCell>{emp.position_title}</TableCell>
                <TableCell>{emp.phone_number}</TableCell>
                <TableCell>{emp.work_email}</TableCell>
                <TableCell>{emp.employment_status}</TableCell>
                <TableCell>
                  <IconButton color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(emp.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AssignEmployeesModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        department={department}
        onSuccess={refetch}
      />
    </Box>
  );
}
