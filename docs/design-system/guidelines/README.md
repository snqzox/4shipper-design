# 4Shipper Design Guidelines

These are the **binding rules** the `designer` agent follows when producing designs.
Keep them short, concrete, and current. The `design-system-manager` agent owns this file.

> ⚠️ This is a seed. Fill the bracketed `[…]` placeholders with the real conventions
> from the Transportly UI Kit 2.0 and the 4Shipper Design file.

## Foundations
- **Spacing scale:** [e.g. 4 / 8 / 12 / 16 / 24 / 32 — use tokens, never arbitrary values]
- **Grid:** [columns, gutter, margins per breakpoint]
- **Color:** use library color styles/variables only. Primary: [token], surfaces: [tokens], semantic (success/warning/danger): [tokens].
- **Typography:** use library text styles only. Headings: [styles], body: [styles].
- **Corner radius / elevation:** [tokens]

## Components
- Build screens from **published UI Kit components only** (see `data/components.json`).
- Prefer the highest-level component that fits (e.g. a full `Table` over hand-assembled rows).
- Never detach instances unless a one-off truly requires it — and note why.

## Layout & structure
- Use **auto-layout** for everything; no absolute positioning unless required.
- Standard page frame: [width, e.g. 1440] with the app shell (sidebar + topbar) when designing in-app screens.
- Forms: [label position, field width rules, required-field marker, error pattern].

## Pages & naming in the Figma file
- Page organization: [how pages map to app sections — Requests, Transports, Tenders, Contracts, Directory, Reports, Settings…].
- Frame naming: [convention, e.g. `1.4 Request detail / Route tab`].
- Keep a `🚧 WIP` page for unfinished work; move to the section page when done.

## Product context
- App sections and screens are documented in `platform-structure.md`.
- Product flow and pricing models in `platform-overview.md`.

## Do / Don't
- ✅ Reuse patterns from existing screens for consistency.
- ✅ Match labels and terminology used elsewhere in the app.
- ❌ No off-system colors, type, or spacing.
- ❌ Don't invent components that aren't in the library — request them instead.
