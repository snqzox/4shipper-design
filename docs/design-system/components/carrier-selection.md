# Carrier Selection

**Component set key:** `4479bdc9b089fadf0bee634a33095f60b535e67e`
**Figma page:** `⚛️ Carrier Selection`
**Variants in set:** 4

## Description

Carrier Selection is the card-style selector used when a shipper chooses one or more carriers to invite to a tender. It renders a carrier identity block and supports collapsed and expanded states for showing contact details or additional carrier information. Use it in tender creation flows and in any context where carriers are selected from a list.

## Variants / Properties

### Expanded axis
| Value | Description |
|---|---|
| `False` | Carrier card is collapsed — shows name and primary identifier only. |
| `True` | Carrier card is expanded — reveals additional details such as contact information. |

### Selected axis
| Value | Description |
|---|---|
| `False` | Carrier is not selected. |
| `True` | Carrier is selected — visually highlighted with a checked state. |

## Related components

- `Carrier Selection/Entry` — the individual contact or carrier row rendered inside the expanded state.

## Usage rules

- Allow multi-select when inviting multiple carriers to a single tender.
- The expanded state is typically triggered on hover or tap to preview carrier details before confirming.
- Always show at least the carrier name and a primary identifier in the collapsed state.
