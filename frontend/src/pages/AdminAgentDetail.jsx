import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchAgentById,
  reviewAgentAdmin,
} from "../services/agentAdminService";
import {
  Box,
  Paper,
  Button,
  TextField,
  Typography,
  Modal,
  Backdrop,
  Fade,
  Divider,
  Chip,
  Grid,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

export default function AdminAgentDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [comment, setComment] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_LINK;

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    const res = await fetchAgentById(id);
    if (res.success) setData(res.data);
  };

  const handleDecision = async (decision) => {
    if (!user) {
      alert("You must be logged in as a reviewer");
      return;
    }

    const res = await reviewAgentAdmin({
      agent_id: id,
      reviewer_id: user.id,
      decision,
      comment,
    });

    if (res.success) {
      alert(res.message);
      navigate("/employer/agents");
    } else {
      alert(res.message || "Failed");
    }
  };

  const handleOpen = (doc) => {
    setSelectedDoc(doc);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedDoc(null);
  };

  if (!data) return <Typography p={4}>Loading agent data...</Typography>;

  const { agent, profile, documents, reviews } = data;

  return (
    <Box sx={{ p: 4, background: "#f9fafc", minHeight: "100vh" }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        ← Back
      </Button>

      {/* Top Summary */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: "#e3f2fd" }}>
        <Typography variant="h5" fontWeight={600}>
          {agent.full_name}
        </Typography>
        <Typography color="text.secondary">{agent.email}</Typography>
        <Typography sx={{ mt: 1 }}>📞 {agent.phone}</Typography>

        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item>
            <Chip label={`Stage: ${agent.onboarding_stage}`} color="info" />
          </Grid>
          <Grid item>
            <Chip
              label={`Status: ${agent.status}`}
              color={
                agent.status === "verified"
                  ? "success"
                  : agent.status === "rejected"
                  ? "error"
                  : "warning"
              }
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Registered on: {new Date(agent.created_at).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last Updated: {new Date(agent.updated_at).toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>

      {/* Quick Summary Section */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: "#f5f9ff" }}>
        <Typography variant="h6" mb={1}>
          Agent Summary
        </Typography>
        <Typography>✅ Documents Uploaded: {documents.length}</Typography>
        <Typography>
          🎓 Education: {profile?.university_name || "N/A"} —{" "}
          {profile?.education_level || "N/A"}
        </Typography>
        <Typography>
          📅 Last Review:{" "}
          {reviews.length
            ? new Date(reviews[0].created_at).toLocaleString()
            : "No reviews yet"}
        </Typography>
      </Paper>

      {/* Profile Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>
          Profile Details
        </Typography>
        {profile ? (
          <Grid container spacing={2} sx={{ color: "text.secondary" }}>
            <Grid item xs={12} sm={6}>
              <p><strong>ID Number:</strong> {profile.id_number}</p>
              <p><strong>Date of Birth:</strong> {profile.date_of_birth}</p>
              <p><strong>Gender:</strong> {profile.gender}</p>
              <p><strong>Address:</strong> {profile.address}</p>
            </Grid>
            <Grid item xs={12} sm={6}>
              <p><strong>Education Level:</strong> {profile.education_level}</p>
              <p><strong>University Name:</strong> {profile.university_name}</p>
              <p><strong>University Email:</strong> {profile.university_email}</p>
              <p><strong>University ID:</strong> {profile.university_id}</p>
              <p><strong>Referred By:</strong> {profile.referred_by}</p>
            </Grid>
          </Grid>
        ) : (
          <Typography>No profile data available.</Typography>
        )}
      </Paper>

      {/* Documents */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>
          Uploaded Documents
        </Typography>
        {documents.length ? (
          documents.map((d) => (
            <Box
              key={d.id}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 1,
                borderBottom: "1px solid #eee",
                "&:last-child": { borderBottom: "none" },
              }}
            >
              <Box>
                <Typography fontWeight={500}>
                  {d.label || d.doc_type.toUpperCase()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Uploaded: {new Date(d.uploaded_at).toLocaleString()}
                </Typography>
              </Box>
              <Box display="flex" gap={1} alignItems="center">
                <Chip
                  label={d.status}
                  size="small"
                  color={
                    d.status === "pending"
                      ? "warning"
                      : d.status === "verified"
                      ? "success"
                      : "error"
                  }
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleOpen(d)}
                >
                  View
                </Button>
              </Box>
            </Box>
          ))
        ) : (
          <Typography>No uploaded documents.</Typography>
        )}
      </Paper>

      {/* Review Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>
          Review Action
        </Typography>
        <TextField
          label="Comment (optional)"
          multiline
          rows={3}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleDecision("approved")}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleDecision("rejected")}
          >
            Reject
          </Button>
        </Box>
      </Paper>

      {/* Review History */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Review History
        </Typography>
        {reviews.length ? (
          reviews.map((r) => (
            <Box key={r.id} mb={1}>
              <Typography>
                <strong>{r.reviewer_username}</strong> — {r.action} —{" "}
                {new Date(r.created_at).toLocaleString()}
              </Typography>
              {r.comment && (
                <Typography color="text.secondary" fontSize={14}>
                  “{r.comment}”
                </Typography>
              )}
              <Divider sx={{ my: 1 }} />
            </Box>
          ))
        ) : (
          <Typography>No reviews recorded.</Typography>
        )}
      </Paper>

      {/* Document Preview Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              borderRadius: 2,
              width: "80%",
              maxHeight: "90vh",
              overflow: "auto",
              p: 2,
            }}
          >
            {selectedDoc && (
              <>
                <Typography variant="h6" mb={2}>
                  {selectedDoc.label || selectedDoc.doc_type.toUpperCase()}
                </Typography>
                {selectedDoc.file_path.match(/\.(pdf)$/i) ? (
                  <iframe
                    src={`${BASE_URL}${selectedDoc.file_path}`}
                    width="100%"
                    height="600px"
                    style={{ border: "none" }}
                    title="Document Preview"
                  ></iframe>
                ) : (
                  <img
                    src={`${BASE_URL}${selectedDoc.file_path}`}
                    alt={selectedDoc.doc_type}
                    style={{
                      width: "100%",
                      maxHeight: "80vh",
                      objectFit: "contain",
                    }}
                  />
                )}
                <Box mt={2} textAlign="right">
                  <Button
                    onClick={handleClose}
                    variant="contained"
                    color="primary"
                  >
                    Close
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
