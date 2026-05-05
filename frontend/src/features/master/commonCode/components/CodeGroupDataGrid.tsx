import { Pencil, Trash2 } from 'lucide-react'
import type { GridColDef } from '@mui/x-data-grid'
import AppDataGrid from '@/common/components/AppDataGrid'
import {
  deleteIconButtonClass,
  editIconButtonClass,
} from '@/common/styles/button'
import type { CodeGroupResponse } from '@/features/master/commonCode/types'

const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]
const compactActionCellClass = 'flex h-full w-full items-center justify-center gap-1'

interface CodeGroupDataGridProps {
  groups: CodeGroupResponse[]
  loading: boolean
  selectedGroupId: string | null
  onSelectGroup: (groupId: string) => void
  onEditGroup: (group: CodeGroupResponse) => void
  onDeleteGroup: (group: CodeGroupResponse) => void
}

const CodeGroupDataGrid = ({
  groups,
  loading,
  selectedGroupId,
  onSelectGroup,
  onEditGroup,
  onDeleteGroup,
}: CodeGroupDataGridProps) => {
  const groupColumns: GridColDef<CodeGroupResponse>[] = [
    {
      field: 'groupId',
      headerName: '코드',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <span
          className={`truncate font-mono text-sm ${
            selectedGroupId === params.row.groupId
              ? 'text-[var(--primary)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          {params.row.groupId}
        </span>
      ),
    },
    {
      field: 'groupName',
      headerName: '그룹명',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <span
          className={`truncate text-sm font-medium ${
            selectedGroupId === params.row.groupId
              ? 'text-[var(--primary)]'
              : 'text-[var(--text-strong)]'
          }`}
        >
          {params.row.groupName}
        </span>
      ),
    },
    {
      field: 'groupActions',
      headerName: '관리',
      width: 76,
      sortable: false,
      disableColumnMenu: true,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => {
        const group = params.row

        return (
          <div className={compactActionCellClass}>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onEditGroup(group)
              }}
              className={editIconButtonClass}
              title="수정"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onDeleteGroup(group)
              }}
              className={deleteIconButtonClass}
              title="삭제"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <AppDataGrid<CodeGroupResponse>
      rows={groups}
      columns={groupColumns}
      loading={loading}
      getRowId={(row) => row.id}
      onRowClick={(params) => onSelectGroup(params.row.groupId)}
      getRowClassName={(params) =>
        params.row.groupId === selectedGroupId ? 'selected-code-group' : ''
      }
      pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 10 },
        },
      }}
      localeText={{ noRowsLabel: '등록된 그룹이 없습니다.' }}
      sx={{
        height: '100%',
        border: 'none',
        borderRadius: 0,
        '& .MuiDataGrid-row': {
          cursor: 'pointer',
        },
        '& .MuiDataGrid-row.selected-code-group': {
          bgcolor: 'var(--primary-soft)',
          '&:hover': {
            bgcolor: 'var(--primary-soft)',
          },
        },
      }}
    />
  )
}

export default CodeGroupDataGrid
