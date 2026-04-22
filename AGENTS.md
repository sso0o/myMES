# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Subdirectory Instructions

각 디렉토리별 상세 가이드는 아래 파일을 함께 참조할 것:
- Backend: [backend/AGENTS.md](backend/AGENTS.md)
- Frontend: [frontend/AGENTS.md](frontend/AGENTS.md)

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
- `security/SecurityConfig.java` — CORS(localhost:5173, 3000), CSRF 비활성화, stateless 세션, 필터 체인 설정
- `security/SupabaseJwtFilter.java` — `OncePerRequestFilter`; `supabase.jwt-secret`으로 HMAC 검증
- `security/SupabasePrincipal.java` — `userId`(UUID), `email`, `role` 필드; `@AuthenticationPrincipal`로 주입

공개 엔드포인트: `/api/health`. 그 외 `/api/**`는 인증 필요.

### 프론트엔드 구조 (`frontend/src/`)
- `lib/supabase.ts` — Supabase 클라이언트 싱글톤
- `lib/axios.ts` — baseURL `/api`, 401 응답 시 자동 로그아웃 및 `/login` 리다이렉트
- `store/authStore.ts` — Zustand 스토어; `initialize()` 앱 시작 시 호출 필요
- `hooks/useSupabaseRealtime.ts` — PostgreSQL 테이블 변경사항 실시간 구독 훅

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


