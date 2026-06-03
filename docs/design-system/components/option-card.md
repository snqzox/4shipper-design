# Option Card

**Component set key:** `198beea9971db2d3fbedb1c54efb0311ac338d0a`
**Figma page:** `⚛️ Option Cards`
**Variants in set:** 4

## Description

Option Card is a large-surface selection control used when presenting a small number of mutually exclusive or multi-select choices that benefit from visual prominence — for example, choosing a transport mode (road, rail, sea, air) or a service level. It is wider and more visually distinctive than a radio button or checkbox row.

## Variants / Properties

### Selected axis
| Value | Description |
|---|---|
| `False` | Card is not selected — renders in a neutral, unactivated style. |
| `True` | Card is selected — renders with a highlighted border or fill. |

### Disabled axis
| Value | Description |
|---|---|
| `False` | Interactive — user can select this option. |
| `True` | Option is not available — visually dimmed and non-interactive. |

## Related components

- `Check, Radio, Switch Item` (Card variants) — lighter-weight card selection for denser layouts.

## Usage rules

- Use Option Card for 2–5 choices; for longer option lists use `List Entry` or `Dropdown Item`.
- Place Option Cards in a horizontal row or a responsive grid — never stack them vertically in a single column without strong reason.
- Provide an icon or illustration inside each card to reinforce the option meaning.
