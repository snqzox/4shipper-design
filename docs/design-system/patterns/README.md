# Patterns

Canonical "how to build it correctly" recipes for composite UI. The `designer` agent reads the
matching recipe before building. **If a pattern is in the backlog (not yet written), the designer
should inspect a real example in the file with `get_metadata` and mirror its construction** — then we
capture it here.

## Documented
- [dialog.md](dialog.md) — Dialog / Modal (use the `Dialog` component + `Holder` slot).

## Backlog — capture later
Each: instance the listed component(s), inspect a real example, then write the recipe + gotchas.

- [ ] **Card** — content card container (find the card/section component; what's a slot vs fixed).
- [ ] **Table** — `Table` + `Table Cell` (columns, header row, cell variants, row states).
- [ ] **Page shell** — app frame: sidebar + topbar (`Page/Header/*`, `Page Footer`) + content area; the 1440 in-app layout.
- [ ] **Banner / Alert** — `Notification (Alert)` and `Alert Dialog` (variants: info/success/warning/danger).
- [ ] **Wizard step** — multi-step flow with `Stepper` / `Step Progress Tabs` (request & tender wizards).
- [ ] **Tabs** — `Tabs` component (in-page section switching).
- [ ] **Dropdown / menu** — `Dropdown` + `Dropdown Item`.
- [ ] **Status & badges** — `Status/*` and `Badge` (per domain: Requests/Transports/Tenders/Contracts).
- [ ] **Carrier selection** — `Carrier Selection` / `Carrier Offer` (used in request & tender flows).
- [ ] **Route / waypoints** — `Route Entry` / `Waypoint Entry` (route builder rows).
- [ ] **Pagination** — `Pagination` (list footers).

> Add new entries here whenever a non-trivial composite is built for the first time, so the next build
> is correct by default.
