# Frontend 개발 규칙

이 파일은 프론트엔드 개발 시 일관성을 유지하기 위한 규칙 모음입니다.
AI(Claude)와 개발자 모두 이 규칙을 따릅니다.

---

## 1. 폴더 구조

**기능 기준(Feature-first)** 구조를 사용합니다.

```
src/
├── features/             # 도메인별 기능 모음
│   ├── workorder/        # 작업 지시
│   │   ├── components/   # 해당 도메인 전용 컴포넌트
│   │   ├── hooks/        # 해당 도메인 전용 훅
│   │   ├── pages/        # 페이지 컴포넌트
│   │   └── types/        # 해당 도메인 타입 정의
│   ├── production/       # 생산 실적
│   ├── planning/         # 생산 계획
│   ├── quality/          # 품질
│   └── equipment/        # 설비
├── common/
│   ├── components/       # 공통 UI 컴포넌트 (Button, Modal, Table 등)
│   └── hooks/            # 공통 훅
├── store/                # Zustand 전역 상태
├── lib/                  # axios, supabase 등 외부 라이브러리 설정
├── router/               # 라우터 설정 및 인증 가드
└── types/                # 전역 공통 타입 정의
```

**규칙**
- 새 기능은 반드시 `features/{도메인}/` 안에 위치시킵니다.
- 두 도메인 이상에서 사용하는 컴포넌트/훅은 `common/`으로 분리합니다.
- `lib/`에는 외부 라이브러리 초기화·설정 코드만 둡니다.

---

---

## 2. 컴포넌트 설계

### 파일 네이밍
PascalCase로 작성합니다.
```
WorkOrderTable.tsx
CreateWorkOrderModal.tsx
ProductionStatusBadge.tsx
```

### 컴포넌트 분리 기준
아래 중 하나라도 해당하면 컴포넌트로 분리합니다.
- 두 곳 이상에서 재사용되는 UI
- 100줄 이상으로 길어지는 경우
- 독립적인 UI 단위로 의미가 있는 경우

### Props 타입 정의
`interface`를 사용합니다.

```tsx
interface WorkOrderTableProps {
    items: WorkOrder[];
    onSelect: (id: number) => void;
}

const WorkOrderTable = ({ items, onSelect }: WorkOrderTableProps) => {
    // ...
};
```

### 컴포넌트 내부 구조 순서
아래 순서를 지킵니다.

```tsx
const WorkOrderTable = ({ items, onSelect }: WorkOrderTableProps) => {
    // 1. 상태 (useState, useReducer)
    // 2. 훅 (useEffect, 커스텀 훅)
    // 3. 핸들러 함수
    // 4. return (JSX)
};

export default WorkOrderTable;
```

---

---

## 3. 상태 관리

Zustand와 React Query(TanStack Query)를 역할에 따라 분리해서 사용합니다.

| 상태 종류 | 도구 |
|---|---|
| 인증 정보, 로그인 유저 | Zustand |
| 공통 UI 상태 (사이드바, 전역 로딩 등) | Zustand |
| 서버에서 가져오는 데이터 (목록, 단건) | React Query |
| 컴포넌트 내부 상태 | `useState` |

**규칙**
- 서버 데이터를 Zustand Store에 저장하지 않습니다. React Query가 캐싱을 담당합니다.
- Zustand Store는 클라이언트 전용 상태만 관리합니다.
- 도메인별 Store는 꼭 필요한 경우에만 만들고, 기본적으로 최소화합니다.

```
store/
├── authStore.ts    # 인증 (기존)
└── uiStore.ts      # 공통 UI 상태 (사이드바, 전역 모달 등)
```

---

## 4. API 호출

### 구조
API 호출은 두 레이어로 분리합니다.

```
features/{domain}/
├── hooks/
│   └── useWorkOrderQuery.ts    # React Query 훅
└── api/
    └── workOrderApi.ts         # axios 호출 함수 (순수 함수)
```

### API 함수 (`api/`)
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

### React Query 훅 (`hooks/`)
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

---

---

## 5. 스타일링

**Tailwind CSS**를 사용합니다.

```tsx
const WorkOrderTable = () => (
    <div className="w-full overflow-x-auto">
        <table className="w-full text-sm border-collapse">
            <tbody>
                <tr className="border-b hover:bg-gray-50">...</tr>
            </tbody>
        </table>
    </div>
);
```

**규칙**
- 인라인 `style` 속성 사용 금지 — 반드시 Tailwind 클래스를 사용합니다.
- className이 길어질 경우 `cn()` 유틸 함수(clsx + tailwind-merge)로 정리합니다.
- 전역 스타일(폰트, reset 등)은 `src/index.css`에만 작성합니다.
- 반복되는 클래스 조합은 `common/components/`에 공통 컴포넌트로 분리합니다.
- UI 라이브러리 도입 시 이 규칙을 재검토합니다.

---

---

## 6. 라우팅

React Router를 사용합니다. 라우터 설정은 `src/router/`에서 관리합니다.

```
router/
├── index.tsx          # 전체 라우터 설정
└── PrivateRoute.tsx   # 인증 가드
```

### URL 구조
```
/login
/dashboard
/work-orders              # 작업 지시 목록
/work-orders/create       # 작업 지시 생성
/work-orders/:id          # 작업 지시 상세
/production               # 생산 실적
/planning                 # 생산 계획
/quality                  # 품질
/equipment                # 설비
```

### 인증 가드
`authStore`의 `session`을 기준으로 비로그인 시 `/login`으로 리다이렉트합니다.

```tsx
// router/PrivateRoute.tsx
const PrivateRoute = () => {
    const { session } = useAuthStore();
    return session ? <Outlet /> : <Navigate to="/login" replace />;
};

// router/index.tsx
const router = createBrowserRouter([
    { path: '/login', element: <LoginPage /> },
    {
        element: <PrivateRoute />,
        children: [
            { path: '/dashboard', element: <DashboardPage /> },
            { path: '/work-orders', element: <WorkOrderListPage /> },
            { path: '/work-orders/create', element: <CreateWorkOrderPage /> },
            { path: '/work-orders/:id', element: <WorkOrderDetailPage /> },
            // ...
        ],
    },
]);
```

**규칙**
- 페이지 컴포넌트는 반드시 `features/{domain}/pages/`에 위치시킵니다.
- 인증이 필요한 모든 라우트는 `PrivateRoute` 하위에 배치합니다.
- URL은 케밥케이스 복수형을 사용합니다. (`/work-orders`, `/work-orders/:id`)

---

---

## 7. 타입스크립트

### any 사용 금지
타입을 모를 땐 `unknown`으로 받고 타입 가드로 처리합니다.

```ts
// ❌ 금지
const data: any = response.data;

// ✅ 권장
const data: unknown = response.data;
```

### 타입 정의 위치

| 범위 | 위치 |
|---|---|
| 도메인 타입 (엔티티, 요청/응답) | `features/{domain}/types/index.ts` |
| 전역 공통 타입 | `src/types/index.ts` |

### API 응답 타입
백엔드 `ApiResponse` 래퍼와 동일한 구조로 정의합니다.

```ts
// src/types/index.ts
interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    message: string | null;
    code: string | null;
}

interface PageInfo {
    page: number;
    size: number;
    total: number;
}
```

### enum 대신 as const
런타임 번들 크기를 줄이고 타입 추론을 명확하게 합니다.

```ts
// ❌ enum 금지
enum WorkOrderStatus { PENDING, IN_PROGRESS }

// ✅ as const 사용
const WorkOrderStatus = {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
} as const;
type WorkOrderStatus = typeof WorkOrderStatus[keyof typeof WorkOrderStatus];
```

**규칙**
- `any` 사용 금지. 불가피한 경우 `// eslint-disable-next-line` 주석과 이유를 명시합니다.
- 컴포넌트 Props 타입은 반드시 `interface`로 정의합니다. (2번 규칙 참고)
- 외부 API 응답은 반드시 타입을 정의하고, 타입 단언(`as`)은 최소화합니다.
