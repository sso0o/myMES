import type { GridColDef } from '@mui/x-data-grid'
import AppDataGrid from '@/common/components/AppDataGrid'
import Badge from '@/common/components/Badge'
import type { ProcessResponse } from '@/features/prod-basic/process/types'

const DATA_GRID_PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

interface ProcessEquipmentProcessDataGridProps {
  processes: ProcessResponse[]
  loading: boolean
  selectedProcessId: number | null
  onSelectProcess: (process: ProcessResponse) => void
}

const ProcessEquipmentProcessDataGrid = ({
  processes,
  loading,
  selectedProcessId,
  onSelectProcess,
}: ProcessEquipmentProcessDataGridProps) => {
  const columns: GridColDef<ProcessResponse>[] = [
    {
      field: 'processCode',
      headerName: '공정코드',
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <span
          className={`truncate font-mono text-sm ${
            selectedProcessId === params.row.id
              ? 'text-[var(--primary)]'
              : 'text-[var(--text-muted)]'
          }`}
        >
          {params.row.processCode}
        </span>
      ),
    },
    {
      field: 'processName',
      headerName: '공정명',
      flex: 1,
      minWidth: 160,
      sortable: false,
      renderCell: (params) => (
        <span
          className={`truncate text-sm font-medium ${
            selectedProcessId === params.row.id
              ? 'text-[var(--primary)]'
              : 'text-[var(--text-strong)]'
          }`}
        >
          {params.row.processName}
        </span>
      ),
    },
    {
      field: 'processTypeName',
      headerName: '유형',
      width: 100,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) =>
        params.row.processTypeName ? (
          <Badge shape="rounded">{params.row.processTypeName}</Badge>
        ) : (
          <span className="text-[var(--text-muted)]">-</span>
        ),
    },
  ]

  return (
    <AppDataGrid<ProcessResponse>
      rows={processes}
      columns={columns}
      loading={loading}
      getRowId={(row) => row.id}
      onRowClick={(params) => onSelectProcess(params.row)}
      getRowClassName={(params) =>
        params.row.id === selectedProcessId ? 'selected-process-equipment-process' : ''
      }
      pageSizeOptions={DATA_GRID_PAGE_SIZE_OPTIONS}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 10 },
        },
      }}
      localeText={{ noRowsLabel: '등록된 공정이 없습니다.' }}
      sx={{
        height: '100%',
        border: 'none',
        borderRadius: 0,
        '& .MuiDataGrid-row': {
          cursor: 'pointer',
        },
        '& .MuiDataGrid-row.selected-process-equipment-process': {
          bgcolor: 'var(--primary-soft)',
          '&:hover': {
            bgcolor: 'var(--primary-soft)',
          },
        },
      }}
    />
  )
}

export default ProcessEquipmentProcessDataGrid
