# API 호출

## 구조
API 호출은 두 레이어로 분리합니다.

```txt
features/{group}/{domain}/
├── hooks/
│   └── useWorkOrderQuery.ts    # React Query 훅
└── api/
    └── workOrderApi.ts         # axios 호출 함수 (순수 함수)
```

## API 함수 (`api/`)
axios를 직접 호출하는 순수 함수만 작성합니다. 컴포넌트나 훅에서 axios를 직접 호출하지 않습니다.

```ts
// features/prod-management/work-order/api/workOrderApi.ts
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
  getById: (id: number) => api.get<ApiResponse<WorkOrderResponse>>(`/work-orders/${id}`),
  create: (data: WorkOrderCreateRequest) =>
    api.post<ApiResponse<WorkOrderResponse>>('/work-orders', data),
  update: (id: number, data: WorkOrderUpdateRequest) =>
    api.put<ApiResponse<WorkOrderResponse>>(`/work-orders/${id}`, data),
  delete: (id: number) => api.delete(`/work-orders/${id}`),
}
```

## React Query 훅 (`hooks/`)
쿼리 키와 API 호출을 묶어서 훅으로 제공합니다. 컴포넌트는 이 훅만 사용합니다.

```ts
// features/prod-management/work-order/hooks/useWorkOrderQuery.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workOrderApi } from '../api/workOrderApi'
import type { WorkOrderCreateRequest } from '../types'

const QUERY_KEY = 'workOrders'

export const useWorkOrderList = (page: number, size: number = 20) =>
  useQuery({
    queryKey: [QUERY_KEY, page, size],
    queryFn: () => workOrderApi.getList(page, size).then((res) => res.data),
  })

export const useWorkOrderDetail = (id: number) =>
  useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => workOrderApi.getById(id).then((res) => res.data.data),
  })

export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: WorkOrderCreateRequest) =>
      workOrderApi.create(data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
```

**규칙**
- 컴포넌트에서 axios 직접 호출 금지 — 반드시 React Query 훅을 통해 호출합니다.
- API 파일은 `@/lib/axios`의 `api` named export를 사용합니다.
- 쿼리 키는 도메인별 상수로 관리합니다.
- Mutation 성공 시 관련 쿼리를 `invalidateQueries`로 갱신합니다.
