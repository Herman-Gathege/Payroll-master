import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Alert,
} from "@mui/material";
import { completeProfile } from "../../services/agentService";
import OnboardingStepper from "../../components/OnboardingStepper";

export default function AgentProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const agent_id = location.state?.agent_id;

  const [form, setForm] = useState({
    phone: "",
    address: "",
    region: "",
    id_number: "",
    gender: "",
    university_name: "",
    university_email: "",
    university_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!agent_id)
        throw new Error("Missing agent ID. Please restart onboarding.");

      const res = await completeProfile(agent_id, form);
      if (res.success) {
        setMessage("Profile updated successfully!");
        // Redirect to document upload after a short delay
        setTimeout(() => {
          navigate("/agent/onboarding/documents", { state: { agent_id } });
        }, 1500);
      } else {
        setMessage(res.message || "Profile update failed. Try again.");
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
          Complete Your Profile
          <OnboardingStepper step={2} />
        </Typography>

        <Typography
          variant="body2"
          align="center"
          sx={{ color: "var(--gray)", mb: 3 }}
        >
          Fill in your personal, contact, and university details to continue
          onboarding.
        </Typography>

        {!agent_id && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Missing agent ID. Please restart from registration.
          </Alert>
        )}

        {message && (
          <Alert sx={{ mt: 2 }} severity="info">
            {message}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
        >
          {/* Basic Info */}
          {["phone", "address", "region", "id_number"].map((field) => (
            <TextField
              key={field}
              label={field.replace("_", " ").toUpperCase()}
              name={field}
              value={form[field]}
              onChange={handleChange}
              fullWidth
            />
          ))}

          {/* Gender Selector */}
          <TextField
            select
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </TextField>

          {/* University Section */}
          <Typography
            variant="subtitle1"
            sx={{ mt: 3, color: "var(--primary)", fontWeight: 600 }}
          >
            University Information
          </Typography>

          {["university_name", "university_email", "university_id"].map(
            (field) => (
              <TextField
                key={field}
                label={field.replace("_", " ").toUpperCase()}
                name={field}
                value={form[field]}
                onChange={handleChange}
                fullWidth
              />
            )
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={loading || !agent_id}
            sx={{
              mt: 3,
              backgroundColor: "var(--primary)",
              borderRadius: "var(--radius)",
              textTransform: "none",
              fontWeight: 500,
              "&:hover": { backgroundColor: "var(--light-blue)" },
            }}
          >
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </Box>
      </Paper>
    </div>
  );
}
