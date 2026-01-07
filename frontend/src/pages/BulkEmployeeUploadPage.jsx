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
} from "@mui/material";
import employeeService from "../services/employeeService";

export default function BulkEmployeeUploadPage() {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [step, setStep] = useState("upload"); // upload | preview | uploading | result
  const [loading, setLoading] = useState(false);

  /* ================= FILE HANDLING ================= */
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.name.endsWith(".csv")) {
      alert("Only CSV files are allowed");
      return;
    }

    if (selected.size > 2 * 1024 * 1024) {
      alert("Maximum file size is 2MB");
      return;
    }

    setFile(selected);
    setPreviewData(null);
    setStep("upload");
  };

  /* ================= PREVIEW ================= */
  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const res = await employeeService.previewBulkUpload(file);
      console.log("Preview data:", res);
      setPreviewData(res);
      setStep("preview");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to preview CSV");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPLOAD ================= */
  const handleUpload = async () => {
    if (!file) return;

    try {
      setStep("uploading");

      const result = await employeeService.bulkUploadEmployees(file);

      setUploadResult(result);
      setStep("result");
    } catch (err) {
      console.error(err);
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
        <Typography variant="h6">Select CSV File</Typography>
        <input
          type="file"
          accept=".csv"
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
        <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
          CSV headers must match required employee fields.
        </Typography>
      </CardContent>
    </Card>
  );
}

function CSVPreviewTable({ previewData }) {
  const rows = previewData?.preview || [];

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Preview (First 10 Rows)
        </Typography>
        {rows.length === 0 ? (
          <Typography>No preview available.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Row #</TableCell>
                <TableCell>Employee No</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Errors</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow
                  key={row.employee_no || index} // use employee_no if unique
                  sx={{
                    bgcolor: row.errors?.length
                      ? "rgba(255,0,0,0.08)"
                      : "inherit",
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.employee_no}</TableCell>
                  <TableCell>
                    {row.first_name} {row.last_name}
                  </TableCell>
                  <TableCell>{row.work_email}</TableCell>
                  <TableCell>
                    {row.errors?.map((err, i) => (
                      <Chip
                        key={i}
                        label={err}
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
        )}
      </CardContent>
    </Card>
  );
}

function ValidationSummary({ previewData, onConfirm, loading }) {
  const total = previewData.total_rows;
  const failed = previewData.rows_with_errors || 0;
  const valid = total - failed;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography>Total rows: {total}</Typography>
        <Typography>Rows with errors: {failed}</Typography>
        <Typography>Rows ready for upload: {valid}</Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={valid === 0 || loading}
          >
            Confirm Upload
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

function UploadResultDialog({ uploadResult, onClose }) {
  return (
    <Dialog open fullWidth maxWidth="md">
      <DialogTitle>Upload Result</DialogTitle>
      <DialogContent>
        <Typography>Total Rows: {uploadResult.summary.total}</Typography>
        <Typography>Inserted: {uploadResult.summary.inserted}</Typography>
        <Typography>Failed: {uploadResult.summary.failed}</Typography>

        {uploadResult.failed_rows.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Failed Rows</Typography>
            <Table size="small">
              <TableBody>
                {uploadResult.failed_rows.map((row) => (
                  <TableRow key={row.row}>
                    <TableCell>{row.row}</TableCell>
                    <TableCell>
                      {row.errors.map((err, i) => (
                        <Chip
                          key={i}
                          label={err}
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
