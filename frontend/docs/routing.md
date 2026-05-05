# 라우팅

React Router를 사용합니다. 라우터 설정은 `src/router/`에서 관리합니다.

```
router/
├── index.tsx          # 전체 라우터 설정
└── PrivateRoute.tsx   # 인증 가드
```

## URL 구조
```
/login
/dashboard
/work-orders              # 작업 지시 목록
/work-orders/create       # 작업 지시 생성
/work-orders/:id          # 작업 지시 상세
/production               # 생산 실적
/planning                 # 생산 계획
/quality                  # 품질
/master/items             # 품목 관리
/master/common-codes      # 공통코드 관리
/prod-basic/processes     # 공정 관리
/prod-basic/equipment     # 설비 관리
/prod-basic/item-processes # 품목별 공정 관리
/prod-basic/boms          # BOM 관리
```

## 인증 가드
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
            { path: '/master/items', element: <ItemManagementPage /> },
            { path: '/prod-basic/processes', element: <ProcessManagementPage /> },
            { path: '/planning', element: <PlanningManagementPage /> },
            // ...
        ],
    },
]);
```

## 에러 처리

라우트 에러는 `RouteErrorScreen` 컴포넌트로 처리합니다.

```
common/components/error/
└── RouteErrorScreen.tsx   # 라우트 에러 전용 화면
```

- `useRouteError()`로 에러를 수신하고 `isRouteErrorResponse()`로 HTTP 에러 여부를 구분합니다.
- 개발 환경(`import.meta.env.DEV`)에서만 스택 트레이스를 표시합니다.
- 라우터 설정에서 `errorElement`로 등록합니다.

```tsx
import RouteErrorScreen from '@/common/components/error/RouteErrorScreen'

const router = createBrowserRouter([
    {
        path: '/',
        errorElement: <RouteErrorScreen />,
        children: [...],
    },
])
```

**규칙**
- 페이지 컴포넌트는 반드시 `pages/`에 위치시킵니다.
- 도메인 구현은 `features/{group}/{domain}/`에 위치시킵니다.
- 인증이 필요한 모든 라우트는 `PrivateRoute` 하위에 배치합니다.
- URL은 케밥케이스 복수형을 사용합니다. (`/work-orders`, `/work-orders/:id`)
