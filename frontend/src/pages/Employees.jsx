import { useState } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { Add, Edit, Visibility, Search } from "@mui/icons-material";
import employeeService from "../services/employeeService";

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // ----------------------------------------------------
  // Fetch employees from backend
  // backend returns: { success, data: [...], pagination }
  // ----------------------------------------------------
  const { data, isLoading, error } = useQuery(
    "employees",
    employeeService.getAllEmployees
  );

  const employees = data?.data || []; // FIXED (backend uses data not records)

  // ----------------------------------------------------
  // Local filtering (optional)
  // ----------------------------------------------------
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_no?.toLowerCase().includes(searchTerm.toLowerCase()) || // FIXED
      emp.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    const map = {
      active: "success",
      on_leave: "warning",
      suspended: "error",
      terminated: "default",
    };
    return map[status] || "default";
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Employees
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/employer/employees/new')}
          sx={{
            bgcolor: "#1976d2",
            borderRadius: "6px",
            padding: "6px 16px",
            fontSize: "13px",
            textTransform: "none",
            fontWeight: 500,
            "&:hover": {
              bgcolor: "#1565c0",
            },
          }}
        >
          Add Employee
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search employees by name, number, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "action.active" }} />,
          }}
        />
      </Paper>

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
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell>{employee.employee_no}</TableCell> {/* FIXED */}
                  <TableCell>{employee.full_name}</TableCell>
                  <TableCell>{employee.department_name}</TableCell>
                  <TableCell>{employee.position_title}</TableCell>
                  <TableCell>{employee.phone}</TableCell> {/* FIXED field */}
                  <TableCell>{employee.work_email}</TableCell>
                  <TableCell>
                    <Chip
                      label={employee.employment_status}
                      color={getStatusColor(employee.employment_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() =>
                        navigate(`/employer/employees/${employee.id}`)
                      }
                      title="View Employee Details"
                    >
                      <Visibility />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() =>
                        navigate(`/employer/employees/${employee.id}`)
                      }
                      title="Edit Employee"
                    >
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
