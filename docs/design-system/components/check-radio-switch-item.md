# Check, Radio, Switch Item

**Component set key:** `69832ee12634e155386b695a6529f1b4e89456ac`
**Figma page:** `⚛️ Checkbox, Radio, Switch (Toggle)`
**Variants in set:** 12

## Description

Check, Radio, Switch Item is the atomic selection control — a single checkbox, radio button, or toggle used directly on a form field. It supports a default inline layout as well as card-based variants that present the control inside a visual card container, suitable for option selection with more visual weight.

## Variants / Properties

### Variant axis
| Variant | Description |
|---|---|
| `Default` | Standard inline control — checkbox or radio with a label beside it. |
| `Card Left` | Control rendered inside a card; indicator on the left side of the card. |
| `Card Right` | Control rendered inside a card; indicator on the right side of the card. |

### Checked axis
| Value | Description |
|---|---|
| `False` | Control is unchecked / not selected. |
| `True` | Control is checked / selected. |

### Disabled axis
| Value | Description |
|---|---|
| `False` | Interactive — user can toggle. |
| `True` | Non-interactive — visually dimmed. |

## Related components

- `Switch Item` — dedicated toggle switch control (on/off, not check/radio).
- `List Entry` — selectable list row that embeds a selection control.
- `List Entry Group` — collapsible group of `List Entry` rows.

## Usage rules

- Use `Default` variant for standard form fields.
- Use `Card` variants when options need visual separation and more surface area (e.g., service type selection).
- Radio controls must always be presented in groups — never use a single radio button.
