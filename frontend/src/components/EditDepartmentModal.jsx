import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress
} from '@mui/material'
import { updateDepartment } from '../services/departmentsService'

export default function EditDepartmentModal({ open, onClose, department, onSuccess }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (department) setName(department.name)
  }, [department])

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Department name is required')
      return
    }

    try {
      setLoading(true)
      const res = await updateDepartment({
        id: department.id,
        name
      })

      if (res.data.success) {
        onSuccess()
      } else {
        alert(res.data.message || 'Failed to update department')
      }
    } catch (error) {
      console.error(error)
      alert(error?.response?.data?.message || 'Error updating department')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle>Edit Department</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Department Name"
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ background: '#1a365d', '&:hover': { background: '#2d4a70' } }}
        >
          {loading ? <CircularProgress size={20} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
