# MES 프로젝트에서 TanStack Query 써보니까 — 서버 상태, 이렇게 정리됐다

> MapStruct, Zustand에 이어 세 번째 회고다.
> MES 프론트엔드에서 14개 도메인의 서버 데이터를 관리하면서 TanStack Query(React Query)를 어떻게 썼는지,
> queryKey는 어떻게 설계했는지, 캐시 무효화는 어떤 기준으로 했는지 정리한다.

---

## 왜 TanStack Query였나

API 응답 데이터를 관리하는 가장 단순한 방법은 `useState` + `useEffect`다.

```typescript
// 직접 구현하면 이런 코드가 도메인마다 반복된다
const [items, setItems] = useState([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

useEffect(() => {
  setLoading(true)
  itemApi.getList()
    .then(res => setItems(res.data))
    .catch(err => setError(err))
    .finally(() => setLoading(false))
}, [])
```

로딩 상태, 에러 상태, 데이터 갱신 타이밍, 캐싱, 중복 요청 방지까지 전부 손으로 짜야 한다.
도메인이 14개인 프로젝트에서 이걸 반복하고 싶진 않았다.

TanStack Query는 이걸 대신 해준다.

- 자동 캐싱 — 같은 쿼리 키면 네트워크 요청 없이 캐시 반환
- 로딩/에러 상태 내장 — `isLoading`, `isError`를 별도로 관리할 필요 없음
- 자동 리페치 — 창 포커스 복귀, 네트워크 재연결 시 자동으로 최신 데이터 동기화
- `useMutation` — 데이터 변경 후 캐시 무효화까지 한 흐름으로 처리

이전 글에서 정리한 역할 분리 원칙도 그래서 자연스럽게 정해졌다.
**서버에서 오는 데이터 → TanStack Query, 클라이언트 UI 상태 → Zustand.**

---

## 기본 구조 — API 함수와 쿼리 훅을 2레이어로 분리

컴포넌트에서 axios를 직접 부르는 건 피했다. 대신 아래처럼 2단계로 나눴다.

```
features/{domain}/api/{domain}Api.ts     — 순수 axios 함수
features/{domain}/hooks/use{Domain}Query.ts — TanStack Query 훅
```

### 1레이어 — API 함수

axios 호출만 담당한다. 쿼리 로직은 모른다.

```typescript
// features/master/item/api/itemApi.ts
import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types'
import type { ItemResponse, ItemCreateRequest, ItemUpdateRequest } from '../types'

export const itemApi = {
  getList: (page: number, size: number) =>
    api.get<ApiResponse<ItemResponse[]>>('/master/items', { params: { page, size } }),
  create: (data: ItemCreateRequest) =>
    api.post<ApiResponse<ItemResponse>>('/master/items', data),
  update: (id: number, data: ItemUpdateRequest) =>
    api.put<ApiResponse<ItemResponse>>(`/master/items/${id}`, data),
  delete: (id: number) =>
    api.delete(`/master/items/${id}`),
}
```

### 2레이어 — 쿼리 훅

API 함수를 `queryFn`에 연결하고, 캐시 키와 무효화 전략을 담당한다.

```typescript
// features/master/item/hooks/useItemQuery.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { itemApi } from '../api/itemApi'

const QUERY_KEY = 'items'

export const useItemList = (page: number, size: number = 20) =>
  useQuery({
    queryKey: [QUERY_KEY, page, size],
    queryFn: () => itemApi.getList(page, size).then((res) => res.data),
  })

export const useCreateItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ItemCreateRequest) =>
      itemApi.create(data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  })
}
```

컴포넌트는 이 훅만 가져다 쓴다. axios가 뭔지, 캐시 키가 뭔지 알 필요 없다.

```typescript
function ItemPage() {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useItemList(page)
  const createItem = useCreateItem()

  return (
    <>
      {isLoading ? <Spinner /> : <ItemTable items={data} />}
      <button onClick={() => createItem.mutate(newItemData)}>추가</button>
    </>
  )
}
```

---

## useQuery — 데이터 조회

`useQuery`의 핵심은 `queryKey`와 `queryFn` 두 가지다.

```typescript
useQuery({
  queryKey: ['items', page, size],  // 캐시를 식별하는 키
  queryFn: () => itemApi.getList(page, size).then(res => res.data),  // 실제 데이터 fetch
})
```

`queryKey`가 같으면 이미 캐시된 데이터를 돌려주고, 다르면 새로 요청한다.
`page`가 바뀌면 `queryKey`도 달라지니까, 페이지마다 독립된 캐시가 생긴다.

반환값도 직관적이다.

```typescript
const { data, isLoading, isError, error } = useItemList(page)
```

로딩/에러 상태를 별도로 관리할 필요가 없다.

### enabled — 조건부 쿼리

어떤 값이 있을 때만 쿼리를 실행해야 할 때 쓴다.
예를 들어 품목을 선택해야 그 품목의 공정 목록을 가져올 수 있는 경우.

```typescript
// features/prod-basic/item-process/hooks/useItemProcessQuery.ts
export const useItemProcessList = (itemId: number | null) =>
  useQuery({
    queryKey: ['itemProcesses', itemId],
    queryFn: () => itemProcessApi.getByItemId(itemId!).then((res) => res.data.data ?? []),
    enabled: itemId !== null,  // itemId가 없으면 요청 자체를 안 함
  })
```

`enabled: false`이면 `queryFn`이 실행되지 않는다. `isLoading`도 `false`로 유지된다.
`itemId`가 들어오는 순간 자동으로 요청이 시작된다.

---

## useMutation — 데이터 변경

`useMutation`은 생성/수정/삭제처럼 서버 상태를 바꾸는 작업에 쓴다.

```typescript
export const useCreateItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ItemCreateRequest) =>
      itemApi.create(data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  })
}
```

컴포넌트에서는 `mutate` 또는 `mutateAsync`로 실행한다.

```typescript
const createItem = useCreateItem()

// 비동기 처리가 필요 없다면 mutate
createItem.mutate(formData)

// await가 필요하다면 mutateAsync
const result = await createItem.mutateAsync(formData)
```

`onSuccess`에서 `invalidateQueries`를 호출하면, 해당 캐시가 stale 처리되어 자동으로 다시 fetch된다.
화면이 즉시 최신 데이터로 갱신되는 게 이 흐름이다.

---

## queryKey 설계 전략

프로젝트에서 가장 많이 고민한 부분이다. 처음엔 그냥 문자열 하나만 썼는데, 도메인이 쌓이면서 체계가 필요해졌다.

### 패턴 1 — 단순 도메인 키

조건이 없는 목록 조회.

```typescript
const QUERY_KEY = 'workers'

queryKey: [QUERY_KEY]  // ['workers']
```

### 패턴 2 — 파라미터 포함

필터나 페이지 조건이 있을 때. 조건이 달라지면 별도 캐시로 관리된다.

```typescript
queryKey: ['items', page, size]          // 페이지네이션
queryKey: ['workOrders', status]         // 상태 필터
queryKey: ['productionPlans', status]    // 상태 필터
```

### 패턴 3 — 부모-자식 관계

부모 ID에 종속된 자식 목록.

```typescript
queryKey: ['itemProcesses', itemId]               // 품목별 공정 목록
queryKey: ['productionRecords', workOrderId]      // 작업지시별 생산실적
queryKey: ['processEquipments', 'process', processId]  // 공정별 설비
```

### 패턴 4 — 복합 경로

계층 구조가 깊은 경우.

```typescript
queryKey: ['boms', parentItemId, 'version', versionId]  // 특정 버전의 BOM 라인
queryKey: ['code-groups', groupId]                       // 코드 그룹 상세
```

### 패턴 5 — 공유 쿼리 키

여러 도메인에서 공통으로 쓰는 코드 목록. 네임스페이스를 통일해두면 한 곳에서 무효화할 수 있다.

```typescript
queryKey: ['commonCodes', 'ITEM_TYPE']
queryKey: ['commonCodes', 'EQUIPMENT_TYPE']
queryKey: ['commonCodes', 'PROCESS_TYPE']
```

**원칙 하나:** 첫 번째 요소는 항상 도메인 이름. 뒤로 갈수록 구체적인 조건.
이렇게 하면 무효화할 때 얼마나 넓게 날릴지 조절할 수 있다.

---

## invalidateQueries 무효화 전략

변경이 일어났을 때 어느 캐시를 날릴지 결정하는 게 중요하다.
너무 좁으면 화면이 안 갱신되고, 너무 넓으면 불필요한 API 요청이 많아진다.

### 전체 무효화 — 해당 도메인 전부

단순 CRUD에서 주로 쓴다.

```typescript
// 'items'로 시작하는 모든 캐시 무효화
// ['items'], ['items', 0, 20], ['items', 1, 20] 전부 날아감
onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] })
```

### 선택적 무효화 — 특정 ID 기준

부모 ID에 종속된 자식 데이터를 바꿨을 때.

```typescript
// 특정 품목의 공정만 무효화. 다른 품목 공정은 건드리지 않음
onSuccess: (_, variables) =>
  queryClient.invalidateQueries({ queryKey: ['itemProcesses', variables.itemId] })
```

### 다중 무효화 — 여러 캐시를 동시에

하나의 액션이 여러 쿼리에 영향을 줄 때.
BOM 저장은 현재 BOM 목록과 버전 히스토리 두 개를 모두 갱신해야 했다.

```typescript
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({ queryKey: ['boms', variables.parentItemId] })
  queryClient.invalidateQueries({ queryKey: ['bom-versions', variables.parentItemId] })
}
```

### forEach 무효화 — 여러 ID를 순회

Bulk 작업처럼 여러 대상의 캐시를 각각 무효화해야 할 때.

```typescript
// BOM 일괄 복사 — 원본 1개 + 대상 N개 모두 갱신
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({ queryKey: ['boms', variables.sourceItemId] })
  variables.targetItemIds.forEach((id) =>
    queryClient.invalidateQueries({ queryKey: ['boms', id] })
  )
}
```

### 네임스페이스 무효화 — 상위 키로 한 번에

대시보드처럼 여러 쿼리가 동일한 네임스페이스로 묶여 있을 때.

```typescript
// ['dashboard', 'summary', 'MONTH']
// ['dashboard', 'workOrderStatus', 'MONTH']
// ['dashboard', 'issues']
// 전부 한 번에 날아감
queryClient.invalidateQueries({ queryKey: ['dashboard'] })
```

---

## Supabase Realtime + TanStack Query

대시보드는 작업지시, 생산실적, 불량 테이블이 바뀌면 실시간으로 갱신되어야 했다.
Supabase의 PostgreSQL Realtime 기능과 TanStack Query를 조합했다.

```typescript
// features/dashboard/hooks/useDashboardQuery.ts
export function useDashboardRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      // 작업지시 테이블 변경 감지
      .on('postgres_changes', { event: '*', schema: 'public', table: 'work_orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      })
      // 생산실적 테이블 변경 감지
      .on('postgres_changes', { event: '*', schema: 'public', table: 'production_records' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      })
      // 불량기록 테이블 변경 감지
      .on('postgres_changes', { event: '*', schema: 'public', table: 'defect_records' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [queryClient])
}
```

쓰는 쪽은 이렇게 단순하다.

```typescript
function DashboardPage() {
  useDashboardRealtime()  // DB 변경 감지 리스너 등록

  const { data: summary } = useDashboardSummary('MONTH')
  const { data: workOrders } = useWorkOrderStatus('MONTH')
  // ...
}
```

Supabase가 DB 변경을 감지하면 → `invalidateQueries` 호출 → TanStack Query가 자동 리페치.
WebSocket 이벤트를 직접 상태에 반영하지 않고, **무효화 트리거로만 쓰는 게 핵심**이다.
데이터 정합성을 서버에 위임하고 클라이언트는 "다시 가져오기"만 하면 된다.

---

## 트러블슈팅

### 1. enabled 없이 조건부 쿼리를 만들었을 때

처음엔 `enabled`를 몰라서 이렇게 짰다.

```typescript
// ❌ itemId가 null이어도 API를 호출해버림
export const useItemProcessList = (itemId: number | null) =>
  useQuery({
    queryKey: ['itemProcesses', itemId],
    queryFn: () => itemProcessApi.getByItemId(itemId!),  // null! 로 강제 단언
  })
```

`itemId`가 null인 상태에서 API가 호출되고, 백엔드에서 400 에러가 터졌다.

```typescript
// ✅ enabled로 조건 걸기
export const useItemProcessList = (itemId: number | null) =>
  useQuery({
    queryKey: ['itemProcesses', itemId],
    queryFn: () => itemProcessApi.getByItemId(itemId!).then((res) => res.data.data ?? []),
    enabled: itemId !== null,
  })
```

`enabled: false`일 때는 `queryFn` 자체가 실행되지 않는다. null 단언(`!`)도 안전하게 쓸 수 있다.

### 2. 페이지네이션에서 queryKey에 page를 빠뜨렸을 때

처음에 이렇게 짰더니 페이지가 바뀌어도 데이터가 안 바뀌었다.

```typescript
// ❌ page가 바뀌어도 queryKey가 같으니 캐시를 그대로 씀
queryKey: ['items'],
queryFn: () => itemApi.getList(page, size).then((res) => res.data),
```

```typescript
// ✅ page와 size를 key에 포함해야 각 페이지가 독립 캐시를 가짐
queryKey: ['items', page, size],
queryFn: () => itemApi.getList(page, size).then((res) => res.data),
```

`queryKey`가 같으면 TanStack Query는 캐시를 그대로 반환한다.
동적으로 바뀌는 값은 반드시 `queryKey`에 포함해야 한다.

### 3. invalidation 범위를 너무 좁게 잡았을 때

공통 코드(`commonCodes`)는 품목, 설비, 공정 여러 곳에서 옵션으로 쓰인다.
처음엔 각자 다른 키를 썼다.

```typescript
// ❌ 각 도메인에서 제각각 키를 씀
queryKey: ['itemTypeOptions']   // 품목 유형
queryKey: ['equipmentTypes']    // 설비 유형
```

공통 코드를 수정해도 어느 캐시가 오래됐는지 추적하기 어려웠다.

```typescript
// ✅ 네임스페이스를 통일
queryKey: ['commonCodes', 'ITEM_TYPE']
queryKey: ['commonCodes', 'EQUIPMENT_TYPE']
queryKey: ['commonCodes', 'PROCESS_TYPE']
```

이렇게 하니까 공통 코드 그룹 전체를 갱신해야 할 때 `['commonCodes']` 하나로 끝났다.

### 4. onSuccess에서 mutation 변수를 제대로 못 꺼냈을 때

`onSuccess`의 시그니처는 `(data, variables, context)` 순서다.
처음엔 `variables`를 빠뜨려서 어떤 ID의 캐시를 무효화해야 하는지 알 수 없었다.

```typescript
// ❌ variables를 안 받아서 itemId를 모름
onSuccess: () =>
  queryClient.invalidateQueries({ queryKey: ['itemProcesses'] })  // 전체 무효화로 임시방편
```

```typescript
// ✅ variables에서 itemId 꺼내서 선택적 무효화
onSuccess: (_, variables) =>
  queryClient.invalidateQueries({ queryKey: ['itemProcesses', variables.itemId] })
```

첫 번째 인자가 `data`(응답값), 두 번째가 `variables`(mutate에 넘긴 인자)다.
선택적 무효화가 필요하면 `variables`를 잘 활용해야 한다.

---

## 정리하면

| 상황 | 방법 |
|---|---|
| 단순 목록 조회 | `useQuery` + 도메인 문자열 `queryKey` |
| 조건부 쿼리 | `enabled` 옵션 |
| 동적 파라미터(페이지, 필터) | `queryKey`에 포함 |
| 데이터 변경 후 갱신 | `useMutation` + `onSuccess: invalidateQueries` |
| 특정 ID 기준 무효화 | `variables`에서 꺼내서 선택적 무효화 |
| 여러 캐시 동시 무효화 | `forEach + invalidateQueries` |
| 상위 네임스페이스로 한 번에 | 상위 key로 `invalidateQueries` |
| 실시간 갱신 | Realtime 이벤트 → `invalidateQueries` |

TanStack Query를 쓰면서 가장 크게 느낀 건 **서버 상태 관리에 집중할 수 있게 됐다**는 것이다.
로딩 상태, 에러 처리, 캐시 동기화를 직접 짜지 않아도 되니까, 비즈니스 로직에 더 집중할 수 있었다.
queryKey 설계를 초반에 잘 잡아두는 게 제일 중요했다. 나중에 바꾸면 무효화 로직도 다 따라서 바꿔야 하니까.
