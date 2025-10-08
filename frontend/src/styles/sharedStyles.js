// Shared styles for consistent UI across the application
export const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    fontSize: '14px',
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#1976d2',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '14px',
  },
  '& .MuiOutlinedInput-input': {
    padding: '10px 14px',
  },
}

export const selectStyles = {
  ...inputStyles,
  '& .MuiSelect-select': {
    padding: '10px 14px',
  },
}

export const buttonStyles = {
  primary: {
    background: '#1976d2',
    color: 'white',
    borderRadius: '12px',
    padding: '6px 16px',
    fontSize: '13px',
    textTransform: 'none',
    fontWeight: 500,
    '&:hover': {
      background: '#1565c0',
      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
    },
    '&:disabled': {
      background: '#e0e0e0',
      color: '#9e9e9e',
    },
  },
  secondary: {
    background: 'transparent',
    color: '#1976d2',
    border: '1px solid #1976d2',
    borderRadius: '12px',
    padding: '6px 16px',
    fontSize: '13px',
    textTransform: 'none',
    fontWeight: 500,
    '&:hover': {
      background: 'rgba(25, 118, 210, 0.08)',
      borderColor: '#1565c0',
    },
  },
}

export const cardStyles = {
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  transition: 'box-shadow 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
  },
}

export const tableStyles = {
  '& .MuiTableCell-head': {
    backgroundColor: '#f8f9fa',
    fontWeight: 600,
    fontSize: '13px',
    color: '#495057',
    borderBottom: '2px solid #dee2e6',
  },
  '& .MuiTableCell-body': {
    fontSize: '14px',
    color: '#212529',
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: '#f8f9fa',
  },
}
