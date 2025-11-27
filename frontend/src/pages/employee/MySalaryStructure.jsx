// MySalaryStructure.jsx — FINAL CLEAN VERSION
import { useQuery } from "react-query";
import { Box, Paper, Typography, Table, TableHead, TableBody, TableRow, TableCell, CircularProgress } from "@mui/material";
import api from "../../services/api";

export default function MySalaryStructure() {
  const { data, isLoading, isError } = useQuery(
    ["my-salary-structure"],
    () => api.get("/employee/my_salary_structure.php").then(res => res.data), // ← NO QUERY PARAM!
    { refetchOnWindowFocus: false }
  );

  if (isLoading) return <Box textAlign="center" mt={4}><CircularProgress /></Box>;
  if (isError || !data?.success) return <Typography color="error">Failed to load salary structure.</Typography>;

  const s = data.data.structure;

  return (
    <Box p={3}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>My Salary Structure</Typography>

        <Table sx={{ mt: 3 }}>
          <TableBody>
            <TableRow><TableCell><strong>Title</strong></TableCell><TableCell>{s.title}</TableCell></TableRow>
            <TableRow><TableCell><strong>Basic Salary</strong></TableCell><TableCell>KES {s.basic_salary.toLocaleString()}</TableCell></TableRow>
            <TableRow><TableCell><strong>Gross Salary</strong></TableCell><TableCell>KES {s.gross_salary.toLocaleString()}</TableCell></TableRow>
            <TableRow><TableCell><strong>Net Salary (before tax)</strong></TableCell><TableCell>KES {s.net_salary.toLocaleString()}</TableCell></TableRow>
          </TableBody>
        </Table>

        {s.allowances?.length > 0 && (
          <>
            <Typography variant="h6" mt={4}>Allowances</Typography>
            <Table size="small">
              <TableHead><TableRow><TableCell>Name</TableCell><TableCell align="right">Amount</TableCell></TableRow></TableHead>
              <TableBody>
                {s.allowances.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{a.name}</TableCell>
                    <TableCell align="right">KES {parseFloat(a.amount).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {s.benefits?.length > 0 && (
          <>
            <Typography variant="h6" mt={4}>Benefits</Typography>
            <Table size="small">
              <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Type</TableCell><TableCell align="right">Amount</TableCell></TableRow></TableHead>
              <TableBody>
                {s.benefits.map(b => (
                  <TableRow key={b.id}>
                    <TableCell>{b.name}</TableCell>
                    <TableCell>{b.benefit_type}</TableCell>
                    <TableCell align="right">KES {parseFloat(b.amount).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Paper>
    </Box>
  );
}