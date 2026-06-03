# Carrier Selection/Entry

**Component set key:** `e8d1dfea80a29c770096bc233953b8ebad396ad2`
**Figma page:** `⚛️ Carrier Selection`
**Variants in set:** 2

## Description

Carrier Selection/Entry is the individual row rendered inside an expanded `Carrier Selection` card. It represents either a named carrier company or a specific contact person at that carrier. Two variants cover these two identities.

## Variants / Properties

### Variant axis
| Variant | Description |
|---|---|
| `Carrier` | Row represents a carrier company — shows carrier name and relevant company identifiers. |
| `Contact` | Row represents a named contact person at the carrier — shows name and role or contact detail. |

## Related components

- `Carrier Selection` — the parent card that contains these entry rows.

## Usage rules

- Use `Carrier` entries to identify the organisation; use `Contact` entries to identify the individual.
- A single expanded `Carrier Selection` card may contain multiple `Contact` entries under a `Carrier` entry.
