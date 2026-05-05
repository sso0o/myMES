import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField'
import { appTextFieldSx, toSxArray } from '@/common/styles/appInput'

const AppTextField = ({ sx, ...props }: TextFieldProps) => (
  <TextField
    variant="outlined"
    size="small"
    fullWidth
    {...props}
    sx={[appTextFieldSx, ...toSxArray(sx)]}
  />
)

export default AppTextField
