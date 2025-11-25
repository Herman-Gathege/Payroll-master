import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import { UploadFile,  Visibility } from "@mui/icons-material";
import documentService from "../../services/documentService";

export default function EmployeeDocuments() {
  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    const res = await documentService.getMyDocuments();
    if (res.success) setDocs(res.data);
  };

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file.");

    const res = await documentService.uploadMyDocument(file, title);
    if (res.success) {
      setFile(null);
      setTitle("");
      loadDocs();
    } else {
      alert(res.message);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        My Documents
      </Typography>

      {/* Upload Card */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2 }}>
            Upload New Document
          </Typography>

          <Box
            component="form"
            onSubmit={upload}
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <TextField
              label="Document Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
              sx={{ maxWidth: 300 }}
            />

            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFile />}
              sx={{ height: 56 }}
            >
              Choose File
              <input
                type="file"
                hidden
                onChange={(e) => setFile(e.target.files[0])}
              />
            </Button>

            <Button
              type="submit"
              variant="contained"
              sx={{ height: 56 }}
              disabled={!file}
            >
              Upload
            </Button>
          </Box>

          {file && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Selected: {file.name}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Uploaded At</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {docs.length > 0 ? (
                docs.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell>{doc.uploaded_at}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        href={`${import.meta.env.VITE_API_BASE_URL.replace(
                          "/api",
                          ""
                        )}/${doc.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 2 }}
                    >
                      No documents uploaded yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
