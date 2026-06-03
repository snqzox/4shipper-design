# Typography

**Typeface: Mulish** for everything. Apply the library **text styles** (24) — never set raw
font/size/weight by hand. Values below are the real published styles (`data/tokens.json`).

## Weights
`regular 400 · medium 500 · semibold 600 · bold 700 · extrabold 800` (+ `900` for Display only).

## Type scale (size / line-height, px)

### Headlines — Mulish ExtraBold 800
| Style | Size / LH |
|---|---|
| `headline/h1` | 28 / 32 |
| `headline/h2` | 23 / 30 |
| `headline/h3` | 19 / 28 |
| `headline/h4` | 16 / 24 |
| `headline/h5` | 14 / 24 |
| `headline/h6` | 13 / 20 |

### Body — 14 / 20
`body/md-regular 400` · `body/md-semibold 600` · `body/md-bold 700` · `body/md-extrabold 800`

### Large — 16 / 24
`lg/lg-regular 400` · `lg/lg-semibold 600` · `lg/lg-bold 700` · `lg/lg-extrabold 800`

### Small — 13 / 18
`sm/sm-regular 400` · `sm/sm-semibold 600` · `sm/sm-bold 700` · `sm/sm-extrabold 800`

### Extra small — 12 / 17
`xs/xs-regular 400` · `xs/xs-semibold 600` · `xs/xs-bold 700` · `xs/xs-extrabold 800`

### Special
| Style | Spec |
|---|---|
| `Special/Display 1` | Mulish Black 900, 64 / 80 |
| `Special/Label` | Mulish Bold 700, 14 / 20 |

## Usage
- Page title → `headline/h2` or `h3`; section headers → `h4`/`h5`; card titles → `headline/h6` or `body/md-bold`.
- Default running text → `body/md-regular`. Secondary/meta → `sm/sm-regular` in `text/muted`.
- Form labels → `sm/sm-semibold`. Table headers → `xs/xs-semibold` uppercase-ish, `text/muted`.
- Never mix a non-Mulish face or an off-scale size.
