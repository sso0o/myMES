# API 호출

## 구조
API 호출은 두 레이어로 분리합니다.

```
features/{domain}/
├── hooks/
│   └── useWorkOrderQuery.ts    # React Query 훅
└── api/
    └── workOrderApi.ts         # axios 호출 함수 (순수 함수)
```

## API 함수 (`api/`)
axios를 직접 호출하는 순수 함수만 작성합니다. 컴포넌트나 훅에서 axios를 직접 호출하지 않습니다.

```ts
// features/workorder/api/workOrderApi.ts
import api from '@/lib/axios';
import { WorkOrderCreateRequest, WorkOrderResponse } from '../types';

export const workOrderApi = {
    getList: () => api.get<ApiResponse<WorkOrderResponse[]>>('/work-orders'),
    getById: (id: number) => api.get<ApiResponse<WorkOrderResponse>>(`/work-orders/${id}`),
    create: (data: WorkOrderCreateRequest) => api.post<ApiResponse<WorkOrderResponse>>('/work-orders', data),
    update: (id: number, data: WorkOrderUpdateRequest) => api.put(`/work-orders/${id}`, data),
    delete: (id: number) => api.delete(`/work-orders/${id}`),
};
```

## React Query 훅 (`hooks/`)
쿼리 키와 API 호출을 묶어서 훅으로 제공합니다. 컴포넌트는 이 훅만 사용합니다.

```ts
// features/workorder/hooks/useWorkOrderQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workOrderApi } from '../api/workOrderApi';

const QUERY_KEY = 'workOrders';

export const useWorkOrderList = () =>
    useQuery({ queryKey: [QUERY_KEY], queryFn: workOrderApi.getList });

export const useWorkOrderDetail = (id: number) =>
    useQuery({ queryKey: [QUERY_KEY, id], queryFn: () => workOrderApi.getById(id) });

export const useCreateWorkOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: workOrderApi.create,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
    });
};
```

**규칙**
- 컴포넌트에서 axios 직접 호출 금지 — 반드시 React Query 훅을 통해 호출합니다.
- 쿼리 키는 도메인별 상수로 관리합니다.
- Mutation 성공 시 관련 쿼리를 `invalidateQueries`로 갱신합니다.
