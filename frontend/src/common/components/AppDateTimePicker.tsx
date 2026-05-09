import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import type { DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker'
import type { SxProps, Theme } from '@mui/material/styles'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import { toSxArray } from '@/common/styles/appInput'

const appDateTimePickerTextFieldSx: SxProps<Theme> = {
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

interface AppDateTimePickerProps extends Omit<DateTimePickerProps, 'value' | 'onChange'> {
  /** ISO 8601 문자열 또는 YYYY-MM-DD HH:mm 형식 */
  value?: string | null
  /** ISO 8601 문자열로 반환 */
  onChange?: (value: string) => void
  sx?: SxProps<Theme>
}

/**
 * 공용 날짜+시간 선택 컴포넌트. value/onChange는 ISO 8601 문자열로 주고받음.
 */
const AppDateTimePicker = ({ value, onChange, sx, slotProps, ...props }: AppDateTimePickerProps) => (
  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
    <DateTimePicker
      value={value ? dayjs(value) : null}
      onChange={(date) => onChange?.(date ? date.toISOString() : '')}
      format="YYYY-MM-DD HH:mm"
      {...props}
      slotProps={{
        ...slotProps,
        actionBar: { actions: ['today'], ...(slotProps?.actionBar as object) },
        textField: {
          size: 'small',
          variant: 'outlined',
          fullWidth: true,
          ...(slotProps && typeof slotProps.textField === 'object' ? slotProps.textField : {}),
          sx: [appDateTimePickerTextFieldSx, ...toSxArray(sx)],
        },
      }}
    />
  </LocalizationProvider>
)

export default AppDateTimePicker
