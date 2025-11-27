// frontend/src/components/SalaryStructure/AllowanceRow.jsx
import { Box, TextField, IconButton, Checkbox } from '@mui/material';
import { Delete } from '@mui/icons-material';

export default function AllowanceRow({ item, index, onChange, onDelete }) {
  return (
    <Box display="flex" gap={2} alignItems="center" mt={1}>
      <TextField
        label="Allowance Name"
        value={item.name}
        onChange={e => onChange(index, 'name', e.target.value)}
        fullWidth
      />

      <TextField
        label="Amount"
        type="number"
        value={item.amount}
        onChange={e => onChange(index, 'amount', e.target.value)}
        sx={{ width: 150 }}
      />

      <Box textAlign="center">
        <Typography variant="caption">Taxable</Typography>
        <Checkbox
          checked={item.taxable === 1}
          onChange={e => onChange(index, 'taxable', e.target.checked ? 1 : 0)}
        />
      </Box>

      <IconButton color="error" onClick={() => onDelete(index)}>
        <Delete />
      </IconButton>
    </Box>
  );
}
