# CLAUDE.md - Interact Repository

## Project Overview

**Interact** (`@wix/interact`) is a declarative web animation library by Wix's wow!Team. It powers scroll-driven, hover, pointer-tracking, click, and entrance animations using the Web Animations API.

- **Repo**: https://github.com/wix-incubator/interact
- **License**: MIT
- **Team**: wow!Team (wow-dev@wix.com)
- **Current version**: 2.0.0-rc.6 (interact), 2.0.0-rc.2 (motion)

## Repository Structure

Yarn 4.10.3 workspace monorepo:

```
packages/interact/    # Core library (@wix/interact) — TypeScript, 26 source files
packages/motion/      # Animation engine (@wix/motion) — 170 source files, 82+ presets
apps/demo/            # Vite + React demo app
apps/docs/            # Vite + React documentation app
Examples-Page/        # Standalone examples showcase (vanilla JS, no build step)
assets/               # Main marketing website assets (main.mjs, styles.css)
index.html            # Marketing homepage (~58kb, uses Tailwind + interact from CDN)
```

## Quick Commands

```bash
# Development
yarn serve              # Serve entire repo on localhost:3000 (includes index.html + Examples-Page)
yarn serve:public       # Serve on 0.0.0.0:3000
yarn dev:demo           # Start demo app dev server
yarn dev:docs           # Start docs app dev server

# Build & Quality
yarn build              # Build all packages (topological) then all apps
yarn lint               # ESLint with --max-warnings=0 (zero tolerance)
yarn test               # Run tests across all packages (Vitest)
yarn format             # Prettier write
yarn format:check       # Prettier check
```

## Code Style

- **Prettier**: 100 char width, single quotes, trailing commas, semicolons, arrow parens always
- **ESLint**: Strict (0 warnings allowed), TypeScript + React + a11y plugins
- **TypeScript**: Strict mode, ES2022 target, no unused locals/params
- **Node**: >=18 (pinned 22.14.0 via .nvmrc)

## Architecture: Core Library

### Trigger Types (9)
`viewEnter` | `viewProgress` | `click` | `hover` | `pointerMove` | `animationEnd` | `pageVisible` | `activate` | `interest`

### API Patterns
- **Vanilla JS**: `Interact.create(config)` + `add(element, key)` / `remove(key)`
- **Web Components**: `<interact-element data-interact-key="id">`
- **React**: `<Interaction interactKey="id">`

### Key Source Paths
- `packages/interact/src/core/Interact.ts` — Main class
- `packages/interact/src/handlers/` — Trigger handler implementations
- `packages/interact/src/web/` — Web Components API
- `packages/interact/src/react/` — React integration
- `packages/interact/rules/` — AI rule files for integration patterns

## Architecture: Marketing Website

`index.html` at repo root is the main marketing homepage:
- Uses `@wix/interact@2.0.0-rc.6` from esm.sh CDN
- `assets/main.mjs` — Hero grid with pointer-tracking animation (~55kb)
- `assets/styles.css` — All styles including hero grid, card spread, tunnel, pyramid, sponge sections
- Branch `homepage-fix-mobile` — Active work on mobile fixes

## Architecture: Examples-Page

Standalone vanilla JS showcase at `Examples-Page/` (see `Examples-Page/CLAUDE.md` for the full guide on adding examples):
- `index.html` — Entry point with sidebar nav, content grid, modal viewer
- `js/config.js` — All example metadata (categories, paths, autoScroll flag)
- `js/app.js` — Orchestrates initialization
- `js/renderer.js` — DOM generation for cards, sections, sidebar; iframe lazy-loading and auto-scroll
- `js/sidebar.js` — Navigation and scroll sync
- `js/modal.js` — Full-screen preview modal with CodeMirror code editor + custom find bar
- `css/styles.css` — Full styling (dark theme, CSS variables)
- `examples/` — Live HTML demos (basic, carousel, layout, ui-elements)

### Examples-Page Categories
- **Basic** (compact 5-col grid): Hover, Click, View Enter, Pointer Move, Scroll
- **Carousel**: Card Spread, Infinite Gallery
- **Layout**: Column Shutters, Parting List
- **UI Items**: Dropdowns, Toggles, Inputs, Labels, Navigation, Radio buttons

### Examples-Page Tech Notes
- No build step, no Node deps — pure static files served directly
- Each example is a self-contained HTML file that imports `@wix/interact` from esm.sh
- Cards show **live iframes** of the actual examples (not videos) — interactive at native 60fps
- Iframes render at a fixed desktop viewport (800×500 or 500×500) and CSS-scale to fit cards, so examples don't trip their own mobile breakpoints inside small thumbnails
- Double-click a card to open the modal; press Cmd+F in code view for a custom find bar with match navigation

## Git Conventions

- **Main branch**: `master`
- **Commit style**: Conventional commits (feat, fix, chore, etc.)
- **PR target**: `master`

## Browser Support

Modern browsers only (no IE11). Uses:
- Web Animations API
- ViewTimeline API (with fizban polyfill)
- CSS Custom Properties
- Web Components / Custom Elements
- adoptedStyleSheets (Chrome 73+, Firefox 101+, Safari 16.4+)

## Testing

- **Framework**: Vitest 4.0.14 with jsdom environment
- **Libraries**: @testing-library/dom, @testing-library/react
- **Coverage**: @vitest/coverage-v8
- **Test location**: `packages/*/test/*.spec.ts(x)`
