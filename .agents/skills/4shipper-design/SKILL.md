```markdown
# 4shipper-design Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches how to contribute to the **4shipper-design** repository, a TypeScript-based design system project that synchronizes with Figma and provides a dashboard, documentation, and data for design tokens, components, and guidelines. You'll learn the repository's coding conventions, commit patterns, and the main workflows for syncing with Figma, updating documentation, managing dashboard features, and handling design tokens and variables.

---

## Coding Conventions

**File Naming:**  
- Use **kebab-case** for files and folders.  
  _Example:_  
  ```
  dashboard/index.html
  data/components.json
  scripts/build-variables-from-bridge.mjs
  ```

**Import Style:**  
- Use **relative imports** for modules.  
  _Example:_  
  ```typescript
  import { getTokens } from '../utils/tokens';
  ```

**Export Style:**  
- Use **named exports**.  
  _Example:_  
  ```typescript
  // tokens.ts
  export function getTokens() { ... }
  export const TOKEN_VERSION = '1.0.0';
  ```

**Commits:**  
- Use **conventional commit** prefixes: `chore`, `docs`, `feat`, `fix`, `merge`, `ci`
- Keep commit messages concise (~51 chars on average).  
  _Example:_  
  ```
  feat(dashboard): add health view to sidebar
  fix(tokens): resolve duplicate variable names
  docs(components): update button documentation
  ```

---

## Workflows

### Sync Design System from Figma
**Trigger:** When you want to update the local repo with the latest design system changes from Figma  
**Command:** `/sync-figma`

1. Run the sync script to pull the latest data from Figma.
2. Update `dashboard/index.html` with new data.
3. Update these JSON files:  
   - `data/components.json`  
   - `data/latest.json`  
   - `data/pages.json`  
   - `data/styles.json`  
   - `data/tokens.json`  
   - `data/variables.json`
4. Add a new snapshot: `data/snapshots/<timestamp>.json`
5. Optionally update `docs/design-system/changelog.md` if changes are detected.
6. Commit all changes with a descriptive message.

_Example commit:_  
```
chore(sync): update design system data from Figma
```

---

### Document or Update Component Docs
**Trigger:** When you want to document, audit, or fix documentation for a component or set of components  
**Command:** `/document-component`

1. Create or update `docs/design-system/components/<component>.md`.
2. Optionally update `docs/design-system/components/README.md`.
3. Optionally update audit or fixes files:  
   - `docs/design-system/audit-*.md`  
   - `docs/design-system/fixes/*.md`
4. Commit changes with a descriptive message.

_Example commit:_  
```
docs(components): add documentation for Badge component
```

---

### Update Design System Guidelines or Patterns
**Trigger:** When you want to clarify, correct, or add a pattern or guideline for the design system  
**Command:** `/update-guideline`

1. Edit or create:  
   - `docs/design-system/guidelines/README.md`  
   - `docs/design-system/patterns/*.md`
2. Optionally update `.claude/agents/designer.md` with new rules or recipes.
3. Commit changes with a summary of the new or changed rule.

_Example commit:_  
```
docs(guidelines): clarify color usage rules
```

---

### Add or Update Dashboard Feature
**Trigger:** When you want to add a new feature or visualization to the design system dashboard  
**Command:** `/add-dashboard-feature`

1. Implement or update the dashboard feature in `dashboard/index.html`.
2. Update or add supporting scripts in `scripts/*.mjs`.
3. Update or generate supporting data files (e.g., `data/thumbnails.json`, `data/tokens.json`).
4. Update `package.json` if new scripts or dependencies are added.
5. Commit all related files.

_Example commit:_  
```
feat(dashboard): add actions tab to dashboard
```

---

### Refresh or Rebuild Variables and Tokens
**Trigger:** When you want to update or fix the design tokens/variables from Figma, or resolve token leaks  
**Command:** `/refresh-variables`

1. Run scripts to pull or resolve variables from Figma or bridge:  
   - `scripts/build-variables-from-bridge.mjs`  
   - `scripts/pull-variables-desktop.mjs`  
   - `scripts/tokens.mjs`
2. Update `data/variables-desktop.json` and/or `data/tokens.json`.
3. Optionally update `dashboard/index.html` to reflect new tokens.
4. Commit the updated files.

_Example commit:_  
```
fix(tokens): refresh variables and resolve leaks
```

---

## Testing Patterns

- **Test files** use the pattern `*.test.*` (e.g., `button.test.ts`).
- The specific testing framework is unknown, but follow typical TypeScript test conventions.
- Place tests close to the code they test, or in a `__tests__` folder if present.
- Example test file:
  ```typescript
  // button.test.ts
  import { renderButton } from './button';

  test('renders button with correct label', () => {
    expect(renderButton('OK')).toContain('OK');
  });
  ```

---

## Commands

| Command              | Purpose                                                         |
|----------------------|-----------------------------------------------------------------|
| /sync-figma          | Sync design system data and dashboard from Figma                |
| /document-component  | Add or update markdown documentation for a component            |
| /update-guideline    | Update or add design system guidelines or patterns              |
| /add-dashboard-feature| Develop or enhance dashboard features                          |
| /refresh-variables   | Refresh or rebuild design tokens and variables from Figma       |
```
