# AGENTS.md — Website App (`apps/website`)

## What this is

The public-facing website for `@wix/interact`, served as a static site (no client bundler). Contains two HTML entry points:

- **Landing page** (`index.html`) — hero, performance demos, interaction showcases, and showcase gallery
- **Examples page** (`examples.html`) — live interactive gallery of animation examples built with `@wix/interact`

Deployed to GitHub Pages via the `interactdocs.yml` workflow (landing + examples + shared assets, alongside docs, playground, and rules).

## Local development

```bash
# From the repo root — same as CI: document root is apps/website/
nvm use
yarn http-server                  # npx http-server apps/website -p 3000 → http://localhost:3000

# Or: workspace dev server (runs from apps/website; same port by default)
yarn dev:website           # → http://localhost:3000
```

The landing page is at `/`, the examples page at `/examples.html`.

## Tech stack

- Vanilla HTML/JS/CSS (no framework, no Vite/webpack for the site)
- Yarn workspace package **`@wix/interact-website`** (`package.json` here) — `dev` / `build` / format scripts only; site files stay static
- Tailwind CSS via CDN with shared config (`/assets/shared/tailwind-config.js`)
- **`@wix/interact`**, **`@wix/motion`**, and presets loaded from **`assets/lib/`** — built copies produced by `scripts/build-landing.sh` (import map on the landing page; examples page + example iframes import `/assets/lib/...` URLs)
- CodeMirror 5 for the live code editor in the examples modal
- highlight.js for code snippets on the landing page

## Directory structure

```
apps/website/
  index.html                  Landing page
  examples.html               Examples gallery page
  package.json                Workspace @wix/interact-website (dev/build/lint scripts)
  AGENTS.md                   Agent notes (this file)
  CLAUDE.md                   Symlink to AGENTS.md (for Claude / tooling)
  assets/
    shared/                   Cross-page scripts and Tailwind config (served as /assets/shared/…)
      nav.js
      footer.js
      tailwind-config.js
    lib/                      Generated — interact, motion, motion-presets ESM (gitignored except .gitkeep)
      .gitkeep
    main.mjs                  Landing page animation configs and JS
    styles.css                Landing page stylesheet
    modal.js                  Landing page source-code modal controller
    snippets.js               Landing page code snippet content
    css/
      styles.css              Examples page styles (dark theme, CSS vars)
    js/
      app.js                  Examples page bootstrap
      config.js               Example registry — the main file to edit when adding examples
      renderer.js             Iframe cards, lazy-loading, auto-scroll
      modal.js                Full-screen preview + CodeMirror editor
      sidebar.js              Category nav with scroll sync
    examples/
      basic/                  Hover, click, viewEnter, scroll, pointer interactions
      carousel/               Scrolling gallery layouts
      layout/                 Grid and list animations
      ui-elements/            Buttons, inputs, toggles, nav, dropdowns
    img/                      Images referenced by example HTML
```

## Build pipeline

The website imports packages from `assets/lib/` (e.g. `/assets/lib/interact/es/web.js`, `/assets/lib/motion/motion.js`). Those files are **not** authored by hand: run **`./scripts/build-landing.sh`** from the repo root (or **`yarn workspace @wix/interact-website run build`**), which builds all packages and copies dist output into `apps/website/assets/lib/`. This runs in CI before deployment.

For local work, run the build script once so `assets/lib/` is populated; otherwise module imports in the landing page, `examples.html`, and example iframes will 404.

## Deployment (GitHub Pages)

The `interactdocs.yml` workflow:

1. Builds packages via `./scripts/build-landing.sh`
2. Builds the docs app (`apps/docs`)
3. Builds the playground app (`apps/playground`)
4. Assembles `_site/`:
   - `/` — `index.html` and `examples.html`
   - `/assets/` — all website assets under `apps/website/assets/` (including `shared/`, `lib/`, examples, etc.)
   - `/docs/` — docs app
   - `/playground/` — playground app
   - `/rules/` — interact rules markdown
5. Deploys to GitHub Pages

## Adding a new example

### 1. Create the HTML file

Place a self-contained HTML file in the appropriate category folder:

```
assets/examples/
  basic/          Hover, click, viewEnter, scroll, pointer interactions
  carousel/       Scrolling gallery layouts
  layout/         Grid and list animations
  ui-elements/    Buttons, inputs, toggles, nav, dropdowns
```

Use the same module pattern as existing demos: import from **`/assets/lib/interact/es/web.js`** (and **`/assets/lib/motion-presets/motion-presets.js`** if you need presets). If the example imports the **`@wix/motion`** bare specifier, add a matching **`<script type="importmap">`** in that file (see `assets/examples/basic/pointer-move.html`). Ensure **`build-landing.sh`** has been run so `assets/lib/` exists locally.

### 2. Register it in config

Open `assets/js/config.js` and add an entry to the correct category's `examples` array:

```js
{
  id: 'my-new-example',
  title: 'My New Example',
  htmlPath: 'assets/examples/<category>/my-new-example.html',
}
```

For scroll-driven examples, add `autoScroll: true`.

### 3. Done

Refresh the page. The example appears as a live interactive iframe in the grid.

## Key files

| File                      | Purpose                                                         |
| ------------------------- | --------------------------------------------------------------- |
| `assets/js/config.js`     | **Primary file to edit** when adding an example                  |
| `assets/js/renderer.js`   | iframe cards, lazy-loading, auto-scroll, scale observer         |
| `assets/js/modal.js`      | Full-screen preview + CodeMirror + custom find bar (examples)    |
| `assets/js/sidebar.js`    | Category nav with scroll sync                                   |
| `assets/js/app.js`        | Examples page entry (module)                                    |
| `examples.html`           | Examples shell, import map for `@wix/motion`, entrance Interact   |
| `assets/main.mjs`         | Landing page animation config and interactive demos              |
| `assets/shared/nav.js`    | Shared navigation (injected into `#shared-nav`)                 |
| `assets/shared/footer.js` | Shared footer (injected into `#shared-footer`)                  |
| `scripts/build-landing.sh` (repo root) | Populates `assets/lib/` from package builds              |

## Grid layouts (examples page)

| Category setting | Columns | Card aspect ratio | Iframe base size |
| ---------------- | ------- | ----------------- | ---------------- |
| default          | 2       | 16:10             | 800x500          |
| `compact: true`  | 5       | 1:1 square        | 500x500          |
