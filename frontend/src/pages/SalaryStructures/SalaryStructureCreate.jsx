import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Box, Button, Typography } from "@mui/material"; // <-- add this
import SalaryStructureForm from "../../components/SalaryStructure/SalaryStructureForm";
import SalaryStructureService from "../../services/salaryStructureService";

export default function SalaryStructureCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    basic_salary: "",
    allowances: [],
    benefits: [],
  });

  const submit = async () => {
    try {
      await SalaryStructureService.create(form);
      toast.success("Salary structure created.");
      navigate("/employer/salary-structures");
    } catch (err) {
      toast.error("Failed to create structure.");
    }
  };

  return (
    <Box p={3}>
      {/* Top header with Back to List */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Create Salary Structure</Typography>

        <Button
          variant="outlined"
          onClick={() => navigate("/employer/salary-structures")}
        >
          Go to List
        </Button>
      </Box>

      {/* The Form */}
      <SalaryStructureForm
        form={form}
        setForm={setForm}
        onSubmit={submit}
        isEdit={false}
      />
    </Box>
  );
}
