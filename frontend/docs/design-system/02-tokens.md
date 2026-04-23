# Design Tokens

## Color Tokens

| Token | Value | Usage |
|---|---|---|
| `primary` | `#2563EB` | Main actions, focus, active states |
| `primary-hover` | `#1D4ED8` | Primary hover state |
| `primary-soft` | `#DBEAFE` | Selected backgrounds, subtle emphasis |
| `background` | `#F8FAFC` | App background |
| `surface` | `#FFFFFF` | Cards, panels, forms |
| `surface-alt` | `#F1F5F9` | Table headers, muted sections |
| `border` | `#CBD5E1` | Default borders |
| `text-strong` | `#0F172A` | Main headings and important text |
| `text-base` | `#334155` | Body text |
| `text-muted` | `#64748B` | Helper text, descriptions |
| `success` | `#15803D` | Completed, normal operation |
| `success-soft` | `#DCFCE7` | Success badge background |
| `warning` | `#D97706` | Caution, pending risk |
| `warning-soft` | `#FEF3C7` | Warning badge background |
| `danger` | `#DC2626` | Errors, destructive actions |
| `danger-soft` | `#FEE2E2` | Danger badge background |

## Color Rules

- Use `primary` as the only main accent color.
- Do not introduce page-specific accent colors.
- Use green, amber, and red only for semantic state feedback.
- Avoid purple, neon accents, and decorative gradients.

## Typography

- Primary font: `Pretendard`
- Fallback: `system-ui, sans-serif`
- Numeric data: use `tabular-nums` when showing KPI or quantity values

| Role | Recommended Tailwind Style |
|---|---|
| Page title | `text-3xl font-semibold` |
| Section title | `text-xl font-semibold` |
| Card title | `text-base font-semibold` |
| Body text | `text-sm` or `text-base` |
| Helper text | `text-sm text-slate-500` |
| Form/table text | `text-sm` |

## Typography Rules

- Keep the number of text sizes limited.
- Prefer `regular`, `medium`, and `semibold`.
- Emphasize values through alignment and contrast rather than oversized text.

## Spacing Scale

- Base scale: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40`
- Section gap: `32`
- Card padding: `24`
- Form field gap: `16`
- Label to input gap: `8`
- Button padding baseline: `12 x 16`

## Radius, Border, and Shadow

| Element | Rule |
|---|---|
| Inputs and buttons | `rounded-lg` |
| Panels and cards | `rounded-2xl` |
| Dense list/table containers | `rounded-xl` |
| Borders | default `1px` border |
| Shadow | use lightly and only for layer separation |

## Surface Rules

- Prefer borders over heavy shadows.
- Keep cards clean and flat to preserve an operational UI feeling.
- Do not mix too many radius sizes on one screen.
