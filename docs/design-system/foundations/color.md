# Color

All colors come from Figma **Variables** (see the Variables/Colors tabs in the dashboard, or
`data/tokens.json`). **Design with semantic tokens, not raw ramp steps** — semantic tokens encode
intent and stay correct across themes.

## Semantic tokens (use these)

### Text
| Token | Hex | Use |
|---|---|---|
| `text/body` | `#11151D` | Default body text |
| `text/muted` | `#606673` | Secondary text, labels |
| `text/extramuted` | `#8F94A1` | Placeholders, disabled |
| `text/primary` | `#105BFF` | Links, primary emphasis |
| `text/primary-accent` | `#004CF2` | Hover/active primary text |
| `text/danger` | `#A8161F` | Errors |
| `text/success` | `#076B0B` | Success messages |
| `text/warning` | `#854D0E` | Warnings |
| `text/purple` | `#5C18BC` | Accent (e.g. tenders) |
| `text/body-inverted` | `#FFFFFF` | Text on dark/primary surfaces |

### Background
| Token | Hex | Use |
|---|---|---|
| `background/body` | `#FFFFFF` | Page surface |
| `background/muted` | `#EEF0F4` | Subtle fills, hover |
| `background/extramuted` | `#E6E9EF` | Dividers, track fills |
| `background/primary` | `#105BFF` | Primary buttons/fills |
| `background/primary-subtle` | `#E6EEFF` | Primary tints |
| `background/danger` · `…-subtle` | `#E0262F` · `#FEF2F2` | Destructive · tint |
| `background/success` · `…-subtle` | `#0AB110` · `#E6F7E6` | Success · tint |
| `background/warning` · `…-subtle` | `#EAB308` · `#FEF9C3` | Warning · tint |

### Border
| Token | Hex | Use |
|---|---|---|
| `border/input` | `#D0D4DD` | Inputs, controls |
| `border/body` | `#11151D26` | Default 1px dividers (15% alpha) |
| `border/body-accent` | `#11151D40` | Stronger dividers (25%) |
| `border/primary` | `#004CF2` | Focus/active primary |

## Ramps (reference only — prefer semantic tokens)

- **blue** (brand): `50 #E6EEFF · 100 #CFDEFF · 200 #AEC7FF · 300 #84ABFF · 400 #558AFF · 500 #105BFF · 600 #004CF2 · 700 #0043D5 · 800 #0035AA · 900 #00287E · 950 #001B57`. Brand primary = **blue/500 `#105BFF`**.
- **neutral**: `0/white #FFFFFF · 50 #EEF0F4 · 100 #E6E9EF · 200 #D0D4DD · 300 #BFC3CD · 400 #A8ADB9 · 500 #8F94A1 · 600 #797E8B · 700 #606673 · 800 #4B515E · 900 #373D4A · 950 #1D222F`.
- Also present: **red, green, yellow** ramps (for danger/success/warning).

## Rules
- Never hardcode a hex that duplicates a token — bind the variable.
- Use `*-subtle` backgrounds with the matching solid text/border for status chips, alerts, badges.
- On `background/primary` use `text/body-inverted`.
