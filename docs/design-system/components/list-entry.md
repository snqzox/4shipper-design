# List Entry

**Component set key:** `070db0d59c67aa5cd819a056c70df1fc82445cd4`
**Figma page:** `⚛️ Checkbox, Radio, Switch (Toggle)`
**Variants in set:** 4

## Description

List Entry is a selectable row used within flat, non-grouped selection lists — for example, a list of available cargo types, service levels, or filter options. It embeds a selection indicator (checkbox or radio) and a label. Group multiple List Entry rows to form a selection list; for collapsible groups, use `List Entry Group`.

## Variants / Properties

### Selected axis
| Value | Description |
|---|---|
| `False` | Row is not selected. |
| `True` | Row is selected. |

### Disabled axis
| Value | Description |
|---|---|
| `False` | Interactive — user can select. |
| `True` | Non-interactive — visually dimmed. |

## Related components

- `List Entry Group` — collapsible container for grouped `List Entry` rows.
- `Check, Radio, Switch Item` — the embedded selection control.

## Usage rules

- Use for flat lists without nesting; use `List Entry Group` when rows need to be collapsed into categories.
- Disabled rows should still be visible so the user understands the full option set.
