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

## 에러 토스트
Mutation 실패 토스트는 백엔드 `ApiResponse.message`를 우선 표시합니다. 메시지가 없거나 API 응답 형태가 아니면 기본 문구는 `처리 중 오류가 발생했습니다.`를 사용합니다.

```ts
import { getApiErrorMessage } from '@/common/utils/apiError'

onError: (error) => {
  showToast({
    title: getApiErrorMessage(error, '처리 중 오류가 발생했습니다.'),
    variant: 'error',
  })
}
```

**규칙**
- `BusinessException`으로 내려온 메시지는 사용자가 이해할 수 있는 업무 메시지이므로 숨기지 않습니다.
- 등록/수정/삭제 등 액션별 fallback 문구를 따로 만들지 않고 `처리 중 오류가 발생했습니다.`로 통일합니다.
