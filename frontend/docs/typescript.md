# 타입스크립트

## any 사용 금지
타입을 모를 땐 `unknown`으로 받고 타입 가드로 처리합니다.

```ts
// ❌ 금지
const data: any = response.data;

// ✅ 권장
const data: unknown = response.data;
```

## 타입 정의 위치

| 범위 | 위치 |
|---|---|
| 도메인 타입 (엔티티, 요청/응답) | `features/{domain}/types/index.ts` |
| 전역 공통 타입 | `src/types/index.ts` |

## API 응답 타입
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

## enum 대신 as const
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
- 컴포넌트 Props 타입은 반드시 `interface`로 정의합니다.
- 외부 API 응답은 반드시 타입을 정의하고, 타입 단언(`as`)은 최소화합니다.
