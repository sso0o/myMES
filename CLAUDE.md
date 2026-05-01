# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sub-directory Instructions

각 디렉토리별 상세 가이드는 아래 파일을 함께 참조할 것:
- Backend: [backend/CLAUDE.md](backend/CLAUDE.md)
- Frontend: [frontend/CLAUDE.md](frontend/CLAUDE.md) → [docs/](frontend/docs/) 내 각 주제별 문서로 분리됨

## Project Overview

MES (Manufacturing Execution System) — 제조 공정의 생산 계획, 작업 지시, 생산 실적 관리 시스템.  
Spring Boot 백엔드 + React(Vite) 프론트엔드 풀스택 프로젝트로, Supabase를 Auth/DB/Realtime 플랫폼으로 사용.

## 파일 삭제 규칙
파일 삭제 전 삭제할 파일을 명시하고 삭제여부 물어볼것.

## Commands

### Backend
```bash
cd backend
./gradlew bootRun              # 서버 시작 (기본 포트: 8080)
./gradlew build                # 빌드
./gradlew test                 # 전체 테스트
./gradlew test --tests "com.mymes.backend.SomeTest"  # 단일 테스트 클래스 실행
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # 개발 서버 (기본 포트: 5173)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
npm run preview  # 빌드 결과물 미리보기
```

### 환경변수 설정 (최초 실행 시 필수)
```bash
cp backend/.env.example backend/.env     # Supabase 정보 입력 필요
cp frontend/.env.example frontend/.env  # Supabase 정보 입력 필요
```

## Architecture

### 인증 흐름
Supabase Auth가 JWT를 발급하고, 프론트와 백엔드 모두 이 토큰을 공유하는 방식:

1. React → `supabase.auth.signIn()` → Supabase가 JWT 발급
2. `authStore` (Zustand)가 세션 상태 관리 및 `onAuthStateChange` 구독
3. `axios` 인터셉터(`src/lib/axios.ts`)가 모든 API 요청에 `Authorization: Bearer <token>` 자동 첨부
4. Spring Boot `SupabaseJwtFilter`가 JJWT로 토큰 검증 후 `SupabasePrincipal`을 `SecurityContext`에 저장
5. 컨트롤러에서 `@AuthenticationPrincipal SupabasePrincipal`로 인증 사용자 접근

### 백엔드 구조 (`backend/src/main/java/com/mymes/backend/`)

**도메인 기준(Domain-first)** 패키지 구조. 각 도메인 패키지 내부는 `controller/`, `service/`, `repository/`, `entity/`, `dto/`, `mapper/` 레이어로 분리.

현재 도메인: `code`, `defect`, `item`, `planning`, `process`, `production`, `user`, `workorder`  
공통: `common/` (ApiResponse, BusinessException, ErrorCode, GlobalExceptionHandler)  
인증: `security/` (SecurityConfig, SupabaseJwtFilter, SupabasePrincipal)

- `security/SupabaseJwtFilter.java` — `OncePerRequestFilter`; `supabase.jwt-secret`으로 HMAC 검증
- `security/SupabasePrincipal.java` — `userId`(UUID), `email`, `role` 필드; `@AuthenticationPrincipal`로 주입

공개 엔드포인트: `/api/health`. 그 외 `/api/**`는 인증 필요.

**핵심 규칙 요약** (상세는 [backend/CLAUDE.md](backend/CLAUDE.md)):
- Controller → Service → Repository 흐름 엄수; Controller에서 Repository 직접 접근 금지
- 모든 API 응답은 `ApiResponse<T>` 래퍼로 감쌈; 에러는 `BusinessException` + `ErrorCode` enum으로 처리
- Entity ↔ DTO 변환은 MapStruct Mapper 클래스로 분리
- Service 클래스에 `@Transactional(readOnly = true)` 기본 적용, 변경 메서드만 `@Transactional` 오버라이드
- Soft Delete 적용: `entity.delete()` 호출 (BaseEntity의 `deletedAt` 세팅); `repository.delete()` 직접 호출 금지
- 동적 조건 2개 이상이면 QueryDSL 사용 (`@Query` JPQL은 단순 조회만)
- 모든 `public` 메서드에 Javadoc 작성 필수

### 프론트엔드 구조 (`frontend/src/`)

**기능 기준(Feature-first)** 폴더 구조:
```
features/{domain}/
  api/        # axios 호출 순수 함수
  components/ # 도메인 전용 컴포넌트
  hooks/      # React Query 훅
  schemas/    # zod 폼 유효성 검증 스키마
  types/      # 도메인 타입 정의
common/       # 여러 도메인에서 공유하는 컴포넌트·훅
pages/        # 라우트 단위 진입 컴포넌트 (features로 위임)
store/        # Zustand 전역 상태 (authStore, uiStore)
lib/          # axios, supabase 클라이언트 설정
router/       # React Router 설정 + PrivateRoute
types/        # 전역 공통 타입 (ApiResponse<T> 등)
```

- `lib/axios.ts` — baseURL `/api`, 401 응답 시 자동 로그아웃 및 `/login` 리다이렉트
- `store/authStore.ts` — Zustand 스토어; `initialize()` 앱 시작 시 호출 필요
- `hooks/useSupabaseRealtime.ts` — PostgreSQL 테이블 변경사항 실시간 구독 훅

**핵심 규칙 요약** (상세는 [frontend/docs/](frontend/docs/)):
- 서버 데이터는 React Query로 관리; Zustand는 인증·UI 클라이언트 상태만 담당
- API 호출은 `features/{domain}/api/{domain}Api.ts` (순수 axios 함수) → `features/{domain}/hooks/use{Domain}Query.ts` (React Query 훅) 2-레이어 구조; 컴포넌트에서 axios 직접 호출 금지
- 폼 유효성 검증은 `react-hook-form` + `zod` + `@hookform/resolvers` 조합; 스키마는 `features/{domain}/schemas/`에 위치; 단일 필드 구독은 `watch()` 대신 `useWatch()` 사용
- TypeScript `any` 사용 금지 (`unknown` + 타입 가드 사용); enum 대신 `as const` 패턴 사용; zod schema는 `z.input<>`(폼 입력)과 `z.output<>`(변환 후) 타입을 분리해서 사용
- 스타일링은 Tailwind CSS만 사용; 인라인 `style` 속성 금지; 복잡한 className은 `cn()` (clsx + tailwind-merge) 사용

### Vite Proxy
`vite.config.ts`에서 `/api` → `http://localhost:8080` 프록시 설정되어 있어 개발 환경에서 CORS 없이 백엔드 호출 가능.

### DB / JPA
- Supabase PostgreSQL 사용, `application.yaml`에서 환경변수로 연결
- `ddl-auto: update` (개발 환경) — 엔티티 변경 시 스키마 자동 반영. 운영 배포 시 `validate`로 변경 필요
- Realtime 구독은 Supabase 대시보드에서 테이블별 Replication 활성화 필요

## Key Env Variables

| 위치 | 변수명 | 용도 |
|---|---|---|
| `backend/.env` | `SUPABASE_JWT_SECRET` | JWT 검증 시크릿 (HS256) |
| `backend/.env` | `SUPABASE_DB_URL/USER/PASSWORD` | PostgreSQL JDBC 연결 |
| `frontend/.env` | `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `frontend/.env` | `VITE_SUPABASE_ANON_KEY` | anon public key |


