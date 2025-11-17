import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Work,
  EventAvailable,
  AccessTime,
  Payments,
  Assessment,
  School,
  Settings as SettingsIcon,
  Logout,
  AccountCircle,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 260;

const dashboardMenuItem = [
  { text: "Dashboard", icon: <Dashboard />, path: "/employer/dashboard" },
];

const hrMenuItems = [
  { text: "Employees", icon: <People />, path: "/employer/employees" },
  { text: "Recruitment", icon: <Work />, path: "/employer/recruitment" },
  {
    text: "Leave Management",
    icon: <EventAvailable />,
    path: "/employer/leave",
  },
  { text: "Attendance", icon: <AccessTime />, path: "/employer/attendance" },
  { text: "Performance", icon: <Assessment />, path: "/employer/performance" },
  { text: "Training", icon: <School />, path: "/employer/training" },
];

const payrollMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Payroll', icon: <Payments />, path: '/payroll' },
  { text: 'Reports', icon: <Assessment />, path: '/reports' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
]

const hrMenuItems = [
  { text: 'Employees', icon: <People />, path: '/employees' },
  { text: 'Recruitment', icon: <Work />, path: '/recruitment' },
  { text: 'Leave Management', icon: <EventAvailable />, path: '/leave' },
  { text: 'Attendance', icon: <AccessTime />, path: '/attendance' },
  { text: 'Performance', icon: <Assessment />, path: '/performance' },
  { text: 'Training', icon: <School />, path: '/training' },
]

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const drawer = (
    <div>
      <Toolbar
        sx={{
          background: "linear-gradient(135deg, #1a365d, #2d3748)",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
          >
            <img
              src="/src/assets/lixnet2.png"
              alt="Lixnet Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{ fontWeight: 700, letterSpacing: 1 }}
          >
            Evolve
          </Typography>
        </Box>
      </Toolbar>
      <Divider />

      {/* Dashboard Section */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="overline" sx={{ color: '#718096', fontWeight: 600, fontSize: 11 }}>
          HUMAN RESOURCE
        </Typography>
      </Box>
      <List sx={{ pt: 0 }}>
        {hrMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderLeft: "4px solid transparent",
                "&:hover": {
                  backgroundColor: "rgba(26, 54, 93, 0.05)",
                  borderLeftColor: "#d4af37",
                  color: "#1a365d",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Payroll Section */}
      <Box sx={{ px: 2, pt: 1, pb: 1 }}>
        <Typography
          variant="overline"
          sx={{ color: "#718096", fontWeight: 600, fontSize: 11 }}
        >
          PAYROLL
        </Typography>
      </Box>
      <List sx={{ pt: 0 }}>
        {payrollMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderLeft: "4px solid transparent",
                "&:hover": {
                  backgroundColor: "rgba(26, 54, 93, 0.05)",
                  borderLeftColor: "#d4af37",
                  color: "#1a365d",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      <Divider sx={{ my: 1 }} />

      {/* Agent Management Section */}
      <Box sx={{ px: 2, pt: 1, pb: 1 }}>
        <Typography
          variant="overline"
          sx={{ color: "#718096", fontWeight: 600, fontSize: 11 }}
        >
          AGENT MANAGEMENT
        </Typography>
      </Box>
      <List sx={{ pt: 0 }}>
        {agentManagementMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderLeft: "4px solid transparent",
                "&:hover": {
                  backgroundColor: "rgba(26, 54, 93, 0.05)",
                  borderLeftColor: "#d4af37",
                  color: "#1a365d",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Security Section */}
      <Box sx={{ px: 2, pt: 1, pb: 1 }}>
        <Typography
          variant="overline"
          sx={{ color: "#718096", fontWeight: 600, fontSize: 11 }}
        >
          CONFIGURATION
        </Typography>
      </Box>
      <List sx={{ pt: 0 }}>
        {securityMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderLeft: "4px solid transparent",
                "&:hover": {
                  backgroundColor: "rgba(26, 54, 93, 0.05)",
                  borderLeftColor: "#d4af37",
                  color: "#1a365d",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Employee Portal Section */}
      <Box sx={{ px: 2, pt: 1, pb: 1 }}>
        <Typography
          variant="overline"
          sx={{ color: "#718096", fontWeight: 600, fontSize: 11 }}
        >
          EMPLOYEE SELF-SERVICE
        </Typography>
      </Box>
      <List sx={{ pt: 0 }}>
        {employeePortalMenuItem.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderLeft: "4px solid transparent",
                "&:hover": {
                  backgroundColor: "rgba(26, 54, 93, 0.05)",
                  borderLeftColor: "#d4af37",
                  color: "#1a365d",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Security Section */}
      <Box sx={{ px: 2, pt: 1, pb: 1 }}>
        <Typography variant="overline" sx={{ color: '#718096', fontWeight: 600, fontSize: 11 }}>
          CONFIGURATION
        </Typography>
      </Box>
      <List sx={{ pt: 0 }}>
        {securityMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderLeft: '4px solid transparent',
                '&:hover': {
                  backgroundColor: 'rgba(26, 54, 93, 0.05)',
                  borderLeftColor: '#d4af37',
                  color: '#1a365d'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 1 }} />

      {/* Employee Portal Section */}
      <Box sx={{ px: 2, pt: 1, pb: 1 }}>
        <Typography variant="overline" sx={{ color: '#718096', fontWeight: 600, fontSize: 11 }}>
          EMPLOYEE SELF-SERVICE
        </Typography>
      </Box>
      <List sx={{ pt: 0 }}>
        {employeePortalMenuItem.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              sx={{
                borderLeft: '4px solid transparent',
                '&:hover': {
                  backgroundColor: 'rgba(26, 54, 93, 0.05)',
                  borderLeftColor: '#d4af37',
                  color: '#1a365d'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: "#FFFFFF",
          color: "#2d3748",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" }, color: "#2d3748" }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600, color: "#2d3748" }}
          >
            Payroll Dashboard
          </Typography>
          <IconButton onClick={handleMenuOpen}>
            <Avatar sx={{ width: 32, height: 32, background: "#1a365d" }}>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate("/employee-portal");
              }}
            >
              <AccountCircle sx={{ mr: 1 }} /> My Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
