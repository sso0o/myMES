import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import Modal from '@/common/components/Modal'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import { formClass, formInputClass, formLabelClass, formDisabledInputClass } from '@/common/styles/form'
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
    fontSize: '0.875rem',
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
    padding: '0.5rem 0.75rem',
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
              <input
                type="text"
                value={editTarget.planNo}
                disabled
                className={formDisabledInputClass}
              />
            </div>
          )}

          <div>
            <label className={formLabelClass}>
              품목 <span className="text-[var(--danger)]">*</span>
            </label>
            <select {...register('itemId')} className={formInputClass}>
              <option value="">품목을 선택하세요</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  [{item.itemCode}] {item.itemName}
                </option>
              ))}
            </select>
            {errors.itemId && <p className={formErrorClass}>{errors.itemId.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>
              계획수량 <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              type="number"
              min={1}
              {...register('plannedQty')}
              placeholder="수량을 입력하세요"
              className={formInputClass}
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
            <textarea
              {...register('memo')}
              placeholder="메모를 입력하세요"
              rows={3}
              maxLength={500}
              className="w-full resize-none rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-muted)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
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
