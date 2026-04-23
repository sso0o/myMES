# 스타일링

**Tailwind CSS**를 사용합니다.

```tsx
const WorkOrderTable = () => (
    <div className="w-full overflow-x-auto">
        <table className="w-full text-sm border-collapse">
            <tbody>
                <tr className="border-b hover:bg-gray-50">...</tr>
            </tbody>
        </table>
    </div>
);
```

**규칙**
- 인라인 `style` 속성 사용 금지 — 반드시 Tailwind 클래스를 사용합니다.
- className이 길어질 경우 `cn()` 유틸 함수(clsx + tailwind-merge)로 정리합니다.
- 전역 스타일(폰트, reset 등)은 `src/index.css`에만 작성합니다.
- 반복되는 클래스 조합은 `common/components/`에 공통 컴포넌트로 분리합니다.
- UI 라이브러리 도입 시 이 규칙을 재검토합니다.

## 디자인 시스템
컴포넌트 토큰, 색상, 타이포그래피 등 디자인 시스템 상세는 [DESIGN_SYSTEM.md](../DESIGN_SYSTEM.md)를 참조합니다.
