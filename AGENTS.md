# Agent Guidelines

## Repository Overview

A monorepo for Wix's web animation and interaction libraries, built on the native Web Animations API.

### Project Map

| Project  | Package                  | Directory                     |
| -------- | ------------------------ | ----------------------------- |
| Motion   | `@wix/motion`            | `packages/motion/`            |
| Interact | `@wix/interact`          | `packages/interact/`          |
| Presets  | `@wix/motion-presets`    | `packages/motion-presets/`    |
| Validate | `@wix/interact-validate` | `packages/interact-validate/` |

### Dependency Graph

```
@wix/motion              ← core animation layer
    ↑
@wix/interact            ← declarative interaction layer
```

```
@wix/motion              ← core animation layer
    ↑
@wix/motion-presets       ← ready-made presets
```

```
@wix/interact            ← config types (peer dependency)
    ↑
@wix/interact-validate   ← static config validation
```

### Motion (`@wix/motion`)

Core animation toolkit. Provides low-level APIs for running animations via the Web Animations API and CSS, including scroll-driven (ViewTimeline) and pointer-based animations. Uses `fastdom` to batch DOM reads/writes and reduce layout thrashing.

### Interact (`@wix/interact`)

Declarative, configuration-driven interaction library built on top of `@wix/motion`. Lets you wire animations to triggers via JSON config. Ships three entry points: vanilla JS (`@wix/interact`), React (`@wix/interact/react`), and Custom Elements (`@wix/interact/web`).

### Presets (`@wix/motion-presets`)

Ready-made animation presets for `@wix/motion`, organized in five categories: entrance, ongoing, scroll, mouse, and background-scroll. Each preset is a separate module under `library/`. Consumed via `registerEffects()`.

### Validate (`@wix/interact-validate`)

Static, zod-powered validator for `@wix/interact`'s `InteractConfig` (schema, referential, and semantic checks). Runs with no DOM/runtime — suitable for CI, build steps, and LLM-output validation. Depends on `@wix/interact` only for its config **types** (peer dependency); the schemas are kept in sync via a compile-time drift guard. Agent rules live at `packages/interact/rules/validate.md`.

## CLI Commands

Always run `nvm use` before executing any CLI commands to ensure the correct Node.js version is active.

```bash
nvm use
# then run your command, e.g.:
yarn build
```
