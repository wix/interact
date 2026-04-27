# CLAUDE.md — Examples-Page

## What this is

A standalone, static gallery page that showcases interactive animation examples built with `@wix/interact`. No build step — it's served as-is from the repo root via `yarn serve`.

Live at: `http://localhost:3000/Examples-Page/`

## Tech stack

- Vanilla JS ES modules (no framework, no bundler, no Node deps)
- `@wix/interact` from `esm.sh` CDN (each example imports its own version)
- CodeMirror 5 for the live code editor in the modal

## How a new example appears on the page

Each example is:
1. A **standalone HTML file** in `examples/<category>/`
2. A **config entry** in `js/config.js`

That's it. The renderer reads the config and creates a live `<iframe>` thumbnail for each example automatically. No other files need touching.

The thumbnail is the example's actual HTML running live at 60fps — pointer-tracking and hover examples are interactive in the thumbnail (move your mouse over them). Double-click a card to open the full-size modal with a CodeMirror code editor.

## Adding a new example — step by step

### 1. Place the HTML file

Put the designer's HTML file in the right category folder:

```
examples/
  basic/          ← hover, click, viewEnter, scroll, pointer interactions
  carousel/       ← scrolling gallery layouts
  layout/         ← grid and list animations
  ui-elements/    ← buttons, inputs, toggles, nav, dropdowns
```

Example: `examples/ui-elements/my-new-toggle.html`

### 2. Add it to the config

Open `js/config.js` and add an entry to the correct category's `examples` array:

```js
{
  id: 'my-new-toggle',                       // unique, kebab-case
  title: 'My New Toggle',                    // display name shown under the card
  htmlPath: 'examples/ui-elements/my-new-toggle.html',
}
```

For scroll-driven examples (animations that play as the page is scrolled), add `autoScroll: true`:

```js
{
  id: 'my-scroll-thing',
  title: 'My Scroll Thing',
  htmlPath: 'examples/basic/my-scroll-thing.html',
  autoScroll: true,                          // auto-scrolls the iframe to demo the effect
}
```

### 3. Done

Refresh the page. The example will appear as a live interactive iframe in the grid.

---

## Config reference

### Category fields

```js
{
  id: 'ui-elements',           // used as the section anchor ID
  title: 'UI Items',           // displayed as the section heading
  description: '...',          // subtitle below heading
  docsLink: '#',               // link for the [docs/...] tag (use '#' if not ready)
  docsLabel: 'docs/hover',     // text for the docs tag
  compact: true,               // optional — 5-column square grid instead of 2-column 16:10
  examples: [ ... ],
}
```

### Example fields

```js
{
  id: 'my-example',            // REQUIRED — unique string, kebab-case
  title: 'My Example',         // REQUIRED — display name
  htmlPath: 'examples/...',    // REQUIRED — relative path from Examples-Page root
  autoScroll: true,            // optional — true for scroll-driven examples
}
```

---

## Grid layouts

| Category setting | Columns | Card aspect ratio | Iframe base size |
|-----------------|---------|------------------|-----------------|
| default | 2 | 16:10 | 800×500 |
| `compact: true` | 5 | 1:1 square | 500×500 |

Iframes render at the base size and are CSS-scaled to fit the card. This means the example sees a real desktop viewport (avoiding mobile breakpoints) even when the card is small. On phones (`max-width: 768px`), this scaling is disabled so examples show their natural mobile layouts.

---

## HTML file requirements for examples

The designer's HTML file should be a complete, self-contained page:

- Loads `@wix/interact` from `esm.sh` CDN (see existing examples for the exact import)
- Dark examples use `background: #000`, light variants use `background: #e0e0e0` or white
- Should work at 800×500 viewport (or 500×500 for the Basic category)
- For UI element examples, position the component near the top: `align-items: flex-start; padding: 80px 24px 24px;` — this matches the Navigation examples and looks better at thumbnail size than centering

See any existing file in `examples/ui-elements/` for a working reference.

---

## Existing categories and examples

| Category | Examples |
|----------|---------|
| **Basic** (compact, 5-col) | Hover, Click, View Enter, Pointer Move, Scroll |
| **Carousel** | Card Spread, Infinite Gallery |
| **Layout** | Column Shutters, Parting List |
| **UI Items** | Dropdown, Dropdown (Light), Labels, Lock Toggle, On/Off Toggle, Password Input, Radio Buttons, Search Input, Search Input (Light), Navigation, Navigation (Light) |

---

## Key files

| File | Purpose |
|------|---------|
| `js/config.js` | **The only file you usually need to edit** to add an example |
| `js/renderer.js` | Creates iframe cards, lazy-loading, auto-scroll, scale observer |
| `js/modal.js` | Full-screen preview + CodeMirror code editor + custom find bar |
| `js/sidebar.js` | Category nav with scroll sync |
| `js/app.js` | Boots the page (renders sections, init modal, footer reveal) |
| `css/styles.css` | All styles (dark theme, CSS variables) |
| `index.html` | Entry point — loads shared nav, footer, Tailwind, CodeMirror |
