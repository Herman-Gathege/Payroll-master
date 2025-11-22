import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

import {
  getDepartments,
  deleteDepartment
} from "../services/departmentsService";

import AssignEmployeesModal from "../components/AssignEmployeesModal";
import AddDepartmentModal from "../components/AddDepartmentModal";
import EditDepartmentModal from "../components/EditDepartmentModal";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [activeDept, setActiveDept] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await getDepartments();
      if (res.data && res.data.success) setDepartments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenAssign = (dept) => {
    setActiveDept(dept);
    setAssignOpen(true);
  };

  const handleAssignSuccess = () => {
    setAssignOpen(false);
    setActiveDept(null);
    fetchDepartments(); // refresh counts
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this department? This will fail if it has active employees."
      )
    )
      return;
    try {
      await deleteDepartment(id);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Departments</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
          sx={{
            background: "#1a365d",
            "&:hover": { background: "#2d4a70" },
          }}
        >
          Add Department
        </Button>
      </Box>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell align="right">Employees</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.name}</TableCell>
                <TableCell>{d.manager_name || "-"}</TableCell>
                <TableCell align="right">{d.employee_count ?? 0}</TableCell>
                <TableCell>
                  <IconButton
                    title="Assign employees"
                    onClick={() => handleOpenAssign(d)}
                  >
                    <AssignmentIndIcon />
                  </IconButton>

                  {/* Edit opens EditDepartmentModal (which now manages positions) */}
                  <IconButton
                    title="Edit"
                    onClick={() => {
                      setEditingDept(d);
                      setEditOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton title="Delete" onClick={() => handleDelete(d.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <AssignEmployeesModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        department={activeDept}
        onSuccess={handleAssignSuccess}
      />

      <AddDepartmentModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => {
          setAddOpen(false);
          fetchDepartments();
        }}
      />

      <EditDepartmentModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        department={editingDept}
        onSuccess={() => {
          setEditOpen(false);
          fetchDepartments();
        }}
      />
    </Box>
  );
}
