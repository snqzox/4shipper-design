# Page/Header/Carrier

**Component set key:** `24b9005e375704fe2e3ce6151c2439fe0a01e2e6`
**Figma page:** `📦 Page Header`
**Variants in set:** 3

## Description

Page/Header/Carrier is the global top navigation bar for the carrier-role view of the Transportly / 4Shipper application. It mirrors the structure of `Page/Header/Shipper` but is configured for the carrier context — different navigation links, role-appropriate account controls, and carrier-specific notifications.

## Variants / Properties

### Layout axis
| Value | Description |
|---|---|
| `Desktop` | Full-width desktop layout with navigation links visible. |
| `Mobile` | Compact mobile layout. |

### Expanded axis
| Value | Description |
|---|---|
| `False` | Default collapsed state. |
| `True` | Expanded state — mobile drawer or dropdown is open. |

## Related components

- `Page/Header/Shipper` — equivalent header for the shipper role.

## Usage rules

- Use only on carrier-facing screens; use `Page/Header/Shipper` in shipper-facing screens.
- Do not customise navigation items within this component in the design file — update the library component.
