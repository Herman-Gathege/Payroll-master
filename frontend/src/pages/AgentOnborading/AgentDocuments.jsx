import { useState } from "react";
import { Box, Button, Typography, Paper, Alert } from "@mui/material";
import { uploadAgentDocument } from "../../services/agentService";
import { useAuth } from "../../contexts/AuthContext";

export default function AgentDocuments() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState("ID");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return setMessage("Please select a file");

    setLoading(true);
    setMessage("");

    try {
      const res = await uploadAgentDocument(user.id, docType, selectedFile);
      setMessage(res.success ? "Document uploaded successfully!" : res.message);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, mt: 4, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Upload Required Documents
      </Typography>

      {message && <Alert sx={{ mt: 2 }} severity="info">{message}</Alert>}

      <Box component="form" onSubmit={handleUpload} sx={{ mt: 3 }}>
        <label>Document Type:</label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          style={{ display: "block", marginTop: 8, marginBottom: 16, padding: 8, width: "100%" }}
        >
          <option value="ID">National ID</option>
          <option value="KRA">KRA PIN</option>
          <option value="LICENSE">Business License</option>
        </select>

        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          style={{ marginBottom: 16 }}
        />

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Uploading..." : "Upload Document"}
        </Button>
      </Box>
    </Paper>
  );
}
