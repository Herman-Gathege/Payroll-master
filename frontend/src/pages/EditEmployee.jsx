import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import {
  Box, Paper, Typography, TextField, Button, Grid, MenuItem, Divider
} from "@mui/material";
import { Save, Cancel } from "@mui/icons-material";
import { toast } from "react-toastify";

import employeeService from "../services/employeeService";
import { getDepartments } from "../services/departmentsService";
import { getPositions } from "../services/positionsService";

import { primaryButtonStyle } from "../styles/buttonStyles";

export default function EditEmployee() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  // -------------------- Load employee ----------------------
  useEffect(() => {
    async function load() {
      try {
        const res = await employeeService.getEmployee(id);
        if (res.success) {
          setFormData({
            ...res.data,
            id: res.data.id, // required for PUT
          });
        }
      } catch (error) {
        toast.error("Failed to load employee");
      }
    }
    load();
  }, [id]);

  // -------------------- Load dropdowns ----------------------
  useEffect(() => {
    async function loadDropDowns() {
      try {
        const [deptRes, posRes] = await Promise.all([
          getDepartments(),
          getPositions()
        ]);

        setDepartments(deptRes.data?.data || []);
        setPositions(posRes.data?.data || []);

      } catch (err) {
        toast.error("Failed to load dropdown data");
      }
    }

    loadDropDowns();
  }, []);

  const updateMutation = useMutation(employeeService.updateEmployee, {
    onSuccess: () => {
      toast.success("Employee updated successfully!");
      navigate(`/employer/employees/${id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const required = [
      "first_name",
      "last_name",
      "phone",
      "work_email",
      "hire_date",
      "department_id",
      "position_id",
    ];

    const newErrors = {};

    required.forEach((field) => {
      if (!formData[field]) newErrors[field] = "This field is required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return toast.error("Fix validation errors");

    updateMutation.mutate(formData);
  };

  if (!formData) return <Typography>Loading employee...</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          Edit Employee
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
        
          <Typography variant="h6" sx={{ color: "primary.main", mb: 1 }}>
            Personal Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Employee Number"
                fullWidth
                value={formData.employee_no}
                name="employee_no"
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="First Name"
                fullWidth
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                error={!!errors.first_name}
                helperText={errors.first_name}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Middle Name"
                fullWidth
                name="middle_name"
                value={formData.middle_name || ""}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Last Name"
                fullWidth
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                error={!!errors.last_name}
                helperText={errors.last_name}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Phone Number"
                fullWidth
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Work Email"
                fullWidth
                name="work_email"
                value={formData.work_email}
                onChange={handleChange}
                error={!!errors.work_email}
                helperText={errors.work_email}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Birth"
                type="date"
                fullWidth
                name="date_of_birth"
                InputLabelProps={{ shrink: true }}
                value={formData.date_of_birth || ""}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ color: "primary.main", mt: 4 }}>
            Employment Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* ---------------- Department dropdown ---------------- */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                label="Department"
                fullWidth
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                error={!!errors.department_id}
                helperText={errors.department_id}
                required
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* ---------------- Position dropdown ---------------- */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                label="Position"
                fullWidth
                name="position_id"
                value={formData.position_id}
                onChange={handleChange}
                error={!!errors.position_id}
                helperText={errors.position_id}
                required
              >
                {positions.map((pos) => (
                  <MenuItem key={pos.id} value={pos.id}>
                    {pos.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                type="date"
                fullWidth
                name="hire_date"
                label="Hire Date"
                InputLabelProps={{ shrink: true }}
                value={formData.hire_date}
                onChange={handleChange}
                error={!!errors.hire_date}
                helperText={errors.hire_date}
                required
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
            <Button variant="outlined" startIcon={<Cancel />} onClick={() => navigate(`/employer/employees/${id}`)}>
              Cancel
            </Button>

            <Button type="submit" variant="contained" startIcon={<Save />} sx={primaryButtonStyle}>
              Update Employee
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
