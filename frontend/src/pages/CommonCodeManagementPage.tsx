import { useState } from 'react'
import { Plus } from 'lucide-react'
import EmptyState from '@/common/components/EmptyState'
import PageHeader from '@/common/components/PageHeader'
import { primaryActionButtonClass } from '@/common/styles/button'
import { useFeedback } from '@/common/hooks/useFeedback'
import CodeGroupFormModal from '@/features/master/commonCode/components/CodeGroupFormModal'
import CodeGroupDataGrid from '@/features/master/commonCode/components/CodeGroupDataGrid'
import CommonCodeDataGrid, {
  NEW_ROW_ID,
  type EditCodeRow,
  type NewCodeRow,
} from '@/features/master/commonCode/components/CommonCodeDataGrid'
import {
  useCodeGroupDetail,
  useCodeGroupList,
  useCreateCodeGroup,
  useCreateCommonCode,
  useDeleteCodeGroup,
  useDeleteCommonCode,
  useUpdateCodeGroup,
  useUpdateCommonCode,
} from '@/features/master/commonCode/hooks/useCommonCodeQuery'
import type {
  CodeGroupCreateRequest,
  CodeGroupResponse,
  CodeGroupUpdateRequest,
  CommonCodeResponse,
} from '@/features/master/commonCode/types'

const CommonCodeManagementPage = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [editGroup, setEditGroup] = useState<CodeGroupResponse | null>(null)
  const [addingRow, setAddingRow] = useState(false)
  const [newRow, setNewRow] = useState<NewCodeRow>({ codeName: '', sortOrder: '', numberingPrefix: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editRow, setEditRow] = useState<EditCodeRow>({ codeName: '', sortOrder: '', numberingPrefix: '' })

  const { showToast, showAlert } = useFeedback()

  const { data: groups = [], isLoading: groupsLoading, isError: groupsError } = useCodeGroupList()
  const { data: groupDetail } = useCodeGroupDetail(selectedGroupId)

  const createGroup = useCreateCodeGroup()
  const updateGroup = useUpdateCodeGroup()
  const deleteGroup = useDeleteCodeGroup()
  const createCode = useCreateCommonCode()
  const updateCode = useUpdateCommonCode()
  const deleteCode = useDeleteCommonCode()

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId)
    setAddingRow(false)
    setEditingId(null)
  }

  const handleOpenCreateGroup = () => {
    setEditGroup(null)
    setGroupModalOpen(true)
  }

  const handleOpenEditGroup = (group: CodeGroupResponse) => {
    setEditGroup(group)
    setGroupModalOpen(true)
  }

  const handleGroupSubmit = (data: CodeGroupCreateRequest | CodeGroupUpdateRequest) => {
    if (editGroup) {
      updateGroup.mutate(
        { groupId: editGroup.groupId, data: data as CodeGroupUpdateRequest },
        {
          onSuccess: () => {
            showToast({ title: '코드 그룹이 수정되었습니다.', variant: 'success' })
            setGroupModalOpen(false)
            setEditGroup(null)
          },
          onError: () => showToast({ title: '수정 중 오류가 발생했습니다.', variant: 'error' }),
        },
      )
      return
    }

    createGroup.mutate(data as CodeGroupCreateRequest, {
      onSuccess: () => {
        showToast({ title: '코드 그룹이 등록되었습니다.', variant: 'success' })
        setGroupModalOpen(false)
      },
      onError: () => showToast({ title: '등록 중 오류가 발생했습니다.', variant: 'error' }),
    })
  }

  const handleDeleteGroup = async (group: CodeGroupResponse) => {
    const confirmed = await showAlert({
      title: '코드 그룹 삭제',
      message: `"${group.groupName}" 그룹을 삭제하시겠습니까?`,
      confirmText: '삭제',
    })
    if (!confirmed) return

    deleteGroup.mutate(group.groupId, {
      onSuccess: () => {
        showToast({ title: '코드 그룹이 삭제되었습니다.', variant: 'success' })
        if (selectedGroupId === group.groupId) setSelectedGroupId(null)
      },
      onError: () => showToast({ title: '삭제 중 오류가 발생했습니다.', variant: 'error' }),
    })
  }

  const handleStartAdd = () => {
    setEditingId(null)
    setNewRow({ codeName: '', sortOrder: '', numberingPrefix: '' })
    setAddingRow(true)
  }

  const handleCancelAdd = () => {
    setAddingRow(false)
    setNewRow({ codeName: '', sortOrder: '', numberingPrefix: '' })
  }

  const handleSaveAdd = () => {
    if (!selectedGroupId) return

    const order = parseInt(newRow.sortOrder, 10)
    if (!newRow.codeName.trim() || isNaN(order) || order < 1) {
      showToast({ title: '코드명과 정렬 순서를 입력해주세요.', variant: 'error' })
      return
    }

    createCode.mutate(
      {
        groupId: selectedGroupId,
        data: {
          codeName: newRow.codeName.trim(),
          sortOrder: order,
          numberingPrefix: newRow.numberingPrefix.trim().toUpperCase() || undefined,
        },
      },
      {
        onSuccess: () => {
          showToast({ title: '코드가 등록되었습니다.', variant: 'success' })
          setAddingRow(false)
          setNewRow({ codeName: '', sortOrder: '', numberingPrefix: '' })
        },
        onError: () => showToast({ title: '등록 중 오류가 발생했습니다.', variant: 'error' }),
      },
    )
  }

  const handleStartEdit = (code: CommonCodeResponse) => {
    setAddingRow(false)
    setEditingId(code.id)
    setEditRow({
      codeName: code.codeName,
      sortOrder: String(code.sortOrder),
      numberingPrefix: code.numberingPrefix ?? '',
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditRow({ codeName: '', sortOrder: '', numberingPrefix: '' })
  }

  const handleSaveEdit = (codeId: number) => {
    if (!selectedGroupId) return

    const order = parseInt(editRow.sortOrder, 10)
    if (!editRow.codeName.trim() || isNaN(order) || order < 1) {
      showToast({ title: '코드명과 정렬 순서를 입력해주세요.', variant: 'error' })
      return
    }

    updateCode.mutate(
      {
        groupId: selectedGroupId,
        codeId,
        data: {
          codeName: editRow.codeName.trim(),
          sortOrder: order,
          numberingPrefix: editRow.numberingPrefix.trim().toUpperCase() || undefined,
        },
      },
      {
        onSuccess: () => {
          showToast({ title: '코드가 수정되었습니다.', variant: 'success' })
          setEditingId(null)
        },
        onError: () => showToast({ title: '수정 중 오류가 발생했습니다.', variant: 'error' }),
      },
    )
  }

  const handleDeleteCode = async (code: CommonCodeResponse) => {
    if (!selectedGroupId) return

    const confirmed = await showAlert({
      title: '코드 삭제',
      message: `"${code.codeName}" 코드를 삭제하시겠습니까?`,
      confirmText: '삭제',
    })
    if (!confirmed) return

    deleteCode.mutate(
      { groupId: selectedGroupId, codeId: code.id },
      {
        onSuccess: () => showToast({ title: '코드가 삭제되었습니다.', variant: 'success' }),
        onError: () => showToast({ title: '삭제 중 오류가 발생했습니다.', variant: 'error' }),
      },
    )
  }

  const selectedGroup = groups.find((group) => group.groupId === selectedGroupId)
  const codes = groupDetail?.codes ?? []
  const canAddCode = Boolean(selectedGroupId) && !addingRow

  // 추가 중일 때 센티넬 행을 rows 끝에 삽입
  const newRowSentinel: CommonCodeResponse = {
    id: NEW_ROW_ID,
    groupId: selectedGroupId ?? '',
    code: '',
    codeName: '',
    sortOrder: 0,
    isActive: true,
    numberingPrefix: null,
    createdAt: '',
  }
  const codeRows: CommonCodeResponse[] = addingRow ? [...codes, newRowSentinel] : codes

  return (
    <div className="min-w-0 max-w-full space-y-5 overflow-hidden p-6">
      <PageHeader title="공통코드 관리" description="시스템에서 사용하는 기준 코드를 관리합니다." />

      <div className="flex h-[calc(100vh-16rem)] min-w-0 gap-0">
        {/* 좌측: 코드 그룹 목록 */}
        <div className="flex w-96 shrink-0 flex-col rounded-l-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <span className="text-sm font-semibold text-[var(--text-strong)]">코드 그룹</span>
            <button
              type="button"
              onClick={handleOpenCreateGroup}
              className={primaryActionButtonClass}
            >
              <Plus size={13} />
              그룹 추가
            </button>
          </div>

          {groupsError && (
            <p className="px-4 py-3 text-xs text-[var(--danger)]">그룹 목록을 불러오지 못했습니다.</p>
          )}

          <div className="min-h-0 flex-1">
            <CodeGroupDataGrid
              groups={groups}
              loading={groupsLoading}
              selectedGroupId={selectedGroupId}
              onSelectGroup={handleSelectGroup}
              onEditGroup={handleOpenEditGroup}
              onDeleteGroup={handleDeleteGroup}
            />
          </div>
        </div>

        {/* 우측: 선택한 그룹의 코드 항목 */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-r-lg border border-l-0 border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
            <div>
              <span className="text-sm font-semibold text-[var(--text-strong)]">
                {selectedGroup ? selectedGroup.groupName : '코드 항목'}
              </span>
              {selectedGroup && (
                <span className="ml-2 font-mono text-xs text-[var(--text-muted)]">
                  {selectedGroup.groupId}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleStartAdd}
              disabled={!canAddCode}
              className={primaryActionButtonClass}
            >
              <Plus size={13} />
              코드 추가
            </button>
          </div>

          {!selectedGroupId ? (
            <EmptyState message="좌측에서 코드 그룹을 선택하세요." fill />
          ) : (
            <div className="min-h-0 flex-1">
              <CommonCodeDataGrid
                rows={codeRows}
                editingId={editingId}
                newRow={newRow}
                editRow={editRow}
                createPending={createCode.isPending}
                updatePending={updateCode.isPending}
                onNewRowChange={setNewRow}
                onEditRowChange={setEditRow}
                onSaveAdd={handleSaveAdd}
                onCancelAdd={handleCancelAdd}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onDeleteCode={handleDeleteCode}
              />
            </div>
          )}
        </div>
      </div>

      <CodeGroupFormModal
        key={`${groupModalOpen ? 'open' : 'closed'}-${editGroup?.groupId ?? 'create'}`}
        open={groupModalOpen}
        editTarget={editGroup}
        onClose={() => {
          setGroupModalOpen(false)
          setEditGroup(null)
        }}
        onSubmit={handleGroupSubmit}
        isLoading={createGroup.isPending || updateGroup.isPending}
      />
    </div>
  )
}

export default CommonCodeManagementPage
