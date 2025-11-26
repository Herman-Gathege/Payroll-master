import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import SalaryStructureService from '../../services/salaryStructureService';

export default function SalaryStructuresList() {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery(
    ['salary-structures'],
    () => SalaryStructureService.list().then(res => res.data)
  );

  return (
    <Box p={3}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Salary Structures</Typography>
          <Button variant="contained" onClick={() => navigate('/employer/salary-structures/create')}>
            Create Structure
          </Button>
        </Box>

        {isLoading ? (
          <Box textAlign="center" mt={4}><CircularProgress /></Box>
        ) : isError ? (
          <Typography color="error" mt={2}>Failed to load salary structures.</Typography>
        ) : (
          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Basic Salary</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Active From</TableCell>
                <TableCell>Active To</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {data?.structures?.length > 0 ? (
                data.structures.map(struct => (
                  <TableRow key={struct.id}>
                    <TableCell>{struct.title}</TableCell>
                    <TableCell>{struct.basic_salary}</TableCell>
                    <TableCell>{struct.status}</TableCell>
                    <TableCell>{struct.active_from || '-'}</TableCell>
                    <TableCell>{struct.active_to || '-'}</TableCell>

                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(`/employer/salary-structures/${struct.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">No structures found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
