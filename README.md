# MES (Manufacturing Execution System)

제조 공정에서 생산 계획, 작업 지시, 생산 실적, 품질검사와 불량 조치를 관리하는 MES 시스템입니다.  
Spring Boot 백엔드와 React(Vite) 프론트엔드로 구성된 풀스택 프로젝트이며, Supabase를 Auth/DB/Realtime 플랫폼으로 사용합니다.

---

## 현재 구현 상태

### 구현된 화면

| 영역 | 경로 | 상태 |
|---|---|---|
| 인증 | `/login` | 로그인 화면 |
| 기준 관리 | `/master/common-codes` | 공통코드 관리 |
| 기준 관리 | `/master/items` | 품목 관리 |
| 생산기초관리 | `/prod-basic/processes` | 공정 관리 |
| 생산기초관리 | `/prod-basic/equipment` | 설비 관리 |
| 생산기초관리 | `/prod-basic/item-processes` | 품목별 공정 관리, 일괄 복사 |
| 생산기초관리 | `/prod-basic/boms` | BOM 관리 |
| 생산기초관리 | `/prod-basic/process-equipment` | 공정별 설비 관리 |
| 생산 관리 | `/planning` | 생산 계획 관리 |
| 생산 관리 | `/work-orders` | 작업 지시 타임라인/설비 배정 |
| 생산 관리 | `/production` | 생산 실적 관리 |
| 품질관리 | `/quality/inspections` | 품질검사 목록, 등록/수정/삭제 |
| 품질관리 | `/quality/defects` | 불량관리 화면 준비 중 |
| 운영 관리 | `/operation/workers` | 작업자 관리 |

### 기능 구현 예정 화면

| 영역 | 경로 |
|---|---|
| 품질관리 | `/quality/defects` |

---

## Tech Stack

### Backend
- **Java 17** / **Spring Boot 3.5**
- **Spring Security** — Supabase JWT(HS256) 검증
- **Spring Data JPA** + **PostgreSQL** (Supabase)
- **MapStruct** — Entity ↔ DTO 변환
- **SpringDoc OpenAPI (Swagger UI)** — API 문서 자동화
- **JJWT 0.12** — JWT 파싱/검증
- **Lombok**

### Frontend
- **React 19** / **Vite 8** / **TypeScript 6**
- **TailwindCSS 4**
- **Zustand 5** — 전역 상태 관리 (인증 등)
- **TanStack React Query 5** — 서버 상태 / API 캐싱
- **React Router 7**
- **Axios** — API 클라이언트 (JWT 인터셉터)
- **@supabase/supabase-js 2** — Auth & Realtime

---

## Project Structure

```plaintext
myMES/
├── backend/                              # Spring Boot 서버 (포트: 8080)
│   └── src/main/java/com/mymes/backend/
│       ├── {domain}/                     # 도메인별 패키지 (Domain-first)
│       │   ├── controller/               # REST 컨트롤러
│       │   ├── service/                  # 비즈니스 로직
│       │   ├── repository/               # JPA Repository (+ QueryDSL)
│       │   ├── entity/                   # JPA 엔티티
│       │   ├── dto/                      # 요청/응답 DTO
│       │   └── mapper/                   # MapStruct Mapper
│       ├── common/
│       │   ├── config/                   # 공통 설정
│       │   ├── controller/               # Health check 등 공통 컨트롤러
│       │   ├── entity/                   # BaseEntity
│       │   ├── exception/                # BusinessException, ErrorCode, GlobalExceptionHandler
│       │   └── response/                 # ApiResponse, PageResponse
│       └── security/
│           ├── SecurityConfig.java       # CORS, CSRF, Stateless 세션 설정
│           ├── SupabaseJwtFilter.java    # OncePerRequestFilter, JWT 검증
│           └── SupabasePrincipal.java    # userId(UUID), email, role 필드
│
└── frontend/                             # React 클라이언트 (포트: 5173)
    └── src/
        ├── features/                     # 도메인별 기능 (Feature-first)
        │   ├── auth/                     # 인증
        │   ├── master/                   # 공통코드, 품목
        │   ├── prod-basic/               # 공정, 설비, 품목별 공정, BOM
        │   ├── prod-management/          # 생산계획, 작업지시, 생산실적
        │   ├── quality/                  # 품질검사, 불량관리
        │   └── operation/                # 작업자 관리
        ├── common/                      # 공통 컴포넌트 / 훅
        ├── pages/                       # 라우트 단위 페이지
        ├── store/
        │   └── authStore.ts            # Zustand 인증 상태
        ├── lib/
        │   ├── supabase.ts             # Supabase 클라이언트 싱글톤
        │   └── axios.ts                # baseURL /api, 401 자동 로그아웃
        └── router/                      # 라우터 설정 및 인증 가드
```

### Backend Domains

| 도메인 | 설명 |
|---|---|
| `code` | 공통코드 그룹/코드 관리 |
| `item` | 품목 관리 |
| `process` | 제조 공정 관리 |
| `equipment` | 설비 관리 |
| `itemprocess` | 품목별 공정 라우팅 관리 |
| `bom` | BOM 구성 관리 |
| `planning` | 생산 계획 |
| `workorder` | 작업 지시 |
| `production` | 생산 실적 |
| `defect` | 불량 기록/조치 |
| `quality` | 품질검사 |
| `user` | 사용자 관리 |
| `worker` | 작업자 관리 |

### Frontend Feature Groups

| 경로 | 설명 |
|---|---|
| `features/auth` | 로그인 및 인증 관련 훅/컴포넌트 |
| `features/master/commonCode` | 공통코드 API, React Query 훅, 폼 |
| `features/master/item` | 품목 API, React Query 훅, 테이블/폼 |
| `features/prod-basic/process` | 공정 관리 |
| `features/prod-basic/equipment` | 설비 관리 |
| `features/prod-basic/item-process` | 품목별 공정 관리 |
| `features/prod-basic/bom` | BOM 관리 |
| `features/prod-basic/process-equipment` | 공정별 설비 관리 |
| `features/prod-management/planning` | 생산 계획 관리 |
| `features/prod-management/work-order` | 작업 지시 관리 |
| `features/prod-management/production-record` | 생산 실적 관리 |
| `features/quality/inspection` | 품질검사 관리 |
| `features/operation/worker` | 작업자 관리 |

---

## 품질관리 MVP

품질관리는 사이드바에서 `품질관리` 독립 그룹으로 분리했습니다.

| 메뉴 | 경로 | 설명 |
|---|---|---|
| 품질검사 | `/quality/inspections` | 작업지시, 품목, 공정 기준 검사 결과와 판정 관리 |
| 불량관리 | `/quality/defects` | 검사/생산 과정의 불량 원인과 조치 상태 관리 |

### 품질검사

- 검사번호 자동 채번: `QI-yyyyMMdd-0001`
- 검사유형: `INCOMING`, `IN_PROCESS`, `FINAL`
- 검사상태: `WAITING`, `IN_PROGRESS`, `COMPLETED`
- 판정결과: `PASS`, `FAIL`, `HOLD`
- 작업지시 선택 시 품목/공정 연결
- 검사수량, 합격수량, 불량수량 검증
- 목록 상단 KPI: 검사 건수, 완료 건수, 합격률, 불량수량

### 불량관리

기존 `defect` 도메인을 품질관리 흐름에 맞춰 확장했습니다.

- 작업지시 기준 불량 등록 유지
- 품질검사 기준 불량 등록 추가
- 품질검사, 품목, 공정 정보 응답 포함
- 불량 상세, 원인분류, 조치내용, 처리방식, 담당자 필드 추가

---

## 실행 방법

### 1. 환경변수 설정

```bash
cp backend/.env.example backend/.env    # Supabase 정보 입력
cp frontend/.env.example frontend/.env  # Supabase 정보 입력
```

### 2. Backend

```bash
cd backend
./gradlew bootRun         # 서버 시작 (localhost:8080)
./gradlew build           # 빌드
./gradlew test            # 전체 테스트
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev               # 개발 서버 (localhost:5173)
npm run build             # 프로덕션 빌드
npm run lint              # ESLint 검사
```

> Vite 프록시 설정으로 `/api` → `http://localhost:8080` 자동 연결됩니다. 개발 환경에서 CORS 설정 없이 백엔드 호출 가능합니다.

---

## 환경변수 목록

### Backend (`backend/.env`)

| 변수명 | 설명 |
|---|---|
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_ANON_KEY` | Supabase anon public key |
| `SUPABASE_JWT_SECRET` | JWT 서명 검증용 시크릿 (HS256) |
| `SUPABASE_DB_URL` | PostgreSQL JDBC URL |
| `SUPABASE_DB_USER` | DB 사용자 (기본: `postgres`) |
| `SUPABASE_DB_PASSWORD` | DB 비밀번호 |

### Frontend (`frontend/.env`)

| 변수명 | 설명 |
|---|---|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |

---

## 인증 흐름

```
[React] supabase.auth.signIn()
   → Supabase Auth 서버가 JWT(HS256) 발급
   → authStore(Zustand)에 세션 저장 / onAuthStateChange 구독
   → axios 인터셉터가 API 요청마다 Authorization: Bearer <token> 자동 첨부
   → Spring Boot SupabaseJwtFilter(OncePerRequestFilter)가 JWT 검증
   → SecurityContext에 SupabasePrincipal(userId, email, role) 저장
   → 컨트롤러에서 @AuthenticationPrincipal SupabasePrincipal로 접근
```

공개 엔드포인트: `GET /api/health`  
그 외 `/api/**`는 모두 인증 필요

---

## 주요 API

| 영역 | API |
|---|---|
| Health | `GET /api/health` |
| 품목 | `/api/master/items` |
| 공통코드 그룹 | `/api/master/code-groups` |
| 공통코드 | `/api/master/code-groups/{groupId}/codes` |
| 공정 | `/api/prod-basic/processes` |
| 설비 | `/api/prod-basic/equipment` |
| 품목별 공정 | `/api/prod-basic/item-processes` |
| 품목별 공정 복사 | `POST /api/prod-basic/item-processes/copy` |
| BOM | `/api/prod-basic/boms` |
| 생산 계획 | `/api/production-plans` |
| 작업 지시 | `/api/work-orders` |
| 생산 실적 | `/api/work-orders/{workOrderId}/production-records`, `/api/production-records/{id}` |
| 품질검사 | `/api/quality-inspections` |
| 불량 기록 | `/api/defect-records`, `/api/work-orders/{workOrderId}/defect-records`, `/api/quality-inspections/{inspectionId}/defect-records`, `/api/defect-records/{id}` |
| 사용자 | `/api/users`, `/api/users/me` |
| 작업자 | `/api/workers` |

API 문서는 서버 실행 후 [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) 에서 확인할 수 있습니다.

### API 설계 규칙

- URL은 복수형 명사 + 케밥케이스를 기본으로 사용합니다.
- 모든 응답은 `ApiResponse<T>` 공통 래퍼로 감쌉니다.

```json
// 성공
{ "success": true, "data": { ... }, "message": null, "code": null }

// 실패
{ "success": false, "data": null, "message": "작업 지시를 찾을 수 없습니다.", "code": "WORK_ORDER_NOT_FOUND" }
```

---

## ⚡ Realtime 사용 예시

```typescript
// 작업지시(work_orders) 테이블 변경을 실시간 구독
// ⚠️ Supabase 대시보드에서 테이블 Replication 활성화 필요
useSupabaseRealtime({
  table: 'work_orders',
  event: '*',
  onChange: (payload) => {
    console.log('변경:', payload.eventType, payload.new)
  }
})
```

현재 백엔드 테스트는 애플리케이션 컨텍스트, 회귀 테스트, JWT 필터, BOM, 설비, 품목별 공정 복사, 품질검사, 불량관리 로직을 포함합니다.

---

## 다음 작업 후보

1. 불량관리 프론트 화면 구현
2. 품질검사에서 불합격/불량수량 발생 시 불량 등록 흐름 연결
3. 검사 기준 관리 도메인 설계
4. 부적합품 처리/승인 흐름 설계
5. 품질 대시보드 지표 보강

---

## 상세 개발 가이드

| 영역 | 문서                                                                     |
|---|------------------------------------------------------------------------|
| 전체 작업 가이드 | [CLAUDE.md](CLAUDE.md)                                                 |
| 백엔드 개발 규칙 (레이어 구조, 예외 처리, 테스트 전략 등) | [backend/CLAUDE.md](backend/CLAUDE.md)                                 |
| 프론트엔드 개발 규칙 허브 | [frontend/CLAUDE.md](frontend/CLAUDE.md)                               |
| 폴더 구조 | [frontend/docs/folder-structure.md](frontend/docs/folder-structure.md) |
| 상태 관리 (Zustand vs React Query) | [frontend/docs/state-management.md](frontend/docs/state-management.md) |
| API 호출 규칙 | [frontend/docs/api.md](frontend/docs/api.md)                           |
| 라우팅 및 인증 가드 | [frontend/docs/routing.md](frontend/docs/routing.md)                   |
| 스타일링 (Tailwind, 디자인 토큰) | [frontend/DESIGN_SYSTEM.md](frontend/DESIGN_SYSTEM.md)                 |
