# Screen & Surface Naming (4Shipper Design file)

How to name the individual screen/surface frames **inside a page's working area** — the list views,
dialogs, dropdowns, and notifications that make up a feature. Names describe **what the surface shows
and what it does**, so the layer list reads like a sitemap instead of `Page`, `Dialog`, `Frame 27179`.

> Scope: the *instances/frames on the canvas* (a `Page`, `Dialog`, `Alert Dialog`, `Dropdown Menu`,
> `Notification (Alert)`). For how the **pages** of the file are named/grouped, see
> [README](README.md) §"Pages & naming". For the UI Kit library, see
> [ui-kit-file-structure.md](ui-kit-file-structure.md). Component **sets** are never renamed (audit-owned).

## The pattern

```
<Section>/<Subsection>/<Type>[/<Name>][ - <Qualifier>]
```

| Segment | What it is | Examples |
|---|---|---|
| **Section** | The app nav area | `Directory`, `Tenders`, `Transports`, `Requests`, `Contracts`, `Reports`, `Settings` |
| **Subsection** | The entity / tab within the section | `Routes`, `Carriers`, `Contacts`, `Addresses`, `Groups` |
| **Type** | The *kind* of surface (controlled vocab below) | `List`, `Detail`, `Dialog`, `Dropdown`, `Notification`, `Empty` |
| **Name** | The specific surface — for things that need it (mostly dialogs/dropdowns) | `Delete Route`, `Edit Route`, `Add Routes` |
| **Qualifier** | A trailing ` - <state/variant>` to tell siblings apart | ` - Included in Tender`, ` - Review`, ` - Empty`, ` - Selection Mode` |

**Stop at the level that fully identifies the surface.** A single list view is just
`Directory/Routes/List`; a dialog needs its name → `Directory/Routes/Dialog/Edit Route`. The qualifier
attaches to the **leaf** with ` - ` (a space-hyphen-space), it is *not* a new `/` segment:
`Dialog/Delete Route - Included in Tender`, not `Dialog/Delete Route/Included in Tender`.

## Type vocabulary

| Type | Use for | UI Kit component it's usually built from |
|---|---|---|
| `List` | The index / table / cards view of the entity | `Page` + `Route Entry` / `Table` |
| `Detail` | A single-record detail screen | `Page` |
| `Dialog` | Modal dialogs | `Dialog` (header + holder + footer) |
| `Dropdown` | Dropdown menus / action popovers | `Dropdown Menu`, `Popover` |
| `Notification` | Toasts / inline alerts | `Notification (Alert)` |
| `Empty` | A standalone empty-state screen (when it isn't just a state of another surface) | `No Data Placeholder` |

Reuse before inventing — only add a Type when a genuinely new kind of surface appears.

## How to derive a name (the repeatable procedure)

1. **Section + Subsection — read the screen's own chrome, never the current layer name.** Use the
   breadcrumb / page title and the active nav tab. (e.g. header *"Directory ▸ Routes"*, tab *"Routes"*
   → `Directory/Routes`.)
2. **Classify the Type** from the component used and what it does: a `Dialog` instance → `Dialog`;
   a `Notification (Alert)` → `Notification`; a full `Page` showing the index → `List`.
3. **Read the surface's own title / leading text for the Name.** Dialog header *"Edit route"* →
   `Edit Route`; alert *"Are you sure you want to delete selected routes?"* → `Delete Route`;
   menu offering *"Add route(s)"* → `Add Route(s)`.
4. **Add a Qualifier only to disambiguate siblings.** Two delete dialogs → one plain `Delete Route`,
   the other `Delete Route - Included in Tender`. A list in selection mode → `List - Selection Mode`.
   A wizard's confirm step → `… - Review`. An empty first state → `… - Empty`.
5. **Title-case each segment**; keep product nouns exactly as the UI spells them
   (`Waypoint Combinations`, `Route`, `Tender`).

When several frames are clearly the **same surface at different states** (empty → filled → review),
keep the base name identical and vary only the qualifier — they sort together and read as a flow.

## Worked example — Directory ▸ Routes

| Surface (what it shows) | Name |
|---|---|
| Routes index, default | `Directory/Routes/List` |
| Routes index, selection mode (checkboxes, bulk delete) | `Directory/Routes/List - Selection Mode` |
| "Add route(s)" split-button menu | `Directory/Routes/Dropdown/Add Route(s)` |
| "Are you sure you want to delete selected routes?" | `Directory/Routes/Dialog/Delete Route` |
| "Routes Included in Draft Tenders" delete | `Directory/Routes/Dialog/Delete Route - Included in Tender` |
| "Edit route" dialog | `Directory/Routes/Dialog/Edit Route` |
| "Add new route(s)" — define waypoints | `Directory/Routes/Dialog/Add Routes` |
| "Select and create N routes" — review step | `Directory/Routes/Dialog/Add Routes - Review` |
| Waypoint-combinations builder, first/empty | `Directory/Routes/Dialog/Waypoint Combinations - Empty` |
| Waypoint-combinations builder, addresses picked | `Directory/Routes/Dialog/Waypoint Combinations` |
| Waypoint-combinations, generated routes review | `Directory/Routes/Dialog/Waypoint Combinations - Review` |
| "N routes successfully created" toast | `Directory/Routes/Notification/Routes Created` |

## Who applies this & how

The **designer** agent owns this. It applies the convention whenever it **creates or reorganizes**
screens in the 4Shipper file, and whenever asked to **"rename screens / frames to match content"**.

Execute renames with the official **`use_figma`** tool (writes the saved file by
`fileKey = Xol48qmGXL8hIqA42jbHno`, no desktop focus needed) — set `node.name` per node id:

```js
const renames = { "287:28256": "Directory/Routes/List", /* … */ };
for (const [id, name] of Object.entries(renames)) {
  const node = await figma.getNodeByIdAsync(id);
  if (node) node.name = name;
}
```

Renaming layers is **link-safe** — it changes nothing about instances, component bindings, or
published assets. Read each surface's content first (`get_metadata` for structure, `get_screenshot`
to read its title) so the name reflects the real content, not a guess.
