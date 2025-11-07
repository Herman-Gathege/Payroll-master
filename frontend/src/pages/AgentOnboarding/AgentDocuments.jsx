import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  FormControlLabel,
  Checkbox,
  Link,
} from "@mui/material";
import { uploadAgentDocument } from "../../services/agentService";
import { useLocation, useNavigate } from "react-router-dom";
import OnboardingStepper from "../../components/OnboardingStepper";

export default function AgentDocuments() {
  const location = useLocation();
  const navigate = useNavigate();
  const agent_id = location.state?.agent_id;

  // File states
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [schoolFront, setSchoolFront] = useState(null);
  const [schoolBack, setSchoolBack] = useState(null);
  const [otherDoc, setOtherDoc] = useState(null);
  const [otherDocType, setOtherDocType] = useState("passport");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!acceptedTerms)
      return setMessage("You must accept the terms and conditions.");
    if (!idFront || !idBack)
      return setMessage("Please upload both sides of your national ID.");
    if (!schoolFront || !schoolBack)
      return setMessage("Please upload both sides of your school ID.");

    setLoading(true);
    setMessage("");

    try {
      if (!agent_id)
        return setMessage("Missing agent ID. Please restart onboarding.");

      // Upload required documents
      const uploads = [
        { type: "id_front", file: idFront },
        { type: "id_back", file: idBack },
        { type: "school_front", file: schoolFront },
        { type: "school_back", file: schoolBack },
      ];

      if (otherDoc) {
        uploads.push({ type: otherDocType, file: otherDoc });
      }

      for (const doc of uploads) {
        await uploadAgentDocument(agent_id, doc.type, doc.file);
      }

      setMessage("All required documents uploaded successfully!");
      setTimeout(() => navigate("/agent/onboarding/success"), 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderFileInput = (label, onChange, required = false) => (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 500, color: "var(--accent)" }}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </Typography>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => onChange(e.target.files[0])}
        required={required}
        style={{
          padding: "0.5rem",
          borderRadius: "var(--radius)",
          border: "1px solid var(--gray)",
          background: "var(--light-gray)",
          width: "100%",
        }}
      />
    </Box>
  );

  return (
    <div style={{ background: "var(--light-gray)", minHeight: "100vh", paddingTop: "3rem" }}>
      <Paper
        sx={{
          p: 4,
          maxWidth: 700,
          mx: "auto",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          backgroundColor: "var(--light)",
        }}
      >
        <Typography variant="h5" align="center" sx={{ color: "var(--primary)", fontWeight: 600 }}>
          Upload Required Documents
          <OnboardingStepper step={3} />
        </Typography>

        <Typography variant="body2" align="center" sx={{ color: "var(--gray)", mb: 3 }}>
          Ensure your uploaded documents are clear and legible before submission.
        </Typography>

        {message && (
          <Alert sx={{ mt: 2, mb: 2 }} severity={message.includes("Error") ? "error" : "info"}>
            {message}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleUpload}
          sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* NATIONAL ID */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>
            National ID (Required)
          </Typography>
          {renderFileInput("Front Side", setIdFront, true)}
          {renderFileInput("Back Side", setIdBack, true)}

          {/* SCHOOL ID */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
            School ID (Required)
          </Typography>
          {renderFileInput("Front Side", setSchoolFront, true)}
          {renderFileInput("Back Side", setSchoolBack, true)}

          {/* OTHER DOCUMENTS */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
            Other Documents (Optional)
          </Typography>
          <select
            value={otherDocType}
            onChange={(e) => setOtherDocType(e.target.value)}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius)",
              border: "1px solid var(--gray)",
              color: "var(--accent)",
            }}
          >
            <option value="passport">Passport</option>
            <option value="license">Driving License</option>
            <option value="birth_certificate">Birth Certificate</option>
          </select>
          {renderFileInput("Upload Optional Document", setOtherDoc)}

          {/* TERMS & CONDITIONS */}
          <FormControlLabel
            control={
              <Checkbox
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                required
              />
            }
            label={
              <>
                I agree to the{" "}
                <Link href="#" target="_blank" underline="hover">
                  Terms and Conditions
                </Link>
              </>
            }
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
              mt: 3,
              "&:hover": { backgroundColor: "var(--light-blue)" },
            }}
          >
            {loading ? "Uploading..." : "Submit Documents"}
          </Button>
        </Box>
      </Paper>
    </div>
  );
}
