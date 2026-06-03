# Switch Item

**Component set key:** `2099694a3f12d682e8f2f3dfc76968623d207557`
**Figma page:** `⚛️ Checkbox, Radio, Switch (Toggle)`
**Variants in set:** 8

## Description

Switch Item is a binary toggle control (on/off) with an accompanying label. Use it for settings and preferences where the effect is immediate and reversible — for example, enabling notifications, toggling a filter, or activating a feature flag. Unlike a checkbox, a switch communicates that the change takes effect immediately without a form submit.

## Variants / Properties

### Checked axis
| Value | Description |
|---|---|
| `False` | Switch is off. |
| `True` | Switch is on. |

### LabelPlacement axis
| Value | Description |
|---|---|
| `Right` | Label appears to the right of the toggle (default). |
| `Left` | Label appears to the left of the toggle — use when right-to-left reading order or specific layout alignment requires it. |

### Disabled axis
| Value | Description |
|---|---|
| `False` | Interactive — user can toggle. |
| `True` | Non-interactive — visually dimmed. |

## Usage rules

- Use Switch for immediate-effect toggles; use a Checkbox for form selections that are submitted together.
- Always provide a clear label that describes the on-state of the switch.
- Do not use Switch for destructive actions — pair a destructive toggle with a confirmation dialog.
