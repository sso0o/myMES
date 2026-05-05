import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { MenuItemProps } from '@mui/material/MenuItem'
import type { SelectProps } from '@mui/material/Select'
import type { SxProps, Theme } from '@mui/material/styles'

const appSelectSx: SxProps<Theme> = {
  width: '100%',
  height: 30,
  bgcolor: 'var(--surface)',
  color: 'var(--text-strong)',
  fontSize: '0.75rem',
  '& .MuiSelect-select': {
    py: 0.5,
    px: 1,
    minHeight: '0 !important',
    lineHeight: 1.35,
  },
  '& .MuiSelect-icon': {
    color: 'var(--text-muted)',
    fontSize: '1.1rem',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--border)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--primary)',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--primary)',
    borderWidth: 1,
  },
  '&.Mui-disabled': {
    bgcolor: 'var(--surface-alt)',
    color: 'var(--text-muted)',
  },
}

const appSelectMenuPaperSx: SxProps<Theme> = {
  mt: 0.5,
  border: '1px solid var(--border)',
  borderRadius: '0.5rem',
  boxShadow: '0 12px 28px color-mix(in srgb, var(--text-strong) 18%, transparent)',
  '& .MuiList-root': {
    py: 0.5,
  },
  '& .MuiMenuItem-root': {
    minHeight: 30,
    py: 0.5,
    px: 1.5,
    color: 'var(--text-strong)',
    fontSize: '0.75rem',
    lineHeight: 1.35,
    '&.Mui-selected': {
      bgcolor: 'var(--primary-soft)',
    },
    '&.Mui-selected:hover, &:hover': {
      bgcolor: 'var(--surface-alt)',
    },
  },
}

const toSxArray = (sx: SxProps<Theme> | undefined) => {
  if (sx === undefined) return []
  return Array.isArray(sx) ? sx : [sx]
}

const AppSelect = ({ sx, MenuProps, ...props }: SelectProps<string>) => (
  <Select
    size="small"
    displayEmpty
    {...props}
    sx={[appSelectSx, ...toSxArray(sx)]}
    MenuProps={{
      ...MenuProps,
      slotProps: {
        ...MenuProps?.slotProps,
        paper: {
          sx: appSelectMenuPaperSx,
        },
      },
    }}
  />
)

export const AppMenuItem = (props: MenuItemProps) => <MenuItem {...props} />

export default AppSelect
