import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import Modal from '@/common/components/Modal'
import AppNumberField from '@/common/components/AppNumberField'
import AppTextField from '@/common/components/AppTextField'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import {
  formClass,
  formLabelClass,
} from '@/common/styles/form'
import {
  commonCodeFormSchema,
  type CommonCodeFormInput,
  type CommonCodeFormValues,
} from '../schemas/commonCodeSchema'
import type { CommonCodeCreateRequest, CommonCodeResponse, CommonCodeUpdateRequest } from '../types'

interface CommonCodeFormModalProps {
  open: boolean
  editTarget: CommonCodeResponse | null
  onClose: () => void
  onSubmit: (data: CommonCodeCreateRequest | CommonCodeUpdateRequest) => void
  isLoading: boolean
}

const formErrorClass = 'mt-1 text-xs text-[var(--danger)]'

const getDefaultValues = (editTarget: CommonCodeResponse | null): CommonCodeFormInput => ({
  codeName: editTarget?.codeName ?? '',
  sortOrder: editTarget ? String(editTarget.sortOrder) : '',
  numberingPrefix: editTarget?.numberingPrefix ?? '',
})

const CommonCodeFormModal = ({
  open,
  editTarget,
  onClose,
  onSubmit,
  isLoading,
}: CommonCodeFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommonCodeFormInput, unknown, CommonCodeFormValues>({
    resolver: zodResolver(commonCodeFormSchema),
    defaultValues: getDefaultValues(editTarget),
  })
  const numberingPrefixField = register('numberingPrefix')

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(editTarget))
    }
  }, [editTarget, open, reset])

  const handleFormSubmit = (values: CommonCodeFormValues) => {
    onSubmit({
      codeName: values.codeName,
      sortOrder: values.sortOrder,
      numberingPrefix: values.numberingPrefix,
    })
  }

  if (!open) return null

  return (
    <Modal title={editTarget ? 'Edit Code' : 'Create Code'} onClose={onClose}>
        <form onSubmit={handleSubmit(handleFormSubmit)} className={formClass}>
          <div>
            <label className={formLabelClass}>
              Code
            </label>
            <AppTextField
              value={editTarget?.code ?? ''}
              placeholder="Generated on save"
              disabled
              slotProps={{ htmlInput: { maxLength: 50 } }}
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
            />
          </div>

          <div>
            <label className={formLabelClass}>
              Code Name
            </label>
            <AppTextField
              {...register('codeName')}
              placeholder="e.g. Waiting"
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
            {errors.codeName && <p className={formErrorClass}>{errors.codeName.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>
              Sort Order
            </label>
            <AppNumberField
              {...register('sortOrder')}
              placeholder="1"
              slotProps={{ htmlInput: { min: 1 } }}
            />
            {errors.sortOrder && <p className={formErrorClass}>{errors.sortOrder.message}</p>}
          </div>

          <div>
            <label className={formLabelClass}>
              Numbering Prefix
            </label>
            <AppTextField
              {...numberingPrefixField}
              onChange={(event) => {
                event.target.value = event.target.value.toUpperCase()
                void numberingPrefixField.onChange(event)
              }}
              placeholder="e.g. RM, FG, WIP"
              slotProps={{ htmlInput: { maxLength: 20 } }}
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace' } }}
            />
            {errors.numberingPrefix && (
              <p className={formErrorClass}>{errors.numberingPrefix.message}</p>
            )}
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Used for downstream numbering, for example `RM-000001`.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className={cancelButtonClass}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className={submitButtonClass}>
              {isLoading ? 'Saving...' : editTarget ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
    </Modal>
  )
}

export default CommonCodeFormModal
