import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker'
import type { SxProps, Theme } from '@mui/material/styles'
import dayjs, { type Dayjs } from 'dayjs'
import 'dayjs/locale/ko'
import { toSxArray } from '@/common/styles/appInput'

const appDatePickerTextFieldSx: SxProps<Theme> = {
  width: '100%',
  '& .MuiPickersInputBase-root': {
    minHeight: 30,
    borderRadius: '0.5rem',
    bgcolor: 'var(--surface)',
    color: 'var(--text-strong)',
    fontSize: '0.75rem',
    alignItems: 'center',
    padding: 0,
  },
  '& .MuiPickersSectionList-root': {
    padding: '4px 4px 4px 8px',
  },
  '& .MuiPickersSectionList-sectionContent': {
    fontSize: '0.75rem',
  },
  '& .MuiPickersSectionList-section': {
    fontSize: '0.75rem',
  },
  '& .MuiPickersOutlinedInput-notchedOutline': {
    borderColor: 'var(--border)',
  },
  '&:hover .MuiPickersOutlinedInput-notchedOutline': {
    borderColor: 'var(--primary)',
  },
  '& .Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
    borderColor: 'var(--primary)',
    borderWidth: 1,
  },
  '& .Mui-disabled': {
    bgcolor: 'var(--surface-alt)',
    WebkitTextFillColor: 'var(--text-muted)',
  },
  '& .MuiIconButton-root': {
    color: 'var(--text-muted)',
    padding: '4px',
    marginRight: '2px',
  },
}

interface AppDatePickerProps extends Omit<DatePickerProps<Dayjs>, 'value' | 'onChange'> {
  value?: string | null
  onChange?: (value: string) => void
  sx?: SxProps<Theme>
}

/**
 * 공용 날짜 선택 컴포넌트. value/onChange는 YYYY-MM-DD 문자열로 주고받음.
 */
const AppDatePicker = ({ value, onChange, sx, slotProps, ...props }: AppDatePickerProps) => (
  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
    <DatePicker
      value={value ? dayjs(value) : null}
      onChange={(date) => onChange?.(date ? date.format('YYYY-MM-DD') : '')}
      format="YYYY-MM-DD"
      {...props}
      slotProps={{
        ...slotProps,
        actionBar: { actions: ['today'], ...(slotProps?.actionBar as object) },
        textField: {
          size: 'small',
          variant: 'outlined',
          fullWidth: true,
          ...(slotProps && typeof slotProps.textField === 'object' ? slotProps.textField : {}),
          sx: [appDatePickerTextFieldSx, ...toSxArray(sx)],
        },
      }}
    />
  </LocalizationProvider>
)

export default AppDatePicker
