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
} from "@mui/material";
import payrollService from "../services/payrollService";
import { tableStyles, cardStyles } from "../styles/sharedStyles";

// ---------------- MONEY FORMATTER ---------------- //
function money(v, currency = "KES") {
  const n = Number(v ?? 0);

  const locale =
    currency === "USD" ? "en-US" :
    currency === "EUR" ? "de-DE" :
    currency === "TZS" ? "en-TZ" :
    currency === "UGX" ? "en-UG" :
    "en-KE";

  return `${currency} ${n.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

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

  const p = data?.data?.data; // normalized

  if (!p) return <Typography>No payslip found.</Typography>;

  {/* SECTION HEADER STYLE */}
        const sectionHeader = {
          fontWeight: 600,
          fontSize: "1.1rem",
          mb: 1.5,
          pl: 1,
          borderLeft: "4px solid #1976d2",
        };

  return (
    <Box p={3}>
      <Paper sx={{ p: 3, ...cardStyles }}>

        {/* HEADER */}
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "#1976d2" }}
        >
          Payslip — {p.month}/{p.year}
        </Typography>

        <Divider sx={{ my: 2 }} />

        

        {/* EMPLOYEE DETAILS */}
        <Typography sx={sectionHeader}>Employee Details</Typography>

        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={6}>
            <Typography>Name: {p.employee_name}</Typography>
            <Typography>Employee No: {p.employee_no}</Typography>
            <Typography>Department: {p.department_name}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>Position: {p.position_name}</Typography>
            <Typography>Status: {p.status}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* SALARY SUMMARY */}
        <Typography sx={sectionHeader}>Salary Summary</Typography>

        <Table size="small" sx={tableStyles}>
          <TableBody>
            <TableRow>
              <TableCell><strong>Basic Salary</strong></TableCell>
              <TableCell align="right">
                {money(p.basic_salary, p.currency)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Gross Pay</strong></TableCell>
              <TableCell align="right">
                {money(p.gross_pay, p.currency)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Total Deductions</strong></TableCell>
              <TableCell align="right">
                {money(p.total_deductions, p.currency)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Net Pay</strong></TableCell>
              <TableCell align="right" style={{ fontWeight: 700, color: "#1976d2" }}>
                {money(p.net_pay, p.currency)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Divider sx={{ my: 3 }} />

        {/* ALLOWANCES */}
        <Typography sx={sectionHeader}>Allowances</Typography>

        <Table size="small" sx={tableStyles}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {p.allowances?.length > 0 ? (
              p.allowances.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.name}</TableCell>
                  <TableCell align="right">{money(a.amount, p.currency)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">No allowances</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Divider sx={{ my: 3 }} />

        {/* BENEFITS */}
        <Typography sx={sectionHeader}>Benefits</Typography>

        <Table size="small" sx={tableStyles}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {p.benefits?.length > 0 ? (
              p.benefits.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.name}</TableCell>
                  <TableCell align="right">{money(b.amount, p.currency)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">No benefits</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Divider sx={{ my: 3 }} />

        {/* STATUTORY */}
        <Typography sx={sectionHeader}>Statutory Deductions</Typography>

        <Table size="small" sx={tableStyles}>
          <TableBody>
            <TableRow><TableCell>PAYE</TableCell><TableCell align="right">{money(p.paye, p.currency)}</TableCell></TableRow>
            <TableRow><TableCell>NSSF (Employee)</TableCell><TableCell align="right">{money(p.nssf_employee, p.currency)}</TableCell></TableRow>
            <TableRow><TableCell>NSSF (Employer)</TableCell><TableCell align="right">{money(p.nssf_employer, p.currency)}</TableCell></TableRow>
            <TableRow><TableCell>NHIF / SHIF</TableCell><TableCell align="right">{money(p.shif, p.currency)}</TableCell></TableRow>
            <TableRow><TableCell>Housing Levy</TableCell><TableCell align="right">{money(p.housing_levy, p.currency)}</TableCell></TableRow>
            <TableRow><TableCell>Personal Relief</TableCell><TableCell align="right">{money(p.personal_relief, p.currency)}</TableCell></TableRow>

            <TableRow>
              <TableCell><strong>Total Deductions</strong></TableCell>
              <TableCell align="right" style={{ fontWeight: 700 }}>
                {money(p.total_deductions, p.currency)}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell><strong>Net Salary (after statutory)</strong></TableCell>
              <TableCell align="right" style={{ fontWeight: 800, color: "#1976d2" }}>
                {money(p.net_pay, p.currency)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

      </Paper>
    </Box>
  );
}
