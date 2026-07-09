# Agent Guidelines

## Repository Overview

A monorepo for Wix's web animation and interaction libraries, built on the native Web Animations API.

### Project Map

| Project   | Package                  | Directory                     |
| --------- | ------------------------ | ----------------------------- |
| Motion    | `@wix/motion`            | `packages/motion/`            |
| Interact  | `@wix/interact`          | `packages/interact/`          |
| Presets   | `@wix/motion-presets`    | `packages/motion-presets/`    |
| Validate  | `@wix/interact-validate` | `packages/interact-validate/` |
| SplitText | `@wix/splittext`         | `packages/splittext/`         |

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

```
@wix/splittext            ← standalone text splitting utility (no @wix/motion dependency)
```

`@wix/splittext/interact` has a **type-only** dependency on `@wix/interact` (declared as an optional peer; imported with `import type` and externalized at build, so the runtime bundle stays free of interact). `@wix/interact` never imports `@wix/splittext`, so there is no build cycle.

### Motion (`@wix/motion`)

Core animation toolkit. Provides low-level APIs for running animations via the Web Animations API and CSS, including scroll-driven (ViewTimeline) and pointer-based animations. Uses `fastdom` to batch DOM reads/writes and reduce layout thrashing.

### Interact (`@wix/interact`)

Declarative, configuration-driven interaction library built on top of `@wix/motion`. Lets you wire animations to triggers via JSON config. Ships three entry points: vanilla JS (`@wix/interact`), React (`@wix/interact/react`), and Custom Elements (`@wix/interact/web`).

### Presets (`@wix/motion-presets`)

Ready-made animation presets for `@wix/motion`, organized in five categories: entrance, ongoing, scroll, mouse, and background-scroll. Each preset is a separate module under `library/`. Consumed via `registerEffects()`.

### Validate (`@wix/interact-validate`)

Static, zod-powered validator for `@wix/interact`'s `InteractConfig` (schema, referential, and semantic checks). Runs with no DOM/runtime — suitable for CI, build steps, and LLM-output validation. Depends on `@wix/interact` only for its config **types** (peer dependency); the schemas are kept in sync via a compile-time drift guard. Agent rules live at `packages/interact/rules/validate.md`.

### SplitText (`@wix/splittext`)

Lightweight, accessible text splitting utility. Splits element text into animatable `<span>` wrappers at the character, word, line, or sentence level. Uses `Intl.Segmenter` for locale-aware segmentation and the Range API for accurate line detection. Ships three entry points: vanilla JS (`@wix/splittext`), React (`@wix/splittext/react`), and an Interact resolver (`@wix/splittext/interact`) registered via `Interact.use('splitText', splitTextResolver)`. Pairs naturally with `@wix/motion` for staggered entrance animations.

## CLI Commands

Always run `nvm use` before executing any CLI commands to ensure the correct Node.js version is active.

```bash
nvm use
# then run your command, e.g.:
yarn build
```
