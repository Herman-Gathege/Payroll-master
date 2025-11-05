import { useState } from "react";
import { Box, Button, Typography, Paper, Alert } from "@mui/material";
import { uploadAgentDocument } from "../../services/agentService";
import { useLocation } from "react-router-dom";
import OnboardingStepper from "../../components/OnboardingStepper";

export default function AgentDocuments() {
  const location = useLocation();
  const agent_id = location.state?.agent_id;
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
      if (!agent_id)
        return setMessage("Missing agent ID. Please restart onboarding.");

      const res = await uploadAgentDocument(agent_id, docType, selectedFile);
      setMessage(res.success ? "Document uploaded successfully!" : res.message);

      if (res.success) {
        setMessage("Document uploaded successfully!");
        setTimeout(() => navigate("/agent/onboarding/success"), 3000);
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--light-gray)",
        minHeight: "100vh",
        paddingTop: "3rem",
      }}
    >
      <Paper
        sx={{
          p: 4,
          maxWidth: 600,
          mx: "auto",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          backgroundColor: "var(--light)",
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          align="center"
          sx={{ color: "var(--primary)", fontWeight: 600 }}
        >
          Upload Required Documents
          <OnboardingStepper step={3} />
        </Typography>

        <Typography
          variant="body2"
          align="center"
          sx={{ color: "var(--gray)", mb: 3 }}
        >
          Ensure your uploaded documents are clear and match your registration
          details.
        </Typography>

        {message && (
          <Alert sx={{ mt: 2 }} severity="info">
            {message}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleUpload}
          sx={{
            mt: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <label
            htmlFor="docType"
            style={{
              color: "var(--accent)",
              fontWeight: 500,
            }}
          >
            Document Type
          </label>

          <select
            id="docType"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius)",
              border: "1px solid var(--gray)",
              color: "var(--accent)",
              transition: "var(--transition)",
            }}
          >
            <option value="ID">National ID</option>
            <option value="KRA">KRA PIN</option>
            <option value="LICENSE">Business License</option>
          </select>

          <label
            htmlFor="fileInput"
            style={{
              color: "var(--accent)",
              fontWeight: 500,
            }}
          >
            Upload File
          </label>

          <input
            id="fileInput"
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            style={{
              padding: "0.5rem",
              borderRadius: "var(--radius)",
              border: "1px solid var(--gray)",
              background: "var(--light-gray)",
            }}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: "var(--primary)",
              borderRadius: "var(--radius)",
              textTransform: "none",
              fontWeight: 500,
              mt: 2,
              "&:hover": { backgroundColor: "var(--light-blue)" },
            }}
          >
            {loading ? "Uploading..." : "Upload Document"}
          </Button>
        </Box>
      </Paper>
    </div>
  );
}
