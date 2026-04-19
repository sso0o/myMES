# 📌 MES (Manufacturing Execution System)

제조 공정에서 생산 계획, 작업 지시, 생산 실적을 관리하는 MES 시스템입니다.  
Spring Boot 기반 백엔드와 React 기반 프론트엔드로 구성된 풀스택 프로젝트입니다.

---

## 🛠 Tech Stack

### Backend
- Java 17
- Spring Boot 3.x
- Spring Security (Supabase JWT 인증)
- Spring Data JPA + PostgreSQL (Supabase)

### Frontend
- React (Vite)
- TypeScript
- Zustand
- Axios
- @supabase/supabase-js

---

## 📂 Project Structure

```plaintext
myMES/
 ├── backend/   # Spring Boot 서버
 │   └── src/main/java/com/mymes/backend/
 │       └── security/
 │           ├── SecurityConfig.java        # Spring Security 설정
 │           ├── SupabaseJwtFilter.java     # Supabase JWT 검증 필터
 │           └── SupabasePrincipal.java     # 인증 사용자 정보
 └── frontend/  # React 클라이언트
     └── src/
         ├── lib/
         │   ├── supabase.ts               # Supabase 클라이언트
         │   └── axios.ts                  # API 클라이언트 (JWT 자동 첨부)
         ├── store/
         │   └── authStore.ts              # Zustand 인증 상태 관리
         └── hooks/
             └── useSupabaseRealtime.ts    # Realtime 구독 훅
```

---

## 🚀 Supabase 프로젝트 설정 (처음 시작 시)

1. [https://supabase.com](https://supabase.com) 에서 새 프로젝트를 생성합니다.

2. **필요한 환경변수 확인 위치** (Supabase 대시보드 → Project Settings → API):
   - `Project URL` → `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - `anon public key` → `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
   - `JWT Secret` (JWT Settings 탭) → `SUPABASE_JWT_SECRET`

3. **DB 연결 정보** (Project Settings → Database → Connection String → Direct):
   - `SUPABASE_DB_URL`, `SUPABASE_DB_USER`, `SUPABASE_DB_PASSWORD`

4. Supabase 대시보드에서 **Authentication → Providers** 설정:
   - Email 로그인 활성화 (기본값)

---

## ⚙️ 실행 방법

### 1. 환경변수 설정

```bash
# 백엔드
cp backend/.env.example backend/.env
# backend/.env 파일에 Supabase 정보 입력

# 프론트엔드
cp frontend/.env.example frontend/.env
# frontend/.env 파일에 Supabase 정보 입력
```

### 2. Backend

```bash
cd backend
./gradlew bootRun
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 환경변수 목록

### Backend (`backend/.env`)

| 변수명 | 설명 |
|---|---|
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_JWT_SECRET` | JWT 서명 검증용 시크릿 |
| `SUPABASE_DB_URL` | PostgreSQL JDBC URL |
| `SUPABASE_DB_USER` | DB 사용자 (기본: `postgres`) |
| `SUPABASE_DB_PASSWORD` | DB 비밀번호 |

### Frontend (`frontend/.env`)

| 변수명 | 설명 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |

---

## 🔐 인증 흐름

```
[React] supabase.auth.signIn()
   → Supabase Auth 서버가 JWT 발급
   → authStore에 세션 저장
   → axios 인터셉터가 API 요청마다 Authorization: Bearer <token> 첨부
   → Spring Boot SupabaseJwtFilter가 JWT 검증
   → SecurityContext에 사용자 정보 저장
   → 컨트롤러에서 @AuthenticationPrincipal SupabasePrincipal로 접근 가능
```

## ⚡ Realtime 사용 예시

```typescript
// 작업지시(work_orders) 테이블 변경을 실시간 구독
// ⚠️ Supabase 대시보드에서 테이블 Replication 활성화 필요
useSupabaseRealtime({
  table: 'work_orders',
  event: '*',
  onchange: (payload) => {
    console.log('변경:', payload.eventType, payload.new)
  }
})
```
