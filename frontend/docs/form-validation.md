# 폼 유효성 검증

프론트엔드 폼 유효성 검증은 라이브러리 기반으로 처리합니다.

## 기본 조합

폼 상태와 검증은 아래 조합을 기본으로 사용합니다.

- `react-hook-form`
- `zod`
- `@hookform/resolvers`

## 적용 기준

새 폼을 만들거나 기존 폼의 유효성 검증을 수정할 때는 아래 기준을 따릅니다.

- 단순 HTML `required`, `min`, `maxLength`만으로 검증을 끝내지 않습니다.
- 도메인별 schema 파일을 만듭니다.
- schema 파일은 해당 feature 내부에 둡니다.
  - 예: `src/features/prod-basic/process/schemas/processSchema.ts`
- 공통 폼 컴포넌트는 필요성이 반복적으로 확인된 뒤 만듭니다.
- 처음부터 거대한 공통 폼 시스템을 만들지 않습니다.

## 구현 규칙

- `useForm`의 `resolver`에는 `zodResolver(schema)`를 사용합니다.
- 수정 폼은 `defaultValues`를 명시합니다.
- 모달 폼은 `open`, `editTarget` 변경 시 `reset()`으로 값을 동기화합니다.
- 서버로 보내는 payload는 기존 API request 타입을 깨지 않게 변환합니다.
- 빈 문자열은 필요한 경우 `undefined`로 변환합니다.
- `trim()`이 필요한 문자열은 schema에서 처리합니다.
- 필드별 에러 메시지는 해당 필드 아래에 표시합니다.
- React Compiler lint 경고를 피하기 위해 단일 필드 구독은 `watch()`보다 `useWatch()`를 우선합니다.

## 서버 검증과의 역할 분리

프론트에서 처리할 것:

- 필수값
- 문자열 길이
- 숫자 범위
- 날짜 순서
- 선택값 여부
- 기본 형식

서버에서 처리할 것:

- 중복 여부
- 권한
- DB 존재 여부
- 상태 전이 가능 여부
- 보안상 신뢰하면 안 되는 값

## 예시 구조

```txt
src/features/{domain}/
  components/
    XxxFormModal.tsx
  schemas/
    xxxSchema.ts
  types/
    index.ts
```
