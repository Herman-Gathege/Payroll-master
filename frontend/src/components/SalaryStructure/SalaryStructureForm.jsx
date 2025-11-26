import {
  Box,
  TextField,
  Typography,
  Button,
  Divider,
  Paper,
} from '@mui/material';
import AllowanceRow from './AllowanceRow';
import BenefitRow from './BenefitRow';

export default function SalaryStructureForm({
  form,
  setForm,
  onSubmit,
  isEdit = false,
}) {
  const addAllowance = () => {
    setForm({
      ...form,
      allowances: [...form.allowances, { name: '', amount: 0, taxable: 1 }],
    });
  };

  const updateAllowance = (index, field, value) => {
    const updated = [...form.allowances];
    updated[index][field] = value;
    setForm({ ...form, allowances: updated });
  };

  const deleteAllowance = (index) => {
    const updated = [...form.allowances];
    updated.splice(index, 1);
    setForm({ ...form, allowances: updated });
  };

  const addBenefit = () => {
    setForm({
      ...form,
      benefits: [
        ...form.benefits,
        { name: '', amount: 0, benefit_type: 'cash', taxable: 0, notes: '' },
      ],
    });
  };

  const updateBenefit = (index, field, value) => {
    const updated = [...form.benefits];
    updated[index][field] = value;
    setForm({ ...form, benefits: updated });
  };

  const deleteBenefit = (index) => {
    const updated = [...form.benefits];
    updated.splice(index, 1);
    setForm({ ...form, benefits: updated });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>
        {isEdit ? 'Edit Salary Structure' : 'Create Salary Structure'}
      </Typography>

      {/* Basic details */}
      <TextField
        label="Title"
        fullWidth
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        sx={{ mb: 2 }}
      />

      <TextField
        label="Basic Salary"
        type="number"
        fullWidth
        value={form.basic_salary}
        onChange={(e) => setForm({ ...form, basic_salary: e.target.value })}
        sx={{ mb: 3 }}
      />

      <Divider sx={{ my: 3 }} />

      {/* Allowances */}
      <Typography variant="subtitle1">Allowances</Typography>
      {form.allowances.map((item, index) => (
        <AllowanceRow
          key={index}
          item={item}
          index={index}
          onChange={updateAllowance}
          onDelete={deleteAllowance}
        />
      ))}
      <Button variant="outlined" onClick={addAllowance} sx={{ mt: 1 }}>
        + Add Allowance
      </Button>

      <Divider sx={{ my: 3 }} />

      {/* Benefits */}
      <Typography variant="subtitle1">Benefits</Typography>
      {form.benefits.map((item, index) => (
        <BenefitRow
          key={index}
          item={item}
          index={index}
          onChange={updateBenefit}
          onDelete={deleteBenefit}
        />
      ))}
      <Button variant="outlined" onClick={addBenefit} sx={{ mt: 1 }}>
        + Add Benefit
      </Button>

      <Box textAlign="right" mt={4}>
        <Button variant="contained" onClick={onSubmit}>
          {isEdit ? 'Update Structure' : 'Create Structure'}
        </Button>
      </Box>
    </Paper>
  );
}
