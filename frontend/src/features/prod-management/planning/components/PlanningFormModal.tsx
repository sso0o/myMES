import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import Modal from '@/common/components/Modal'
import AppNumberField from '@/common/components/AppNumberField'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import AppTextField from '@/common/components/AppTextField'
import AppTextarea from '@/common/components/AppTextarea'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import { formClass, formLabelClass } from '@/common/styles/form'
import { useItemList } from '@/features/master/item/hooks/useItemQuery'
import { planningFormSchema, type PlanningFormInput, type PlanningFormValues } from '../schemas/planningSchema'
import type { ProductionPlanResponse } from '../types'

interface PlanningFormModalProps {
  open: boolean
  editTarget: ProductionPlanResponse | null
  onClose: () => void
  onSubmit: (data: PlanningFormValues) => void
  isLoading: boolean
}

const formErrorClass = 'mt-1 text-xs text-[var(--danger)]'

const getDefaultValues = (editTarget: ProductionPlanResponse | null): PlanningFormInput => ({
  itemId: editTarget?.itemId ?? ('' as unknown as number),
  plannedQty: editTarget?.plannedQty ?? ('' as unknown as number),
  plannedDate: editTarget?.plannedDate ?? '',
  memo: editTarget?.memo ?? '',
})

const datePickerSx = {
  width: '100%',
  '& .MuiInputBase-root': {
    minHeight: 30,
    fontSize: '0.75rem',
    borderRadius: '0.5rem',
    color: 'var(--text-strong)',
    backgroundColor: 'var(--surface)',
    border: '1px solid var(--border)',
    padding: '0',
    '&.Mui-focused': {
      border: '2px solid var(--primary)',
      outline: 'none',
    },
    '&:hover': {
      borderColor: 'var(--text-muted)',
    },
  },
  '& .MuiInputBase-input': {
    padding: '0.25rem 0.5rem',
    lineHeight: 1.35,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    display: 'none',
  },
  '& .MuiIconButton-root': {
    color: 'var(--text-muted)',
  },
}

const PlanningFormModal = ({
  open,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: PlanningFormModalProps) => {
  const { data: itemResponse } = useItemList(0, 200)
  const items = itemResponse?.data ?? []

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PlanningFormInput, unknown, PlanningFormValues>({
    resolver: zodResolver(planningFormSchema),
    defaultValues: getDefaultValues(editTarget),
  })

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(editTarget))
    }
  }, [editTarget, open, reset])

  const handleFormSubmit = (values: PlanningFormValues) => {
    onSubmit(values)
  }

  if (!open) return null

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <Modal title={editTarget ? '생산계획 수정' : '생산계획 등록'} onClose={onClose}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className={formClass}>
          {editTarget && (
            <div>
              <label className={formLabelClass}>계획번호</label>
              <AppTextField
                value={editTarget.planNo}
                disabled
                sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
              />
            </div>
          )}

          <div>
            <label className={formLabelClass}>
              품목 <span className="text-[var(--danger)]">*</span>
            </label>
            <Controller
              name="itemId"
              control={control}
              render={({ field }) => (
                <AppSelect {...field} value={field.value === '' ? '' : String(field.value)}>
                  <AppMenuItem value="">품목을 선택하세요</AppMenuItem>
                  {items.map((item) => (
                    <AppMenuItem key={item.id} value={String(item.id)}>
                      [{item.itemCode}] {item.itemName}
                    </AppMenuItem>
                  ))}
                </AppSelect>
              )}
            />
            {errors.itemId && <p className={formErrorClass}>{errors.itemId.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>
              계획수량 <span className="text-[var(--danger)]">*</span>
            </label>
            <AppNumberField
              {...register('plannedQty')}
              placeholder="수량을 입력하세요"
              slotProps={{ htmlInput: { min: 1 } }}
            />
            {errors.plannedQty && <p className={formErrorClass}>{errors.plannedQty.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>
              생산예정일 <span className="text-[var(--danger)]">*</span>
            </label>
            <Controller
              name="plannedDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : '')}
                  format="YYYY-MM-DD"
                  sx={datePickerSx}
                />
              )}
            />
            {errors.plannedDate && (
              <p className={formErrorClass}>{errors.plannedDate.message}</p>
            )}
          </div>

          <div>
            <label className={formLabelClass}>메모</label>
            <AppTextarea
              {...register('memo')}
              placeholder="메모를 입력하세요"
              rows={3}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
            {errors.memo && <p className={formErrorClass}>{errors.memo.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={cancelButtonClass}>
              취소
            </button>
            <button type="submit" disabled={isLoading} className={submitButtonClass}>
              {isLoading ? '저장 중...' : editTarget ? '수정' : '등록'}
            </button>
          </div>
        </form>
      </Modal>
    </LocalizationProvider>
  )
}

export default PlanningFormModal
