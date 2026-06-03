# Page/Header/Shipper

**Component set key:** `ff99e69b29386c223a3667ba286f6be3f8f9c8d7`
**Figma page:** `📦 Page Header`
**Variants in set:** 3

## Description

Page/Header/Shipper is the global top navigation bar for the shipper-role view of the Transportly / 4Shipper application. It contains the logo, primary navigation links, user account controls, and notifications. Use it on every page in the shipper flow.

## Variants / Properties

### Layout axis
| Value | Description |
|---|---|
| `Desktop` | Full-width desktop layout with navigation links visible. |
| `Mobile` | Compact mobile layout — navigation may be hidden behind a hamburger or drawer. |

### Expanded axis
| Value | Description |
|---|---|
| `False` | Default collapsed state. |
| `True` | Expanded state — typically a mobile drawer or dropdown is open. |

## Related components

- `Page/Header/Carrier` — equivalent header for the carrier role.

## Usage rules

- Use only the shipper header variant in shipper-facing screens; use `Page/Header/Carrier` in carrier-facing screens.
- Do not customise navigation items within this component — changes to navigation structure must be made in the Figma library.
