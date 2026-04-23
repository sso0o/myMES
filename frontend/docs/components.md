# 컴포넌트 설계

## 파일 네이밍
PascalCase로 작성합니다.
```
WorkOrderTable.tsx
CreateWorkOrderModal.tsx
ProductionStatusBadge.tsx
```

## 컴포넌트 분리 기준
아래 중 하나라도 해당하면 컴포넌트로 분리합니다.
- 두 곳 이상에서 재사용되는 UI
- 100줄 이상으로 길어지는 경우
- 독립적인 UI 단위로 의미가 있는 경우

## Props 타입 정의
`interface`를 사용합니다.

```tsx
interface WorkOrderTableProps {
    items: WorkOrder[];
    onSelect: (id: number) => void;
}

const WorkOrderTable = ({ items, onSelect }: WorkOrderTableProps) => {
    // ...
};
```

## 컴포넌트 내부 구조 순서
아래 순서를 지킵니다.

```tsx
const WorkOrderTable = ({ items, onSelect }: WorkOrderTableProps) => {
    // 1. 상태 (useState, useReducer)
    // 2. 훅 (useEffect, 커스텀 훅)
    // 3. 핸들러 함수
    // 4. return (JSX)
};

export default WorkOrderTable;
```
