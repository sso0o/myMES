import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { primaryActionButtonClass } from '@/common/styles/button'
import { useFeedback } from '@/common/hooks/useFeedback'
import CodeGroupFormModal from '@/features/master/commonCode/components/CodeGroupFormModal'
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

interface NewCodeRow {
  codeName: string
  sortOrder: string
  numberingPrefix: string
}

interface EditCodeRow {
  codeName: string
  sortOrder: string
  numberingPrefix: string
}

const inputCls =
  'w-full rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-sm text-[var(--text-strong)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--primary)]'

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

  return (
    <div className="space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-strong)]">공통코드 관리</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            시스템에서 사용하는 기준 코드를 관리합니다.
          </p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-16rem)] gap-0">
        <div className="flex w-80 shrink-0 flex-col rounded-l-lg border border-[var(--border)] bg-[var(--surface)]">
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

        <ul className="flex-1 overflow-y-auto">
          {groupsLoading ? (
            <li className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">불러오는 중...</li>
          ) : groups.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
              등록된 그룹이 없습니다.
            </li>
          ) : (
            groups.map((group) => (
              <li
                key={group.groupId}
                onClick={() => handleSelectGroup(group.groupId)}
                className={`flex cursor-pointer items-center justify-between px-4 py-3 transition-colors ${
                  selectedGroupId === group.groupId ? 'bg-[var(--primary-soft)]' : 'hover:bg-[var(--surface-alt)]'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      selectedGroupId === group.groupId ? 'text-[var(--primary)]' : 'text-[var(--text-strong)]'
                    }`}
                  >
                    {group.groupName}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-[var(--text-muted)]">{group.groupId}</p>
                </div>

                <div className="ml-2 flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleOpenEditGroup(group)
                    }}
                    className="rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      handleDeleteGroup(group)
                    }}
                    className="rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

        <div className="flex flex-1 flex-col rounded-r-lg border border-l-0 border-[var(--border)] bg-[var(--surface)]">
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
            <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-muted)]">
              좌측에서 코드 그룹을 선택하세요.
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface-alt)] text-[var(--text-base)]">
                <tr>
                  <th className="px-5 py-3 text-left font-medium">코드값</th>
                  <th className="px-5 py-3 text-left font-medium">코드명</th>
                  <th className="w-28 px-5 py-3 text-center font-medium">채번코드</th>
                  <th className="w-24 px-5 py-3 text-center font-medium">정렬</th>
                  <th className="w-20 px-5 py-3 text-center font-medium">상태</th>
                  <th className="w-24 px-5 py-3 text-center font-medium">관리</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border)]/50">
                {codes.length === 0 && !addingRow && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-[var(--text-muted)]">
                      등록된 코드가 없습니다.
                    </td>
                  </tr>
                )}

                {codes.map((code) =>
                  editingId === code.id ? (
                    <tr key={code.id} className="bg-[var(--primary-soft)]/40">
                      <td className="px-5 py-2 font-mono text-[var(--text-muted)]">{code.code}</td>
                      <td className="px-5 py-2">
                        <input
                          className={inputCls}
                          value={editRow.codeName}
                          onChange={(event) => setEditRow((row) => ({ ...row, codeName: event.target.value }))}
                          autoFocus
                          maxLength={100}
                        />
                      </td>
                      <td className="px-5 py-2">
                        <input
                          className={`${inputCls} font-mono text-center`}
                          value={editRow.numberingPrefix}
                          onChange={(event) =>
                            setEditRow((row) => ({ ...row, numberingPrefix: event.target.value.toUpperCase() }))
                          }
                          maxLength={20}
                          placeholder="예: RM"
                        />
                      </td>
                      <td className="px-5 py-2">
                        <input
                          className={`${inputCls} text-center`}
                          type="number"
                          min={1}
                          value={editRow.sortOrder}
                          onChange={(event) => setEditRow((row) => ({ ...row, sortOrder: event.target.value }))}
                        />
                      </td>
                      <td className="px-5 py-2 text-center">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            code.isActive
                              ? 'bg-[var(--success-soft)] text-[var(--success)]'
                              : 'bg-[var(--surface-alt)] text-[var(--text-muted)]'
                          }`}
                        >
                          {code.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-5 py-2">
                        <div className="flex justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(code.id)}
                            disabled={updateCode.isPending}
                            className="rounded p-1.5 text-[var(--success)] transition-colors hover:bg-[var(--success-soft)] disabled:opacity-50"
                            title="저장"
                          >
                            <Check size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-alt)]"
                            title="취소"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={code.id} className="transition-colors hover:bg-[var(--surface-alt)]">
                      <td className="px-5 py-3 font-mono text-[var(--text-base)]">{code.code}</td>
                      <td className="px-5 py-3 text-[var(--text-strong)]">{code.codeName}</td>
                      <td className="px-5 py-3 text-center font-mono text-[var(--text-muted)]">
                        {code.numberingPrefix ?? '-'}
                      </td>
                      <td className="px-5 py-3 text-center text-[var(--text-muted)]">{code.sortOrder}</td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            code.isActive
                              ? 'bg-[var(--success-soft)] text-[var(--success)]'
                              : 'bg-[var(--surface-alt)] text-[var(--text-muted)]'
                          }`}
                        >
                          {code.isActive ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(code)}
                            className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                            title="수정"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCode(code)}
                            className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                            title="삭제"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ),
                )}

                {addingRow && (
                  <tr className="bg-[var(--primary-soft)]/40">
                    <td className="px-5 py-2">
                      <input
                        className={`${inputCls} font-mono bg-[var(--surface-alt)] text-[var(--text-muted)]`}
                        value=""
                        placeholder="저장 시 자동 채번"
                        readOnly
                      />
                    </td>
                    <td className="px-5 py-2">
                      <input
                        className={inputCls}
                        value={newRow.codeName}
                        onChange={(event) => setNewRow((row) => ({ ...row, codeName: event.target.value }))}
                        placeholder="예: 대기"
                        maxLength={100}
                        autoFocus
                      />
                    </td>
                    <td className="px-5 py-2">
                      <input
                        className={`${inputCls} font-mono text-center`}
                        value={newRow.numberingPrefix}
                        onChange={(event) =>
                          setNewRow((row) => ({ ...row, numberingPrefix: event.target.value.toUpperCase() }))
                        }
                        maxLength={20}
                        placeholder="예: RM"
                      />
                    </td>
                    <td className="px-5 py-2">
                      <input
                        className={`${inputCls} text-center`}
                        type="number"
                        min={1}
                        value={newRow.sortOrder}
                        onChange={(event) => setNewRow((row) => ({ ...row, sortOrder: event.target.value }))}
                        placeholder="1"
                      />
                    </td>
                    <td />
                    <td className="px-5 py-2">
                      <div className="flex justify-center gap-1">
                        <button
                          type="button"
                          onClick={handleSaveAdd}
                          disabled={createCode.isPending}
                          className="rounded p-1.5 text-[var(--success)] transition-colors hover:bg-[var(--success-soft)] disabled:opacity-50"
                          title="저장"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelAdd}
                          className="rounded p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-alt)]"
                          title="취소"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>

      <CodeGroupFormModal
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
