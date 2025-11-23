import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Work,
  CalendarToday,
  AccountBalance,
  Download,
  Add,
  EventAvailable,
  AccessTime,
  RequestQuote,
  Edit,
  Logout,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { employeeService } from "../services/employeeService";
import payrollService from "../services/payrollService";
import leaveService from "../services/leaveService";
import { useAuth } from "../contexts/AuthContext";
import { primaryButtonStyle } from "../styles/buttonStyles";

const drawerWidth = 240;

export default function EmployeePortal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveRequest, setLeaveRequest] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    email: "",
    phone: "",
  });

  // Fetch logged-in employee's profile data
  const { data: employeeData, isLoading: loadingEmployee } = useQuery(
    "myProfile",
    () => employeeService.getMyProfile(),
    {
      onError: (error) => {
        console.error("Failed to load employee data:", error);
        toast.error("Failed to load employee data");
      },
    }
  );

  const currentEmployee =
    employeeData?.data || employeeData?.employee || employeeData;

  // Fetch payroll data for this employee
  const { data: payrollData } = useQuery(
    ["employeePayroll", currentEmployee?.id],
    () =>
      currentEmployee
        ? payrollService.getEmployeePayroll(currentEmployee.id)
        : null,
    {
      enabled: !!currentEmployee?.id,
    }
  );

  const payslips = payrollData?.records || [];

  // Fetch leave requests from database
  const { data: leaveRequestsData } = useQuery(
    ["leaveRequests", currentEmployee?.id],
    () =>
      currentEmployee
        ? leaveService.getLeaveRequestsByEmployee(currentEmployee.id)
        : null,
    {
      enabled: !!currentEmployee?.id,
    }
  );

  const leaveRequests = leaveRequestsData?.records || [];

  // Fetch leave balance from database
  const { data: leaveBalanceData } = useQuery(
    ["leaveBalance", currentEmployee?.id],
    () =>
      currentEmployee ? leaveService.getLeaveBalance(currentEmployee.id) : null,
    {
      enabled: !!currentEmployee?.id,
    }
  );

  const leaveBalance = leaveBalanceData?.balance || {
    annual: { total: 21, used: 0, remaining: 21 },
    sick: { total: 14, used: 0, remaining: 14 },
    maternity: { total: 90, used: 0, remaining: 90 },
  };

  // Mock attendance data - in production, fetch from API
  const attendanceRecords = [
    {
      id: 1,
      date: "2025-10-14",
      checkIn: "08:00 AM",
      checkOut: "05:00 PM",
      hours: 9,
      status: "Present",
    },
    {
      id: 2,
      date: "2025-10-13",
      checkIn: "08:05 AM",
      checkOut: "05:10 PM",
      hours: 9,
      status: "Present",
    },
    {
      id: 3,
      date: "2025-10-12",
      checkIn: "08:00 AM",
      checkOut: "05:00 PM",
      hours: 9,
      status: "Present",
    },
    {
      id: 4,
      date: "2025-10-11",
      checkIn: "08:15 AM",
      checkOut: "05:00 PM",
      hours: 8.75,
      status: "Late",
    },
    {
      id: 5,
      date: "2025-10-10",
      checkIn: "08:00 AM",
      checkOut: "05:00 PM",
      hours: 9,
      status: "Present",
    },
  ];

  // Mutation for creating leave request
  const createLeaveRequestMutation = useMutation(
    (leaveData) => leaveService.createLeaveRequest(leaveData),
    {
      onSuccess: () => {
        toast.success("Leave request submitted successfully!");
        queryClient.invalidateQueries(["leaveRequests", currentEmployee?.id]);
        queryClient.invalidateQueries("leaveRequests");
        setLeaveDialogOpen(false);
        setLeaveRequest({
          leaveType: "",
          startDate: "",
          endDate: "",
          reason: "",
        });
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to submit leave request"
        );
      },
    }
  );

  const updateProfileMutation = useMutation(
    (data) => employeeService.updateMyProfile(data),
    {
      onSuccess: () => {
        toast.success("Profile updated successfully");
        queryClient.invalidateQueries("myProfile");
        setEditDialogOpen(false);
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to update profile"
        );
      },
    }
  );

  const handleLeaveRequest = () => {
    if (
      !leaveRequest.leaveType ||
      !leaveRequest.startDate ||
      !leaveRequest.endDate ||
      !leaveRequest.reason
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!currentEmployee?.id) {
      toast.error("Employee information not available");
      return;
    }

    // Calculate number of days
    const start = new Date(leaveRequest.startDate);
    const end = new Date(leaveRequest.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const leaveData = {
      employee_id: currentEmployee.id,
      leave_type: leaveRequest.leaveType,
      start_date: leaveRequest.startDate,
      end_date: leaveRequest.endDate,
      days: days,
      reason: leaveRequest.reason,
      status: "pending",
    };

    createLeaveRequestMutation.mutate(leaveData);
  };

  const handleDownloadPayslip = (payslipId) => {
    toast.info("Downloading payslip...");
    if (currentEmployee) {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      payrollService.downloadPayslip(
        currentEmployee.id,
        currentMonth,
        currentYear
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/employee/login");
  };

  const menuItems = [
    { id: "profile", label: "My Profile", icon: <Person /> },
    { id: "payslips", label: "Payslips", icon: <RequestQuote /> },
    { id: "leave", label: "Leave Management", icon: <EventAvailable /> },
    { id: "attendance", label: "Attendance", icon: <AccessTime /> },
  ];

  const drawer = (
    <Box>
      <Box
        sx={{
          p: 2,
          textAlign: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Avatar
          sx={{
            width: 60,
            height: 60,
            bgcolor: "#11998e",
            fontSize: 24,
            mx: "auto",
            mb: 1,
          }}
        >
          {currentEmployee?.first_name?.charAt(0) ||
            user?.username?.charAt(0) ||
            "E"}
        </Avatar>
        <Typography variant="subtitle1" fontWeight={600}>
          {currentEmployee?.first_name} {currentEmployee?.last_name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Employee Portal
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 2 }} />
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  if (loadingEmployee) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!currentEmployee) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No employee data available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Unable to load your profile. Please contact HR.
          </Typography>
          <Button variant="contained" onClick={handleLogout}>
            Logout
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile AppBar */}
      <AppBar
        position="fixed"
        sx={{
          display: { sm: "none" },
          width: "100%",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Employee Portal
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(!mobileOpen)}
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
        {/* Desktop drawer */}
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

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 7, sm: 0 },
        }}
      >
        {/* Header */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: "linear-gradient(135deg, #11998e 0%, #0d7a6f 100%)",
            color: "white",
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "white",
                  color: "#11998e",
                  fontSize: 32,
                  fontWeight: 700,
                }}
              >
                {currentEmployee.first_name?.charAt(0)}
                {currentEmployee.last_name?.charAt(0)}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                {currentEmployee.first_name} {currentEmployee.last_name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                {currentEmployee.position_title || "Position"} •{" "}
                {currentEmployee.department_name || "Department"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Employee ID: {currentEmployee.employee_no || "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* My Profile Tab */}
        {activeTab === "profile" && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Personal Information
                  </Typography>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      setEditForm({
                        email:
                          currentEmployee.work_email ||
                          currentEmployee.personal_email ||
                          "",
                        phone: currentEmployee.phone || "",
                      });
                      setEditDialogOpen(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Email color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body2">
                        {currentEmployee.work_email ||
                          currentEmployee.personal_email ||
                          "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Phone color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body2">
                        {currentEmployee.phone || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Work color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Position
                      </Typography>
                      <Typography variant="body2">
                        {currentEmployee.position_title || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <CalendarToday color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Join Date
                      </Typography>
                      <Typography variant="body2">
                        {currentEmployee.hire_date || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <LocationOn color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body2">
                        {currentEmployee.residential_address || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Banking Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <AccountBalance color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Bank Name
                      </Typography>
                      <Typography variant="body2">
                        {currentEmployee.bank_name || "Not provided"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <AccountBalance color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Account Number
                      </Typography>
                      <Typography variant="body2">
                        {currentEmployee.bank_account_number || "Not provided"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>

              <Paper
                sx={{
                  p: 3,
                  background:
                    "linear-gradient(135deg, #11998e 0%, #0d7a6f 100%)",
                  color: "white",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Employment Status
                </Typography>
                <Chip
                  label={currentEmployee.employment_status || "Active"}
                  sx={{ bgcolor: "white", color: "#11998e", fontWeight: 600 }}
                />
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ mt: 2, opacity: 0.9 }}
                >
                  Department: {currentEmployee.department_name || "N/A"}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Payslips Tab */}
        {activeTab === "payslips" && (
          <Paper sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                My Payslips
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    <TableCell align="right">Gross Pay</TableCell>
                    <TableCell align="right">Net Pay</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payslips.length > 0 ? (
                    payslips.map((payslip) => (
                      <TableRow key={payslip.id}>
                        <TableCell>
                          {new Date(payslip.period_month, 0).toLocaleString(
                            "default",
                            { month: "long" }
                          )}{" "}
                          {payslip.period_year}
                        </TableCell>
                        <TableCell align="right">
                          KES{" "}
                          {parseFloat(payslip.gross_pay || 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          KES{" "}
                          {parseFloat(payslip.net_pay || 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label="Paid" color="success" size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleDownloadPayslip(payslip.id)}
                          >
                            <Download />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No payslips available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Leave Management Tab */}
        {activeTab === "leave" && (
          <Box>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                    color: "white",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Annual Leave
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {leaveBalance.annual.remaining}
                    </Typography>
                    <Typography variant="body2">Days Remaining</Typography>
                    <Typography variant="caption">
                      Used: {leaveBalance.annual.used} /{" "}
                      {leaveBalance.annual.total}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    color: "white",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Sick Leave
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {leaveBalance.sick.remaining}
                    </Typography>
                    <Typography variant="body2">Days Remaining</Typography>
                    <Typography variant="caption">
                      Used: {leaveBalance.sick.used} / {leaveBalance.sick.total}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    background:
                      "linear-gradient(135deg, #11998e 0%, #0d7a6f 100%)",
                    color: "white",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Maternity Leave
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {leaveBalance.maternity.remaining}
                    </Typography>
                    <Typography variant="body2">Days Remaining</Typography>
                    <Typography variant="caption">
                      Used: {leaveBalance.maternity.used} /{" "}
                      {leaveBalance.maternity.total}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper sx={{ p: 3 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  My Leave Requests
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setLeaveDialogOpen(true)}
                  sx={{
                    ...primaryButtonStyle,
                    backgroundColor: "#11998e",
                    "&:hover": { backgroundColor: "#0d7a6f" },
                  }}
                >
                  New Request
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Leave Type</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell align="center">Days</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaveRequests.length > 0 ? (
                      leaveRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            {request.type || request.leave_type}
                          </TableCell>
                          <TableCell>
                            {request.startDate || request.start_date}
                          </TableCell>
                          <TableCell>
                            {request.endDate || request.end_date}
                          </TableCell>
                          <TableCell align="center">{request.days}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={request.status}
                              color={
                                request.status === "approved"
                                  ? "success"
                                  : request.status === "pending"
                                  ? "warning"
                                  : "default"
                              }
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No leave requests
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              My Attendance Records
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell align="center">Hours Worked</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.checkIn}</TableCell>
                      <TableCell>{record.checkOut}</TableCell>
                      <TableCell align="center">{record.hours} hrs</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={record.status}
                          color={
                            record.status === "Present" ? "success" : "warning"
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Leave Request Dialog */}
        <Dialog
          open={leaveDialogOpen}
          onClose={() => setLeaveDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>New Leave Request</DialogTitle>
          <DialogContent>
            <Box
              sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                select
                fullWidth
                label="Leave Type"
                value={leaveRequest.leaveType}
                onChange={(e) =>
                  setLeaveRequest({
                    ...leaveRequest,
                    leaveType: e.target.value,
                  })
                }
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                <option value="Annual Leave">Annual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Maternity Leave">Maternity Leave</option>
                <option value="Paternity Leave">Paternity Leave</option>
              </TextField>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={leaveRequest.startDate}
                onChange={(e) =>
                  setLeaveRequest({
                    ...leaveRequest,
                    startDate: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={leaveRequest.endDate}
                onChange={(e) =>
                  setLeaveRequest({ ...leaveRequest, endDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason"
                value={leaveRequest.reason}
                onChange={(e) =>
                  setLeaveRequest({ ...leaveRequest, reason: e.target.value })
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLeaveDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleLeaveRequest}
              sx={{
                backgroundColor: "#11998e",
                "&:hover": { backgroundColor: "#0d7a6f" },
              }}
            >
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
          <DialogTitle>Edit Contact Information</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
            />
            <TextField
              fullWidth
              margin="normal"
              label="Phone Number"
              value={editForm.phone}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() =>
                updateProfileMutation.mutate({
                  email: editForm.email,
                  phone: editForm.phone,
                })
              }
              disabled={updateProfileMutation.isLoading}
            >
              {updateProfileMutation.isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
