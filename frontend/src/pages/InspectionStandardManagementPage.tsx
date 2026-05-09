import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import AppSelect, { AppMenuItem } from '@/common/components/AppSelect'
import EmptyState from '@/common/components/EmptyState'
import InlineAlert from '@/common/components/InlineAlert'
import PageHeader from '@/common/components/PageHeader'
import { pagePrimaryActionButtonClass } from '@/common/styles/button'
import { useFeedback } from '@/common/hooks/useFeedback'
import { getApiErrorMessage } from '@/common/utils/apiError'
import type { ItemResponse } from '@/features/master/item/types'
import {
  useItemProcessList,
  useItemsWithProcesses,
} from '@/features/prod-basic/item-process/hooks/useItemProcessQuery'
import type { ItemProcessResponse } from '@/features/prod-basic/item-process/types'
import InspectionStandardDataGrid from '@/features/quality/inspection-standard/components/InspectionStandardDataGrid'
import InspectionStandardFormModal from '@/features/quality/inspection-standard/components/InspectionStandardFormModal'
import {
  useCreateInspectionStandard,
  useDeleteInspectionStandard,
  useInspectionStandardList,
  useUpdateInspectionStandard,
} from '@/features/quality/inspection-standard/hooks/useInspectionStandardQuery'
import type {
  InspectionStandardCreateRequest,
  InspectionStandardResponse,
  InspectionStandardUpdateRequest,
} from '@/features/quality/inspection-standard/types'

const InspectionStandardManagementPage = () => {
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [selectedProcessId, setSelectedProcessId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<InspectionStandardResponse | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  const { showToast, showAlert } = useFeedback()
  const { data: items = [], isLoading: itemsLoading } = useItemsWithProcesses()

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? null,
    [items, selectedItemId],
  )

  const { data: itemProcesses = [], isLoading: processesLoading } =
    useItemProcessList(selectedItemId)

  const selectedProcess = useMemo(
    () => itemProcesses.find((itemProcess) => itemProcess.processId === selectedProcessId) ?? null,
    [itemProcesses, selectedProcessId],
  )

  const {
    data: inspectionStandards = [],
    isLoading: standardsLoading,
    isError,
  } = useInspectionStandardList(selectedItemId, selectedProcessId)

  const createInspectionStandard = useCreateInspectionStandard()
  const updateInspectionStandard = useUpdateInspectionStandard()
  const deleteInspectionStandard = useDeleteInspectionStandard()

  const handlePageSizeChange = (newSize: number) => {
    setSize(newSize)
    setPage(0)
  }

  const handleSelectItem = (value: string) => {
    setSelectedItemId(value ? Number(value) : null)
    setSelectedProcessId(null)
    setPage(0)
  }

  const handleSelectProcess = (value: string) => {
    setSelectedProcessId(value ? Number(value) : null)
    setPage(0)
  }

  const handleOpenCreate = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (inspectionStandard: InspectionStandardResponse) => {
    setEditTarget(inspectionStandard)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditTarget(null)
  }

  const handleSubmit = (data: InspectionStandardCreateRequest | InspectionStandardUpdateRequest) => {
    if (!selectedItem || !selectedProcess) return

    if (editTarget) {
      updateInspectionStandard.mutate(
        {
          id: editTarget.id,
          data: data as InspectionStandardUpdateRequest,
          itemId: selectedItem.id,
          processId: selectedProcess.processId,
        },
        {
          onSuccess: () => {
            showToast({ title: '공정 검사항목을 수정했습니다.', variant: 'success' })
            handleClose()
          },
          onError: (error) => {
            showToast({
              title: getApiErrorMessage(error, '수정 중 오류가 발생했습니다.'),
              variant: 'error',
            })
          },
        },
      )
      return
    }

    createInspectionStandard.mutate(data as InspectionStandardCreateRequest, {
      onSuccess: () => {
        showToast({ title: '공정 검사항목을 등록했습니다.', variant: 'success' })
        handleClose()
      },
      onError: (error) => {
        showToast({
          title: getApiErrorMessage(error, '등록 중 오류가 발생했습니다.'),
          variant: 'error',
        })
      },
    })
  }

  const handleDelete = async (inspectionStandard: InspectionStandardResponse) => {
    if (!selectedItem || !selectedProcess) return

    const confirmed = await showAlert({
      title: '공정 검사항목 삭제',
      message: `"${inspectionStandard.inspectionItemName}" 검사항목 기준을 삭제하시겠습니까?`,
      confirmText: '삭제',
    })
    if (!confirmed) return

    deleteInspectionStandard.mutate(
      {
        id: inspectionStandard.id,
        itemId: selectedItem.id,
        processId: selectedProcess.processId,
      },
      {
        onSuccess: () => {
          showToast({ title: '공정 검사항목을 삭제했습니다.', variant: 'success' })
        },
        onError: (error) => {
          showToast({
            title: getApiErrorMessage(error, '삭제 중 오류가 발생했습니다.'),
            variant: 'error',
          })
        },
      },
    )
  }

  const canRegister = Boolean(selectedItem && selectedProcess)
  const isMutating = createInspectionStandard.isPending || updateInspectionStandard.isPending

  return (
    <div className="space-y-5 p-6">
      <PageHeader
        title="품목별 공정검사항목"
        description="품목과 공정 조합별로 적용할 품질검사 항목과 판정 기준을 관리합니다."
        actions={
          <button
            type="button"
            onClick={handleOpenCreate}
            disabled={!canRegister}
            className={pagePrimaryActionButtonClass}
          >
            <Plus size={16} />
            검사항목 기준 등록
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-base)]">품목</label>
          <AppSelect
            value={selectedItemId === null ? '' : String(selectedItemId)}
            onChange={(event) => handleSelectItem(event.target.value)}
            disabled={itemsLoading}
          >
            <AppMenuItem value="">품목 선택</AppMenuItem>
            {items.map((item: ItemResponse) => (
              <AppMenuItem key={item.id} value={String(item.id)}>
                {item.itemCode} / {item.itemName}
              </AppMenuItem>
            ))}
          </AppSelect>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-base)]">공정</label>
          <AppSelect
            value={selectedProcessId === null ? '' : String(selectedProcessId)}
            onChange={(event) => handleSelectProcess(event.target.value)}
            disabled={!selectedItemId || processesLoading}
          >
            <AppMenuItem value="">공정 선택</AppMenuItem>
            {itemProcesses.map((itemProcess: ItemProcessResponse) => (
              <AppMenuItem key={itemProcess.id} value={String(itemProcess.processId)}>
                {itemProcess.sequence}. {itemProcess.processCode} / {itemProcess.processName}
              </AppMenuItem>
            ))}
          </AppSelect>
        </div>
      </div>

      {isError && (
        <InlineAlert>공정 검사항목 목록을 불러오는 중 오류가 발생했습니다.</InlineAlert>
      )}

      {!selectedItem ? (
        <EmptyState
          message={
            items.length === 0
              ? '공정이 등록된 품목이 없습니다. 생산 기초 > 품목별 공정 관리에서 먼저 공정을 등록하세요.'
              : '품목을 선택하면 적용 공정을 확인할 수 있습니다.'
          }
        />
      ) : !selectedProcess ? (
        <EmptyState message="공정을 선택하면 등록된 검사항목 기준을 확인할 수 있습니다." />
      ) : (
        <InspectionStandardDataGrid
          inspectionStandards={inspectionStandards}
          loading={standardsLoading}
          currentPage={page}
          pageSize={size}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      {modalOpen && selectedItem && selectedProcess && (
        <InspectionStandardFormModal
          key={`${modalOpen ? 'open' : 'closed'}-${editTarget?.id ?? 'create'}-${selectedItem.id}-${selectedProcess.processId}`}
          open={modalOpen}
          selectedItem={selectedItem}
          selectedProcess={selectedProcess}
          editTarget={editTarget}
          onClose={handleClose}
          onSubmit={handleSubmit}
          isLoading={isMutating}
        />
      )}
    </div>
  )
}

export default InspectionStandardManagementPage
