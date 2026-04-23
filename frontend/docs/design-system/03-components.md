# Component Rules

## Buttons

Supported variants:

- `Primary`
- `Secondary`
- `Ghost`
- `Danger`

Rules:

- Use only one visually dominant primary action per area when possible.
- `Secondary` uses white surface plus border styling.
- `Ghost` is for toolbar and low-emphasis actions.
- `Danger` is only for destructive actions such as delete or discard.

## Inputs

Supported patterns:

- `TextField`
- `Select`
- `Textarea`
- `DateField`

Rules:

- Keep height, padding, and focus style consistent.
- Use the same focus ring color across the product.
- Always show errors with both color and message text.
- Placeholder text is supplemental only; labels remain mandatory.

## Information Components

Recommended shared components:

- `Badge`
- `StatCard`
- `SectionCard`
- `EmptyState`
- `InlineAlert`
- `ConfirmDialog`

## Status System

| Status Meaning | Color Family |
|---|---|
| Waiting | slate |
| In progress | blue |
| Completed | green |
| Warning | amber |
| Delayed / error | red |

## Status Rules

- Always show status with both text and color.
- Reuse the same wording across all pages.
- Do not mix similar labels like `진행중`, `작업중`, `처리중` unless they are intentionally different states.

## Table Rules

- Use muted header backgrounds.
- Right-align numeric values.
- Use badges for status columns.
- Provide row hover feedback.
- Prevent row-click and inline-button interactions from conflicting.
- Replace empty tables with a proper `EmptyState`.

## Icon and Motion Rules

- Use simple line-style icons consistently.
- Avoid decorative icon overuse.
- Limit motion to hover, focus, and subtle panel entrance.
- Do not use playful bounce, zoom, or floating effects in core workflows.
