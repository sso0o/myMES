# 상태 관리

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
