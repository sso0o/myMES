# Implementation Guide

## Initial Rollout Order

1. Define design tokens in `src/index.css`.
2. Create shared UI primitives first:
   - `Button`
   - `Input`
   - `Card`
   - `Badge`
3. Redesign the login page as the first reference screen.
4. Apply the same system to dashboard, list, detail, and form pages.

## Suggested Ownership Flow

- Tokens first
- Shared components second
- Reference page third
- Feature pages last

## Review Checklist

- Are colors coming only from defined tokens?
- Are spacing values following the agreed scale?
- Are primary actions visually limited and consistent?
- Are states expressed with both text and color?
- Are tables and forms following the common interaction patterns?
