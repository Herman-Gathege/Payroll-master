import { useEffect, useState } from "react";
import { Box, Grid, Paper, Typography, CircularProgress, Divider } from "@mui/material";
import { TrendingUp, Users, Wallet } from "lucide-react";

export default function AgentDashboard() {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("agent_token");
    fetch(`${import.meta.env.VITE_API_BASE_LINK || "http://localhost:8000"}/api/agent/dashboard.php`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setAgent(data.agent);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );

  return (
    <Box>
      {/* Welcome */}
      <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a365d", mb: 2 }}>
        Welcome, {agent?.full_name || "Agent"}
      </Typography>
      <Typography variant="subtitle1" sx={{ color: "#718096", mb: 4 }}>
        Here’s an overview of your current performance.
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderLeft: "5px solid #1a365d",
              backgroundColor: "#f8fafc",
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Users size={36} color="#1a365d" />
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  48
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Clients
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderLeft: "5px solid #d4af37",
              backgroundColor: "#fefce8",
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <TrendingUp size={36} color="#d4af37" />
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  12
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  New Leads This Month
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderLeft: "5px solid #38a169",
              backgroundColor: "#f0fff4",
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Wallet size={36} color="#38a169" />
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  KES 45,200
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Commission Earned
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Performance Chart */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Monthly Performance
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <iframe
          title="performance-chart"
          style={{ border: "none", width: "100%", height: "300px" }}
          src="https://charts.mongodb.com/charts-project-0-qgkbi/embed/charts?id=65518a32-c31a-4892-821a-78c6d93cd123&theme=light"
        ></iframe>
      </Paper>

      {/* Recent Activity */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Recent Sales Activity
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box>
          {[
            { client: "Jirani Shop POS", date: "Nov 7, 2025", amount: "KES 5,000" },
            { client: "Afya Chemist", date: "Nov 4, 2025", amount: "KES 2,500" },
            { client: "Mama Mboga App", date: "Nov 3, 2025", amount: "KES 3,800" },
          ].map((s, i) => (
            <Box
              key={i}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                py: 1.5,
                borderBottom: i < 2 ? "1px solid #edf2f7" : "none",
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {s.client}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {s.date}
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: "#1a365d" }}>
                {s.amount}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
