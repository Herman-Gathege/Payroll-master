import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Divider,
  CircularProgress,
  Card,
} from "@mui/material";
import payrollService from "../services/payrollService";
import { tableStyles, cardStyles } from "../styles/sharedStyles";

// ---------------- MONEY FORMATTER ---------------- //
function money(v, currency = "KES") {
  const n = Number(v ?? 0);

  const locale =
    currency === "USD"
      ? "en-US"
      : currency === "EUR"
      ? "de-DE"
      : currency === "TZS"
      ? "en-TZ"
      : currency === "UGX"
      ? "en-UG"
      : "en-KE";

  return `${currency} ${n.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ---------------- SECTION HEADER STYLE ---------------- //
const sectionHeader = {
  fontWeight: 600,
  fontSize: "1.15rem",
  mb: 1.5,
  mt: 2,
  pl: 1,
  borderLeft: "4px solid #1976d2",
};

export default function PayslipView() {
  const { payrollId } = useParams();

  const { data, isLoading } = useQuery(
    ["payslip", payrollId],
    () => payrollService.getPayrollById(payrollId),
    { enabled: !!payrollId }
  );

  if (isLoading)
    return (
      <Box textAlign="center" mt={6}>
        <CircularProgress />
      </Box>
    );

  const p = data?.data?.data;

  if (!p) return <Typography>No payslip found.</Typography>;

  return (
    <Box p={3}>
      <Paper sx={{ p: 3, ...cardStyles }}>

        {/* HEADER */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#1976d2",
            textAlign: "center",
            pb: 1,
          }}
        >
          Employee Payslip — {p.month}/{p.year}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* ================= EMPLOYEE DETAILS ================= */}
        <Typography sx={sectionHeader}>Employee Details</Typography>

        <Card sx={{ p: 2, mb: 3, borderRadius: 2, background: "#fafbfd" }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography><strong>Name:</strong> {p.employee_name}</Typography>
              <Typography><strong>Employee No:</strong> {p.employee_no}</Typography>
              <Typography><strong>Department:</strong> {p.department_name}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography><strong>Position:</strong> {p.position_name}</Typography>
              <Typography>
                <strong>Status:</strong>{" "}
                <span style={{ color: p.status === "finalized" ? "green" : "orange" }}>
                  {p.status}
                </span>
              </Typography>
            </Grid>
          </Grid>
        </Card>

        {/* ================= SALARY SUMMARY ================= */}
        <Typography sx={sectionHeader}>Salary Summary</Typography>

        <Card sx={{ p: 2, mb: 3 }}>
          <Table size="small" sx={tableStyles}>
            <TableBody>
              <TableRow>
                <TableCell><strong>Basic Salary</strong></TableCell>
                <TableCell align="right">{money(p.basic_salary, p.currency)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Gross Pay</strong></TableCell>
                <TableCell align="right">{money(p.gross_pay, p.currency)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Total Deductions</strong></TableCell>
                <TableCell align="right">{money(p.total_deductions, p.currency)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>
                  <strong>Net Pay</strong>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, color: "#1976d2" }}
                >
                  {money(p.net_pay, p.currency)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        {/* ================= ALLOWANCES ================= */}
        <Typography sx={sectionHeader}>Allowances</Typography>

        <Card sx={{ p: 2, mb: 3 }}>
          <Table size="small" sx={tableStyles}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {p.allowances?.length ? (
                p.allowances.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.name}</TableCell>
                    <TableCell align="right">{money(a.amount, p.currency)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No allowances
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* ================= BENEFITS ================= */}
        <Typography sx={sectionHeader}>Benefits</Typography>

        <Card sx={{ p: 2, mb: 3 }}>
          <Table size="small" sx={tableStyles}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {p.benefits?.length ? (
                p.benefits.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.name}</TableCell>
                    <TableCell align="right">{money(b.amount, p.currency)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No benefits
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* ================= STATUTORY DEDUCTIONS ================= */}
        <Typography sx={sectionHeader}>Statutory Deductions</Typography>

        <Card sx={{ p: 2, mb: 3 }}>
          <Table size="small" sx={tableStyles}>
            <TableBody>
              <TableRow><TableCell>PAYE</TableCell><TableCell align="right">{money(p.paye, p.currency)}</TableCell></TableRow>
              <TableRow><TableCell>NSSF (Employee)</TableCell><TableCell align="right">{money(p.nssf_employee, p.currency)}</TableCell></TableRow>
              <TableRow><TableCell>SHIF / NHIF</TableCell><TableCell align="right">{money(p.shif, p.currency)}</TableCell></TableRow>
              <TableRow><TableCell>Housing Levy</TableCell><TableCell align="right">{money(p.housing_levy, p.currency)}</TableCell></TableRow>
              <TableRow><TableCell>Personal Relief</TableCell><TableCell align="right">{money(p.personal_relief, p.currency)}</TableCell></TableRow>

              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Total Deductions</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {money(p.total_deductions, p.currency)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>
                  Net Salary (after deductions)
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 800, color: "#1976d2" }}
                >
                  {money(p.net_pay, p.currency)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </Paper>
    </Box>
  );
}
