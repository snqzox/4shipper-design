# Item

**Component set key:** `a70fbb845175f1d6672331775b949ae7bfd8fdb7`
**Figma page:** `⚛️ Item`
**Variants in set:** 3

## Description

Item is a general-purpose label–value display row used to present a single piece of structured information — for example, a shipment attribute, a tender detail field, or a contract property. It supports horizontal and vertical layout modes to fit different densities and reading directions.

## Variants / Properties

### Align axis
| Align | Description |
|---|---|
| `Horizontal` | Label on the left, value on the right — suitable for compact lists and sidebars. |
| `Vertical` | Label above, value below — suitable for wider panels with more visual space. |
| `Horizontal - Right` | Label on the left, value right-aligned — use when numeric values need to align across multiple rows. |

## Usage rules

- Use `Horizontal` for compact attribute lists (4–8 items in a card or panel).
- Use `Vertical` when each field needs more emphasis or when values are long strings.
- Use `Horizontal - Right` for price or quantity displays where numeric alignment matters.
- Do not use `Item` for editable fields — use `Input` + `Form Control` wrapper instead.
