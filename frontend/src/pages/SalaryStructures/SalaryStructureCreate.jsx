// frontend/src/pages/SalaryStructures/SalaryStructureCreate.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import SalaryStructureForm from '../../components/SalaryStructure/SalaryStructureForm';
import SalaryStructureService from '../../services/salaryStructureService';

export default function SalaryStructureCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    basic_salary: '',
    allowances: [],
    benefits: [],
  });

  const submit = async () => {
    try {
      await SalaryStructureService.create(form);
      toast.success('Salary structure created.');
      navigate('/employer/salary-structures');
    } catch (err) {
      toast.error('Failed to create structure.');
    }
  };

  return (
    <SalaryStructureForm
      form={form}
      setForm={setForm}
      onSubmit={submit}
      isEdit={false}
    />
  );
}
