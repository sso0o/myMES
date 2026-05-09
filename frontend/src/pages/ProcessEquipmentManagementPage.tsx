import { useState } from 'react'
import { Plus } from 'lucide-react'
import EmptyState from '@/common/components/EmptyState'
import PageHeader from '@/common/components/PageHeader'
import { primaryActionButtonClass } from '@/common/styles/button'
import { useFeedback } from '@/common/hooks/useFeedback'
import { getApiErrorMessage } from '@/common/utils/apiError'
import { useProcessList } from '@/features/prod-basic/process/hooks/useProcessQuery'
import type { ProcessResponse } from '@/features/prod-basic/process/types'
import { useEquipmentList } from '@/features/prod-basic/equipment/hooks/useEquipmentQuery'
import {
  useProcessEquipmentListByProcess,
  useCreateProcessEquipment,
  useUpdateProcessEquipment,
  useDeleteProcessEquipment,
} from '@/features/prod-basic/process-equipment/hooks/useProcessEquipmentQuery'
import type { ProcessEquipmentResponse } from '@/features/prod-basic/process-equipment/types'
import ProcessEquipmentProcessDataGrid from '@/features/prod-basic/process-equipment/components/ProcessEquipmentProcessDataGrid'
import ProcessEquipmentDataGrid, {
  type ProcessEquipmentInlineRow,
} from '@/features/prod-basic/process-equipment/components/ProcessEquipmentDataGrid'

const ProcessEquipmentManagementPage = () => {
  const [selectedProcess, setSelectedProcess] = useState<ProcessResponse | null>(null)
  const [addingRow, setAddingRow] = useState(false)
  const [newRow, setNewRow] = useState<ProcessEquipmentInlineRow>({ equipmentId: '', isPrimary: false })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<ProcessEquipmentInlineRow>({ equipmentId: '', isPrimary: false })

  const { showToast, showAlert } = useFeedback()

  const { data: processes = [], isLoading: processesLoading } = useProcessList()
  const { data: equipments = [] } = useEquipmentList()

  const { data: processEquipments = [], isLoading: peLoading } = useProcessEquipmentListByProcess(
    selectedProcess?.id ?? null,
  )

  const createProcessEquipment = useCreateProcessEquipment()
  const updateProcessEquipment = useUpdateProcessEquipment()
  const deleteProcessEquipment = useDeleteProcessEquipment()

  const handleSelectProcess = (process: ProcessResponse) => {
    setSelectedProcess(process)
    setAddingRow(false)
    setNewRow({ equipmentId: '', isPrimary: false })
    setEditingId(null)
    setEditRow({ equipmentId: '', isPrimary: false })
  }

  const handleStartAdd = () => {
    setEditingId(null)
    setNewRow({ equipmentId: '', isPrimary: false })
    setAddingRow(true)
  }

  const handleCancelAdd = () => {
    setAddingRow(false)
    setNewRow({ equipmentId: '', isPrimary: false })
  }

  const handleSaveAdd = () => {
    if (!selectedProcess) return
    const equipmentId = parseInt(newRow.equipmentId, 10)
    if (isNaN(equipmentId)) {
      showToast({ title: '설비를 선택해주세요.', variant: 'error' })
      return
    }
    createProcessEquipment.mutate(
      { processId: selectedProcess.id, equipmentId, isPrimary: newRow.isPrimary },
      {
        onSuccess: () => {
          showToast({ title: '설비를 배정했습니다.', variant: 'success' })
          setAddingRow(false)
          setNewRow({ equipmentId: '', isPrimary: false })
        },
        onError: (error) =>
          showToast({ title: getApiErrorMessage(error, '배정 중 오류가 발생했습니다.'), variant: 'error' }),
      },
    )
  }

  const handleStartEdit = (pe: ProcessEquipmentResponse) => {
    setAddingRow(false)
    setEditingId(pe.id)
    setEditRow({ equipmentId: String(pe.equipmentId), isPrimary: pe.isPrimary })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditRow({ equipmentId: '', isPrimary: false })
  }

  const handleSaveEdit = (pe: ProcessEquipmentResponse) => {
    if (!selectedProcess) return
    updateProcessEquipment.mutate(
      { id: pe.id, data: { isPrimary: editRow.isPrimary }, processId: selectedProcess.id },
      {
        onSuccess: () => {
          showToast({ title: '주설비 설정을 변경했습니다.', variant: 'success' })
          setEditingId(null)
        },
        onError: (error) =>
          showToast({ title: getApiErrorMessage(error, '수정 중 오류가 발생했습니다.'), variant: 'error' }),
      },
    )
  }

  const handleDelete = async (pe: ProcessEquipmentResponse) => {
    if (!selectedProcess) return
    const confirmed = await showAlert({
      title: '설비 배정 삭제',
      message: `"${pe.equipmentName}" 설비 배정을 삭제하시겠습니까?`,
      confirmText: '삭제',
    })
    if (!confirmed) return
    deleteProcessEquipment.mutate(
      { id: pe.id, processId: selectedProcess.id },
      {
        onSuccess: () => showToast({ title: '설비 배정을 삭제했습니다.', variant: 'success' }),
        onError: (error) =>
          showToast({ title: getApiErrorMessage(error, '삭제 중 오류가 발생했습니다.'), variant: 'error' }),
      },
    )
  }

  const canAdd = Boolean(selectedProcess) && !addingRow

  return (
    <div className="min-w-0 max-w-full space-y-5 overflow-hidden p-6">
      <PageHeader
        title="공정별 설비 관리"
        description="공정에 배정된 설비를 관리합니다."
      />

      <div className="flex h-[calc(100vh-16rem)] min-w-0 gap-0">
        {/* 좌측: 공정 목록 */}
        <div className="flex w-[28rem] shrink-0 flex-col rounded-l-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex min-h-[52px] shrink-0 items-center border-b border-[var(--border)] px-4">
            <span className="text-sm font-semibold text-[var(--text-strong)]">공정 목록</span>
          </div>

          <div className="min-h-0 flex-1">
            <ProcessEquipmentProcessDataGrid
              processes={processes}
              loading={processesLoading}
              selectedProcessId={selectedProcess?.id ?? null}
              onSelectProcess={handleSelectProcess}
            />
          </div>
        </div>

        {/* 우측: 배정된 설비 목록 */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-r-lg border border-l-0 border-[var(--border)] bg-[var(--surface)]">
          <div className="flex min-h-[52px] shrink-0 items-center justify-between border-b border-[var(--border)] px-5">
            <div className="min-w-0 flex-1">
              <span className="text-sm font-semibold text-[var(--text-strong)]">
                {selectedProcess ? selectedProcess.processName : '설비 목록'}
              </span>
              {selectedProcess && (
                <span className="ml-2 font-mono text-xs text-[var(--text-muted)]">
                  {selectedProcess.processCode}
                </span>
              )}
            </div>
            <div className="ml-3 flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={handleStartAdd}
                disabled={!canAdd}
                className={primaryActionButtonClass}
              >
                <Plus size={13} />
                설비 배정
              </button>
            </div>
          </div>

          {!selectedProcess ? (
            <EmptyState message="좌측에서 공정을 선택하세요." fill />
          ) : (
            <div className="min-h-0 flex-1">
              <ProcessEquipmentDataGrid
                processEquipments={processEquipments}
                equipmentOptions={equipments}
                loading={peLoading}
                addingRow={addingRow}
                editingId={editingId}
                newRow={newRow}
                editRow={editRow}
                isCreating={createProcessEquipment.isPending}
                isUpdating={updateProcessEquipment.isPending}
                onCancelAdd={handleCancelAdd}
                onChangeNewRow={setNewRow}
                onSaveAdd={handleSaveAdd}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onChangeEditRow={setEditRow}
                onSaveEdit={handleSaveEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
{/* fixme: 주설비 등록 로직 확인 */}
export default ProcessEquipmentManagementPage
