import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Fade,
} from "@mui/material";
import { CheckCircle } from "lucide-react";
import OnboardingStepper from "../../components/OnboardingStepper";

export default function AgentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/agent/login");
    }, 9000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={600}>
          <Paper
            elevation={6}
            sx={{
              p: 5,
              borderRadius: 3,
              textAlign: "center",
              backgroundColor: "#fff",
            }}
          >
            {/* Stepper */}
            <Box sx={{ mb: 4 }}>
              <OnboardingStepper step={3} />
            </Box>

            {/* Success Icon */}
            <CheckCircle
              size={72}
              strokeWidth={1.5}
              style={{ color: "#16a34a", marginBottom: "1rem" }}
            />

            {/* Title */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#1a365d",
                mb: 1.5,
              }}
            >
              Onboarding Complete 🎉
            </Typography>

            {/* Message */}
            <Typography
              variant="body1"
              sx={{
                color: "#4a5568",
                mb: 4,
                px: 1,
                lineHeight: 1.7,
              }}
            >
              Thank you for completing your onboarding process.
              <br />
              Our team will review your documents shortly. You’ll receive an
              email once your account is verified and ready for login.
            </Typography>

            {/* Login Button */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => navigate("/agent/login")}
              sx={{
                py: 1.4,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 500,
                backgroundColor: "#1a365d",
                "&:hover": {
                  backgroundColor: "#2c5282",
                },
              }}
            >
              Go to Agent Login
            </Button>

            {/* Redirect Note */}
            <Typography
              variant="caption"
              sx={{
                mt: 2.5,
                display: "block",
                color: "#718096",
              }}
            >
              You’ll be redirected automatically in a few seconds...
            </Typography>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}
