// frontend/src/pages/SalaryStructures/SalaryStructureEdit.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CircularProgress, Box } from '@mui/material';
import SalaryStructureForm from '../../components/SalaryStructure/SalaryStructureForm';
import SalaryStructureService from '../../services/salaryStructureService';

export default function SalaryStructureEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);

  useEffect(() => {
  SalaryStructureService.get(id)
    .then(res => {
      const payload = res.data.structure || res.data.data || res.data;
      setForm(payload);
    })
    .catch(() => toast.error('Failed to load structure.'));
}, [id]);


  const submit = async () => {
    try {
      await SalaryStructureService.update(id, form);
      toast.success('Updated successfully.');
      navigate('/employer/salary-structures');
    } catch (err) {
      toast.error('Update failed.');
    }
  };

  if (!form) return (
    <Box textAlign="center" mt={4}>
      <CircularProgress />
    </Box>
  );

  return (
    <SalaryStructureForm
      form={form}
      setForm={setForm}
      onSubmit={submit}
      isEdit={true}
    />
  );
}
