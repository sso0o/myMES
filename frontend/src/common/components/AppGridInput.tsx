import type { TextFieldProps } from '@mui/material/TextField'
import type { SxProps, Theme } from '@mui/material/styles'
import AppTextField from '@/common/components/AppTextField'
import { toSxArray } from '@/common/styles/appInput'

const appGridInputSx: SxProps<Theme> = {
  width: '100%',
  '& .MuiInputBase-root': {
    minHeight: 30,
    height: 30,
    borderRadius: '0.25rem',
  },
  '& .MuiInputBase-input': {
    height: 30,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
  },
}

const AppGridInput = ({ sx, ...props }: TextFieldProps) => (
  <AppTextField {...props} sx={[appGridInputSx, ...toSxArray(sx)]} />
)

export default AppGridInput
