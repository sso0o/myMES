import type { TextFieldProps } from '@mui/material/TextField'
import type { SxProps, Theme } from '@mui/material/styles'
import AppTextField from '@/common/components/AppTextField'
import { toSxArray } from '@/common/styles/appInput'

const textareaSx: SxProps<Theme> = {
  '& .MuiInputBase-root': {
    alignItems: 'flex-start',
  },
  '& .MuiInputBase-inputMultiline': {
    px: 0,
    py: 0,
    lineHeight: 1.5,
    resize: 'none',
  },
}

const AppTextarea = ({ rows = 3, sx, ...props }: TextFieldProps) => (
  <AppTextField multiline rows={rows} {...props} sx={[textareaSx, ...toSxArray(sx)]} />
)

export default AppTextarea
