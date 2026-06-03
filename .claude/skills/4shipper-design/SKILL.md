```markdown
# 4shipper-design Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development and collaboration patterns used in the `4shipper-design` TypeScript codebase. You'll learn how to follow the project's coding conventions, structure files, write and organize tests, and use commit messages effectively. This guide also provides suggested commands for common workflows to streamline your development process.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `buttonGroup.ts`, `userProfileCard.tsx`

### Import Style
- Use **relative imports** for modules within the project.
  - Example:
    ```typescript
    import { Button } from './button';
    import { formatDate } from '../utils/dateUtils';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    // In button.ts
    export const Button = () => { /* ... */ };
    ```

### Commit Messages
- Follow the **Conventional Commits** format.
- Prefixes used: `feat`, `chore`
- Example:
  ```
  feat: add responsive layout to header component
  chore: update dependencies to latest versions
  ```

## Workflows

### Commit Workflow
**Trigger:** When making any code change  
**Command:** `/commit`

1. Make your code changes following the coding conventions.
2. Stage your changes: `git add .`
3. Write a commit message using the Conventional Commits format:
   - `feat: <description>` for new features
   - `chore: <description>` for maintenance
4. Commit your changes: `git commit -m "feat: add new button style"`

### Testing Workflow
**Trigger:** Before pushing or merging code  
**Command:** `/test`

1. Identify or create a test file matching the `*.test.*` pattern (e.g., `button.test.ts`).
2. Write or update tests for your changes.
3. Run the test suite using the project's test runner (framework unknown; check project scripts).
4. Ensure all tests pass before pushing.

## Testing Patterns

- Test files are named with the pattern `*.test.*` (e.g., `component.test.ts`).
- The testing framework is not specified; check for a test runner in project scripts or documentation.
- Place tests alongside the modules they test or in a dedicated `tests` directory, following the file naming pattern.

## Commands
| Command    | Purpose                                      |
|------------|----------------------------------------------|
| /commit    | Guide for making commits with conventions    |
| /test      | Steps for writing and running tests          |
```
