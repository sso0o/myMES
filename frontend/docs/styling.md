# 스타일링

**MUI(Material UI)를 1순위**로 사용하고, MUI로 구현이 어렵거나 세밀한 레이아웃 조정이 필요한 경우에만 **Tailwind CSS**를 보조로 사용합니다.

## 우선순위

1. **MUI 컴포넌트** — Button, TextField, Dialog, Table, Select 등 MUI에서 제공하는 컴포넌트를 우선 사용합니다.
2. **MUI `sx` prop / `styled()`** — MUI 컴포넌트의 스타일 커스터마이징은 `sx` prop 또는 `styled()`를 사용합니다.
3. **Tailwind CSS** — MUI 컴포넌트가 없거나, 레이아웃·간격 조정 등 MUI만으로 표현이 어려운 경우에 보조로 사용합니다.

```tsx
// MUI 우선 사용 예시
import { Button, TextField, Box } from '@mui/material';

const WorkOrderForm = () => (
    <Box className="flex flex-col gap-4">  {/* 레이아웃은 Tailwind 보조 가능 */}
        <TextField label="작업지시 번호" fullWidth />
        <Button variant="contained">저장</Button>
    </Box>
);
```

**규칙**
- MUI 컴포넌트로 구현 가능한 경우 Tailwind로 직접 구현하지 않습니다.
- MUI `sx` prop과 Tailwind className을 같은 컴포넌트에서 혼용할 수 있으나, 동일 속성을 중복 지정하지 않습니다.
- 인라인 `style` 속성 사용 금지 — MUI `sx` prop 또는 Tailwind 클래스를 사용합니다.
- className이 길어질 경우 `cn()` 유틸 함수(clsx + tailwind-merge)로 정리합니다.
- 전역 스타일(폰트, reset 등)은 `src/index.css`에만 작성합니다.
- 반복되는 컴포넌트 조합은 `common/components/`에 공통 컴포넌트로 분리합니다.

## 디자인 시스템
컴포넌트 토큰, 색상, 타이포그래피 등 디자인 시스템 상세는 [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)를 참조합니다.
