import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import {
  PlayArrow,
  Download,
  Email,
  Check,
  Settings as SettingsIcon,
  Save,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import payrollService from "../services/payrollService";
import { employeeService } from "../services/employeeService";
import { primaryButtonStyle } from "../styles/buttonStyles";
// import SalaryStructureForm from "../../components/SalaryStructure/SalaryStructureForm";
import SalaryStructureCreate from "./SalaryStructures/SalaryStructureCreate";

export default function Payroll() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Configuration state (preserve existing UI)
  const [config, setConfig] = useState({
    personalRelief: 2400,
    nssfRate: 6,
    nssfEmployerRate: 6,
    nssfUpperLimit: 36000,
    shifRate: 2.75,
    housingLevyRate: 1.5,
    overtimeRate: 150,
    workingHoursPerMonth: 160,
    workingDaysPerMonth: 22,
    companyName: "Evolve",
    companyAddress: "Nairobi, Kenya",
    companyPin: "P000000000A",
    companyEmail: "payroll@evolve.com",
    companyPhone: "+254 700 000000",
  });

  // Employees list (unchanged)
  const { data: employeesData } = useQuery(
    "employees",
    employeeService.getAllEmployees
  );
  const employees = employeesData?.records || [];

  // Payroll records for selected period (Option A: only existing payrolls)
  const { data: payrollData, isLoading: payrollLoading } = useQuery(
    ["payroll", selectedMonth, selectedYear],
    () => payrollService.getPayroll(selectedMonth, selectedYear),
    { refetchOnWindowFocus: false }
  );

  const payrollRecords = payrollData?.data || [];

  // Generate bulk payroll mutation (unchanged behavior)
  const generatePayrollMutation = useMutation(
    (vars) => payrollService.generateBulkPayroll(vars.month, vars.year),
    {
      onSuccess: (res) => {
        toast.success("Payroll generated successfully!");
        queryClient.invalidateQueries(["payroll", selectedMonth, selectedYear]);
      },
      onError: (err) => {
        toast.error("Failed to generate payroll");
        console.error(err);
      },
    }
  );

  const handleConfigChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveConfig = () => {
    localStorage.setItem("payrollConfig", JSON.stringify(config));
    toast.success("Configuration saved successfully!");
  };

  const handleGeneratePayroll = () => {
    if (
      window.confirm(
        `Generate payroll for ${getMonthName(selectedMonth)} ${selectedYear}?`
      )
    ) {
      generatePayrollMutation.mutate({ month: selectedMonth, year: selectedYear });
    }
  };

  const getMonthName = (month) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[month - 1];
  };

  // Row actions
  const handleApprove = async (payrollId) => {
    try {
      const res = await payrollService.approvePayroll(payrollId);
      if (res.success) {
        toast.success("Payroll approved");
        queryClient.invalidateQueries(["payroll", selectedMonth, selectedYear]);
      } else {
        toast.error(res.message || "Failed to approve payroll");
      }
    } catch (e) {
      toast.error("Failed to approve payroll");
    }
  };

  const handleProcessPayment = async (payrollId) => {
    try {
      const res = await payrollService.processPayment(payrollId);
      if (res.success) {
        toast.success("Payment processed");
        queryClient.invalidateQueries(["payroll", selectedMonth, selectedYear]);
      } else {
        toast.error(res.message || "Failed to process payment");
      }
    } catch (e) {
      toast.error("Failed to process payment");
    }
  };

  const handleDownloadPayslip = async (employeeId, month, year) => {
    try {
      const resp = await payrollService.downloadPayslip(employeeId, month, year);
      // resp is axios response with blob
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payslip_${employeeId}_${month}_${year}.html`); // backend returns HTML
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("Failed to download payslip");
    }
  };

  const handleEmailPayslip = async (employeeId, month, year) => {
    try {
      const res = await payrollService.sendPayslip(employeeId, month, year);
      if (res.success) {
        toast.success("Payslip emailed");
      } else {
        toast.error(res.message || "Failed to email payslip");
      }
    } catch (e) {
      toast.error("Failed to email payslip");
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Payroll Management
        </Typography>
        <Box display="flex" gap={2}>
          <TextField
            select
            size="small"
            label="Month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            sx={{ width: 120 }}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <MenuItem key={month} value={month}>
                {getMonthName(month)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            sx={{ width: 100 }}
          >
            {[2024, 2025, 2026].map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        sx={{ mb: 3 }}
      >
        <Tab label="Process Payroll" />
        <Tab label="Configuration" />
        <Tab label="Salary Structures" />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h6">
                  Payroll Period: {getMonthName(selectedMonth)} {selectedYear}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {payrollRecords.length} payroll records
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
                <Button
                  variant="contained"
                  startIcon={<PlayArrow />}
                  onClick={handleGeneratePayroll}
                  disabled={generatePayrollMutation.isLoading}
                  sx={primaryButtonStyle}
                >
                  {generatePayrollMutation.isLoading
                    ? "Processing..."
                    : "Generate Payroll"}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee #</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="right">Gross Pay</TableCell>
                  <TableCell align="right">NSSF</TableCell>
                  <TableCell align="right">SHIF</TableCell>
                  <TableCell align="right">Housing Levy</TableCell>
                  <TableCell align="right">PAYE</TableCell>
                  <TableCell align="right">Total Deductions</TableCell>
                  <TableCell align="right">Net Pay</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payrollLoading && (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
                      Loading payroll...
                    </TableCell>
                  </TableRow>
                )}

                {!payrollLoading && payrollRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} align="center">
                      No payroll records found for this period
                    </TableCell>
                  </TableRow>
                )}

                {!payrollLoading &&
                  payrollRecords.map((row) => {
                    const statusColor =
                      row.status === "approved"
                        ? "success"
                        : row.status === "paid"
                        ? "primary"
                        : "warning";
                    return (
                      <TableRow key={row.id}>
                        <TableCell>{row.employee_number ?? row.employee_id}</TableCell>
                        <TableCell>{row.employee_name ?? row.employee}</TableCell>
                        <TableCell align="right">KES {parseFloat(row.gross_pay).toLocaleString()}</TableCell>
                        <TableCell align="right">KES {parseFloat(row.nssf_employee || 0).toLocaleString()}</TableCell>
                        <TableCell align="right">KES {parseFloat(row.shif || 0).toLocaleString()}</TableCell>
                        <TableCell align="right">KES {parseFloat(row.housing_levy || 0).toLocaleString()}</TableCell>
                        <TableCell align="right">KES {parseFloat(row.paye || 0).toLocaleString()}</TableCell>
                        <TableCell align="right">KES {parseFloat(row.total_deductions || 0).toLocaleString()}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          KES {parseFloat(row.net_pay || 0).toLocaleString()}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={row.status ?? 'draft'} size="small" color={statusColor} />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" title="Download Payslip" onClick={() => handleDownloadPayslip(row.employee_id, selectedMonth, selectedYear)}>
                            <Download />
                          </IconButton>
                          <IconButton size="small" title="Email Payslip" onClick={() => handleEmailPayslip(row.employee_id, selectedMonth, selectedYear)}>
                            <Email />
                          </IconButton>
                          {row.status !== 'approved' && (
                            <IconButton size="small" title="Approve" onClick={() => handleApprove(row.id)}>
                              <Check />
                            </IconButton>
                          )}
                          {row.status === 'approved' && (
                            <IconButton size="small" title="Mark Paid" onClick={() => handleProcessPayment(row.id)}>
                              <SettingsIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 4 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "primary.main", fontWeight: 600 }}
          >
            Tax & Statutory Deductions
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Personal Relief (Monthly)"
                type="number"
                value={config.personalRelief}
                onChange={(e) =>
                  handleConfigChange(
                    "personalRelief",
                    parseFloat(e.target.value)
                  )
                }
                InputProps={{ startAdornment: "KES " }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="NSSF Rate (%)"
                type="number"
                value={config.nssfRate}
                onChange={(e) =>
                  handleConfigChange("nssfRate", parseFloat(e.target.value))
                }
                InputProps={{ endAdornment: "%" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="NSSF Upper Limit"
                type="number"
                value={config.nssfUpperLimit}
                onChange={(e) =>
                  handleConfigChange(
                    "nssfUpperLimit",
                    parseFloat(e.target.value)
                  )
                }
                InputProps={{ startAdornment: "KES " }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="SHIF Rate (%)"
                type="number"
                value={config.shifRate}
                onChange={(e) =>
                  handleConfigChange("shifRate", parseFloat(e.target.value))
                }
                InputProps={{ endAdornment: "%" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Housing Levy Rate (%)"
                type="number"
                value={config.housingLevyRate}
                onChange={(e) =>
                  handleConfigChange(
                    "housingLevyRate",
                    parseFloat(e.target.value)
                  )
                }
                InputProps={{ endAdornment: "%" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Overtime Rate (%)"
                type="number"
                value={config.overtimeRate}
                onChange={(e) =>
                  handleConfigChange("overtimeRate", parseFloat(e.target.value))
                }
                InputProps={{ endAdornment: "%" }}
              />
            </Grid>
          </Grid>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "primary.main", fontWeight: 600, mt: 4 }}
          >
            Working Hours
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Working Hours Per Month"
                type="number"
                value={config.workingHoursPerMonth}
                onChange={(e) =>
                  handleConfigChange(
                    "workingHoursPerMonth",
                    parseInt(e.target.value)
                  )
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Working Days Per Month"
                type="number"
                value={config.workingDaysPerMonth}
                onChange={(e) =>
                  handleConfigChange(
                    "workingDaysPerMonth",
                    parseInt(e.target.value)
                  )
                }
              />
            </Grid>
          </Grid>

          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "primary.main", fontWeight: 600, mt: 4 }}
          >
            Company Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={config.companyName}
                onChange={(e) =>
                  handleConfigChange("companyName", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company PIN"
                value={config.companyPin}
                onChange={(e) =>
                  handleConfigChange("companyPin", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Address"
                value={config.companyAddress}
                onChange={(e) =>
                  handleConfigChange("companyAddress", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Email"
                type="email"
                value={config.companyEmail}
                onChange={(e) =>
                  handleConfigChange("companyEmail", e.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Phone"
                value={config.companyPhone}
                onChange={(e) =>
                  handleConfigChange("companyPhone", e.target.value)
                }
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveConfig}
              sx={primaryButtonStyle}
            >
              Save Configuration
            </Button>
          </Box>
        </Paper>
      )}

      {activeTab === 2 && (
        <Box sx={{ p: 2 }}>
          <SalaryStructureCreate />
        </Box>
      )}
    </Box>
  );
}
