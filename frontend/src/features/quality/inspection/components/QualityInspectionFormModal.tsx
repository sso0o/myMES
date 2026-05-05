import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import Modal from '@/common/components/Modal'
import AppNumberField from '@/common/components/AppNumberField'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import AppTextField from '@/common/components/AppTextField'
import AppTextarea from '@/common/components/AppTextarea'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import { formClass, formLabelClass } from '@/common/styles/form'
import { useItemList } from '@/features/master/item/hooks/useItemQuery'
import { useProcessList } from '@/features/prod-basic/process/hooks/useProcessQuery'
import { useWorkOrderList } from '@/features/prod-management/work-order/hooks/useWorkOrderQuery'
import {
  qualityInspectionFormSchema,
  type QualityInspectionFormInput,
  type QualityInspectionFormValues,
} from '../schemas/qualityInspectionSchema'
import type {
  QualityInspectionCreateRequest,
  QualityInspectionResponse,
  QualityInspectionUpdateRequest,
} from '../types'
import {
  QualityInspectionResult,
  QualityInspectionStatus,
  QualityInspectionType,
} from '../types'

interface QualityInspectionFormModalProps {
  open: boolean
  editTarget: QualityInspectionResponse | null
  onClose: () => void
  onSubmit: (data: QualityInspectionCreateRequest | QualityInspectionUpdateRequest) => void
  isLoading: boolean
}

const formErrorClass = 'mt-1 text-xs text-[var(--danger)]'

const inspectionTypeOptions = [
  { value: QualityInspectionType.INCOMING, label: '수입검사' },
  { value: QualityInspectionType.IN_PROCESS, label: '공정검사' },
  { value: QualityInspectionType.FINAL, label: '최종검사' },
]

const statusOptions = [
  { value: QualityInspectionStatus.WAITING, label: '대기' },
  { value: QualityInspectionStatus.IN_PROGRESS, label: '검사중' },
  { value: QualityInspectionStatus.COMPLETED, label: '완료' },
]

const resultOptions = [
  { value: QualityInspectionResult.PASS, label: '합격' },
  { value: QualityInspectionResult.FAIL, label: '불합격' },
  { value: QualityInspectionResult.HOLD, label: '보류' },
]

const today = () => new Date().toISOString().slice(0, 10)

const getDefaultValues = (
  editTarget: QualityInspectionResponse | null,
): QualityInspectionFormInput => ({
  inspectionDate: editTarget?.inspectionDate ?? today(),
  inspectionType: editTarget?.inspectionType ?? QualityInspectionType.IN_PROCESS,
  status: editTarget?.status ?? QualityInspectionStatus.WAITING,
  result: editTarget?.result ?? QualityInspectionResult.HOLD,
  itemId: editTarget?.itemId ?? '',
  processId: editTarget?.processId ?? '',
  workOrderId: editTarget?.workOrderId ?? '',
  inspectionQty: editTarget?.inspectionQty ?? 0,
  passQty: editTarget?.passQty ?? 0,
  defectQty: editTarget?.defectQty ?? 0,
  inspectorName: editTarget?.inspectorName ?? '',
  remarks: editTarget?.remarks ?? '',
})

const QualityInspectionFormModal = ({
  open,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: QualityInspectionFormModalProps) => {
  const { data: itemResponse } = useItemList(0, 1000)
  const { data: processes = [] } = useProcessList()
  const { data: workOrders = [] } = useWorkOrderList()

  const items = itemResponse?.data ?? []

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<QualityInspectionFormInput, unknown, QualityInspectionFormValues>({
    resolver: zodResolver(qualityInspectionFormSchema),
    defaultValues: getDefaultValues(editTarget),
  })

  const selectedWorkOrderId = useWatch({ control, name: 'workOrderId' })

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(editTarget))
    }
  }, [editTarget, open, reset])

  useEffect(() => {
    if (!open || !selectedWorkOrderId) return

    const selected = workOrders.find((workOrder) => workOrder.id === Number(selectedWorkOrderId))
    if (!selected) return

    setValue('itemId', selected.itemId, { shouldDirty: true, shouldValidate: true })
    setValue('processId', selected.processId ?? '', { shouldDirty: true, shouldValidate: true })
  }, [open, selectedWorkOrderId, setValue, workOrders])

  const handleFormSubmit = (values: QualityInspectionFormValues) => {
    onSubmit({
      inspectionDate: values.inspectionDate,
      inspectionType: values.inspectionType,
      status: values.status,
      result: values.result,
      itemId: values.itemId,
      processId: values.processId,
      workOrderId: values.workOrderId,
      inspectionQty: values.inspectionQty,
      passQty: values.passQty,
      defectQty: values.defectQty,
      inspectorName: values.inspectorName,
      remarks: values.remarks,
    })
  }

  if (!open) return null

  return (
    <Modal title={editTarget ? '품질검사 수정' : '품질검사 등록'} onClose={onClose}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className={formClass}>
        {editTarget && (
          <div>
            <label className={formLabelClass}>검사번호</label>
            <AppTextField
              value={editTarget.inspectionNo}
              disabled
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
            />
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className={formLabelClass}>
              검사일자 <span className="text-[var(--danger)]">*</span>
            </label>
            <AppTextField type="date" {...register('inspectionDate')} />
            {errors.inspectionDate && (
              <p className={formErrorClass}>{errors.inspectionDate.message}</p>
            )}
          </div>

          <div>
            <label className={formLabelClass}>
              검사유형 <span className="text-[var(--danger)]">*</span>
            </label>
            <Controller
              name="inspectionType"
              control={control}
              render={({ field }) => (
                <AppSelect {...field} value={String(field.value)}>
                  {inspectionTypeOptions.map((option) => (
                    <AppMenuItem key={option.value} value={option.value}>
                      {option.label}
                    </AppMenuItem>
                  ))}
                </AppSelect>
              )}
            />
            {errors.inspectionType && (
              <p className={formErrorClass}>{errors.inspectionType.message}</p>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className={formLabelClass}>
              검사상태 <span className="text-[var(--danger)]">*</span>
            </label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <AppSelect {...field} value={String(field.value)}>
                  {statusOptions.map((option) => (
                    <AppMenuItem key={option.value} value={option.value}>
                      {option.label}
                    </AppMenuItem>
                  ))}
                </AppSelect>
              )}
            />
            {errors.status && <p className={formErrorClass}>{errors.status.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>
              판정결과 <span className="text-[var(--danger)]">*</span>
            </label>
            <Controller
              name="result"
              control={control}
              render={({ field }) => (
                <AppSelect {...field} value={String(field.value)}>
                  {resultOptions.map((option) => (
                    <AppMenuItem key={option.value} value={option.value}>
                      {option.label}
                    </AppMenuItem>
                  ))}
                </AppSelect>
              )}
            />
            {errors.result && <p className={formErrorClass}>{errors.result.message}</p>}
          </div>
        </div>

        <div>
          <label className={formLabelClass}>작업지시</label>
          <Controller
            name="workOrderId"
            control={control}
            render={({ field }) => (
              <AppSelect {...field} value={field.value === '' ? '' : String(field.value)}>
                <AppMenuItem value="">작업지시 선택</AppMenuItem>
                {workOrders.map((workOrder) => (
                  <AppMenuItem key={workOrder.id} value={String(workOrder.id)}>
                    {workOrder.workOrderNo} · {workOrder.itemName}
                  </AppMenuItem>
                ))}
              </AppSelect>
            )}
          />
          {errors.workOrderId && <p className={formErrorClass}>{errors.workOrderId.message}</p>}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className={formLabelClass}>
              품목 <span className="text-[var(--danger)]">*</span>
            </label>
            <Controller
              name="itemId"
              control={control}
              render={({ field }) => (
                <AppSelect {...field} value={field.value === '' ? '' : String(field.value)}>
                  <AppMenuItem value="">품목 선택</AppMenuItem>
                  {items.map((item) => (
                    <AppMenuItem key={item.id} value={String(item.id)}>
                      {item.itemName} · {item.itemCode}
                    </AppMenuItem>
                  ))}
                </AppSelect>
              )}
            />
            {errors.itemId && <p className={formErrorClass}>{errors.itemId.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>공정</label>
            <Controller
              name="processId"
              control={control}
              render={({ field }) => (
                <AppSelect {...field} value={field.value === '' ? '' : String(field.value)}>
                  <AppMenuItem value="">공정 선택</AppMenuItem>
                  {processes.map((process) => (
                    <AppMenuItem key={process.id} value={String(process.id)}>
                      {process.processName} · {process.processCode}
                    </AppMenuItem>
                  ))}
                </AppSelect>
              )}
            />
            {errors.processId && <p className={formErrorClass}>{errors.processId.message}</p>}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className={formLabelClass}>
              검사수량 <span className="text-[var(--danger)]">*</span>
            </label>
            <AppNumberField
              {...register('inspectionQty')}
              placeholder="0"
              slotProps={{ htmlInput: { min: 0 } }}
            />
            {errors.inspectionQty && (
              <p className={formErrorClass}>{errors.inspectionQty.message}</p>
            )}
          </div>

          <div>
            <label className={formLabelClass}>
              합격수량 <span className="text-[var(--danger)]">*</span>
            </label>
            <AppNumberField
              {...register('passQty')}
              placeholder="0"
              slotProps={{ htmlInput: { min: 0 } }}
            />
            {errors.passQty && <p className={formErrorClass}>{errors.passQty.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>
              불량수량 <span className="text-[var(--danger)]">*</span>
            </label>
            <AppNumberField
              {...register('defectQty')}
              placeholder="0"
              slotProps={{ htmlInput: { min: 0 } }}
            />
            {errors.defectQty && <p className={formErrorClass}>{errors.defectQty.message}</p>}
          </div>
        </div>

        <div>
          <label className={formLabelClass}>검사자</label>
          <AppTextField
            {...register('inspectorName')}
            placeholder="검사자명을 입력하세요"
            slotProps={{ htmlInput: { maxLength: 50 } }}
          />
          {errors.inspectorName && (
            <p className={formErrorClass}>{errors.inspectorName.message}</p>
          )}
        </div>

        <div>
          <label className={formLabelClass}>비고</label>
          <AppTextarea
            {...register('remarks')}
            placeholder="검사 특이사항을 입력하세요"
            rows={3}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
          {errors.remarks && <p className={formErrorClass}>{errors.remarks.message}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={cancelButtonClass}>
            취소
          </button>
          <button type="submit" disabled={isLoading} className={submitButtonClass}>
            {isLoading ? '처리 중...' : editTarget ? '수정' : '등록'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default QualityInspectionFormModal
