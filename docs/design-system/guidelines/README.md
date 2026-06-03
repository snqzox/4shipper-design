# 4Shipper Design Guidelines

The **binding rules** the `designer` agent follows. Derived from the real UI Kit 2.0 tokens and
file structure. Owned by `design-system-manager`. Keep concrete and current.

> **How the UI Kit library file itself is organized** (page grouping, emoji legend, per-component
> anatomy, description standard): [ui-kit-file-structure.md](ui-kit-file-structure.md) — the IA
> companion to [../audit-2026-06-03.md](../audit-2026-06-03.md).

## Foundations (full detail in `../foundations/`)
- **Color** → semantic tokens only. Brand primary `background/primary #105BFF`; text `text/body #11151D`,
  `text/muted #606673`; status via `*-subtle` bg + solid text. See [color.md](../foundations/color.md).
- **Typography** → **Mulish**, library text styles only. Page title `headline/h2`–`h3`, body
  `body/md-regular` (14/20), labels `sm/sm-semibold`. See [typography.md](../foundations/typography.md).
- **Spacing** → 4-base scale (`spacing/2 8`, `/3 12`, `/4 16`, `/6 24`, `/8 32`); layout gaps
  `xs6 sm12 md20 lg32`. See [spacing.md](../foundations/spacing.md).
- **Radius** → each component carries its own radius token (e.g. **every button size has its own
  radius — don't override it**). Containers you build yourself: **cards & dialogs `lg 20`**, pills `full`. **Icons** default 20.
- **Never** hardcode a value that duplicates a token — bind the variable/style.

## Components
- Build from **published UI Kit components only** (41 sets + standalone — see Components tab or
  `data/components.json`). If a needed component is missing, **stop and request it** — don't draw it.
- Prefer the highest-level fit: `Table` + `Table Cell`, `Input`/`Form Control`, `Button`, `Badge`,
  `Status/*`, `Dialog`, `Tabs`, `Dropdown`, `Notification (Alert)`, `Pagination`, `Stepper`,
  `Carrier Selection`, `Route Entry`.
  - **Note:** `Waypoint Entry`, `Address entry`, `Carrier Offer` are product compositions that now live
    in the **4Shipper Design file**, not the UI Kit — use them there, don't expect them in the library.
- Don't detach instances unless a one-off truly requires it — note why.
- **Reuse the whole component, not its parts.** Containers (dialogs, cards, banners) are components —
  instance them and fill their slots; never rebuild their chrome from frames. Recipes in
  `../patterns/` (e.g. **dialogs → use the `Dialog` component**, see [patterns/dialog.md](../patterns/dialog.md)).

## Layout & structure
- **Auto-layout for everything.** No absolute positioning unless unavoidable.
- **Width = FILL, never fixed** (`layoutSizingHorizontal = 'FILL'`). Fields/content stretch to their container;
  don't hardcode widths, and don't re-pad a container that already pads (it pushes content past the edges).
- In-app screens: standard **1440** frame with the app shell (sidebar + topbar). Content max-width
  consistent with neighbouring screens.
- Vertical rhythm: section gaps `spacing/8 (32)`, block gaps `spacing/4 (16)`, control padding `spacing/3 (12)`.

## Forms
- **Use the `Form Control` component for every field.** It already contains the label, hint/helper
  text, and error state — do **not** hand-build label + input stacks. (UI Kit node `26:1580`.)
- **Spacing between form fields = `layout-gap/md` (20px)** — set the form's auto-layout gap to it.
- One column. Required, hint and error states are driven by `Form Control`'s own properties.
- Group related fields; primary action right-aligned (`Button` primary), secondary to its left.
- Multi-step flows use the `Stepper` / `Step Progress Tabs` (e.g. tender & request wizards).

## Pages & naming (4Shipper Design file)
- The file is split into two role sections marked by divider pages: **`SHIPPER ---------`** and
  **`CARRIER ---------`**.
- Section pages carry an emoji prefix, mirroring the app nav: `⏰ Requests`, `🚚 Transports`,
  `📦 Tenders`, `📑 Contracts`, `🗂️ Directory`, `📊 Reports`, `⚙️ Settings` (+ `Carrier - Sign in/up flow`).
- Put new work on the matching section page; **keep new screens on a `🚧 WIP` area** until done, then
  place them in order next to siblings. Name frames after the app structure, e.g. `Requests / 1.4 Request detail / Route`.
- App sections & screens reference: `platform-structure.md`. Product flow: `platform-overview.md`.

## Do / Don't
- ✅ Reuse the pattern of the nearest existing screen; match its terminology and labels.
- ✅ Use semantic color tokens and named text styles; bind, don't hardcode.
- ✅ Take a screenshot to verify before reporting done.
- ❌ Off-system color/type/spacing. ❌ Inventing components. ❌ Editing the UI Kit library (that's the DS manager's job).
