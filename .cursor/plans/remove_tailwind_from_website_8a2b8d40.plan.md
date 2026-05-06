---
name: Remove Tailwind from website
overview: Remove the Tailwind CDN dependency from the website app, replacing all Tailwind utility classes with custom CSS organized into modular stylesheets under `assets/css/`, with shared theme variables on `:root` and reusable utility classes.
todos:
  - id: create-variables
    content: Create `assets/css/variables.css` with consolidated `:root` theme tokens from both pages and the Tailwind config
    status: pending
  - id: create-reset
    content: Create `assets/css/reset.css` with minimal reset rules
    status: pending
  - id: create-utilities
    content: Create `assets/css/utilities.css` with reusable utility classes (layout, spacing, typography, color, effects) including responsive variants
    status: pending
  - id: create-nav-css
    content: Create `assets/css/nav.css` and refactor `nav.js` to use semantic class names
    status: pending
  - id: create-footer-css
    content: Create `assets/css/footer.css` and refactor `footer.js` to use semantic class names
    status: pending
  - id: create-landing-css
    content: Create `assets/css/landing.css` by migrating `assets/styles.css` and adding new rules for Tailwind classes replaced in `index.html`
    status: pending
  - id: convert-index
    content: "Convert `index.html`: remove Tailwind scripts, add new CSS links, replace all Tailwind class attributes with utility/semantic classes"
    status: pending
  - id: convert-examples
    content: "Convert `examples.html`: remove Tailwind scripts, add new CSS links, verify existing styles still work"
    status: pending
  - id: refactor-examples-css
    content: Refactor `assets/css/styles.css` into `assets/css/examples.css`, importing shared variables
    status: pending
  - id: fix-gallery-example
    content: Remove Tailwind from `mouse-track-gallery.html`
    status: pending
  - id: cleanup
    content: Delete `tailwind-config.js`, remove old `assets/styles.css` (replaced by landing.css), update any references
    status: pending
  - id: validate
    content: Serve locally and verify both pages render correctly without Tailwind
    status: pending
isProject: false
---

# Remove Tailwind from Website App

## Current State

Tailwind is loaded via CDN (`https://cdn.tailwindcss.com`) + a config script (`/assets/shared/tailwind-config.js`) in two pages:
- [apps/website/index.html](apps/website/index.html) -- heavy Tailwind usage (~200+ utility class instances)
- [apps/website/examples.html](apps/website/examples.html) -- minimal direct usage; relies on Tailwind via injected nav/footer

Additionally, two shared JS files inject HTML with Tailwind classes:
- [apps/website/assets/shared/nav.js](apps/website/assets/shared/nav.js)
- [apps/website/assets/shared/footer.js](apps/website/assets/shared/footer.js)

One example file loads Tailwind (`mouse-track-gallery.html`) but only uses `cursor-pointer`.

Existing CSS files:
- [apps/website/assets/styles.css](apps/website/assets/styles.css) -- landing page component styles (hero grid, tunnel, pyramid, cards, modal, sponge)
- [apps/website/assets/css/styles.css](apps/website/assets/css/styles.css) -- examples page layout/sidebar/gallery styles (already has `:root` variables)

## Proposed CSS Architecture

Create a modular stylesheet system under `apps/website/assets/css/`:

```
assets/css/
  variables.css      -- :root theme tokens (colors, fonts, spacing, radii, shadows, breakpoints)
  reset.css          -- minimal reset (box-sizing, margin, interact-element)
  utilities.css      -- reusable utility classes (layout, spacing, typography, visibility, effects)
  nav.css            -- navigation bar styles
  footer.css         -- footer styles
  landing.css        -- landing page section/component styles (replaces assets/styles.css)
  examples.css       -- examples page layout styles (rename/refactor of current assets/css/styles.css)
```

Both pages will link to `variables.css`, `reset.css`, `utilities.css`, `nav.css`, `footer.css`, plus their page-specific sheet.

## Consolidated Theme Variables (`:root`)

Merge tokens from both existing CSS files and the Tailwind config into a single source of truth:

```css
:root {
  /* Colors */
  --color-off-black: hsl(0 0% 7%);
  --color-white: hsl(0 0% 100%);
  --color-gray-50: hsl(210 20% 98%);
  --color-gray-100: hsl(220 14% 96%);
  --color-gray-200: hsl(220 13% 91%);
  --color-gray-300: hsl(216 12% 84%);
  --color-gray-400: hsl(218 11% 65%);
  --color-gray-500: hsl(220 9% 46%);
  --color-gray-600: hsl(215 14% 34%);
  --color-gray-800: hsl(217 19% 17%);
  --color-apple-gray: hsl(240 2% 54%);
  --color-accent-gold: hsl(41 100% 75%);
  --color-accent-purple: hsl(277 22% 64%);
  --color-accent-blue: hsl(221 100% 75%);
  --color-accent-green: hsl(84 67% 73%);

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-helvetica: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --fs-xs: 0.75rem;
  --fs-sm: 0.875rem;
  --fs-base: 1rem;
  --fs-lg: 1.125rem;
  --fs-xl: 1.25rem;
  --fs-2xl: 1.5rem;
  --fs-3xl: 1.875rem;
  --fs-4xl: 2.25rem;
  --fs-5xl: 3rem;
  --fs-6xl: 3.75rem;
  --fs-8xl: 6rem;
  --fs-giant: 6rem;
  --fs-mega: 11rem;

  /* Spacing scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;
  --space-32: 8rem;

  /* Radii */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius-full: 9999px;

  /* Transitions */
  --transition-colors: color 200ms, background-color 200ms, border-color 200ms;
  --transition-opacity: opacity 200ms;
  --transition-transform: transform 200ms;
  --transition-all: all 200ms;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Letter spacing */
  --tracking-tighter: -0.04em;
  --tracking-tight: -0.025em;
  --tracking-wide: 0.025em;
  --tracking-widest: 0.1em;
}
```

## Utility Classes (`utilities.css`)

Instead of mirroring Tailwind's one-property-per-class approach, group frequently co-occurring properties into compound utility classes. This keeps the HTML readable and reduces class-list noise.

### Compound layout utilities

```css
.stack          { display: flex; flex-direction: column; }
.row            { display: flex; flex-direction: row; }
.center         { display: flex; align-items: center; justify-content: center; }
.center-col     { display: flex; flex-direction: column; align-items: center; justify-content: center; }
.between        { display: flex; align-items: center; justify-content: space-between; }
.cover          { position: absolute; inset: 0; width: 100%; height: 100%; }
.full           { width: 100%; height: 100%; }
```

### Compound typography utilities

```css
.heading-display {
  font-weight: 300;
  letter-spacing: var(--tracking-tighter);
  line-height: 0.85;
  color: var(--color-white);
}
.heading-section {
  font-weight: 300;
  letter-spacing: var(--tracking-tighter);
  line-height: 1.2;
  text-align: center;
}
.body-secondary {
  font-weight: 300;
  letter-spacing: var(--tracking-tight);
  line-height: 1.4;
  color: var(--color-gray-400);
}
.label {
  font-size: var(--fs-sm);
  font-weight: 500;
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}
.code-text {
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  line-height: 1.6;
  white-space: pre;
}
```

### Compound interactive/effect utilities

```css
.pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-8);
  border-radius: var(--radius-full);
  font-size: var(--fs-sm);
  font-weight: 500;
  transition: var(--transition-colors);
}
.overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.centered-abs {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
}
.no-interact    { pointer-events: none; }
.clickable      { cursor: pointer; }
```

### Minimal single-purpose utilities (kept only where compounds don't apply)

```css
.relative       { position: relative; }
.sticky         { position: sticky; }
.hidden         { display: none; }
.inline-block   { display: inline-block; }
.block          { display: block; }
.text-center    { text-align: center; }
.mx-auto        { margin-inline: auto; }
.overflow-clip  { overflow: clip; }
.overflow-hidden{ overflow: hidden; }
.w-full         { width: 100%; }
.h-full         { height: 100%; }
```

### Responsive modifiers

Rather than `.md\:` prefixes for every property, define responsive compound shifts:

```css
@media (min-width: 768px) {
  .md\:row      { flex-direction: row; }
  .md\:hidden   { display: none; }
  .md\:block    { display: block; }
  .md\:center   { display: flex; align-items: center; justify-content: center; }
}
@media (min-width: 1024px) {
  .lg\:row       { flex-direction: row; }
  .lg\:row-rev   { flex-direction: row-reverse; }
  .lg\:text-left { text-align: left; }
  .lg\:hidden    { display: none; }
  .lg\:block     { display: block; }
}
```

### Design rationale

- **Compounds reduce class count by ~60%**: e.g. `class="center full"` replaces `class="flex items-center justify-center w-full h-full"`.
- **Typography compounds** map to the 4-5 text styles actually used across the site (display heading, section heading, body paragraph, label, code) rather than mixing font-weight + tracking + leading on every element.
- **`.pill`** captures the CTA button pattern used 6+ times (rounded-full + padding + font-size + gap + transition).
- **One-off values** (arbitrary heights, z-indices, custom gaps) remain in page-specific component classes in `landing.css` / `examples.css`, not in utilities.

## Conversion Strategy for `nav.js` and `footer.js`

Replace inline Tailwind classes with semantic class names:
- Nav: `.site-nav`, `.nav-link`, `.nav-logo`, `.nav-cta`
- Footer: `.site-footer`, `.footer-brand`, `.footer-links`, `.footer-link`

Style these in `nav.css` and `footer.css` using the theme variables.

## Conversion Strategy for `index.html`

Replace Tailwind classes on elements with either:
1. A utility class from `utilities.css` (when the pattern is generic and reused)
2. A semantic component class in `landing.css` (for page-specific styling like `.hero-section`, `.perf-section`, `.interaction-grid`, `.interaction-card`, `.code-panel`, `.tailored-section`, `.horizontal-section`, `.h-card-overlay`, `.pinned-tag`, `.section-title`, `.section-subtitle`, `.cta-btn`, `.cta-btn--outline`)

## Conversion for `mouse-track-gallery.html`

Remove the Tailwind CDN script and replace `cursor-pointer` with either the utility class or a direct `cursor: pointer` rule in its local `<style>`.

## Files to Delete

- [apps/website/assets/shared/tailwind-config.js](apps/website/assets/shared/tailwind-config.js) -- no longer needed

## Files to Modify

- `index.html` -- remove Tailwind scripts, add new CSS links, replace all class attributes
- `examples.html` -- remove Tailwind scripts, add new CSS links
- `nav.js` -- replace Tailwind classes with semantic classes
- `footer.js` -- replace Tailwind classes with semantic classes
- `assets/examples/carousel/mouse-track-gallery.html` -- remove Tailwind CDN script
- Rename/restructure existing `assets/styles.css` content into `landing.css`
- Rename/restructure existing `assets/css/styles.css` content into `examples.css`

## Files to Create

- `assets/css/variables.css`
- `assets/css/reset.css`
- `assets/css/utilities.css`
- `assets/css/nav.css`
- `assets/css/footer.css`
- `assets/css/landing.css` (absorbs current `assets/styles.css`)

## Validation

After conversion, serve locally with `npx http-server . -p 3000` from the website directory and visually verify both pages render identically to their current state.