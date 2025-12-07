import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "react-query";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Divider,
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
          const emp = res.data;

          // Extract phone
          const fullPhone = emp.phone || "";
          let country_code = "+254";
          let phone = "";

          if (fullPhone.startsWith("+")) {
            country_code = fullPhone.slice(0, 4); // e.g. +254
            phone = fullPhone.slice(4); // remaining 9 digits
          }

          setFormData({
            ...emp,
            id: emp.id,
            country_code,
            phone,
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
          getPositions(),
        ]);

        setDepartments(deptRes.data?.data || []);
        setPositions(posRes.data?.data || []);
      } catch (err) {
        toast.error("Failed to load dropdown data");
      }
    }

    loadDropDowns();
  }, []);

  // -------------------- UPDATE EMPLOYEE ----------------------
  const updateMutation = useMutation(employeeService.updateEmployee, {
    onSuccess: () => {
      toast.success("Employee updated successfully!");
      navigate(`/employer/employees/${id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update");
    },
  });

  // ------------------ Handle Change ------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // ------------------ Validation ------------------
  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name) newErrors.first_name = "Required";
    if (!formData.last_name) newErrors.last_name = "Required";
    if (!formData.phone) newErrors.phone = "Required";
    if (formData.phone && formData.phone.length !== 9)
      newErrors.phone = "Phone must be 9 digits";
    if (!formData.work_email) newErrors.work_email = "Required";
    if (!formData.hire_date) newErrors.hire_date = "Required";
    if (!formData.department_id) newErrors.department_id = "Required";
    if (!formData.position_id) newErrors.position_id = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ------------------ SUBMIT ------------------
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    const payload = {
      ...formData,
      phone: formData.country_code + formData.phone, // combine into one string
    };

    updateMutation.mutate(payload); // FIXED
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
            {/* First Name */}
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

            {/* Middle */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Middle Name"
                fullWidth
                name="middle_name"
                value={formData.middle_name || ""}
                onChange={handleChange}
              />
            </Grid>

            {/* Last Name */}
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

            {/* PHONE NUMBER */}
            <Grid item xs={12} sm={6} md={4}>
              <Box display="flex" gap={1}>
                <TextField
                  select
                  label="Code"
                  name="country_code"
                  value={formData.country_code}
                  onChange={handleChange}
                  sx={{ width: "50%" }}
                >
                  <MenuItem value="+254">🇰🇪 +254 (Kenya)</MenuItem>
                  <MenuItem value="+255">🇹🇿 +255 (Tanzania)</MenuItem>
                  <MenuItem value="+256">🇺🇬 +256 (Uganda)</MenuItem>
                </TextField>

                <TextField
                  label="Phone Number"
                  fullWidth
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const cleaned = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 9);
                    setFormData((prev) => ({ ...prev, phone: cleaned }));
                    if (errors.phone) {
                      setErrors((prev) => ({ ...prev, phone: null }));
                    }
                  }}
                  inputProps={{ maxLength: 9 }}
                  error={!!errors.phone}
                  helperText={
                    errors.phone || "Enter 9-digit phone e.g., 712345678"
                  }
                  required
                />
              </Box>
            </Grid>

            {/* EMAIL */}
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

            {/* DOB */}
            <Grid item xs={12} sm={6}>
              <TextField
                type="date"
                fullWidth
                name="date_of_birth"
                InputLabelProps={{ shrink: true }}
                value={formData.date_of_birth || ""}
                onChange={handleChange}
              />
            </Grid>

            {/* GENDER */}
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

          {/* EMPLOYMENT INFO */}
          <Typography variant="h6" sx={{ color: "primary.main", mt: 4 }}>
            Employment Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            {/* DEPARTMENT */}
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

            {/* EMPLOYMENT STATUS */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                label="Employment Status"
                fullWidth
                name="employment_status"
                value={formData.employment_status}
                onChange={handleChange}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="On Leave">On Leave</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
                <MenuItem value="Terminated">Terminated</MenuItem>
                <MenuItem value="Retired">Retired</MenuItem>
              </TextField>
            </Grid>

            {/* POSITION */}
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

            {/* HIRE DATE */}
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

          {/* ACTION BUTTONS */}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => navigate(`/employer/employees/${id}`)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              sx={primaryButtonStyle}
            >
              Update Employee
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
