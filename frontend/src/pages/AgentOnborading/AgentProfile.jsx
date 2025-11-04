import { useState } from "react";
import { Box, Button, TextField, Paper, Typography, Alert } from "@mui/material";
import { completeProfile } from "../../services/agentService";
import { useAuth } from "../../contexts/AuthContext";

export default function AgentProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    phone: "",
    address: "",
    region: "",
    id_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await completeProfile(user.id, form);
      if (res.success) setMessage("Profile updated successfully!");
      else setMessage(res.message || "Failed to update profile");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, mt: 4, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Complete Your Profile
      </Typography>

      {message && <Alert sx={{ mt: 2 }} severity="info">{message}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Address"
          name="address"
          value={form.address}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Region"
          name="region"
          value={form.region}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="ID Number"
          name="id_number"
          value={form.id_number}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" sx={{ mt: 3 }} disabled={loading}>
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </Box>
    </Paper>
  );
}
