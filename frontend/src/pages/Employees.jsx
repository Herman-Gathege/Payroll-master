import { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  IconButton,
  Chip,
  InputAdornment
} from '@mui/material';
import { Add, Edit, Visibility, Search } from '@mui/icons-material';
import { employeeService } from '../services/employeeService';

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch all employees using react-query
  const { data, isLoading, error } = useQuery('employees', employeeService.getAllEmployees);

  const employees = data?.records || [];

  // Memoized filtered employees for performance
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    return employees.filter(emp =>
      emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  // Map employment status to Material-UI Chip colors
  const getStatusColor = (status) => {
    const statusColors = {
      active: 'success',
      on_leave: 'warning',
      suspended: 'error',
      terminated: 'default',
    };
    return statusColors[status] || 'default';
  };

  // Handlers
  const handleAdd = () => navigate('/employees/new');
  const handleView = (id) => navigate(`/employee-portal/${id}`);
  const handleEdit = (id) => navigate(`/employees/${id}`);

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Employees
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
          sx={{
            bgcolor: '#1976d2',
            borderRadius: '6px',
            padding: '6px 16px',
            fontSize: '13px',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': { bgcolor: '#1565c0' },
          }}
        >
          Add Employee
        </Button>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by name, number, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'action.active' }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Employees Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee #</TableCell>
              <TableCell>Full Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Error loading employees
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => (
                <TableRow key={emp.id} hover>
                  <TableCell>{emp.employee_number}</TableCell>
                  <TableCell>{emp.full_name}</TableCell>
                  <TableCell>{emp.department_name}</TableCell>
                  <TableCell>{emp.position_title}</TableCell>
                  <TableCell>{emp.phone_number}</TableCell>
                  <TableCell>{emp.work_email}</TableCell>
                  <TableCell>
                    <Chip
                      label={emp.employment_status}
                      color={getStatusColor(emp.employment_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleView(emp.id)} title="View Portal">
                      <Visibility />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEdit(emp.id)} title="Edit Employee">
                      <Edit />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
