import { DataGrid } from '@mui/x-data-grid'
import type { DataGridProps, GridValidRowModel } from '@mui/x-data-grid'
import { appDataGridSx } from '@/common/styles/dataGrid'

type AppDataGridProps<R extends GridValidRowModel> = DataGridProps<R>
type AppDataGridSx = AppDataGridProps<GridValidRowModel>['sx']
type AppDataGridSxArray = Extract<NonNullable<AppDataGridSx>, readonly unknown[]>

function isSxArray(sx: AppDataGridSx): sx is AppDataGridSxArray {
  return Array.isArray(sx)
}

function mergeSx(sx: AppDataGridSx): AppDataGridSx {
  if (isSxArray(sx)) {
    return [appDataGridSx, ...sx]
  }

  if (sx === undefined || sx === null) {
    return appDataGridSx
  }

  return [appDataGridSx, sx]
}

/**
 * MUI X DataGrid 공통 래퍼.
 * 기존 HTML table의 CSS 변수 톤(border, surface, text-*)과 일치하는 sx가 기본 적용된다.
 * 소비자는 DataGrid props를 그대로 전달하고, sx로 개별 오버라이드할 수 있다.
 *
 * @example
 * <AppDataGrid rows={rows} columns={columns} />
 */
function AppDataGrid<R extends GridValidRowModel>({
  sx,
  disableRowSelectionOnClick = true,
  ...rest
}: AppDataGridProps<R>) {
  const mergedSx = mergeSx(sx)

  return (
    <div className="h-full w-full min-w-0 max-w-full overflow-hidden">
      <DataGrid<R>
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        sx={mergedSx}
        {...rest}
      />
    </div>
  )
}

export default AppDataGrid
