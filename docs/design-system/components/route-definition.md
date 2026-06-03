# Route Definition

**Component set key:** `bafa9ca0a68a8a8a9e3928dec3e3c28fd57a9994`
**Figma page:** `Tenders - Shipper`
**Variants in set:** 3

## Description

Route Definition is a compact route summary block used in tender list rows and cards to give a quick at-a-glance representation of the origin–destination structure. It distinguishes between single-leg routes and multi-stop routes.

## Variants / Properties

### Property 1 axis
| Variant | Description |
|---|---|
| `Default` | Standard route definition display (origin to destination). |
| `Single` | Single-leg route — direct origin to destination with no intermediate stops. |
| `Variant3` | Additional route layout variant — verify in Figma for the current treatment. |

## Usage rules

- Use `Single` only when the tender has exactly one origin and one destination with no intermediate waypoints.
- Use `Default` when intermediate stops are present or when the route complexity is unknown.
- This component is for display only — do not use it in form contexts.
