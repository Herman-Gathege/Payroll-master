import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress
} from '@mui/material'
import { createDepartment } from '../services/departmentsService'

export default function AddDepartmentModal({ open, onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Department name is required')
      return
    }

    try {
      setLoading(true)
      const res = await createDepartment({ name })

      if (res.data.success) {
        onSuccess()
        setName('')
      } else {
        alert(res.data.message || 'Failed to create department')
      }
    } catch (error) {
      console.error(error)
      alert(error?.response?.data?.message || 'Error creating department')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    onClose()
  }

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle>Add Department</DialogTitle>
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
          {loading ? <CircularProgress size={20} /> : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
