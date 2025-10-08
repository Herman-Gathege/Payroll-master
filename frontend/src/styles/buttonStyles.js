// Shared button styles for consistent UI across the application
export const primaryButtonStyle = {
  bgcolor: '#1976d2',
  borderRadius: '12px',
  padding: '6px 16px',
  fontSize: '13px',
  textTransform: 'none',
  fontWeight: 500,
  '&:hover': {
    bgcolor: '#1565c0',
  }
}

export const inputFieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontSize: '14px',
  },
  '& .MuiOutlinedInput-input': {
    padding: '10px 12px',
  },
  '& .MuiInputLabel-root': {
    fontSize: '14px',
  },
}
