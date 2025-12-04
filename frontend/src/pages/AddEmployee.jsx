// frontend/src/pages/AddEmployee.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import SalaryStructureService from "../services/salaryStructureService";
import employeeSalaryService from "../services/employeeSalaryService";
import { primaryButtonStyle } from "../styles/buttonStyles";

export default function AddEmployee() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employee_no: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    id_number: "",
    kra_pin: "",
    nssf_no: "",
    nhif_no: "",
    shif_number: "",
    phone: "",
    personal_email: "",
    work_email: "",
    date_of_birth: "",
    gender: "",
    residential_address: "",
    postal_address: "",
    nationality: "Kenyan",

    employment_type: "Permanent",
    employment_status: "Active",
    hire_date: "",
    department_id: "",
    position_id: "",
    basic_salary: "",
    currency: "KES",
  });

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [structures, setStructures] = useState([]);
  const [selectedStructure, setSelectedStructure] = useState(""); // structure id 
  const [errors, setErrors] = useState({});

  // Load next employee number
  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await employeeService.getNextEmployeeNo();
        // employeeService returns response.data already, so res.next_employee_no
        setFormData((prev) => ({
          ...prev,
          employee_no: res?.next_employee_no || "",
        }));
      } catch (e) {
        toast.error("Failed to auto-generate employee number");
      }
    }

    loadInitial();
  }, []);

  // -------------------- Load dropdowns (departments, positions, structures) ----------------------
  useEffect(() => {
    async function loadDropDowns() {
      try {
        const [deptRes, posRes, structRes] = await Promise.all([
          getDepartments(),
          getPositions(),
          SalaryStructureService.list(),
        ]);

        setDepartments(deptRes.data?.data || []);
        setPositions(posRes.data?.data || []);
        // SalaryStructureService.list() is expected to return { data: { data: [structures...] } }
        // adapt to both possible shapes:
        let list = structRes.data?.data ?? structRes.data ?? [];
        setStructures(Array.isArray(list) ? list : []);
      } catch (err) {
        toast.error("Failed to load dropdown data");
      }
    }

    loadDropDowns();
  }, []);

  const createMutation = useMutation(employeeService.createEmployee, {
    onSuccess: async (responseData) => {
      // responseData can be different shapes depending on your backend conventions.
      // Try multiple fallbacks to locate the created employee ID.
      // Common possibilities: responseData.data.id, responseData.id, responseData.data.employee_id
      const resp = responseData || {};
      const possible = resp.data ?? resp;
      const created = possible?.data ?? possible; // handle nested shapes

      const employeeId =
        (created &&
          (created.id || created.employee_id || created.employee_id)) ||
        resp.id ||
        resp.employee_id ||
        resp.data?.id ||
        resp.data?.employee_id;

      // If we can't find an id, try to inspect resp directly (last resort)
      // (still allow navigation)
      if (!employeeId) {
        toast.warning(
          "Employee created but could not detect ID for auto assignment. Please assign the salary structure manually."
        );
        navigate("/employer/employees");
        return;
      }

      // If a salary structure was selected, assign it automatically
      if (selectedStructure) {
        const effective_from =
          formData.hire_date || new Date().toISOString().split("T")[0];

        try {
          await employeeSalaryService.assign(employeeId, {
            structure_id: selectedStructure,
            effective_from,
          });
          toast.success("Employee added and salary structure assigned");
        } catch (err) {
          // keep the employee, but notify assignment failed
          toast.error("Employee added but salary structure assignment failed");
        }
      } else {
        toast.success("Employee added successfully!");
      }

      navigate("/employer/employees");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add employee");
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

  // When user selects a salary structure
  const handleStructureChange = async (e) => {
    const structureId = e.target.value;
    setSelectedStructure(structureId);

    if (!structureId) {
      // Clear salary if no structure selected (optional)
      setFormData((prev) => ({ ...prev, basic_salary: "" }));
      return;
    }

    // Try to find in loaded structures first
    const found = structures.find((s) => String(s.id) === String(structureId));
    if (found) {
      setFormData((prev) => ({
        ...prev,
        basic_salary: found.basic_salary || "",
      }));
      return;
    }

    // Fallback: fetch a full structure (with allowances/benefits) and use its basic_salary
    try {
      const res = await SalaryStructureService.getOne(structureId);
      const structure = res.data?.data ?? res.data ?? res;
      setFormData((prev) => ({
        ...prev,
        basic_salary: structure.basic_salary || "",
      }));
    } catch (err) {
      toast.error("Failed to load salary structure details");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.employee_no)
      newErrors.employee_no = "Employee number is required";
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    if (!formData.phone) newErrors.phone = "Phone is required";
    if (!formData.date_of_birth)
      newErrors.date_of_birth = "Date of birth is required";
    // Age validation
    if (formData.date_of_birth) {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      const age =
        today.getFullYear() -
        dob.getFullYear() -
        (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
          ? 1
          : 0);

      if (age < 16)
        newErrors.date_of_birth = "Employee must be at least 16 years old";
      if (age > 100)
        newErrors.date_of_birth = "Employee age cannot exceed 100 years";
    }

    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.work_email) newErrors.work_email = "Work email is required";
    if (!formData.hire_date) newErrors.hire_date = "Hire date is required";
    if (!formData.department_id)
      newErrors.department_id = "Department is required";
    if (!formData.position_id) newErrors.position_id = "Position is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      createMutation.mutate(formData);
    } else {
      toast.error("Please fix validation errors");
    }
  };

  const handleCancel = () => navigate("/employer/employees");

  // ------------------------ UI ------------------------
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight={600}>
          Add New Employee
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          {/* PERSONAL INFO */}
          <Typography variant="h6" sx={{ color: "primary.main", mb: 1 }}>
            Personal Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Employee Number"
                fullWidth
                name="employee_no"
                value={formData.employee_no}
                onChange={handleChange}
                error={!!errors.employee_no}
                helperText={errors.employee_no}
                required
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
                value={formData.middle_name}
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

            {/* ID NUMBER */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="National ID"
                fullWidth
                name="id_number"
                value={formData.id_number}
                onChange={handleChange}
              />
            </Grid>

            {/* PHONE */}
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

            {/* EMAILS */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Personal Email"
                fullWidth
                name="personal_email"
                value={formData.personal_email}
                onChange={handleChange}
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

            {/* DOB */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Date of Birth"
                type="date"
                fullWidth
                name="date_of_birth"
                InputLabelProps={{ shrink: true }}
                value={formData.date_of_birth}
                onChange={handleChange}
                error={!!errors.date_of_birth}
                helperText={errors.date_of_birth}
                required
                inputProps={{
                  max: new Date(
                    new Date().setFullYear(new Date().getFullYear() - 16)
                  )
                    .toISOString()
                    .split("T")[0],
                  min: new Date(
                    new Date().setFullYear(new Date().getFullYear() - 100)
                  )
                    .toISOString()
                    .split("T")[0],
                }}
              />
            </Grid>

            {/* GENDER */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                error={!!errors.gender}
                helperText={errors.gender}
                required
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
            {/* EMPLOYMENT TYPE */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Employment Type"
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
              >
                <MenuItem value="Permanent">Permanent</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
                {/* <MenuItem value="Temporary">Temporary</MenuItem> */}
              </TextField>
            </Grid>

            {/* STATUS */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                fullWidth
                label="Status"
                name="employment_status"
                value={formData.employment_status}
                onChange={handleChange}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Suspended">Suspended</MenuItem>
                <MenuItem value="Terminated">Terminated</MenuItem>
              </TextField>
            </Grid>

            {/* HIRE DATE */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Hire Date"
                type="date"
                fullWidth
                name="hire_date"
                InputLabelProps={{ shrink: true }}
                value={formData.hire_date}
                onChange={handleChange}
                error={!!errors.hire_date}
                helperText={errors.hire_date}
                required
              />
            </Grid>

            {/* DEPT + POS */}
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

            {/* SALARY STRUCTURE SELECT */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select
                label="Salary Structure"
                fullWidth
                value={selectedStructure}
                onChange={handleStructureChange}
                helperText={
                  selectedStructure
                    ? "Salary locked to structure"
                    : "Select structure to auto-fill salary"
                }
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {structures.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.title} — {s.basic_salary}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* SALARY */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Salary"
                fullWidth
                type="number"
                name="basic_salary"
                value={formData.basic_salary}
                onChange={handleChange}
                InputProps={{ readOnly: !!selectedStructure }}
              />
            </Grid>
          </Grid>

          {/* ACTION BUTTONS */}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              sx={primaryButtonStyle}
            >
              Save Employee
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
