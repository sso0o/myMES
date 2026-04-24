---
name: security-test
description: PR 전 보안 점검 시 사용. 코드 정적 분석(SQL Injection, 민감정보 노출 등)과 Supabase RLS 정책 누락 여부를 체크하고 문제점과 개선안을 리포트한다.
disable-model-invocation: false
---

## 목적
PR 전 보안 취약점을 사전에 탐지한다. 코드 정적 분석과 Supabase RLS 정책 두 가지 관점에서 점검하고, 발견된 문제는 심각도와 개선안과 함께 리포트한다.

---

## 점검 범위

변경된 파일 또는 명시적으로 지정한 도메인을 대상으로 아래 두 영역을 점검한다.

---

## 1. 코드 정적 분석

### SQL Injection
- Native Query(`@Query(nativeQuery = true)`) 사용 시 파라미터 바인딩(`?1`, `:param`) 없이 문자열 직접 연결 여부
- QueryDSL에서 외부 입력값을 문자열로 직접 조합하는 코드 여부
- `jdbcTemplate.query()` 등 JDBC 직접 사용 시 PreparedStatement 미사용 여부

### 민감정보 노출
- 로그(`log.info`, `log.debug` 등)에 비밀번호, 토큰, 개인식별정보(이름, 이메일, 전화번호) 포함 여부
- Response DTO에 불필요한 민감 필드 포함 여부 (비밀번호 해시, 내부 시스템 ID 등)
- `application.yml` / `application.properties`에 하드코딩된 secret, password, key 여부
- Exception 메시지에 내부 스택트레이스나 DB 구조 노출 여부

### 인증 / 인가
- `@RestController` 엔드포인트에 인증 어노테이션(`@PreAuthorize`, Security Config 등) 누락 여부
- 관리자 전용 API에 권한 체크 없이 접근 가능한지 여부
- JWT 토큰 검증 로직 우회 가능 여부

### 입력값 검증
- Request DTO에 `@Valid` 누락 여부
- 파일 업로드 시 확장자/MIME 타입 검증 누락 여부
- 페이지네이션 파라미터(page, size)에 상한선 없이 그대로 사용하는지 여부

### 기타
- `@CrossOrigin("*")` 무분별한 CORS 허용 여부
- 에러 응답에 `500 Internal Server Error` 상세 메시지 그대로 노출 여부 (GlobalExceptionHandler 미처리 예외)
- `System.out.println` 사용 여부 (로그 대신 직접 출력)

---

## 2. Supabase RLS 정책 점검

### 확인 항목
- 새로 추가된 테이블에 RLS(Row Level Security)가 활성화됐는지 여부
- 각 테이블에 SELECT / INSERT / UPDATE / DELETE 정책이 명시적으로 정의됐는지 여부
- 인증된 사용자만 접근해야 하는 테이블에 `anon` 역할로 접근 가능한 정책이 있는지 여부
- 사용자 본인 데이터만 접근해야 하는 경우 `auth.uid() = user_id` 조건이 있는지 여부
- 정책 없이 테이블이 전체 공개(`public`)로 열려 있는지 여부

### 점검 방법
Supabase 마이그레이션 파일(`.sql`) 또는 `supabase/migrations/` 경로의 파일을 분석한다.
파일이 없으면 변경된 Entity 클래스 기준으로 누락 가능성을 경고한다.

---

## 리포트 형식

점검 완료 후 아래 형식으로 결과를 출력한다.

```
## 보안 점검 결과

### 요약
- 점검 파일: {파일 목록}
- 발견된 문제: {건수}건 ({HIGH} High / {MEDIUM} Medium / {LOW} Low)

---

### 발견된 문제

#### [HIGH] SQL Injection 위험
- **파일**: `workorder/repository/WorkOrderRepositoryImpl.java`
- **라인**: 42
- **내용**: 외부 입력값을 문자열로 직접 조합해 쿼리 생성
- **개선안**: QueryDSL 파라미터 바인딩 또는 PreparedStatement 사용

#### [MEDIUM] 민감정보 로그 노출
- **파일**: `user/service/UserService.java`
- **라인**: 78
- **내용**: log.info에 사용자 이메일 포함
- **개선안**: 로그에서 개인식별정보 제거

#### [LOW] CORS 전체 허용
- **파일**: `SecurityConfig.java`
- **라인**: 15
- **내용**: @CrossOrigin("*") 사용
- **개선안**: 허용할 Origin을 명시적으로 지정

---

### RLS 점검 결과

#### [HIGH] RLS 미적용 테이블
- **테이블**: `work_orders`
- **내용**: RLS 활성화되지 않음
- **개선안**: `ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;` 추가 및 정책 정의

---

### 이상 없음 ✅
- {문제없는 항목 목록}
```

---

## 심각도 기준

| 심각도 | 기준 |
|---|---|
| **HIGH** | 즉시 수정 필요. 데이터 유출, 인증 우회, SQL Injection 등 직접적인 공격 가능 |
| **MEDIUM** | PR 전 수정 권장. 민감정보 노출, 권한 누락 등 잠재적 위험 |
| **LOW** | 개선 권장. 코드 품질 및 보안 모범 사례 미준수 |

---

## 점검 체크리스트

**코드 정적 분석**
- [ ] Native Query / JDBC 직접 사용 시 파라미터 바인딩 확인
- [ ] 로그에 민감정보 포함 여부 확인
- [ ] Response DTO 민감 필드 노출 여부 확인
- [ ] 설정 파일 하드코딩 secret 여부 확인
- [ ] Controller 인증/인가 어노테이션 누락 여부 확인
- [ ] Request DTO `@Valid` 누락 여부 확인
- [ ] `@CrossOrigin("*")` 무분별 사용 여부 확인
- [ ] GlobalExceptionHandler 미처리 예외 노출 여부 확인

**Supabase RLS**
- [ ] 신규 테이블 RLS 활성화 여부 확인
- [ ] SELECT / INSERT / UPDATE / DELETE 정책 정의 여부 확인
- [ ] anon 역할 불필요한 접근 가능 여부 확인
- [ ] 본인 데이터 접근 제한 조건(`auth.uid()`) 적용 여부 확인