# Playground App Plan

## Context

The monorepo currently has `demo` and `docs` apps but lacks a dedicated visual editor for authoring `InteractConfig` objects. The playground app provides a library of pre-made HTML/CSS website components (card, grid, carousel, etc.) that users can select and then wire up interactions/effects through a GUI, producing a valid `InteractConfig` JSON. This is useful for prototyping animations, exploring the Interact API, and generating config snippets.

---

## Todo List

### Phase 1: Scaffolding & Infra — DONE
- [x] package.json, tsconfig.json, vite.config.ts, index.html
- [x] CSS architecture: layers.css, base.css, theme.css, layout.css, controls.css, utilities.css, states.css
- [x] Store: PlaygroundStore, reducer, actions, types
- [x] BaseComponent (abstract, shadow DOM, store subscription, adoptedStyleSheets)
- [x] pg-app (grid layout shell)
- [x] pg-toolbar (title, JSON toggle, clear button)
- [x] pg-sidebar (interactions header, slot)
- [x] pg-stage (renders components, scroll mode, sticky positioning)
- [x] pg-inspector (selection-based shell)
- [x] pg-json-panel (textarea with parse-on-blur)
- [x] Utils: id.ts, dom.ts
- [x] main.ts (CSS imports, component registration, DOM mount)
- [x] vite-env.d.ts (CSS inline module declarations)

### Phase 2: Component Library — DONE
- [x] library/types.ts (ComponentDefinition interface)
- [x] library/index.ts (registry of all 8 components)
- [x] card (template + CSS, keys: card, card-image, card-title, card-cta)
- [x] card-list (template + CSS, keys: card-list, card-list-item)
- [x] card-grid (template + CSS, keys: card-grid, card-grid-item)
- [x] hero-section (template + CSS, keys: hero, hero-image, hero-title, hero-text)
- [x] figure (template + CSS, keys: figure, figure-image, figure-caption)
- [x] header (template + CSS, keys: header, header-title, header-subtitle)
- [x] nav-menu (template + CSS, keys: nav-menu, nav-menu-item)
- [x] carousel (template + CSS, keys: carousel, carousel-slide, carousel-title)
- [x] pg-component-selector (dropdown populated from registry)
- [x] pg-stage wired to render selected component with CSS isolation

### Phase 3: Interact Integration & Interaction Editing — DONE
- [x] src/interact/InteractManager.ts (Interact.create/destroy lifecycle, debounced, store-subscribed)
- [x] src/interact/preset-registry.ts (flat catalog from @wix/motion-presets)
- [x] pg-interaction-editor.ts (trigger type dropdown, source element key selector from active component)
- [x] pg-trigger-editor.ts (dynamic param forms per trigger type)
- [x] Scroll stage behavior (stage height expansion for viewProgress, sticky controls)
- [x] pg-interaction-list.ts (sidebar list with add/delete, trigger badge + key)
- [x] src/components/shared/pg-select.ts (reusable dropdown control)
- [x] src/components/shared/pg-number-input.ts (number input with optional range)
- [x] src/components/shared/pg-text-input.ts (text input)
- [x] src/components/shared/pg-toggle.ts (boolean toggle)

### Phase 4: Effect Editors & Live Preview — DONE
- [x] pg-effect-editor.ts (target element key selector, tabs: TimeEffect | ScrubEffect | TransitionEffect)
- [x] pg-time-effect-editor.ts (duration, easing, iterations, alternate, fill, reversed, delay)
- [x] pg-scrub-effect-editor.ts (range offsets, transition params)
- [x] pg-transition-effect-editor.ts (CSS property list editor)
- [x] pg-named-effect-picker.ts (preset browser by category with comprehensive per-preset param controls)
- [x] pg-easing-picker.ts (initial: preset dropdown outputting cubic-bezier string)

### Phase 5: Conditions, Sequences & Advanced
- [ ] pg-condition-editor.ts (media/container/selector conditions)
- [ ] pg-sequence-editor.ts (effect list, delay, offset, offsetEasing)

### Phase 6: Easing Picker SVG Editor
- [ ] src/utils/bezier.ts (parse, format, preset lookup, curve sampling)
- [ ] Upgrade pg-easing-picker.ts (SVG bezier editor, draggable handles, bidirectional sync)

### Phase 7: Polish & UX
- [ ] Import/Export (file download + file picker)
- [ ] Keyboard shortcuts (Delete, Ctrl+Z undo)
- [ ] Visual polish (transitions, panel resize handles)
- [ ] Component preview thumbnails in selector

---

## Architecture Overview

- **Location**: `apps/playground/`
- **Package**: `@wix/interact-playground`
- **Stack**: Plain HTML/CSS/JS with TypeScript, Vite, native Web Components
- **Integration**: `@wix/interact/web` custom elements + `@wix/motion-presets`
- **Pattern**: Central store (reducer + EventTarget) drives all UI; `InteractConfig` is the source of truth

### Core Concept

Users pick a pre-made component from a dropdown in the toolbar. The stage renders that component wrapped in `<interact-element>`. The inspector panel lets users add interactions and effects to it. Switching components replaces the stage content entirely and resets the config.

### Component Tree

```
<pg-app>                              Root layout shell (grid: toolbar | sidebar | stage | inspector)
  <pg-toolbar>                        Top bar: component selector, import/export JSON, clear
    <pg-component-selector>           Dropdown to pick a pre-made component
  <pg-sidebar>                        Left panel
    <pg-interaction-list>             Interactions for active component
  <pg-stage>                          Center: renders selected component with interact-element wrappers
  <pg-inspector>                      Right panel (context-sensitive)
    <pg-interaction-editor>           Source element + Trigger type + params
    <pg-effect-editor>                Target element + Effect type + properties
    <pg-sequence-editor>              Sequence orchestration
    <pg-condition-editor>             Media/container/selector conditions
  <pg-json-panel>                     Bottom drawer: live JSON view/edit
```

### Pre-made Component Library

Each component is a self-contained module exporting HTML template, CSS, and metadata (name, description, available `data-interact-key` targets). Components:

| Component | Description | Interact Keys |
|-----------|-------------|---------------|
| `card` | Image, title, text, CTA button | `card`, `card-image`, `card-title`, `card-cta` |
| `card-list` | Vertical list of cards | `card-list`, `card-list-item` (list) |
| `card-grid` | 2-3 column grid of cards | `card-grid`, `card-grid-item` (list) |
| `hero-section` | Full-width section with image, title, text | `hero`, `hero-image`, `hero-title`, `hero-text` |
| `figure` | Image with caption | `figure`, `figure-image`, `figure-caption` |
| `header` | Heading text with subtitle | `header`, `header-title`, `header-subtitle` |
| `nav-menu` | Horizontal list of text anchors | `nav-menu`, `nav-menu-item` (list) |
| `carousel` | Horizontal image carousel with title overlay | `carousel`, `carousel-slide` (list), `carousel-title` |

Each key is a valid `data-interact-key` that can be used as `interaction.key` or `effect.key` in the config.

### `<interact-element>` Wrapping Rules

Per `@wix/interact/web` integration rules, each keyed element must be wrapped with `<interact-element data-interact-key="...">` containing the actual element as its first child. Key distinctions:

- **Unique keys** (e.g., `card`, `card-image`, `hero-title`) — wrap with `<interact-element data-interact-key="...">`; the visual element becomes the first child.
- **Repeated/list keys** (e.g., `card-list-item`, `nav-menu-item`, `carousel-slide`) — do NOT wrap individually. These are discovered via `listContainer`/`listItemSelector` on the parent interaction, not via individual custom element registration.
- **`display: contents`** is applied to `interact-element` in the stage styles to prevent layout disruption.
- **Shadow DOM reconnection**: Since the stage renders component HTML into its shadow DOM, `InteractManager` explicitly reconnects `<interact-element>` instances in the shadow root after each `Interact.create()` call (the library's default `document.querySelectorAll` reconnection doesn't reach into shadow DOM).
- **`listContainer`/`listItemSelector`** selectors use CSS class selectors (e.g., `.card-list`, `.card-list-item`) rather than `[data-interact-key="..."]` attribute selectors, since the `data-interact-key` attribute lives on the `<interact-element>` wrapper, not the inner element.
- **List item key selection**: When a user selects a list item key (e.g., `card-list-item`) in the interaction editor, the interaction's `key` is set to the **parent** key (e.g., `card-list`) with `listContainer`/`listItemSelector` on the interaction. This is because list items don't have their own `<interact-element>` — they're targeted via `listContainer` on the parent. Each list-type `ComponentKey` has a `parentKey` field that maps to the parent's interact key. The key dropdown selection state accounts for this mapping when displaying the current value.

### Source & Target Element Selection

The Interact runtime distinguishes between **source** (trigger) and **target** (animated) elements:

- **`interaction.key`** — the **source** element: the element that listens for the trigger event (hover, click, scroll, etc.). Set via the "Source Element" dropdown in `pg-interaction-editor`.
- **Inline effect ref's `key`** (`interaction.effects[i].key`) — the **target** element: the element that gets animated. Set via the "Target Element" dropdown in `pg-effect-editor`. When left empty ("Same as source"), the runtime cascades to the interaction's key, so the same element is both source and target.

**Important: target selection properties live on the inline effect ref, not the top-level effect.** The runtime's target cascade order is:
1. `interaction.effects[i].key` (inline ref — checked first)
2. `config.effects[effectId].key` (top-level effect — fallback)
3. `interaction.key` (final fallback)

Because inline refs are checked first, the playground stores target selection properties (`key`, `listContainer`, `listItemSelector`) on the inline ref in `interaction.effects[i]`, updating them via `updateInteraction()`. The top-level `config.effects[id]` objects only contain animation properties (duration, easing, namedEffect, etc.) and `conditions`. This ensures the target element setting is not accidentally overridden or lost when the top-level effect is replaced (e.g., when switching effect type tabs).

### State Management

```
PlaygroundStore (extends EventTarget)
  ├── state.config: InteractConfig           ← the serializable output
  ├── state.activeComponentId: string        ← which pre-made component is on stage
  ├── state.selectedInteractionIndex: number | null
  ├── state.selectedEffectId: string | null
  ├── state.jsonPanelOpen: boolean
  └── state.scrollPreview: {                 ← UI-only, not in InteractConfig
        enabled: boolean                       (stage is in scroll mode)
        stickyTop?: number                     (sticky top offset px)
        stickyBottom?: number                  (sticky bottom offset px)
        stageHeight: number                    (expanded stage height multiplier)
      }
```

### Live Preview

`InteractManager` wraps `Interact.create()` / `.destroy()`. On every config change (debounced ~100ms), it destroys the old instance and creates a new one. This is the canonical consumption pattern and guarantees correctness.

**Stale animation cleanup**: After `Interact.destroy()`, `InteractManager` cancels all Web Animations API animations on stage `interact-element` nodes (via `Element.getAnimations({ subtree: true })`). This is necessary because `Interact.destroy()` removes event listeners and CSS stylesheets but does not cancel in-progress or finished animations. Without this cleanup, animations with `fill: 'both'` would persist their styles on DOM elements and override subsequent CSS transitions (e.g., switching from a Time effect to a Transition effect on the same element).

---

## CSS Architecture

### Layer System

All styles are organized into CSS `@layer` declarations, ordered by specificity intent:

```css
/* src/styles/layers.css — imported first in main.ts */
@layer base, layout, theme, components, utilities, states;
```

| Layer | Purpose | Files |
|-------|---------|-------|
| `base` | CSS reset, box-sizing, typography defaults | `styles/base.css` |
| `layout` | App grid, panel sizing, responsive breakpoints | `styles/layout.css` |
| `theme` | All CSS custom properties (colors, spacing, radii, shadows, fonts) | `styles/theme.css` |
| `components` | Styles for each Web Component (via shadow DOM adoptedStyleSheets or `<style>` in shadow root) | Per-component CSS |
| `utilities` | Helper classes: `.sr-only`, `.truncate`, `.flex-center`, `.gap-*` | `styles/utilities.css` |
| `states` | Interactive states: `:hover`, `:focus-visible`, `[aria-selected]`, `.active`, `.disabled` | `styles/states.css` |

### CSS Custom Properties (Theme Layer)

**`src/styles/theme.css`** — single source of truth for all design tokens:

```css
@layer theme {
  :root {
    /* ── Colors ── */
    --pg-color-bg-primary: #0f0f11;
    --pg-color-bg-secondary: #1a1a1f;
    --pg-color-bg-tertiary: #242429;
    --pg-color-bg-surface: #2a2a30;
    --pg-color-bg-hover: #32323a;
    --pg-color-bg-active: #3a3a44;

    --pg-color-text-primary: #e8e8ec;
    --pg-color-text-secondary: #a0a0aa;
    --pg-color-text-muted: #6a6a74;
    --pg-color-text-inverse: #0f0f11;

    --pg-color-accent: #6366f1;
    --pg-color-accent-hover: #818cf8;
    --pg-color-accent-muted: #6366f133;
    --pg-color-border: #2e2e36;
    --pg-color-border-focus: #6366f1;
    --pg-color-danger: #ef4444;
    --pg-color-success: #22c55e;

    /* ── Spacing scale ── */
    --pg-space-1: 4px;
    --pg-space-2: 8px;
    --pg-space-3: 12px;
    --pg-space-4: 16px;
    --pg-space-5: 20px;
    --pg-space-6: 24px;
    --pg-space-8: 32px;
    --pg-space-10: 40px;

    /* ── Typography ── */
    --pg-font-family: 'Inter', system-ui, -apple-system, sans-serif;
    --pg-font-mono: 'JetBrains Mono', 'Fira Code', monospace;
    --pg-font-size-xs: 11px;
    --pg-font-size-sm: 12px;
    --pg-font-size-md: 13px;
    --pg-font-size-lg: 15px;
    --pg-font-size-xl: 18px;
    --pg-font-weight-normal: 400;
    --pg-font-weight-medium: 500;
    --pg-font-weight-bold: 600;
    --pg-line-height: 1.5;

    /* ── Layout ── */
    --pg-toolbar-height: 48px;
    --pg-sidebar-width: 260px;
    --pg-inspector-width: 320px;
    --pg-json-panel-height: 240px;
    --pg-panel-padding: var(--pg-space-4);

    /* ── Borders & Radii ── */
    --pg-radius-sm: 4px;
    --pg-radius-md: 6px;
    --pg-radius-lg: 8px;
    --pg-radius-xl: 12px;
    --pg-border-width: 1px;

    /* ── Shadows ── */
    --pg-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
    --pg-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
    --pg-shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);

    /* ── Transitions ── */
    --pg-transition-fast: 100ms ease;
    --pg-transition-normal: 200ms ease;
    --pg-transition-slow: 300ms ease;

    /* ── Z-index scale ── */
    --pg-z-panel: 10;
    --pg-z-dropdown: 20;
    --pg-z-tooltip: 30;
    --pg-z-modal: 40;
  }
}
```

### Layout Layer

**`src/styles/layout.css`** — app grid and panel layout:

```css
@layer layout {
  .pg-app-grid {
    display: grid;
    grid-template-columns: var(--pg-sidebar-width) 1fr var(--pg-inspector-width);
    grid-template-rows: var(--pg-toolbar-height) 1fr auto;
    grid-template-areas:
      "toolbar  toolbar   toolbar"
      "sidebar  stage     inspector"
      "json     json      json";
    height: 100vh;
    overflow: hidden;
  }
}
```

### Component Styles

Each Web Component adopts styles from the theme layer plus its own component-layer styles. Pattern:

```typescript
// In BaseComponent.ts
const themeSheet = new CSSStyleSheet();
themeSheet.replaceSync(themeCSS);   // imported from styles/theme.css

// Each component creates its own sheet
const componentSheet = new CSSStyleSheet();
componentSheet.replaceSync(componentCSS);

this.shadowRoot.adoptedStyleSheets = [themeSheet, componentSheet];
```

Component CSS uses `@layer components` and references theme variables:

```css
@layer components {
  :host {
    display: block;
    background: var(--pg-color-bg-secondary);
    border-right: var(--pg-border-width) solid var(--pg-color-border);
    padding: var(--pg-panel-padding);
    font-family: var(--pg-font-family);
    font-size: var(--pg-font-size-md);
    color: var(--pg-color-text-primary);
  }
}
```

### Shared Control Styles

**`src/styles/controls.css`** — shared styles for form controls (`pg-select`, `pg-number-input`, `pg-text-input`, `pg-toggle`):

```css
@layer components {
  /* Common input base */
  .pg-input {
    height: 28px;
    padding: 0 var(--pg-space-2);
    background: var(--pg-color-bg-tertiary);
    border: var(--pg-border-width) solid var(--pg-color-border);
    border-radius: var(--pg-radius-sm);
    color: var(--pg-color-text-primary);
    font-family: var(--pg-font-family);
    font-size: var(--pg-font-size-sm);
    transition: border-color var(--pg-transition-fast);
  }

  .pg-input:focus-visible {
    outline: none;
    border-color: var(--pg-color-border-focus);
    box-shadow: 0 0 0 2px var(--pg-color-accent-muted);
  }

  /* Label */
  .pg-label {
    display: block;
    font-size: var(--pg-font-size-xs);
    font-weight: var(--pg-font-weight-medium);
    color: var(--pg-color-text-secondary);
    margin-bottom: var(--pg-space-1);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Field group (label + input) */
  .pg-field {
    display: flex;
    flex-direction: column;
    gap: var(--pg-space-1);
  }

  /* Button */
  .pg-button {
    height: 28px;
    padding: 0 var(--pg-space-3);
    background: var(--pg-color-accent);
    border: none;
    border-radius: var(--pg-radius-sm);
    color: var(--pg-color-text-primary);
    font-size: var(--pg-font-size-sm);
    font-weight: var(--pg-font-weight-medium);
    cursor: pointer;
    transition: background var(--pg-transition-fast);
  }

  .pg-button:hover {
    background: var(--pg-color-accent-hover);
  }

  .pg-button--secondary {
    background: var(--pg-color-bg-tertiary);
    border: var(--pg-border-width) solid var(--pg-color-border);
  }
}
```

### Style File Map

```
src/styles/
  layers.css          ← @layer order declaration (imported first)
  base.css            ← reset, box-sizing, html/body defaults
  layout.css          ← app grid, panel areas
  theme.css           ← all CSS custom properties
  controls.css        ← shared form control styles
  utilities.css       ← utility classes (.sr-only, .truncate, etc.)
  states.css          ← interactive state styles (:hover, :focus, [aria-*])
```

Import order in `main.ts`:
```ts
import './styles/layers.css';
import './styles/base.css';
import './styles/theme.css';
import './styles/layout.css';
import './styles/controls.css';
import './styles/utilities.css';
import './styles/states.css';
```

---

## Easing Picker Component (`pg-easing-picker`)

A composite control for selecting/editing CSS easing curves. Consists of two parts:

### 1. Preset Dropdown

A `<pg-select>` populated from `@wix/motion`'s `cssEasings` export (`packages/motion/src/easings.ts`). Import `cssEasings` and use its keys as preset names, values as the `cubic-bezier()` strings.

**Complete preset list from `cssEasings`:**

| Preset | Value |
|--------|-------|
| linear | `linear` |
| ease | `ease` |
| easeIn | `ease-in` |
| easeOut | `ease-out` |
| easeInOut | `ease-in-out` |
| sineIn | `cubic-bezier(0.47, 0, 0.745, 0.715)` |
| sineOut | `cubic-bezier(0.39, 0.575, 0.565, 1)` |
| sineInOut | `cubic-bezier(0.445, 0.05, 0.55, 0.95)` |
| quadIn | `cubic-bezier(0.55, 0.085, 0.68, 0.53)` |
| quadOut | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| quadInOut | `cubic-bezier(0.455, 0.03, 0.515, 0.955)` |
| cubicIn | `cubic-bezier(0.55, 0.055, 0.675, 0.19)` |
| cubicOut | `cubic-bezier(0.215, 0.61, 0.355, 1)` |
| cubicInOut | `cubic-bezier(0.645, 0.045, 0.355, 1)` |
| quartIn | `cubic-bezier(0.895, 0.03, 0.685, 0.22)` |
| quartOut | `cubic-bezier(0.165, 0.84, 0.44, 1)` |
| quartInOut | `cubic-bezier(0.77, 0, 0.175, 1)` |
| quintIn | `cubic-bezier(0.755, 0.05, 0.855, 0.06)` |
| quintOut | `cubic-bezier(0.23, 1, 0.32, 1)` |
| quintInOut | `cubic-bezier(0.86, 0, 0.07, 1)` |
| expoIn | `cubic-bezier(0.95, 0.05, 0.795, 0.035)` |
| expoOut | `cubic-bezier(0.19, 1, 0.22, 1)` |
| expoInOut | `cubic-bezier(1, 0, 0, 1)` |
| circIn | `cubic-bezier(0.6, 0.04, 0.98, 0.335)` |
| circOut | `cubic-bezier(0.075, 0.82, 0.165, 1)` |
| circInOut | `cubic-bezier(0.785, 0.135, 0.15, 0.86)` |
| backIn | `cubic-bezier(0.6, -0.28, 0.735, 0.045)` |
| backOut | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` |
| backInOut | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` |
| custom | User-defined via the SVG editor below |

The presets are grouped in the dropdown by category (Standard, Sine, Quad, Cubic, Quart, Quint, Expo, Circ, Back) using `<optgroup>` labels. Selecting a preset updates the SVG visualization. Selecting "custom" enables manual drag editing.

### 2. SVG Bezier Curve Editor

An inline SVG (200x200 viewBox) that visualizes the cubic-bezier curve and provides draggable control point handles.

**SVG structure:**
```
<svg viewBox="-20 -20 240 240">
  <!-- Grid background -->
  <rect class="bg" x="0" y="0" width="200" height="200" />

  <!-- Diagonal reference line (linear) -->
  <line class="reference" x1="0" y1="200" x2="200" y2="0" />

  <!-- The bezier curve path -->
  <path class="curve" d="M 0,200 C cx1,cy1 cx2,cy2 200,0" />

  <!-- Control point lines (from endpoints to handles) -->
  <line class="handle-line" x1="0" y1="200" x2="cx1" y2="cy1" />
  <line class="handle-line" x1="200" y1="0" x2="cx2" y2="cy2" />

  <!-- Draggable control point handles -->
  <circle class="handle handle-1" cx="cx1" cy="cy1" r="6" />
  <circle class="handle handle-2" cx="cx2" cy="cy2" r="6" />
</svg>
```

**Coordinate mapping** (bezier values 0-1 to SVG viewBox):
- `x` maps to SVG `x`: `bezierX * 200`
- `y` maps to SVG `y`: `200 - (bezierY * 200)` (inverted, since SVG y goes down)
- Control points can go outside 0-1 on y-axis (for overshoot), the viewBox has -20 padding

**Drag behavior:**
- `pointerdown` on a handle → capture pointer, track `pointermove`
- Convert pointer position to SVG coordinates via `SVGSVGElement.getScreenCTM().inverse()`
- Clamp x to 0-1 range (CSS spec requirement), y unclamped (allows overshoot)
- Update the `<path>` d attribute and the handle/line positions in real-time
- On `pointerup`, emit a change event with the new `cubic-bezier(x1, y1, x2, y2)` string
- If the user drags to a position matching a named preset, auto-select that preset in the dropdown

**Output value**: A string like `cubic-bezier(0.42, 0, 0.58, 1)` or a named keyword like `ease-in-out`.

**File**: `src/components/shared/pg-easing-picker.ts` — contains the full Web Component including the SVG editor, preset dropdown, and a text input showing the raw `cubic-bezier()` value.

---

## File Structure

```
apps/playground/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  src/
    main.ts
    types.ts
    store/
      PlaygroundStore.ts
      actions.ts
      reducer.ts
    library/                              ← pre-made component library
      types.ts                            ← ComponentDefinition interface
      index.ts                            ← registry of all components
      card/
        template.ts
        card.css
      card-list/
        template.ts
        card-list.css
      card-grid/
        template.ts
        card-grid.css
      hero-section/
        template.ts
        hero-section.css
      figure/
        template.ts
        figure.css
      header/
        template.ts
        header.css
      nav-menu/
        template.ts
        nav-menu.css
      carousel/
        template.ts
        carousel.css
    components/
      base/BaseComponent.ts
      app/pg-app.ts
      toolbar/
        pg-toolbar.ts
        pg-component-selector.ts
      sidebar/
        pg-sidebar.ts
        pg-interaction-list.ts
      stage/
        pg-stage.ts
      inspector/
        pg-inspector.ts
        pg-interaction-editor.ts
        pg-trigger-editor.ts
        pg-effect-editor.ts
        pg-time-effect-editor.ts
        pg-scrub-effect-editor.ts
        pg-transition-effect-editor.ts
        pg-named-effect-picker.ts
        pg-sequence-editor.ts
        pg-condition-editor.ts
      json-panel/pg-json-panel.ts
      shared/
        pg-select.ts
        pg-number-input.ts
        pg-text-input.ts
        pg-toggle.ts
        pg-easing-picker.ts              ← composite: preset dropdown + SVG bezier editor
    interact/
      InteractManager.ts
      preset-registry.ts
    utils/
      dom.ts
      id.ts
      bezier.ts                           ← cubic-bezier math: point-on-curve, preset lookup
    styles/
      layers.css                          ← @layer order declaration
      base.css                            ← CSS reset
      theme.css                           ← all CSS custom properties
      layout.css                          ← app grid layout
      controls.css                        ← shared form control styles
      utilities.css                       ← utility classes
      states.css                          ← interactive states
```

---

## Implementation Phases

### Phase 1: Scaffolding & Infra — DONE

**Goal**: App boots with Vite, shows grid layout with placeholder panels. Store, base component, and CSS architecture wired up.

**Files to create**:

1. **`apps/playground/package.json`**
   - name: `@wix/interact-playground`, private, type: module
   - deps: `@wix/interact: ^2.1.4`, `@wix/motion-presets: ^1.0.0`
   - devDeps: `typescript: ^5.9.3`, `vite: ^7.2.2`
   - scripts: `dev`, `build` (`tsc && vite build`), `preview`, `lint`

2. **`apps/playground/vite.config.ts`**
   - Aliases (same pattern as demo app):
     - `@wix/interact/web` → `../../packages/interact/src/web`
     - `@wix/interact` → `../../packages/interact/src/index`
     - `@wix/motion` → `../../packages/motion/src/index`
     - `@wix/motion-presets` → `../../packages/motion-presets/src/index`
   - Server port: 4175
   - No framework plugins (no React)

3. **`apps/playground/tsconfig.json`**
   - Extends `../../tsconfig.base.json`
   - Paths matching Vite aliases

4. **`apps/playground/index.html`** — minimal HTML, loads `src/main.ts`

5. **`src/main.ts`** — imports all style layers in order, registers all `pg-*` custom elements, appends `<pg-app>` to body

6. **`src/types.ts`** — `PlaygroundState`, `Action` union type

7. **`src/store/`** — `PlaygroundStore.ts` (EventTarget-based), `actions.ts` (action creators), `reducer.ts` (pure reducer)

8. **`src/components/base/BaseComponent.ts`** — abstract class: shadow DOM, store subscription, `render()` method, adopts theme stylesheet

9. **`src/components/app/pg-app.ts`** — root grid layout using `layout.css` grid areas

10. **`src/components/toolbar/pg-toolbar.ts`** — placeholder with import/export/clear buttons

11. **`src/components/stage/pg-stage.ts`** — empty stage placeholder

12. **`src/components/sidebar/pg-sidebar.ts`** — empty sidebar placeholder

13. **`src/styles/`** — all 7 style files: `layers.css`, `base.css`, `theme.css`, `layout.css`, `controls.css`, `utilities.css`, `states.css`

14. **`src/utils/id.ts`** — `generateKey()`, **`dom.ts`** — DOM helpers

**Verification**: `nvm use && cd apps/playground && yarn dev` → app loads at localhost:4175, shows the dark-themed grid layout with toolbar, sidebar, stage, and inspector panels. CSS variables applied, layers working correctly.

---

### Phase 2: Component Library — DONE

**Goal**: Build the pre-made HTML/CSS component library. Each component is a module with HTML template, scoped CSS, and metadata listing its interact keys.

**Files to create**:

1. **`src/library/types.ts`** — `ComponentKey` and `ComponentDefinition` interfaces:
   ```ts
   interface ComponentKey {
     key: string;
     label: string;
     isList?: boolean;
     parentKey?: string;           // For list items: the parent's interact key
     listContainer?: string;       // CSS selector for the list container within the parent
     listItemSelector?: string;    // CSS selector for items within the container
   }

   interface ComponentDefinition {
     id: string;
     name: string;
     description: string;
     keys: ComponentKey[];
     html: string;     // HTML template string
     css: string;      // Scoped CSS
   }
   ```

2. **`src/library/index.ts`** — registry exporting `components: ComponentDefinition[]`

3. **`src/library/card/template.ts`** + **`card.css`**
   - Single card with image placeholder, title, description text, CTA button
   - Keys: `card` (root), `card-image`, `card-title`, `card-cta`

4. **`src/library/card-list/template.ts`** + **`card-list.css`**
   - Vertical stack of 3-4 cards
   - Keys: `card-list` (root), `card-list-item` (list, with `listContainer`/`listItemSelector`)

5. **`src/library/card-grid/template.ts`** + **`card-grid.css`**
   - 2-3 column responsive grid of cards
   - Keys: `card-grid` (root), `card-grid-item` (list)

6. **`src/library/hero-section/template.ts`** + **`hero-section.css`**
   - Full-width section with background image, heading, paragraph text
   - Keys: `hero` (root), `hero-image`, `hero-title`, `hero-text`

7. **`src/library/figure/template.ts`** + **`figure.css`**
   - `<figure>` with image and `<figcaption>`
   - Keys: `figure` (root), `figure-image`, `figure-caption`

8. **`src/library/header/template.ts`** + **`header.css`**
   - Heading with subtitle text
   - Keys: `header` (root), `header-title`, `header-subtitle`

9. **`src/library/nav-menu/template.ts`** + **`nav-menu.css`**
   - Horizontal nav bar with text anchor links
   - Keys: `nav-menu` (root), `nav-menu-item` (list)

10. **`src/library/carousel/template.ts`** + **`carousel.css`**
    - Horizontal scrollable carousel with image slides and title overlay
    - Keys: `carousel` (root), `carousel-slide` (list), `carousel-title`

11. **`src/components/toolbar/pg-component-selector.ts`** — dropdown populated from the registry, dispatches `SELECT_COMPONENT` action

12. **Wire stage**: Update `pg-stage.ts` to render the selected component's HTML/CSS, wrapping keyed elements with `<interact-element data-interact-key="...">`

**Verification**: Use component selector → pick "Card" → stage shows a styled card. Pick "Carousel" → stage replaces with carousel. Each component renders correctly with its own CSS.

---

### Phase 3: Interact Integration & Interaction Editing — DONE

**Goal**: Wire up InteractManager, create/edit interactions on the active component's keys, live JSON panel, trigger type selection with parameter forms.

**Files to create**:

1. **`src/interact/InteractManager.ts`**
   - `apply(config)`: destroy old Interact instance, call `Interact.registerEffects()` with presets, `Interact.create(config)`
   - Debounced by 100ms
   - Subscribes to store, reacts to config changes

2. **`src/interact/preset-registry.ts`**
   - Imports all preset categories from `@wix/motion-presets`
   - Exports a flat catalog: `{ name, category, factory }[]` for the UI picker

3. **`src/components/inspector/pg-inspector.ts`** — shell that shows the right sub-editor based on selection state

4. **`src/components/inspector/pg-interaction-editor.ts`** — trigger type dropdown (9 types), **source element** key selector (populated from active component's keys, sets `interaction.key` — the trigger element), delegates to `pg-trigger-editor`

5. **`src/components/inspector/pg-trigger-editor.ts`** — dynamic parameter form per trigger type:
   - `hover`/`click`/`activate`/`interest`: **Behavior dropdown adapts based on effect type:**
     - When any effect on the interaction is a **Transition** effect → shows `StateParams.method` values: `add` / `remove` / `toggle` / `clear` (sets `params.method`)
     - When effects are **Time** effects (or no effects yet) → shows `PointerTriggerParams.type` values: `once` / `repeat` / `alternate` / `state` (sets `params.type`)
     - Switching effect type tabs in `pg-effect-editor` automatically migrates the params (removes `type` and sets `method: 'toggle'` when switching to Transition, removes `method` and sets `type: 'alternate'` when switching away)
   - `viewEnter`: type, threshold (0-1 slider), inset
   - `viewProgress`: no trigger params (only scroll preview controls)
   - `pointerMove`: hitArea (root/self), axis (x/y)
   - Number/text inputs use `change` events; range sliders use `input` for real-time feedback (they don't lose focus on re-render)

6. **Scroll stage behavior** — when a `viewProgress` (or `viewEnter`) trigger is selected, the stage adapts for scroll preview:

   **Stage height expansion**: `pg-stage` switches from `overflow: hidden` to `overflow-y: auto`. The inner content area expands to ~3x the container height (configurable), with the component placed in the vertical center. This creates enough scroll distance to preview scroll-driven animations.

   **Sticky position controls**: A `pg-sticky-controls` sub-component appears in the inspector when `viewProgress` is the active trigger. It provides:
   - **Enable sticky** toggle — applies `position: sticky` to the component's wrapper on stage
   - **Sticky top** — number input (px) for `top` offset (how far from the top of the scroll container the element sticks)
   - **Sticky bottom** — number input (px) for `bottom` offset (for bottom-sticky behavior, implemented via a wrapper with `display: flex; flex-direction: column-reverse`)
   - These values are stored in `PlaygroundState` as `scrollPreview: { enabled: boolean; stickyTop?: number; stickyBottom?: number; stageHeight: number }` — they're UI-only state, not part of InteractConfig

   **Behavior**: When the user scrolls the stage, the `viewProgress` scrub effect animates the component in real-time based on scroll position. The sticky controls allow previewing parallax-style effects where the element remains in view during scroll.

   **Reset**: When the trigger is changed away from `viewProgress`/`viewEnter`, the stage reverts to its normal non-scrollable layout.

7. **`src/components/sidebar/pg-interaction-list.ts`** — lists interactions, add/delete buttons. Each row shows trigger type badge and source element key.

7. **`src/components/json-panel/pg-json-panel.ts`** — `<textarea>` showing `JSON.stringify(config, null, 2)`, editable (parse on blur, update store). Toggle open/closed.

8. **`src/components/shared/pg-select.ts`**, **`pg-number-input.ts`**, **`pg-text-input.ts`**, **`pg-toggle.ts`** — reusable form controls, styled via `controls.css` theme variables

**Verification**: Pick "Card" component → "Add Interaction" → pick key `card`, trigger "hover" → JSON panel shows valid `InteractConfig`. Change trigger to "viewEnter" → params form shows threshold slider. The key dropdown only shows keys available for the active component.

---

### Phase 4: Effect Editors & Live Preview — DONE

**Goal**: Add effects to interactions, configure keyframes/transitions/named presets, see animations live on stage. Includes the basic easing picker (preset dropdown only).

**Files to create**:

1. **`src/components/inspector/pg-effect-editor.ts`** — **target element** key selector (sets the inline ref's `key`/`listContainer`/`listItemSelector` on `interaction.effects[i]` — the animated element; defaults to "Same as source" when unset, meaning the runtime cascades to `interaction.key`), tabs/radio for effect type, delegates to sub-editors. **Allowed effect types are constrained by trigger:**
   - `hover` / `click` / `activate` / `interest`: Time or Transition
   - `viewProgress` / `pointerMove`: Scrub only
   - `viewEnter`: Time only
   - Tabs are filtered to only show allowed types (hidden entirely when only one option). When the trigger changes, existing incompatible effects are auto-converted to the trigger's default type.

2. **`src/components/inspector/pg-time-effect-editor.ts`**
   - Fields: duration, easing (picker), iterations, alternate, fill, reversed, delay
   - Effect property: namedEffect (picker) | keyframeEffect (name + keyframes JSON) | raw keyframes editor
   - All number/text inputs use `change` events (not `input`) to avoid focus-loss from store-triggered re-renders

3. **`src/components/inspector/pg-scrub-effect-editor.ts`**
   - Fields: easing, iterations, alternate, fill, reversed
   - Range: rangeStart/rangeEnd with name (entry/exit/contain/cover) + offset (value + unit) — **only shown when the trigger is `viewProgress`** (not applicable to `pointerMove` scrub effects)
   - Transition: transitionDuration, transitionDelay, transitionEasing, centeredToTarget — **only shown when the trigger is `pointerMove`** (not applicable to `viewProgress` scroll-driven scrub effects)
   - Same effect property union as TimeEffect
   - All number/text inputs use `change` events (not `input`) to avoid focus-loss from store-triggered re-renders

4. **`src/components/inspector/pg-transition-effect-editor.ts`**
   - **Timing section** (top): shared duration (default 300ms), delay (default 0ms), easing (`pg-easing-picker` select, same as Time effect) — propagated to every entry in `transitionProperties` so the runtime generates correct CSS transitions
   - **Properties section** (below divider): style property list — each has name (CSS property, defaults to `transform`) and value (defaults to `scale(1.05)`)
   - Per-property duration/delay/easing hidden from UI; the Timing section values are stamped onto all `transitionProperties` entries when changed
   - All inputs use `change` events (not `input`) to avoid focus-loss from re-renders
   - Add/remove property rows; new properties inherit the current shared timing

5. **`src/components/inspector/pg-named-effect-picker.ts`**
   - Browse presets by category: entrance (19), ongoing (14), scroll (19), mouse (9), backgroundScroll (5)
   - Select preset → show comprehensive per-preset parameter controls
   - Outputs a `namedEffect` object with all configured params
   - **Preset categories are filtered by trigger + effect type:**
     - `hover` / `click` / `activate` / `interest` / `viewEnter` + Time: Entrance and Ongoing only
     - `viewProgress` + Scrub: Scroll only
     - `pointerMove` + Scrub: Mouse only
   - Accepts `allowedCategories` via `setAllowedCategories()`, passed by the parent effect sub-editor
   - **Preset param control types:**
     - `select` — dropdown for direction, shape, range, axis, pivotAxis, spin
     - `number` — numeric input for perspective, blur, intensity, scale, spins, angle, rotate, etc.
     - `boolean` — checkbox for inverted, staggered, startFromOffScreen
     - `unit-value` — compound input (number + unit dropdown) for distance, depth (produces `{ value, type }` objects)
   - **Reset behavior:** Changing the selected preset clears all current param values (`_currentOptions = {}`); the new preset's controls render with their documented defaults
   - **Comprehensive coverage:** All parameters from `@wix/motion-presets` rules are exposed — entrance (19 presets), ongoing (14), scroll (19), mouse (9), background-scroll (5). Includes perspective, depth, distance, intensity, range, scale, angle, and all other documented params per preset

6. **`src/components/shared/pg-easing-picker.ts`** — initial version: preset dropdown that outputs `cubic-bezier()` string. SVG editor added in Phase 6.

**Verification**: Pick "Card" → add hover interaction on `card` key → add TimeEffect with `namedEffect: FadeIn` → hover over card on stage → it fades in. Switch to TransitionEffect with `transform: scale(1.1)` → hover → card scales. Export JSON → re-import → same behavior.

---

### Phase 5: Conditions, Sequences & Advanced Features

**Goal**: Full InteractConfig authoring capability.

**Files to create**:

1. **`src/components/inspector/pg-condition-editor.ts`**
   - Add/edit/delete conditions in `config.conditions`
   - Type selector: media | container | selector
   - Predicate input (e.g., `(min-width: 768px)`)
   - Wire conditions to effects/interactions via multi-select

2. **`src/components/inspector/pg-sequence-editor.ts`**
   - Create/edit sequences in `config.sequences`
   - Reorderable effect list (drag or up/down buttons)
   - Fields: delay, offset, offsetEasing
   - Reference existing effects by ID or create inline

**Verification**: Pick "Card Grid" → create a `viewEnter` interaction on `card-grid-item` (list) with a sequence of 3 staggered FadeIn effects, add a media condition `(min-width: 768px)` → scroll stage → grid items animate in with stagger. Resize browser below 768px → animation doesn't trigger.

---

### Phase 6: Easing Picker SVG Editor

**Goal**: Upgrade the easing picker from a simple dropdown into a composite component with interactive SVG bezier curve editor.

**Files to create/modify**:

1. **`src/utils/bezier.ts`** — cubic-bezier utilities:
   - `parseCubicBezier(str)` → `[x1, y1, x2, y2]`
   - `formatCubicBezier(x1, y1, x2, y2)` → `cubic-bezier(...)` string
   - `EASING_PRESETS` — map of named easings to control point values
   - `matchPreset(x1, y1, x2, y2)` → preset name or `null` (with tolerance for floating point)
   - `sampleBezierCurve(x1, y1, x2, y2, steps)` → `{x, y}[]` for rendering the curve path

2. **Upgrade `src/components/shared/pg-easing-picker.ts`** — full composite component:

   **Layout** (vertical stack within the component):
   ```
   ┌─────────────────────────┐
   │ [Preset dropdown ▼]     │  ← pg-select with named easings
   ├─────────────────────────┤
   │                         │
   │   SVG Bezier Editor     │  ← 200x200 SVG with draggable handles
   │   (curve + handles)     │
   │                         │
   ├─────────────────────────┤
   │ cubic-bezier(x1,y1,x2,y2) │  ← editable text input, synced
   └─────────────────────────┘
   ```

   **SVG internals**:
   - Background rect with subtle grid lines
   - Dashed diagonal line (0,0 → 1,1) as "linear" reference
   - `<path>` for the bezier curve, computed from control points
   - Two `<line>` elements connecting start→handle1 and end→handle2
   - Two `<circle r="6">` handles at (x1, y1) and (x2, y2), styled with `--pg-color-accent`
   - Viewbox `-20 -20 240 240` to allow y-axis overshoot (for easeOutBack etc.)

   **Drag interaction**:
   - `pointerdown` on handle → `setPointerCapture`, track `pointermove`
   - Convert screen coords to SVG coords via `getScreenCTM().inverse()` + `DOMPoint`
   - Clamp `x` to [0, 1], allow `y` to range [-0.5, 1.5] for overshoot
   - On every move: update path `d`, handle positions, line positions, text input
   - On `pointerup`: release capture, emit `change` event with final `cubic-bezier()` value
   - If dragged position matches a named preset (within 0.01 tolerance), auto-select it in dropdown

   **Bidirectional sync**:
   - Dropdown change → update SVG handles + text input
   - SVG drag → update dropdown (if matches preset, else "custom") + text input
   - Text input blur → parse, update SVG handles + dropdown

**Verification**: Open easing picker → select "ease-out" → SVG shows correct curve shape with handles at (0, 0, 0.58, 1). Drag handle 2 to a new position → curve updates live, dropdown switches to "custom", text input updates. Type `cubic-bezier(0.68, -0.55, 0.265, 1.55)` → SVG shows overshoot curve, dropdown auto-selects "easeInOutBack". Apply to an effect → animation on stage uses the selected easing.

---

### Phase 7: Polish & UX

**Goal**: Refined editing experience.

**Enhancements** (modifications to existing files):

1. **Import/Export** wired in `pg-toolbar.ts`: file download for export, file picker for import
2. **Keyboard shortcuts**: Delete to remove selected interaction, Ctrl+Z undo (add undo stack to `PlaygroundStore.ts`)
3. **Visual polish**: hover/focus state transitions using `states.css` layer, panel divider resize handles
4. **Component preview thumbnails** in the selector dropdown

**Verification**: Full round-trip: pick component, add interactions, export JSON, clear, import JSON → identical state restored.

---

## Critical Files Reference

| File | Purpose |
|------|---------|
| `packages/interact/src/types.ts` | All InteractConfig, Effect, Trigger types |
| `packages/interact/src/core/Interact.ts` | `Interact.create()`, `.destroy()`, `.registerEffects()` |
| `packages/interact/src/web/index.ts` | Web entry point, `defineInteractElement` |
| `packages/motion-presets/src/index.ts` | All preset exports by category |
| `apps/demo/vite.config.ts` | Reference for Vite alias pattern |
| `apps/demo/tsconfig.json` | Reference for tsconfig paths pattern |

## Verification (End-to-End)

1. `nvm use && yarn install && cd apps/playground && yarn dev`
2. Pick "Card" from component selector → card renders on stage
3. Add a `hover` interaction on `card` key with a `TimeEffect` using `FadeIn` named effect
4. Hover over card on stage → it fades in
5. Open easing picker → drag bezier handles → animation easing updates live
6. Switch to "Card Grid" → add `viewEnter` interaction on `card-grid-item` with staggered sequence
7. Scroll → grid items animate in with stagger
8. Open JSON panel → valid `InteractConfig` shown
9. Copy JSON → clear → paste JSON into import → same interactions restored
10. `yarn build` succeeds without errors
