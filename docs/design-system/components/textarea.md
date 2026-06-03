# Textarea

**Component set key:** `070099fb216768417ef71472d9c1089d92df8516`
**Figma page:** `⚛️ Input & Form Control`
**Variants in set:** 4

## Description

Textarea is the multi-line text-entry field. Use it in place of `Input` (Text type) whenever the expected content is longer than a single line — for example, shipment notes, Q&A answers, rejection reasons, or any free-form remarks field. It shares the same visual language as the Input component.

## Variants / Properties

### Empty axis
| Value | Meaning |
|---|---|
| `True` | No value entered — placeholder text is visible. |
| `False` | Content has been entered. |

### Disabled axis
| Value | Meaning |
|---|---|
| `False` | Editable — user can type into the field. |
| `True` | Read-only — field is visually dimmed and non-interactive. |

## Usage rules

- Pair with a `Form Control` wrapper for the label, helper text, and error state — the same as `Input`.
- Use when the expected input is more than ~80 characters or when line breaks are meaningful.
- Do not use Textarea for structured data that has a dedicated input type (dates, addresses, tags).
