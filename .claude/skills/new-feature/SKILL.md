---
name: new-feature
description: 새로운 프론트엔드 기능(도메인) 추가 시 사용. 현재 frontend/src/features의 그룹형 feature 구조에 맞춰 api, hooks, types, schemas, components, page, route를 생성한다.
---

## 프로젝트 기본 정보

- 프레임워크: Vite + React 19 + TypeScript
- 서버 상태 관리: React Query (TanStack Query)
- 클라이언트/UI 상태 관리: Zustand는 전역 인증/UI 상태 중심으로만 사용
- 스타일링: Tailwind CSS + 공통 스타일 상수
- API 통신: `src/lib/axios.ts`의 `api` named export 사용
- 기본 feature 경로: `frontend/src/features/{group}/{domain}/`

`{group}`는 현재 네비게이션/라우트 그룹을 기준으로 정한다.

- `master`: 기준정보. 예: `item`, `commonCode`
- `prod-basic`: 생산 기초. 예: `process`, `equipment`, `item-process`, `bom`
- `prod-management`: 생산 관리. 예: `planning`
- 새 그룹이 필요하면 `frontend/src/router/index.tsx`, `MainLayout/Sidebar`의 메뉴 구조와 함께 판단한다.

---

## 실제 생성 파일 구조

새 도메인 `{domain}` 추가 시 기본 구조는 아래를 따른다.

```txt
frontend/src/features/{group}/{domain}/
├── api/
│   └── {domainCamel}Api.ts
├── components/
│   ├── {Domain}DataGrid.tsx
│   └── {Domain}FormModal.tsx          # 등록/수정 폼이 있을 때
├── hooks/
│   └── use{Domain}Query.ts
├── schemas/
│   └── {domainCamel}Schema.ts         # 폼 검증이 있을 때
└── types/
    └── index.ts
```

라우트에 노출되는 화면은 feature 내부가 아니라 `pages/`에 둔다.

```txt
frontend/src/pages/{Domain}ManagementPage.tsx
frontend/src/router/index.tsx
```

관계형/대량 처리 UI가 필요한 도메인은 현재 패턴처럼 전용 컴포넌트를 추가한다.

```txt
components/
├── {Domain}DataGrid.tsx
├── {Domain}ItemDataGrid.tsx
├── {Domain}BulkCopyModal.tsx
└── {Domain}StatusBadge.tsx
```

---

## 네이밍 규칙

- 폴더명은 현재 라우트와 메뉴 기준을 따른다.
    - kebab-case 사용: `item-process`, `process-equipment`
    - 기존 예외 유지: `commonCode`
- API 파일: `{domainCamel}Api.ts`
    - 예: `itemApi.ts`, `itemProcessApi.ts`, `commonCodeApi.ts`
- Hook 파일: `use{Domain}Query.ts`
    - 예: `useItemQuery.ts`, `useItemProcessQuery.ts`
- Schema 파일: `{domainCamel}Schema.ts`
    - 예: `itemSchema.ts`, `planningSchema.ts`
- Types 파일: 항상 `types/index.ts`
- 표 컴포넌트는 신규 작성 시 `DataGrid` 네이밍을 우선한다.
    - 예: `ItemDataGrid.tsx`, `PlanningDataGrid.tsx`
    - 기존 `Table` 컴포넌트는 남아있어도 새 기능의 기본값으로 만들지 않는다.

---

## types/index.ts

- 백엔드 DTO와 1:1로 맞춰 `Response`, `CreateRequest`, `UpdateRequest`를 정의한다.
- `any` 사용 금지. 필요하면 `unknown` + 타입 가드를 사용한다.
- `enum` 대신 `as const` 패턴을 사용한다.
- nullable 응답은 백엔드와 동일하게 `T | null`로 표현한다.

```ts
export const PlanStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  RELEASED: 'RELEASED',
  CLOSED: 'CLOSED',
} as const
export type PlanStatus = (typeof PlanStatus)[keyof typeof PlanStatus]

export interface WorkOrderResponse {
  id: number
  workOrderNo: string
  itemId: number
  itemCode: string
  itemName: string
  orderedQty: number
  dueDate: string
  memo: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkOrderCreateRequest {
  itemId: number
  orderedQty: number
  dueDate: string
  memo?: string
}

export interface WorkOrderUpdateRequest {
  itemId: number
  orderedQty: number
  dueDate: string
  memo?: string
}
```

---

## api/{domainCamel}Api.ts

- `import { api } from '@/lib/axios'`를 사용한다.
- `axios`를 직접 import하지 않는다.
- `ApiResponse<T>`는 `@/types`에서 import한다.
- feature 타입은 `../types`에서 import한다.
- API 경로에 `/api`를 다시 붙이지 않는다.
- 함수 내부 `try-catch` 금지. 에러 처리는 호출부 또는 공통 axios/feedback 흐름에서 처리한다.
- 목록 조회는 현재 백엔드 응답에 맞춰 page/size 또는 status 등 params를 명시한다.

```ts
import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type {
  WorkOrderCreateRequest,
  WorkOrderResponse,
  WorkOrderUpdateRequest,
} from '../types'

export const workOrderApi = {
  getList: (page: number, size: number) =>
    api.get<ApiResponse<WorkOrderResponse[]>>('/work-orders', { params: { page, size } }),

  getById: (id: number) =>
    api.get<ApiResponse<WorkOrderResponse>>(`/work-orders/${id}`),

  create: (data: WorkOrderCreateRequest) =>
    api.post<ApiResponse<WorkOrderResponse>>('/work-orders', data),

  update: (id: number, data: WorkOrderUpdateRequest) =>
    api.put<ApiResponse<WorkOrderResponse>>(`/work-orders/${id}`, data),

  delete: (id: number) => api.delete(`/work-orders/${id}`),
}
```

---

## hooks/use{Domain}Query.ts

- 한 도메인의 query/mutation 훅은 `use{Domain}Query.ts`에 모은다.
- query key는 파일 상단 상수로 관리한다.
- API 응답 unwrap은 현재 패턴처럼 `then((res) => res.data...)`를 사용한다.
- mutation 성공 시 관련 query를 `invalidateQueries`로 갱신한다.
- 다른 도메인의 옵션 조회가 필요하면 해당 도메인의 API를 import해 별도 옵션 훅을 함께 둔다.

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workOrderApi } from '../api/workOrderApi'
import type { WorkOrderCreateRequest, WorkOrderUpdateRequest } from '../types'

const QUERY_KEY = 'workOrders'

export const useWorkOrderList = (page: number, size: number = 20) =>
  useQuery({
    queryKey: [QUERY_KEY, page, size],
    queryFn: () => workOrderApi.getList(page, size).then((res) => res.data),
  })

export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WorkOrderCreateRequest) =>
      workOrderApi.create(data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useUpdateWorkOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: WorkOrderUpdateRequest }) =>
      workOrderApi.update(id, data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}

export const useDeleteWorkOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => workOrderApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
```

---

## schemas/{domainCamel}Schema.ts

- 폼이 있으면 `react-hook-form` + `zod` + `@hookform/resolvers` 조합을 사용한다.
- schema 파일은 feature 내부 `schemas/`에 둔다.
- `z.input<>`과 `z.output<>` 타입을 분리한다.
- 문자열 trim, 빈 문자열 `undefined` 변환 등 payload 정리는 schema에서 우선 처리한다.

```ts
import { z } from 'zod'

export const workOrderFormSchema = z.object({
  itemId: z.coerce
    .number({ error: '품목을 선택해주세요.' })
    .int()
    .positive('품목을 선택해주세요.'),

  orderedQty: z.coerce
    .number({ error: '지시수량을 입력해주세요.' })
    .int('지시수량은 정수여야 합니다.')
    .min(1, '지시수량은 1 이상이어야 합니다.'),

  dueDate: z
    .string({ error: '납기일을 선택해주세요.' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다.'),

  memo: z
    .string()
    .max(500, '메모는 500자 이하로 입력해주세요.')
    .transform((v) => v.trim() || undefined)
    .optional(),
})

export type WorkOrderFormInput = z.input<typeof workOrderFormSchema>
export type WorkOrderFormValues = z.output<typeof workOrderFormSchema>
```

---

## components/

### {Domain}DataGrid.tsx

- 목록 UI는 `DataGrid` 컴포넌트 네이밍을 우선한다.
- MUI DataGrid 또는 공통 `AppDataGrid`/`Pagination` 패턴을 기존 도메인과 맞춰 사용한다.
- 컴포넌트에서 axios 직접 호출 금지.
- 데이터 fetch/mutation은 page에서 hook을 호출하고, DataGrid는 props로 데이터를 받는 패턴을 우선한다.
- Props 타입은 컴포넌트 상단에 `interface {Domain}DataGridProps`로 정의한다.
- 이벤트 props는 `onEdit`, `onDelete`, `onPageChange`처럼 `on{Event}`로 둔다.
- Tailwind CSS와 `common/styles/*`의 공통 class 상수를 사용한다. 인라인 `style` 금지.

### {Domain}FormModal.tsx

- `Modal` 공통 컴포넌트를 우선 사용한다.
- `react-hook-form`과 `zodResolver(schema)`를 사용한다.
- 수정 폼은 `defaultValues`를 명시한다.
- `open`, `editTarget` 변경 시 `reset()`으로 값을 동기화한다.
- 단일 필드 구독은 `watch()`보다 `useWatch()`를 우선한다.
- submit payload는 `CreateRequest | UpdateRequest` 타입과 호환되게 변환한다.

---

## pages/{Domain}ManagementPage.tsx

- 라우트 단위 화면은 `pages/`에 둔다.
- 페이지에서 pagination, modal open, edit target 같은 화면 상태를 관리한다.
- 페이지에서 React Query 훅을 호출하고 DataGrid/FormModal에 props를 전달한다.
- 사용자 피드백은 `useFeedback()`의 `showToast`, `showAlert`를 사용한다.
- 삭제 동작은 `showAlert`로 확인 후 mutation을 호출한다.
- 상단 제목/액션은 `PageHeader`, `pagePrimaryActionButtonClass`, `lucide-react` 아이콘 패턴을 따른다.

```tsx
import { useState } from 'react'
import { Plus } from 'lucide-react'
import PageHeader from '@/common/components/PageHeader'
import InlineAlert from '@/common/components/InlineAlert'
import { useFeedback } from '@/common/hooks/useFeedback'
import { pagePrimaryActionButtonClass } from '@/common/styles/button'
import WorkOrderDataGrid from '@/features/prod-management/work-order/components/WorkOrderDataGrid'
import WorkOrderFormModal from '@/features/prod-management/work-order/components/WorkOrderFormModal'
import {
  useCreateWorkOrder,
  useDeleteWorkOrder,
  useUpdateWorkOrder,
  useWorkOrderList,
} from '@/features/prod-management/work-order/hooks/useWorkOrderQuery'
import type {
  WorkOrderCreateRequest,
  WorkOrderResponse,
  WorkOrderUpdateRequest,
} from '@/features/prod-management/work-order/types'

const WorkOrderManagementPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<WorkOrderResponse | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)

  const { showToast, showAlert } = useFeedback()
  const { data: response, isLoading, isError } = useWorkOrderList(page, size)
  const workOrders = response?.data ?? []
  const pagination = response?.pagination

  const createWorkOrder = useCreateWorkOrder()
  const updateWorkOrder = useUpdateWorkOrder()
  const deleteWorkOrder = useDeleteWorkOrder()

  const handleOpenCreate = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (workOrder: WorkOrderResponse) => {
    setEditTarget(workOrder)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditTarget(null)
  }

  const handleSubmit = (data: WorkOrderCreateRequest | WorkOrderUpdateRequest) => {
    if (editTarget) {
      updateWorkOrder.mutate(
        { id: editTarget.id, data },
        {
          onSuccess: () => {
            showToast({ title: '작업지시를 수정했습니다.', variant: 'success' })
            handleClose()
          },
          onError: () => showToast({ title: '수정 중 오류가 발생했습니다.', variant: 'error' }),
        },
      )
      return
    }

    createWorkOrder.mutate(data as WorkOrderCreateRequest, {
      onSuccess: () => {
        showToast({ title: '작업지시를 등록했습니다.', variant: 'success' })
        handleClose()
      },
      onError: () => showToast({ title: '등록 중 오류가 발생했습니다.', variant: 'error' }),
    })
  }

  const handleDelete = async (workOrder: WorkOrderResponse) => {
    const confirmed = await showAlert({
      title: '작업지시 삭제',
      message: `"${workOrder.workOrderNo}" 작업지시를 삭제하시겠습니까?`,
      confirmText: '삭제',
    })
    if (!confirmed) return

    deleteWorkOrder.mutate(workOrder.id, {
      onSuccess: () => showToast({ title: '작업지시를 삭제했습니다.', variant: 'success' }),
      onError: () => showToast({ title: '삭제 중 오류가 발생했습니다.', variant: 'error' }),
    })
  }

  return (
    <div className="space-y-5 p-6">
      <PageHeader
        title="작업지시 관리"
        description="생산 작업지시를 관리합니다."
        actions={
          <button type="button" onClick={handleOpenCreate} className={pagePrimaryActionButtonClass}>
            <Plus size={16} />
            작업지시 등록
          </button>
        }
      />

      {isError && <InlineAlert>작업지시 목록을 불러오는 중 오류가 발생했습니다.</InlineAlert>}

      <WorkOrderDataGrid
        items={workOrders}
        loading={isLoading}
        currentPage={page}
        totalItems={pagination?.total ?? 0}
        pageSize={size}
        onPageChange={setPage}
        onPageSizeChange={setSize}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <WorkOrderFormModal
        open={modalOpen}
        editTarget={editTarget}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isLoading={createWorkOrder.isPending || updateWorkOrder.isPending}
      />
    </div>
  )
}

export default WorkOrderManagementPage
```

---

## 라우팅/메뉴 연결

- 새 페이지를 `frontend/src/router/index.tsx`에 import하고 route를 추가한다.
- 실제 메뉴 노출이 필요하면 `frontend/src/common/components/layout/Sidebar.tsx`의 그룹 메뉴도 함께 수정한다.
- 라우트 경로는 현재 그룹 경로와 맞춘다.
    - `master`: `/master/{domain-plural-kebab}`
    - `prod-basic`: `/prod-basic/{domain-plural-kebab}`
    - `prod-management`: 필요 시 기존 `/planning` 또는 신규 `/prod-management/...` 패턴을 코드와 메뉴에 맞춰 결정한다.

---

## Zustand 사용 기준

- feature 생성 시 store 파일을 기본 생성하지 않는다.
- 서버 데이터는 React Query에 둔다.
- 페이지 안에서 끝나는 modal open, edit target, pagination 상태는 `useState`로 관리한다.
- 두 페이지 이상에서 공유되는 UI 상태이거나 전역 레이아웃/인증 상태일 때만 Zustand를 검토한다.

---

## 생성 체크리스트

- [ ] feature 경로가 `features/{group}/{domain}/` 구조인가
- [ ] 파일명이 실제 패턴(`types/index.ts`, `use{Domain}Query.ts`, `{domainCamel}Api.ts`)과 맞는가
- [ ] API 파일이 `@/lib/axios`의 `api` named export를 사용하는가
- [ ] API 경로에 `/api`를 중복으로 붙이지 않았는가
- [ ] 컴포넌트에서 axios/API 함수를 직접 호출하지 않는가
- [ ] 서버 데이터는 React Query로 관리하고 mutation 성공 후 invalidate 하는가
- [ ] feature store를 불필요하게 만들지 않았는가
- [ ] 폼이 있으면 `schemas/` + zod + react-hook-form 구조를 적용했는가
- [ ] zod 타입을 `z.input<>`, `z.output<>`로 분리했는가
- [ ] `any`와 `enum`을 사용하지 않았는가
- [ ] 페이지를 `pages/{Domain}ManagementPage.tsx`에 만들고 router에 연결했는가
- [ ] 메뉴 노출이 필요하면 `Sidebar.tsx`까지 연결했는가
- [ ] Tailwind CSS와 공통 스타일 상수를 사용하고 인라인 style을 쓰지 않았는가
- [ ] 사용자 피드백은 `useFeedback()` 패턴을 따르는가
