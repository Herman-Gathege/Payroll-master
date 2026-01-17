import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import employeeService from "../services/employeeService";
import { useQueryClient } from "react-query";

export default function BulkEmployeeUploadPage() {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [step, setStep] = useState("upload"); // upload | preview | uploading | result
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();

  /* ================= FILE HANDLING ================= */
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!/\.(csv|xlsx|xls)$/i.test(selected.name)) {
      alert("Only CSV or Excel files are allowed");
      return;
    }

    if (selected.size > 2 * 1024 * 1024) {
      alert("Maximum file size is 2MB");
      return;
    }

    setFile(selected);
    setPreviewData(null);
    setUploadResult(null);
    setStep("upload");
  };

  /* ================= PREVIEW ================= */
  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const res = await employeeService.previewBulkUpload(file);
      setPreviewData(res);
      setStep("preview");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to preview CSV");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPLOAD (FIXED) ================= */
  const handleUpload = async () => {
    if (!file) return;

    try {
      setStep("uploading");

      const res = await employeeService.bulkUploadEmployees(file);

      // 🔒 NORMALIZE BACKEND RESPONSE
      const normalizedResult = {
        status:
          res.status ||
          (res.failed > 0 && res.inserted > 0
            ? "partial_success"
            : res.failed > 0
            ? "error"
            : "success"),

        summary: {
          total: res.summary?.total ?? res.total ?? 0,
          inserted: res.summary?.inserted ?? res.inserted ?? 0,
          failed: res.summary?.failed ?? res.failed ?? 0,
        },

        failed_rows: res.failed_rows ?? [],
      };

      setUploadResult(normalizedResult);
      setStep("result");

      queryClient.invalidateQueries("employees");
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
      setStep("preview");
    }
  };

  /* ================= RENDER ================= */
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Bulk Employee Upload
      </Typography>

      {step === "upload" && (
        <UploadCSVCard
          file={file}
          onFileChange={handleFileChange}
          onPreview={handlePreview}
          loading={loading}
        />
      )}

      {step === "preview" && previewData && (
        <>
          <CSVPreviewTable previewData={previewData} />
          <ValidationSummary
            previewData={previewData}
            onConfirm={handleUpload}
            loading={loading}
          />
        </>
      )}

      {step === "uploading" && (
        <Box sx={{ textAlign: "center", mt: 5 }}>
          <CircularProgress />
          <Typography mt={2}>Uploading employees…</Typography>
        </Box>
      )}

      {step === "result" && uploadResult && (
        <UploadResultDialog
          uploadResult={uploadResult}
          onClose={() => {
            setStep("upload");
            setFile(null);
            setPreviewData(null);
            setUploadResult(null);
          }}
        />
      )}
    </Box>
  );
}

/* ================= COMPONENTS ================= */

function UploadCSVCard({ file, onFileChange, onPreview, loading }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6">Select CSV or Excel File</Typography>
        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={onFileChange}
          disabled={!!file}
          style={{ marginTop: 10 }}
        />

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={onPreview}
            disabled={!file || loading}
          >
            Preview CSV
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

function CSVPreviewTable({ previewData }) {
  const rows = previewData?.preview || [];

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">Preview (First 10 Rows)</Typography>

        {previewData?.has_errors && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Some rows contain errors. Fix them before uploading.
          </Alert>
        )}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Row</TableCell>
              <TableCell>Employee No</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.row}
                sx={{
                  bgcolor: row.is_valid
                    ? "rgba(0,128,0,0.06)"
                    : "rgba(255,0,0,0.08)",
                }}
              >
                <TableCell>{row.row}</TableCell>
                <TableCell>{row.employee_no}</TableCell>
                <TableCell>
                  {row.first_name} {row.last_name}
                </TableCell>
                <TableCell>{row.work_email}</TableCell>
                <TableCell>
                  {row.is_valid ? (
                    <Chip label="Valid" size="small" color="success" />
                  ) : (
                    row.errors.map((err, i) => (
                      <Chip
                        key={i}
                        label={err.message || err}
                        size="small"
                        color="error"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ValidationSummary({ previewData, onConfirm, loading }) {
  const rows = previewData.preview || [];
  const failed = rows.filter((r) => !r.is_valid).length;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography>Total previewed rows: {rows.length}</Typography>
        <Typography color={failed ? "error" : "success.main"}>
          Rows with errors: {failed}
        </Typography>
        <Typography color="success.main">
          Rows ready for upload: {rows.length - failed}
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={failed > 0 || loading}
          >
            Confirm Upload
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

function UploadResultDialog({ uploadResult, onClose }) {
  if (!uploadResult || !uploadResult.summary) return null;

  const { summary, status, failed_rows = [] } = uploadResult;

  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitle>Upload Result</DialogTitle>
      <DialogContent>
        <Alert
          severity={
            status === "success"
              ? "success"
              : status === "partial_success"
              ? "warning"
              : "error"
          }
          sx={{ mb: 2 }}
        >
          {status === "success" && "All employees uploaded successfully."}
          {status === "partial_success" &&
            "Some employees were uploaded. Others failed."}
          {status === "error" && "No employees were uploaded."}
        </Alert>

        <Typography>Total Rows: {summary.total}</Typography>
        <Typography>Inserted: {summary.inserted}</Typography>
        <Typography>Failed: {summary.failed}</Typography>

        {failed_rows.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1">Failed Rows</Typography>
            <Table size="small">
              <TableBody>
                {failed_rows.map((row) => (
                  <TableRow key={row.row}>
                    <TableCell>Row {row.row}</TableCell>
                    <TableCell>
                      {row.errors.map((err, i) => (
                        <Chip
                          key={i}
                          label={err.message || err}
                          size="small"
                          color="error"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
