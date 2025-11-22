import { useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  TextField,
} from '@mui/material';
import { Upload, Cancel } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { employeeService } from '../services/employeeService';
import { primaryButtonStyle } from '../styles/buttonStyles';

export default function ESSDocuments() {
  const navigate = useNavigate();
  const [files, setFiles] = useState({
    id_front: null,
    id_back: null,
    other_document: null,
  });

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles.length > 0) {
      setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const uploadMutation = useMutation(employeeService.uploadDocument, {
    onSuccess: () => {
      toast.success('Documents uploaded successfully!');
      navigate('/ess/home');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload documents');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!files.id_front && !files.id_back && !files.other_document) {
      toast.error('Please select at least one document to upload.');
      return;
    }

    const formData = new FormData();
    Object.keys(files).forEach((key) => {
      if (files[key]) formData.append(key, files[key]);
    });

    uploadMutation.mutate(formData);
  };

  const handleCancel = () => navigate('/ess/home');

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Upload Documents
      </Typography>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}>
            Upload your documents
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                type="file"
                fullWidth
                name="id_front"
                onChange={handleFileChange}
                inputProps={{ accept: 'image/*,application/pdf' }}
                helperText="ID Front"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                type="file"
                fullWidth
                name="id_back"
                onChange={handleFileChange}
                inputProps={{ accept: 'image/*,application/pdf' }}
                helperText="ID Back"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                type="file"
                fullWidth
                name="other_document"
                onChange={handleFileChange}
                inputProps={{ accept: 'image/*,application/pdf' }}
                helperText="Other Document (optional)"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              disabled={uploadMutation.isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Upload />}
              disabled={uploadMutation.isLoading}
              sx={primaryButtonStyle}
            >
              {uploadMutation.isLoading ? 'Uploading...' : 'Upload Documents'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
