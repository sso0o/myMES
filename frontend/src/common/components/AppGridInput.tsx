import type { TextFieldProps } from '@mui/material/TextField'
import type { SxProps, Theme } from '@mui/material/styles'
import AppTextField from '@/common/components/AppTextField'
import { toSxArray } from '@/common/styles/appInput'

const appGridInputSx: SxProps<Theme> = {
  '& .MuiInputBase-root': {
    height: 30,
    borderRadius: '0.25rem',
  },
}

const AppGridInput = ({ sx, ...props }: TextFieldProps) => (
  <AppTextField {...props} sx={[appGridInputSx, ...toSxArray(sx)]} />
)

export default AppGridInput
