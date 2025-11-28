import { useMemo } from "react";
import { useQuery } from "react-query";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Divider,
  Grid,
} from "@mui/material";
import api from "../../services/api";

function money(v) {
  const n = Number(v ?? 0);
  return `KES ${n.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MySalaryStructure() {
  // 1) Load assigned structure
  const {
    data: structResp,
    isLoading: isStructLoading,
    isError: isStructError,
    error: structError,
  } = useQuery(
    ["my-salary-structure"],
    () => api.get("/employee/my_salary_structure.php").then((r) => r.data),
    { refetchOnWindowFocus: false }
  );

  // Extract structure safely
  const structure = structResp?.data?.structure ?? null;
  const assignedAt = structResp?.data?.assigned_at ?? null;

  // 2) Call calculation endpoint when structure is available
  const {
    data: calcResp,
    isLoading: isCalcLoading,
    isError: isCalcError,
    error: calcError,
  } = useQuery(
    ["calculate-payroll", structure?.title, structure?.basic_salary, structure?.id],
    async () => {
      // Prepare payload: send raw allowances & benefits as returned by backend (option A)
      const payload = {
        basic: Number(structure.basic_salary) || 0,
        allowances: Array.isArray(structure.allowances) ? structure.allowances : [],
        benefits: Array.isArray(structure.benefits) ? structure.benefits : [],
      };
      const res = await api.post("/calculate_payroll.php", payload);
      return res.data;
    },
    {
      enabled: !!structure, // wait for structure to load
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    }
  );

  // Loading state
  if (isStructLoading)
    return (
      <Box textAlign="center" mt={6}>
        <CircularProgress />
      </Box>
    );

  if (isStructError || !structure)
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Failed to load salary structure.
        </Typography>
        {structError?.message && (
          <Typography variant="body2" color="text.secondary" mt={1}>
            {String(structError.message)}
          </Typography>
        )}
      </Box>
    );

  // calculation result (if available)
  const calc = calcResp?.data ?? calcResp?.data?.data ?? calcResp?.data?.result ?? calcResp?.data;
  // Note: CalculationService returns { success:true, data: { ... } } from calculate_payroll.php,
  // but this hook extracts either resp.data or resp.data.data depending on server shape.
  const breakdown = calcResp?.data?.data ?? calcResp?.data ?? null;

  return (
    <Box p={3}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          My Salary Structure
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>
                    <strong>Title</strong>
                  </TableCell>
                  <TableCell>{structure.title ?? "—"}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <strong>Basic Salary</strong>
                  </TableCell>
                  <TableCell>{money(structure.basic_salary)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <strong>Gross (structure)</strong>
                  </TableCell>
                  <TableCell>{money(structure.gross_salary)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <strong>Net (before statutory)</strong>
                  </TableCell>
                  <TableCell>{money(structure.net_salary)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <strong>Currency</strong>
                  </TableCell>
                  <TableCell>{structure.currency ?? "KES"}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <strong>Effective</strong>
                  </TableCell>
                  <TableCell>
                    {structure.effective_from ?? "—"}{" "}
                    {structure.effective_to ? ` — ${structure.effective_to}` : ""}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <strong>Assigned at</strong>
                  </TableCell>
                  <TableCell>{assignedAt ?? "—"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Allowances & Benefits Summary
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Taxable</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(structure.allowances ?? []).map((a) => (
                  <TableRow key={`al-${a.id}`}>
                    <TableCell>{a.name}</TableCell>
                    <TableCell>{Number(a.taxable) ? "Yes" : "No"}</TableCell>
                    <TableCell align="right">{money(a.amount)}</TableCell>
                  </TableRow>
                ))}

                {(structure.benefits ?? []).map((b) => (
                  <TableRow key={`b-${b.id}`}>
                    <TableCell>{b.name}</TableCell>
                    <TableCell>{Number(b.taxable) ? "Yes" : "No"}</TableCell>
                    <TableCell align="right">{money(b.amount)}</TableCell>
                  </TableRow>
                ))}

                {((structure.allowances ?? []).length === 0 &&
                  (structure.benefits ?? []).length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No allowances or benefits found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Statutory Breakdown (calculated)
        </Typography>

        {isCalcLoading && (
          <Box textAlign="center" my={2}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary" mt={1}>
              Calculating taxes...
            </Typography>
          </Box>
        )}

        {isCalcError && (
          <Typography color="error" variant="body2">
            Failed to calculate statutory deductions. {calcError?.message ? `(${calcError.message})` : ""}
          </Typography>
        )}

        {!isCalcLoading && breakdown && breakdown.success && (
          <Box>
            {/* Top summary */}
            <Table sx={{ mt: 1 }}>
              <TableBody>
                <TableRow>
                  <TableCell><strong>Gross (calculated)</strong></TableCell>
                  <TableCell>{money(breakdown.data?.gross_pay ?? breakdown.gross_pay)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell><strong>Taxable Income</strong></TableCell>
                  <TableCell>{money(breakdown.data?.taxable_income ?? breakdown.taxable_income)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <Table size="small" sx={{ mt: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Deduction</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>PAYE</TableCell>
                  <TableCell align="right">{money(breakdown.data?.paye ?? breakdown.paye)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>NSSF (employee)</TableCell>
                  <TableCell align="right">{money(breakdown.data?.nssf_employee ?? breakdown.nssf_employee)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>NSSF (employer)</TableCell>
                  <TableCell align="right">{money(breakdown.data?.nssf_employer ?? breakdown.nssf_employer)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>SHIF / NHIF</TableCell>
                  <TableCell align="right">{money(breakdown.data?.shif ?? breakdown.shif)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Housing Levy</TableCell>
                  <TableCell align="right">{money(breakdown.data?.housing_levy ?? breakdown.housing_levy)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>Personal Relief</TableCell>
                  <TableCell align="right">{money(breakdown.data?.personal_relief ?? breakdown.personal_relief)}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell><strong>Total Deductions</strong></TableCell>
                  <TableCell align="right"><strong>{money(breakdown.data?.total_deductions ?? breakdown.total_deductions)}</strong></TableCell>
                </TableRow>

                <TableRow>
                  <TableCell><strong>Net Salary (after statutory)</strong></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {money(breakdown.data?.net_salary ?? breakdown.net_salary)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Fallback if calculation endpoint returned non-success shape */}
        {!isCalcLoading && breakdown && !breakdown.success && (
          <Typography color="error" mt={2}>
            Calculation endpoint responded with an error: {breakdown.message ?? "Unknown error"}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
