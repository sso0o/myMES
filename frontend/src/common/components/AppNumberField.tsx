import type { TextFieldProps } from '@mui/material/TextField'
import type { SxProps, Theme } from '@mui/material/styles'
import AppTextField from '@/common/components/AppTextField'
import { toSxArray } from '@/common/styles/appInput'

const numberFieldSx: SxProps<Theme> = {
  '& input[type=number]': {
    MozAppearance: 'textfield',
  },
  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
    margin: 0,
    WebkitAppearance: 'none',
  },
}

const AppNumberField = ({ sx, ...props }: TextFieldProps) => (
  <AppTextField type="number" {...props} sx={[numberFieldSx, ...toSxArray(sx)]} />
)

export default AppNumberField
