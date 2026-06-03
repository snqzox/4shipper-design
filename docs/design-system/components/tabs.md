# Tabs

**Component set key:** `050ff2281cbe78462fd4e7a8ae63524c66e1c457`
**Figma page:** `⚛️ Tabs`
**Variants in set:** 2

## Description

Tabs is the general-purpose tab navigation component for switching between related content panels within the same page context. It does not imply a workflow order — use it for flat content grouping such as "Details / Documents / History" views. For ordered multi-step flows, use `Stepper` or `Step Progress Tabs` instead.

## Variants / Properties

### Orientation axis
| Orientation | Description |
|---|---|
| `Horizontal` | Tab bar runs left-to-right across the top of the content area — the standard layout. |
| `Vertical` | Tab bar runs top-to-bottom on the left side of the content area — use in sidebar-style layouts with many tabs. |

## Usage rules

- Keep tab labels short (1–3 words); do not use sentences.
- Highlight the active tab clearly so it is distinguishable at a glance.
- Use `Horizontal` orientation by default; switch to `Vertical` only when more than ~6 tabs are needed or when a sidebar panel calls for it.
- Do not use Tabs for primary app navigation — use the sidebar or page header for that.
