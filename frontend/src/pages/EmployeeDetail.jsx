// frontend/src/pages/EmployeeDetail.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Stack,
  Button,
} from "@mui/material";
import employeeService from "../services/employeeService";
import documentService from "../services/documentService";

export default function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const res = await employeeService.getEmployee(id);
        if (res.success) setEmployee(res.data);
      } catch (error) {
        console.error("Failed to load employee:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await documentService.getEmployeeDocuments(id);
        if (res.success) setDocuments(res.data);
      } catch (error) {
        console.error("Failed to load employee documents:", error);
      } finally {
        setLoadingDocs(false);
      }
    }

    loadDocs();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!employee) return <Typography>No employee found</Typography>;

  // Extract initials for avatar
  const initials = `${employee.first_name?.charAt(0) || ""}${
    employee.last_name?.charAt(0) || ""
  }`;

  return (
    <Box>
      {/* HEADER WITH AVATAR */}
      <Card
        sx={{
          p: 3,
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 3,
          borderRadius: 3,
        }}
      >
        <Avatar
          sx={{ width: 70, height: 70, bgcolor: "primary.main", fontSize: 32 }}
        >
          {initials}
        </Avatar>

        <Box>
          <Typography variant="h4" fontWeight={700}>
            {employee.full_name}
          </Typography>
          <Typography color="text.secondary">
            {employee.position_title} — {employee.department_name}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          sx={{ ml: "auto" }}
          onClick={() =>
            navigate(`/employer/employees/${employee.id}/salary-structure`)
          }
        >
          Manage Salary Structure
        </Button>
      </Card>

      {/* MAIN GRID */}
      <Grid container spacing={3}>
        {/* PERSONAL INFO */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1.2}>
                <Typography>
                  <strong>Employee No:</strong> {employee.employee_no}
                </Typography>
                <Typography>
                  <strong>Email:</strong> {employee.work_email}
                </Typography>
                <Typography>
                  <strong>Phone:</strong> {employee.phone}
                </Typography>
                <Typography>
                  <strong>DOB:</strong> {employee.date_of_birth}
                </Typography>
                <Typography>
                  <strong>Gender:</strong> {employee.gender}
                </Typography>
                <Typography>
                  <strong>Nationality:</strong> {employee.nationality}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* JOB INFO */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Job Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={1.2}>
                <Typography>
                  <strong>Department:</strong> {employee.department_name}
                </Typography>
                <Typography>
                  <strong>Position:</strong> {employee.position_title}
                </Typography>
                <Typography>
                  <strong>Manager:</strong> {employee.manager_name}
                </Typography>
                <Typography>
                  <strong>Status:</strong> {employee.employment_status}
                </Typography>
                <Typography>
                  <strong>Employment Type:</strong> {employee.employment_type}
                </Typography>
                <Typography>
                  <strong>Salary:</strong> {employee.currency}{" "}
                  {employee.basic_salary}
                </Typography>
                <Typography>
                  <strong>Hire Date:</strong> {employee.hire_date}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* EMPLOYEE DOCUMENTS */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Employee Documents
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {loadingDocs ? (
                <CircularProgress />
              ) : documents.length === 0 ? (
                <Typography>No documents uploaded.</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {documents.map((doc) => {
                    const FILE_BASE_URL =
                      import.meta.env.VITE_API_BASE_URL.replace("/api", "");

                    // Normalize path to avoid double slashes
                    const normalizedPath = doc.file_path.startsWith("/")
                      ? doc.file_path.substring(1)
                      : doc.file_path;

                    const fileUrl = `${FILE_BASE_URL}/${normalizedPath}`;

                    return (
                      <Box
                        key={doc.id}
                        sx={{
                          p: 2,
                          border: "1px solid #eee",
                          borderRadius: 2,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          bgcolor: "#fafafa",
                        }}
                      >
                        <Box>
                          <Typography fontWeight={600}>{doc.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Uploaded: {doc.uploaded_at}
                          </Typography>
                        </Box>

                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            textDecoration: "none",
                            color: "#1976d2",
                            fontWeight: "bold",
                          }}
                        >
                          View
                        </a>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
