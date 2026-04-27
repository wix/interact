# Agent Guidelines

## Repository Overview

A monorepo for Wix's web animation and interaction libraries, built on the native Web Animations API.

### Project Map

| Project  | Package               | Directory                  |
| -------- | --------------------- | -------------------------- |
| Motion   | `@wix/motion`         | `packages/motion/`         |
| Interact | `@wix/interact`       | `packages/interact/`       |
| Presets  | `@wix/motion-presets` | `packages/motion-presets/` |

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

### Motion (`@wix/motion`)

Core animation toolkit. Provides low-level APIs for running animations via the Web Animations API and CSS, including scroll-driven (ViewTimeline) and pointer-based animations. Uses `fastdom` to batch DOM reads/writes and reduce layout thrashing.

### Interact (`@wix/interact`)

Declarative, configuration-driven interaction library built on top of `@wix/motion`. Lets you wire animations to triggers via JSON config. Ships three entry points: vanilla JS (`@wix/interact`), React (`@wix/interact/react`), and Custom Elements (`@wix/interact/web`).

### Presets (`@wix/motion-presets`)

Ready-made animation presets for `@wix/motion`, organized in five categories: entrance, ongoing, scroll, mouse, and background-scroll. Each preset is a separate module under `library/`. Consumed via `registerEffects()`.

## CLI Commands

Always run `nvm use` before executing any CLI commands to ensure the correct Node.js version is active.

```bash
nvm use
# then run your command, e.g.:
yarn build
```
