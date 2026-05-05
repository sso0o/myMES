import type { SxProps, Theme } from '@mui/material/styles'

export const appTextFieldSx: SxProps<Theme> = {
  width: '100%',
  '& .MuiInputBase-root': {
    minHeight: 30,
    borderRadius: '0.5rem',
    bgcolor: 'var(--surface)',
    color: 'var(--text-strong)',
    fontSize: '0.75rem',
  },
  '& .MuiInputBase-input': {
    px: 1,
    py: 0.5,
    lineHeight: 1.35,
    '&::placeholder': {
      color: 'var(--text-muted)',
      opacity: 1,
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--border)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--primary)',
  },
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--primary)',
    borderWidth: 1,
  },
  '& .Mui-disabled': {
    bgcolor: 'var(--surface-alt)',
    color: 'var(--text-muted)',
    WebkitTextFillColor: 'var(--text-muted)',
  },
}

export const toSxArray = (sx: SxProps<Theme> | undefined) => {
  if (sx === undefined) return []
  return Array.isArray(sx) ? sx : [sx]
}
