import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import AppTextField from '@/common/components/AppTextField'
import Modal from '@/common/components/Modal'
import { cancelButtonClass, submitButtonClass } from '@/common/styles/button'
import { formClass, formLabelClass } from '@/common/styles/form'
import {
  workerResignSchema,
  type WorkerResignInput,
  type WorkerResignValues,
} from '../schemas/workerSchema'
import type { WorkerResignRequest, WorkerResponse } from '../types'

interface WorkerResignModalProps {
  open: boolean
  target: WorkerResponse | null
  onClose: () => void
  onSubmit: (data: WorkerResignRequest) => void
  isLoading: boolean
}

const formErrorClass = 'mt-1 text-xs text-[var(--danger)]'

const getToday = () => new Date().toISOString().slice(0, 10)

const WorkerResignModal = ({
  open,
  target,
  onClose,
  onSubmit,
  isLoading,
}: WorkerResignModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkerResignInput, unknown, WorkerResignValues>({
    resolver: zodResolver(workerResignSchema),
    defaultValues: { resignedAt: getToday() },
  })

  useEffect(() => {
    if (open) {
      reset({ resignedAt: target?.resignedAt ?? getToday() })
    }
  }, [open, reset, target])

  const handleFormSubmit = (values: WorkerResignValues) => {
    onSubmit({ resignedAt: values.resignedAt })
  }

  if (!open || !target) return null

  return (
    <Modal title="퇴사 처리" onClose={onClose}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className={formClass}>
        <div className="rounded-lg bg-[var(--surface-alt)] px-3 py-2 text-sm text-[var(--text-base)]">
          <span className="font-medium text-[var(--text-strong)]">{target.workerName}</span>
          <span className="ml-1 font-mono text-[var(--text-muted)]">{target.workerCode}</span>
        </div>

        <div>
          <label className={formLabelClass}>
            퇴사일 <span className="text-[var(--danger)]">*</span>
          </label>
          <AppTextField type="date" {...register('resignedAt')} />
          {errors.resignedAt && <p className={formErrorClass}>{errors.resignedAt.message}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={cancelButtonClass}>
            취소
          </button>
          <button type="submit" disabled={isLoading} className={submitButtonClass}>
            {isLoading ? '처리 중...' : '퇴사 처리'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default WorkerResignModal
