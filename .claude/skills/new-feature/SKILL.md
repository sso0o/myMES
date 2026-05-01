---
name: new-feature
description: 새로운 프론트엔드 기능(도메인) 추가 시 사용. features/ 구조에 맞게 components, hooks, store, api, types 전체를 프론트엔드 개발 규칙에 따라 생성한다.
---

## 프로젝트 기본 정보
- 프레임워크: Vite + React 18 + TypeScript
- 서버 상태 관리: React Query (TanStack Query)
- 클라이언트/UI 상태 관리: Zustand
- 스타일링: Tailwind CSS
- API 통신: Axios instance 래핑 (`src/lib/axios.ts`)
- 베이스 경로: `frontend/src/features/{domain}/`

---

## 생성할 파일 목록

새 도메인 `{domain}` 추가 시 아래 파일을 기본으로 생성한다.

```
frontend/src/features/{domain}/
├── components/
│   ├── {Domain}List.tsx         # 목록 컴포넌트
│   └── {Domain}Detail.tsx       # 상세/폼 컴포넌트
├── hooks/
│   ├── use{Domain}s.ts          # 목록 조회 훅
│   └── use{Domain}.ts           # 단건 조회 훅
├── api/
│   └── {domain}Api.ts           # axios 래핑 API 함수
└── types/
    └── {domain}.types.ts        # 타입 정의
```

UI 전용 상태가 꼭 필요할 때만 아래 파일을 추가 생성한다.

```text
frontend/src/features/{domain}/store/{domain}Store.ts
```

---

## 각 파일 작성 규칙

### types/{domain}.types.ts
- 백엔드 DTO와 1:1로 맞춰 정의
- `any` 사용 금지
- `interface`는 객체 타입, `type`은 유니온/인터섹션에 사용
- `enum` 대신 `as const` 사용

```ts
// features/workorder/types/workOrder.types.ts

export interface WorkOrder {
    id: number;
    name: string;
    quantity: number;
    createdAt: string;
    updatedAt: string;
}

export interface WorkOrderCreateRequest {
    name: string;
    quantity: number;
}

export interface WorkOrderUpdateRequest {
    name?: string;
    quantity?: number;
}

export const WorkOrderStatus = {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
} as const;

export type WorkOrderStatus = typeof WorkOrderStatus[keyof typeof WorkOrderStatus];
```

### api/{domain}Api.ts
- `src/lib/axios.ts`의 instance만 사용 (`axios` 직접 import 금지)
- 순수 함수로 작성 (사이드이펙트 없이 요청/응답만 처리)
- 응답 타입 반드시 제네릭으로 명시 — `ApiResponse<T>`는 `@/types`에서 import
- 함수 내부 try-catch 금지 — 에러 처리는 훅에서 담당
- 경로에 /api를 다시 붙이지 않음 — axios instance의 baseURL이 이미 `/api`

```ts
// features/workorder/api/workOrderApi.ts
import { api } from '@/lib/axios';
import type {
  WorkOrder,
  WorkOrderCreateRequest,
  WorkOrderUpdateRequest,
} from '../types/workOrder.types';
import type { ApiResponse } from '@/types';

export const workOrderApi = {
  getList: () => api.get<ApiResponse<WorkOrder[]>>('/work-orders'),
  getById: (id: number) => api.get<ApiResponse<WorkOrder>>(`/work-orders/${id}`),
  create: (data: WorkOrderCreateRequest) =>
    api.post<ApiResponse<WorkOrder>>('/work-orders', data),
  update: (id: number, data: WorkOrderUpdateRequest) =>
    api.put<ApiResponse<WorkOrder>>(`/work-orders/${id}`, data),
  delete: (id: number) => api.delete<ApiResponse<void>>(`/work-orders/${id}`),
};
```

### store/{domain}Store.ts
- UI 상태만 관리 (서버 데이터는 훅에서 관리, 스토어에 저장 금지)
- 상태(state)와 액션(actions) 명확히 분리
- `set` 직접 노출 금지 — 액션 함수로만 상태 변경
- `devtools` 미들웨어 적용

```ts
// features/workorder/store/workOrderStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface WorkOrderState {
  selectedId: number | null;
  isDetailOpen: boolean;
  isCreateOpen: boolean;
}

interface WorkOrderActions {
  selectWorkOrder: (id: number) => void;
  openCreate: () => void;
  closeModal: () => void;
}

type WorkOrderStore = WorkOrderState & WorkOrderActions;

export const useWorkOrderStore = create<WorkOrderStore>()(
  devtools(
    (set) => ({
      // state
      selectedId: null,
      isDetailOpen: false,
      isCreateOpen: false,

      // actions
      selectWorkOrder: (id) => set({ selectedId: id, isDetailOpen: true }),
      openCreate: () => set({ isCreateOpen: true }),
      closeModal: () => set({ selectedId: null, isDetailOpen: false, isCreateOpen: false }),
    }),
    { name: '{domain}Store' }
  )
);
```

### hooks/use{Domain}s.ts (목록 조회)
- API 호출 로직은 반드시 커스텀 훅으로 분리
- 서버 데이터는 React Query로 관리
- 로딩/에러 상태를 훅에서 캡슐화
- 단일 책임 — 하나의 훅은 하나의 기능만
- 필요 시 `refetch`로 재조회 가능
- 변경 작업은 mutation 훅에서 처리하고 성공 후 `invalidateQueries`로 갱신

```ts
// features/workorder/hooks/useWorkOrders.ts
import { useQuery } from '@tanstack/react-query';
import { workOrderApi } from '../api/workOrderApi';
import type { WorkOrder } from '../types/workOrder.types';
import type { Pagination } from '@/types';

const QUERY_KEY = 'workOrders';

interface UseWorkOrdersResult {
  workOrders: WorkOrder[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<unknown>;
}

export function useWorkOrders(): UseWorkOrdersResult {
  const query = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const res = await workOrderApi.getList();
      // res.data → ApiResponse<WorkOrder[]>
      // res.data.data → 실제 WorkOrder[] 데이터
      // res.data.pagination → 페이지네이션 정보 (없으면 null)
      return {
        workOrders: res.data.data ?? [],
        pagination: res.data.pagination,
      };
    },
  });

  return {
    workOrders: query.data?.workOrders ?? [],
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    error: query.isError ? '데이터를 불러오는 데 실패했습니다.' : null,
    refetch: async () => {
      const result = await query.refetch();
      return result.data;
    },
  };
}
```

### hooks/use{Domain}.ts (단건 + 뮤테이션)
```ts
// features/workorder/hooks/useWorkOrder.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workOrderApi } from '../api/workOrderApi';
import type {
  WorkOrder,
  WorkOrderCreateRequest,
  WorkOrderUpdateRequest,
} from '../types/workOrder.types';

const QUERY_KEY = 'workOrders';

export function useWorkOrder(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async (): Promise<WorkOrder | null> => {
      const res = await workOrderApi.getById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WorkOrderCreateRequest): Promise<WorkOrder | null> => {
      const res = await workOrderApi.create(data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: WorkOrderUpdateRequest;
    }): Promise<WorkOrder | null> => {
      const res = await workOrderApi.update(id, data);
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await workOrderApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
```

### components/{Domain}List.tsx
- 함수형 컴포넌트만 사용
- Props 타입은 컴포넌트 상단에 `interface {Component}Props`로 정의
- 컴포넌트 내부에서 직접 API 호출 금지 — 커스텀 훅 사용
- 컴포넌트 내부에서 Zustand 스토어 직접 조작 금지 — 액션 함수 사용
- 이벤트 핸들러: `handle{Event}`, Props 이벤트: `on{Event}`
- 스타일은 Tailwind CSS만 사용 (인라인 스타일 금지)
- 조건부 클래스는 `clsx` 사용

```tsx
// features/workorder/components/WorkOrderList.tsx
import { clsx } from 'clsx';
import { useWorkOrders } from '../hooks/useWorkOrders';
import { useWorkOrderStore } from '../store/workOrderStore';

export default function WorkOrderList() {
    const { workOrders, isLoading, error } = useWorkOrders();
    const { selectWorkOrder, openCreate } = useWorkOrderStore();

    if (isLoading) return <div className="p-4 text-gray-500">로딩 중...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">작업 지시 목록</h2>
                <button
                    onClick={openCreate}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                >
                    + 새 작업 지시
                </button>
            </div>
            {workOrders.map((workOrder) => (
                <div
                    key={workOrder.id}
                    onClick={() => selectWorkOrder(workOrder.id)}
                    className={clsx(
                        'cursor-pointer rounded-lg border p-4 transition-colors',
                        'hover:border-blue-400 hover:bg-blue-50'
                    )}
                >
                    <p className="font-medium">{workOrder.name}</p>
                    <p className="text-sm text-gray-500">수량: {workOrder.quantity}</p>
                </div>
            ))}
        </div>
    );
}
```

---

## 생성 체크리스트

- [ ] `types/` — 백엔드 DTO와 1:1 타입 정의, `any` 없는가
- [ ] `api/` — `src/lib/axios.ts` instance 사용, 내부 try-catch 없는가
- [ ] `store/` — UI 상태만 관리, 서버 데이터 저장 없는가
- [ ] `hooks/` — API 호출 로직 분리, 로딩/에러 상태 관리되는가
- [ ] `hooks/` — 서버 데이터를 React Query(`useQuery`, `useMutation`)로 관리하는가
- [ ] mutation 성공 후 `invalidateQueries`로 관련 쿼리를 갱신하는가
- [ ] `components/` — 직접 API 호출 없는가, 인라인 스타일 없는가
- [ ] 컴포넌트에서 스토어 직접 조작 없고 액션 함수만 사용하는가
- [ ] 이벤트 핸들러 네이밍 규칙 (`handle{Event}` / `on{Event}`) 지켰는가
- [ ] `enum` 대신 `as const` 사용했는가
- [ ] 조건부 클래스는 `clsx` 사용했는가
