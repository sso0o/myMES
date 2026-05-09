# MES 프로젝트에서 Zustand 써보니까 — 전역 상태, 이렇게 정리됐다

> React + Vite로 MES 프론트엔드를 개발하면서 전역 상태 관리로 Zustand를 선택했다.
> Redux도 알고 있었고 Recoil도 써본 적 있었는데, 왜 Zustand였나, 어떻게 썼나, 쓰면서 뭘 배웠나를 순서대로 적어본다.

---

## 왜 Zustand였나

처음에 Redux를 쓸까 고민했다. 그런데 MES 특성상 전역에서 공유해야 할 클라이언트 상태가 사실 많지 않았다.

- 로그인 세션 (인증 정보)
- 전역 피드백 UI (토스트, 알럿 다이얼로그)

이 두 가지가 전부였다. 그런데 Redux를 쓰면 store 설정, action, reducer, selector를 전부 셋업해야 한다.
보일러플레이트가 너무 많았고, 그 코드가 실제로 하는 일에 비해 오버스펙이라는 느낌이 강했다.

Zustand는 달랐다.

```typescript
import { create } from 'zustand'

const useCountStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))
```

store 생성, 상태, 액션이 한 파일 안에 다 들어간다.
Provider로 감쌀 필요도 없고, `connect()` HOC도 없다.
컴포넌트에서 그냥 hook처럼 불러다 쓰면 끝이다.

---

## Zustand 기본 사용 패턴

### store 만들기

`create()` 함수에 상태와 액션을 함께 정의한다. 타입도 interface로 명시해두면 자동완성이 잘 된다.

```typescript
import { create } from 'zustand'

interface CountState {
  count: number
  increment: () => void
  reset: () => void
}

const useCountStore = create<CountState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}))
```

### 컴포넌트에서 쓰기

```typescript
function Counter() {
  // selector로 필요한 것만 구독 — count가 바뀔 때만 리렌더링
  const count = useCountStore((state) => state.count)
  const increment = useCountStore((state) => state.increment)

  return <button onClick={increment}>{count}</button>
}
```

**selector를 쓰는 게 중요하다.** `useCountStore()` 로 전체를 구독하면 store 어디가 바뀌든 리렌더링이 발생한다.
`(state) => state.count` 처럼 필요한 슬라이스만 구독해야 불필요한 렌더링을 막을 수 있다.

---

## 실제 프로젝트 — authStore

### 설계 의도

Supabase Auth를 쓰는 프로젝트였다. 인증 흐름은 이렇다.

1. Supabase가 JWT 발급
2. `authStore`가 세션 상태를 들고 있음
3. axios 인터셉터가 모든 API 요청에 토큰 자동 첨부
4. Spring Boot 백엔드가 토큰 검증

`authStore`가 담당하는 것: **세션 보관 + 로그인/로그아웃 액션 + 초기화**

### 코드

```typescript
// src/store/authStore.ts
import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    set({ session: data.session, user: data.user })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null })
  },

  initialize: async () => {
    // 1. 앱 시작 시 저장된 세션 복원
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null, loading: false })

    // 2. 이후 세션 변경(토큰 갱신, 외부 로그아웃 등) 자동 반영
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },
}))
```

### 앱 시작 시 initialize()

`initialize()`는 React가 렌더링을 시작하기 전에 한 번 호출해야 한다.
React를 마운트하기 전에 세션을 복원해놔야, 첫 렌더링부터 인증 상태가 올바르게 보인다.

```typescript
// src/main.tsx
async function bootstrap() {
  try {
    // React 렌더링 전에 세션 복원
    await useAuthStore.getState().initialize()

    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  } catch (error) {
    root.render(<StartupErrorScreen message="앱 시작 중 오류가 발생했습니다." />)
  }
}

void bootstrap()
```

`useAuthStore.getState()`는 컴포넌트 바깥에서 store에 접근하는 Zustand 방식이다.
React hook은 컴포넌트 안에서만 호출할 수 있기 때문에, main.tsx 같은 최상단에서는 `getState()`를 써야 한다.

### PrivateRoute에서 세션 체크

```typescript
// src/router/PrivateRoute.tsx
const PrivateRoute = () => {
  const { session, loading } = useAuthStore()

  if (loading) {
    return <div>Loading...</div>
  }

  return session ? <Outlet /> : <Navigate to="/login" replace />
}
```

`loading` 플래그가 중요하다. `initialize()`가 끝나기 전엔 session이 null이라 `/login`으로 튕겨버린다.
`loading: true` 동안은 렌더링을 보류하고, 복원이 끝난 뒤에야 판단한다.

---

## 실제 프로젝트 — uiStore

### 설계 의도

토스트 알림과 확인 다이얼로그를 전역에서 쓰고 싶었다.
로그인 성공, 저장 완료, 삭제 확인 같은 피드백이 어느 컴포넌트에서나 호출되어야 했는데,
prop drilling은 말도 안 됐고 Context를 새로 파기도 번거로웠다.

Zustand에 `showToast`, `showAlert`를 넣어두고, 어디서든 꺼내 쓰는 구조로 만들었다.

```typescript
// src/store/uiStore.ts
export const useUiStore = create<UiState>((set, get) => ({
  toasts: [],
  alertState: null,
  nextToastId: 1,
  alertResolver: null,

  showToast: (input) => {
    const id = get().nextToastId
    set((state) => ({
      toasts: [...state.toasts, { id, ...input, variant: input.variant ?? 'info', duration: input.duration ?? 3000 }],
      nextToastId: state.nextToastId + 1,
    }))
  },

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  // Promise를 반환해서 사용자의 확인/취소를 await할 수 있음
  showAlert: (input) =>
    new Promise<boolean>((resolve) => {
      set({
        alertState: { open: true, ...input, confirmText: input.confirmText ?? '확인' },
        alertResolver: resolve,
      })
    }),

  confirmAlert: () => {
    const resolver = get().alertResolver
    set({ alertState: null, alertResolver: null })
    resolver?.(true)
  },

  cancelAlert: () => {
    const resolver = get().alertResolver
    set({ alertState: null, alertResolver: null })
    resolver?.(false)
  },
}))
```

### showAlert가 Promise를 반환한다는 게 핵심

`showAlert`를 `await`하면 사용자가 확인/취소를 누를 때까지 기다릴 수 있다.

```typescript
// 어느 컴포넌트에서든 이렇게 쓴다
const handleSignOut = async () => {
  const confirmed = await showAlert({
    title: '로그아웃',
    message: '로그아웃 하시겠습니까?',
    confirmText: '로그아웃',
  })
  if (!confirmed) return
  await signOut()
}
```

`showAlert`가 호출되면 store에 `alertResolver`(Promise의 resolve 함수)를 저장해둔다.
사용자가 버튼을 누르면 `confirmAlert()` 또는 `cancelAlert()`가 resolver를 호출하며 Promise가 완료된다.
이 패턴 덕분에 다이얼로그 상태와 비즈니스 로직이 완전히 분리된다.

### useFeedback — store를 한 번 더 추상화

```typescript
// src/common/hooks/useFeedback.ts
export function useFeedback() {
  const showToast = useUiStore((state) => state.showToast)
  const showAlert = useUiStore((state) => state.showAlert)
  return { showToast, showAlert }
}
```

컴포넌트에서 직접 `useUiStore`를 부르는 대신, `useFeedback()` 하나로 감싸뒀다.
나중에 toast 라이브러리를 바꾸거나 내부 구현이 달라져도 컴포넌트 코드를 건드리지 않아도 된다.

---

## Zustand vs React Query — 역할을 어떻게 나눴나

이게 이 프로젝트에서 제일 많이 고민했던 부분이다.

처음엔 "서버에서 오는 데이터도 Zustand에 다 넣을까?" 싶었는데, 그러면 캐싱, 리페치, 에러 처리, 로딩 상태를 전부 직접 구현해야 한다는 걸 깨달았다.

결론은 이렇게 정리됐다.

| 상태 종류 | 도구 | 이유 |
|---|---|---|
| 인증 세션, 로그인 사용자 정보 | Zustand | 서버 요청 없이 클라이언트가 직접 관리 |
| 토스트, 알럿 같은 UI 상태 | Zustand | 서버와 무관한 순수 UI 레이어 |
| API로 가져오는 데이터 (품목, 설비 등) | React Query | 캐싱, 자동 리페치, 로딩/에러 상태 내장 |
| 데이터 생성/수정/삭제 | React Query (useMutation) | 성공 시 캐시 무효화, 낙관적 업데이트 등 |

```typescript
// React Query — 서버 데이터
export const useItemList = (page: number, size: number = 20) =>
  useQuery({
    queryKey: ['items', page, size],
    queryFn: () => itemApi.getList(page, size).then((res) => res.data),
  })

export const useCreateItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ItemCreateRequest) => itemApi.create(data).then((res) => res.data.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  })
}
```

```typescript
// Zustand — 클라이언트 상태
const { signIn, signOut, user } = useAuthStore()
const { showToast, showAlert } = useFeedback()
```

"이 상태가 서버와 동기화되어야 하나?" 라는 질문 하나로 구분하면 꽤 명확해진다.
서버에서 오는 거면 React Query, 그렇지 않으면 Zustand.

---

## 트러블슈팅

### 1. axios 인터셉터에서 useAuthStore를 쓰면 안 된다

처음엔 axios 인터셉터에서 `useAuthStore.getState().session?.access_token` 으로 토큰을 꺼내려 했다.

문제는 토큰 만료다. Supabase는 토큰이 만료되면 자동으로 갱신해주는데,
store에 저장된 토큰은 갱신 시점에 따라 오래된 값일 수 있었다.

결국 인터셉터에서는 Supabase SDK를 직접 호출하는 방식으로 바꿨다.

```typescript
// src/lib/axios.ts
api.interceptors.request.use(async (config) => {
  // store의 캐시된 값 대신, SDK를 직접 호출해서 항상 최신 토큰을 가져옴
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})
```

`supabase.auth.getSession()`은 내부적으로 토큰이 만료됐을 때 자동으로 갱신한다.
store는 세션 상태를 UI에 보여주는 용도이고, **실제 토큰은 Supabase SDK가 가장 정확하게 들고 있다.**

### 2. 컴포넌트 바깥에서 store 접근 — getState() 사용

`useAuthStore`는 React hook이라 컴포넌트 안에서만 호출할 수 있다.
`main.tsx`에서 렌더링 전에 `initialize()`를 호출해야 하는 상황에서 막혔다.

Zustand는 이를 위해 `getState()`를 제공한다.

```typescript
// 컴포넌트 바깥 — main.tsx, 유틸 함수 등
await useAuthStore.getState().initialize()

// setState도 가능
useAuthStore.setState({ loading: false })
```

hook처럼 구독/렌더링 기능은 없지만, 상태를 읽거나 액션을 호출하는 데는 충분하다.

### 3. selector 없이 전체 구독하면 렌더링이 과하게 발생

초반에 이렇게 썼다가 성능 문제를 겪었다.

```typescript
// ❌ 전체 구독 — uiStore가 바뀔 때마다(토스트 추가/삭제 등) 전부 리렌더링
const store = useUiStore()
const showToast = store.showToast
```

```typescript
// ✅ selector로 필요한 것만 구독
const showToast = useUiStore((state) => state.showToast)
const showAlert = useUiStore((state) => state.showAlert)
```

특히 `uiStore`는 토스트가 추가/제거될 때마다 상태가 바뀌는데,
전체 구독 컴포넌트가 그때마다 리렌더링되면 의도치 않은 성능 저하가 생긴다.

---

## 정리하면

Zustand를 쓰면서 느낀 가장 큰 장점은 **보일러플레이트가 거의 없다**는 것이다.
store 하나 만드는 데 파일 하나, 코드 20줄이면 충분하다. Redux였다면 slice, action, reducer, selector가 각각 필요했을 것이다.

역할 분리도 명확해졌다.
- 서버 데이터 → React Query
- 클라이언트 상태 → Zustand

이 원칙 하나로 "이걸 어디에 넣어야 하지?" 라는 고민이 사라졌다.

주의할 점은 두 가지였다. selector로 구독 범위를 좁힐 것, 그리고 컴포넌트 바깥에서는 `getState()`를 쓸 것.
이 두 가지만 챙기면 Zustand는 꽤 단순하고 예측 가능하게 동작한다.
