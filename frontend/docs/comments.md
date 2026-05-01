# 주석 규칙

프론트엔드 주석은 컴포넌트, 훅, 복잡한 핸들러, 도메인 의도가 있는 로직의 역할을 설명하기 위해 작성합니다.

## 기본 규칙

- 주석은 코드가 **무엇을(what)** 하는지와 UI/도메인 의도를 설명합니다.
- 코드를 그대로 읽으면 알 수 있는 내용을 반복해서 설명하지 않습니다.
- JSX 영역 구분 주석은 화면 구조가 복잡할 때만 작성합니다.
- `eslint-disable` 주석은 불가피한 경우에만 사용하며, 반드시 이유를 함께 적습니다.
- export 되는 공통 컴포넌트, 공통 훅, 공통 유틸은 역할이 이름만으로 충분히 드러나지 않으면 JSDoc을 작성합니다.
- 도메인 전용 컴포넌트는 이름만으로 역할이 명확하면 주석을 생략할 수 있습니다.
- helper 함수는 로직이 자명하지 않은 경우에만 한 줄 주석으로 의도를 설명합니다.

## 공통 컴포넌트

공통 UI 컴포넌트는 여러 화면에서 같은 의미로 재사용되므로, 역할이 모호할 수 있으면 JSDoc으로 용도를 설명합니다.

```tsx
/**
 * 페이지 제목, 설명, 우측 액션 영역을 일관된 레이아웃으로 렌더링합니다.
 */
const PageHeader = ({ title, description, actions }: PageHeaderProps) => { ... }
```

## 공통 훅

공통 훅은 어떤 상태나 기능을 제공하는지 설명합니다.

```tsx
/**
 * toast와 confirm alert 호출 함수를 제공합니다.
 */
export const useFeedback = () => { ... }
```

## 복잡한 핸들러

도메인 규칙이나 UI 흐름이 즉시 드러나지 않는 핸들러에는 한 줄 주석으로 의도를 설명합니다.

```tsx
// 선택한 품목의 기존 공정 뒤에 복사 대상 공정을 이어 붙입니다.
const handleAppendProcesses = () => { ... }
```

## JSX 영역 구분

한 컴포넌트 안에 여러 패널이나 큰 영역이 함께 있는 경우에만 JSX 영역 구분 주석을 사용합니다.

```tsx
{/* 좌측: 품목 목록 */}
<div>...</div>

{/* 우측: 공정 목록 */}
<div>...</div>
```

## 금지 예시

코드를 그대로 반복하는 주석은 작성하지 않습니다.

```tsx
// 버튼을 클릭하면 handleSubmit을 호출한다
<button onClick={handleSubmit}>저장</button>
```

```tsx
// itemProcesses를 map으로 반복한다
{itemProcesses.map(...)}
```

## eslint-disable 사용

불가피하게 lint rule을 비활성화해야 하는 경우, 가능한 한 줄 범위로 제한하고 이유를 남깁니다.

```tsx
// 외부 라이브러리 타입이 any로만 제공되어 이 라인에서만 예외 처리합니다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const payload = externalValue as any
```
