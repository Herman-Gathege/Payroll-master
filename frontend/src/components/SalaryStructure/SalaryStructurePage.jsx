// frontend/src/components/SalaryStructure/SalaryStructurePage.jsx
import { useEffect, useState } from "react";
import {
Box,
Button,
Paper,
Typography,
Table,
TableHead,
TableBody,
TableCell,
TableRow,
IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import SalaryStructureForm from "./SalaryStructureForm";
import {
getAllStructures,
createStructure,
updateStructure,
deleteStructure,
} from "../../services/salaryStructureService";

export default function SalaryStructurePage() {
const initialForm = {
title: "",
basic_salary: 0,
description: "",
allowances: [],
benefits: [],
};

const [structures, setStructures] = useState([]);
const [formOpen, setFormOpen] = useState(false);
const [selectedStructure, setSelectedStructure] = useState(null);
const [form, setForm] = useState(initialForm);

// Fetch all structures
const fetchStructures = async () => {
const data = await getAllStructures();
setStructures(data || []);
};

useEffect(() => {
fetchStructures();
}, []);

// Open form for edit
const handleEdit = (structure) => {
setSelectedStructure(structure);
setForm({
title: structure.title,
basic_salary: structure.basic_salary,
description: structure.description || "",
allowances: structure.allowances || [],
benefits: structure.benefits || [],
});
setFormOpen(true);
};

// Delete structure
const handleDelete = async (id) => {
if (!window.confirm("Are you sure you want to delete this structure?")) return;
await deleteStructure(id);
fetchStructures();
};

// Form submit (create or update)
const handleFormSubmit = async () => {
if (selectedStructure) {
await updateStructure(selectedStructure.id, form);
} else {
await createStructure(form);
}
fetchStructures();
setForm(initialForm);
setSelectedStructure(null);
setFormOpen(false);
};

// Open empty form for create
const handleCreate = () => {
setSelectedStructure(null);
setForm(initialForm);
setFormOpen(true);
};

return ( <Box p={3}> <Typography variant="h4" mb={3}>
Salary Structures </Typography>

```
  <Button variant="contained" onClick={handleCreate} sx={{ mb: 3 }}>
    + Create New Structure
  </Button>

  {formOpen && (
    <Box mb={4}>
      <SalaryStructureForm
        form={form}
        setForm={setForm}
        onSubmit={handleFormSubmit}
        isEdit={!!selectedStructure}
      />
    </Box>
  )}

  <Paper>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell>Basic Salary</TableCell>
          <TableCell>Allowances</TableCell>
          <TableCell>Benefits</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {structures.length > 0 ? (
          structures.map((structure) => (
            <TableRow key={structure.id}>
              <TableCell>{structure.title}</TableCell>
              <TableCell>{structure.basic_salary}</TableCell>
              <TableCell>
                {structure.allowances?.length
                  ? structure.allowances.map((a) => a.name).join(", ")
                  : "-"}
              </TableCell>
              <TableCell>
                {structure.benefits?.length
                  ? structure.benefits.map((b) => b.name).join(", ")
                  : "-"}
              </TableCell>
              <TableCell>
                <IconButton color="primary" onClick={() => handleEdit(structure)}>
                  <Edit />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(structure.id)}>
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} align="center">
              No salary structures yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </Paper>
</Box>


);
}
