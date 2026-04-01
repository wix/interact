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
- [x] Scroll stage behavior (auto scroll mode for viewEnter/viewProgress, sticky mode toggle, stage height)
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

### Phase 5: Conditions, Sequences & Advanced — DONE

- [x] pg-condition-editor.ts (media/container/selector conditions)
- [x] pg-sequence-editor.ts (effect list, delay, offset, offsetEasing)

### Phase 6: Easing Picker SVG Editor — DONE

- [x] src/utils/bezier.ts (parse, format, preset lookup, curve sampling)
- [x] Upgrade pg-easing-picker.ts (SVG bezier editor, draggable handles, bidirectional sync)

### Phase 7: Polish & UX — DONE

- [x] Import/Export (file download + file picker)
- [x] Keyboard shortcuts (Delete, Ctrl+Z undo)
- [x] Visual polish (transitions, panel resize handles)
- [x] Component descriptions in selector

### Phase 8: Keyframe Effect Editor

- [ ] pg-keyframe-editor.ts (keyframe list editor with CSS property/value rows, add/remove/reorder keyframes)
- [ ] Upgrade pg-time-effect-editor.ts (animation source toggle: Named Effect vs Keyframe Effect, bidirectional switch)
- [ ] Upgrade pg-scrub-effect-editor.ts (same animation source toggle for scrub effects)
- [ ] Upgrade pg-effect-editor.ts (detect keyframeEffect in type detection, preserve keyframeEffect in default creation)

### Phase 9: Timeline Panel

- [ ] Refactor bottom panel to tabbed area (replace jsonPanelOpen with bottomPanel: 'none' | 'json' | 'timeline')
- [ ] pg-timeline-panel.ts (transport controls, effect tracks, time ruler, draggable playhead)
- [ ] src/timeline/TimelineEngine.ts (creates preview WAAPI animations, coordinates playback, scrubbing, RAF loop)
- [ ] Wire into InteractManager (expose stage element reference, pause Interact preview during timeline playback)
- [ ] Update pg-toolbar, pg-app, pg-json-panel for bottom panel tab switching

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

| Component      | Description                                  | Interact Keys                                         |
| -------------- | -------------------------------------------- | ----------------------------------------------------- |
| `card`         | Image, title, text, CTA button               | `card`, `card-image`, `card-title`, `card-cta`        |
| `card-list`    | Vertical list of cards                       | `card-list`, `card-list-item` (list)                  |
| `card-grid`    | 2-3 column grid of cards                     | `card-grid`, `card-grid-item` (list)                  |
| `hero-section` | Full-width section with image, title, text   | `hero`, `hero-image`, `hero-title`, `hero-text`       |
| `figure`       | Image with caption                           | `figure`, `figure-image`, `figure-caption`            |
| `header`       | Heading text with subtitle                   | `header`, `header-title`, `header-subtitle`           |
| `nav-menu`     | Horizontal list of text anchors              | `nav-menu`, `nav-menu-item` (list)                    |
| `carousel`     | Horizontal image carousel with title overlay | `carousel`, `carousel-slide` (list), `carousel-title` |

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

Because inline refs are checked first, the playground stores target selection properties (`key`, `listContainer`, `listItemSelector`) on the inline ref in `interaction.effects[i]` or `sequence.effects[i]`, updating them via `updateInteraction()` or `updateSequence()` respectively. The top-level `config.effects[id]` objects only contain animation properties (duration, easing, namedEffect, etc.) and `conditions`. This ensures the target element setting is not accidentally overridden or lost when the top-level effect is replaced (e.g., when switching effect type tabs).

**Effect context tracking**: When a user selects an effect to edit, `state.selectedEffectContext` tracks whether the inline ref lives in `interaction.effects[]` (`source: 'interaction'`) or `sequence.effects[]` (`source: 'sequence'`, with `sequenceId` and `effectIndex`). The `pg-effect-editor`'s "Target Element" dropdown reads and writes the inline ref from the correct location based on this context. Effect rows in `pg-sequence-editor` are clickable and dispatch `selectEffect(id, { source: 'sequence', sequenceId, effectIndex })` to set the context, reusing the same target dropdown in `pg-effect-editor`.

### State Management

```
PlaygroundStore (extends EventTarget)
  ├── state.config: InteractConfig           ← the serializable output
  ├── state.activeComponentId: string        ← which pre-made component is on stage
  ├── state.selectedInteractionIndex: number | null
  ├── state.selectedEffectId: string | null
  ├── state.selectedEffectContext: EffectContext | null  ← where the selected effect's inline ref lives
  │     EffectContext = { source: 'interaction' }
  │                   | { source: 'sequence', sequenceId: string, effectIndex: number }
  ├── state.jsonPanelOpen: boolean
  └── state.scrollPreview: {                 ← UI-only, not in InteractConfig
        enabled: boolean                       (auto-managed: true when trigger is viewEnter/viewProgress)
        stickyTop?: number                     (sticky top offset px — enables position:sticky)
        stickyBottom?: number                  (sticky bottom offset px — enables position:sticky)
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

| Layer        | Purpose                                                                                       | Files                  |
| ------------ | --------------------------------------------------------------------------------------------- | ---------------------- |
| `base`       | CSS reset, box-sizing, typography defaults                                                    | `styles/base.css`      |
| `layout`     | App grid, panel sizing, responsive breakpoints                                                | `styles/layout.css`    |
| `theme`      | All CSS custom properties (colors, spacing, radii, shadows, fonts)                            | `styles/theme.css`     |
| `components` | Styles for each Web Component (via shadow DOM adoptedStyleSheets or `<style>` in shadow root) | Per-component CSS      |
| `utilities`  | Helper classes: `.sr-only`, `.truncate`, `.flex-center`, `.gap-*`                             | `styles/utilities.css` |
| `states`     | Interactive states: `:hover`, `:focus-visible`, `[aria-selected]`, `.active`, `.disabled`     | `styles/states.css`    |

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
      'toolbar  toolbar   toolbar'
      'sidebar  stage     inspector'
      'json     json      json';
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
themeSheet.replaceSync(themeCSS); // imported from styles/theme.css

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

| Preset     | Value                                     |
| ---------- | ----------------------------------------- |
| linear     | `linear`                                  |
| ease       | `ease`                                    |
| easeIn     | `ease-in`                                 |
| easeOut    | `ease-out`                                |
| easeInOut  | `ease-in-out`                             |
| sineIn     | `cubic-bezier(0.47, 0, 0.745, 0.715)`     |
| sineOut    | `cubic-bezier(0.39, 0.575, 0.565, 1)`     |
| sineInOut  | `cubic-bezier(0.445, 0.05, 0.55, 0.95)`   |
| quadIn     | `cubic-bezier(0.55, 0.085, 0.68, 0.53)`   |
| quadOut    | `cubic-bezier(0.25, 0.46, 0.45, 0.94)`    |
| quadInOut  | `cubic-bezier(0.455, 0.03, 0.515, 0.955)` |
| cubicIn    | `cubic-bezier(0.55, 0.055, 0.675, 0.19)`  |
| cubicOut   | `cubic-bezier(0.215, 0.61, 0.355, 1)`     |
| cubicInOut | `cubic-bezier(0.645, 0.045, 0.355, 1)`    |
| quartIn    | `cubic-bezier(0.895, 0.03, 0.685, 0.22)`  |
| quartOut   | `cubic-bezier(0.165, 0.84, 0.44, 1)`      |
| quartInOut | `cubic-bezier(0.77, 0, 0.175, 1)`         |
| quintIn    | `cubic-bezier(0.755, 0.05, 0.855, 0.06)`  |
| quintOut   | `cubic-bezier(0.23, 1, 0.32, 1)`          |
| quintInOut | `cubic-bezier(0.86, 0, 0.07, 1)`          |
| expoIn     | `cubic-bezier(0.95, 0.05, 0.795, 0.035)`  |
| expoOut    | `cubic-bezier(0.19, 1, 0.22, 1)`          |
| expoInOut  | `cubic-bezier(1, 0, 0, 1)`                |
| circIn     | `cubic-bezier(0.6, 0.04, 0.98, 0.335)`    |
| circOut    | `cubic-bezier(0.075, 0.82, 0.165, 1)`     |
| circInOut  | `cubic-bezier(0.785, 0.135, 0.15, 0.86)`  |
| backIn     | `cubic-bezier(0.6, -0.28, 0.735, 0.045)`  |
| backOut    | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` |
| backInOut  | `cubic-bezier(0.68, -0.55, 0.265, 1.55)`  |
| custom     | User-defined via the SVG editor below     |

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
        pg-keyframe-editor.ts              ← keyframe list editor (CSS property/value rows)
        pg-sequence-editor.ts
        pg-condition-editor.ts
      json-panel/pg-json-panel.ts
      timeline/
        pg-timeline-panel.ts         ← timeline UI: transport, tracks, ruler, playhead
      shared/
        pg-select.ts
        pg-number-input.ts
        pg-text-input.ts
        pg-toggle.ts
        pg-easing-picker.ts              ← composite: preset dropdown + SVG bezier editor
    interact/
      InteractManager.ts
      preset-registry.ts
    timeline/
      TimelineEngine.ts              ← WAAPI animation creation, playback, scrubbing
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
     parentKey?: string; // For list items: the parent's interact key
     listContainer?: string; // CSS selector for the list container within the parent
     listItemSelector?: string; // CSS selector for items within the container
   }

   interface ComponentDefinition {
     id: string;
     name: string;
     description: string;
     keys: ComponentKey[];
     html: string; // HTML template string
     css: string; // Scoped CSS
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

6. **Scroll stage behavior** — when a `viewProgress` or `viewEnter` trigger is selected, the stage **automatically** enters scroll mode:

   **Auto scroll mode**: Selecting a `viewProgress` or `viewEnter` trigger automatically enables scroll mode on the stage. Switching to any other trigger automatically disables it. There is no manual toggle for scroll mode — it is driven entirely by the selected trigger type.

   **Stage height expansion**: `pg-stage` switches from `overflow: hidden` to `overflow-y: auto`. The inner content area expands to ~3x the container height (configurable via a slider), with the component placed in the vertical center. This creates enough scroll distance to preview scroll-driven animations.

   **Sticky mode toggle**: A "Scroll Preview" section appears in the trigger params area for both `viewProgress` and `viewEnter` triggers. It provides:
   - **Stage height multiplier** — range slider (2-10x) controlling how tall the scrollable area is
   - **Enable sticky mode** checkbox — when checked, applies `position: sticky` to the component's `.stage-content` wrapper on stage and shows the top/bottom offset fields. Defaults to `top: 0px` when first enabled.
   - **Sticky top** — number input (px) for `top` offset (how far from the top of the scroll container the element sticks). Setting top clears bottom.
   - **Sticky bottom** — number input (px) for `bottom` offset (simple `bottom: <length>` on the sticky element). Setting bottom clears top.
   - These values are stored in `PlaygroundState` as `scrollPreview: { enabled: boolean; stickyTop?: number; stickyBottom?: number; stageHeight: number }` — they're UI-only state, not part of InteractConfig. `enabled` tracks whether the stage is in scroll mode (auto-managed by trigger type), while `stickyTop`/`stickyBottom` control the optional sticky positioning.

   **Behavior**: When the user scrolls the stage, scroll-driven effects animate in real-time. The sticky controls allow previewing parallax-style effects where the element remains in view during scroll.

   **Reset**: When the trigger is changed away from `viewProgress`/`viewEnter`, the stage reverts to its normal non-scrollable layout and sticky positioning is cleared.

7. **`src/components/sidebar/pg-interaction-list.ts`** — lists interactions, add/delete buttons. Each row shows trigger type badge and source element key.

8. **`src/components/json-panel/pg-json-panel.ts`** — `<textarea>` showing `JSON.stringify(config, null, 2)`, editable (parse on blur, update store). Toggle open/closed.

9. **`src/components/shared/pg-select.ts`**, **`pg-number-input.ts`**, **`pg-text-input.ts`**, **`pg-toggle.ts`** — reusable form controls, styled via `controls.css` theme variables

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

### Phase 8: Keyframe Effect Editor

**Goal**: Let users author custom `keyframeEffect` animations as an alternative to named presets. The `keyframeEffect` property (`{ name: string; keyframes: Keyframe[] }`) is the primary way to define custom CSS-property animations in Interact. It works with both Time effects (all event-based triggers) and Scrub effects (viewProgress, pointerMove). This phase adds a visual keyframe list editor and wires it into the existing effect editors alongside the existing named-effect picker.

**Background — `keyframeEffect` vs `namedEffect`:**

Both are members of the `EffectEffectProperty` union on every effect:

```ts
type EffectEffectProperty =
  | { keyframeEffect: MotionKeyframeEffect }   // custom keyframes (this phase)
  | { namedEffect: NamedEffect }               // preset from @wix/motion-presets (existing)
  | { customEffect: ... }                      // JS callback (not GUI-authorable)
```

A `keyframeEffect` has the shape `{ name: string; keyframes: Keyframe[] }` where each `Keyframe` is a plain object of CSS properties in camelCase (the standard Web Animations API `Keyframe` type). Examples:

```ts
// Simple fade
keyframeEffect: {
  name: 'fade',
  keyframes: [{ opacity: 0 }, { opacity: 1 }]
}

// Multi-property with explicit offsets
keyframeEffect: {
  name: 'slide-rotate',
  keyframes: [
    { offset: 0, transform: 'translateX(-100px) rotate(-10deg)', opacity: 0 },
    { offset: 0.6, opacity: 1 },
    { offset: 1, transform: 'translateX(0) rotate(0deg)', opacity: 1 }
  ]
}
```

Timing properties (`duration`, `easing`, `fill`, `delay`, `iterations`, `alternate`, `reversed`) live on the effect alongside `keyframeEffect` — exactly the same as when using `namedEffect`. The only change is which animation source property is present.

**Files to create/modify:**

1. **`src/components/inspector/pg-keyframe-editor.ts`** — new component: the keyframe list editor

   **Layout** (vertical stack):

   ```
   ┌─────────────────────────────────────┐
   │ Effect Name: [___________________]  │  ← text input for keyframeEffect.name
   ├─────────────────────────────────────┤
   │ Keyframe 1                    [×]   │  ← header with remove button
   │  offset: [0__]                      │  ← optional offset (0-1, step 0.01)
   │  ┌──────────────┬─────────────┐     │
   │  │ Property     │ Value       │     │  ← CSS property name + value
   │  │ [opacity   ] │ [0        ] │     │
   │  │ [transform ] │ [scale(0) ] │     │
   │  │ + add property              │     │
   │  └──────────────┴─────────────┘     │
   ├─────────────────────────────────────┤
   │ Keyframe 2                    [×]   │
   │  offset: [1__]                      │
   │  ┌──────────────┬─────────────┐     │
   │  │ [opacity   ] │ [1        ] │     │
   │  │ [transform ] │ [scale(1) ] │     │
   │  │ + add property              │     │
   │  └──────────────┴─────────────┘     │
   ├─────────────────────────────────────┤
   │         [+ Add Keyframe]            │
   └─────────────────────────────────────┘
   ```

   **Data model**: The component manages a `MotionKeyframeEffect` object:

   ```ts
   {
     name: string;               // user-chosen identifier
     keyframes: Keyframe[];      // array of keyframe objects
   }
   ```

   Each `Keyframe` is a plain `Record<string, string | number>` plus an optional `offset` (0-1). The editor represents each keyframe as a list of CSS property/value rows.

   **Behavior:**
   - `setKeyframeEffect(effect: { name: string; keyframes: Keyframe[] } | null)` — called by parent to populate
   - On any change (name, keyframe property/value, offset, add/remove), emit a `change` CustomEvent with `detail: { name, keyframes }` (the full `keyframeEffect` object)
   - "Add Keyframe" button appends `{}` (empty keyframe) to the array
   - Each keyframe card has:
     - Optional `offset` number input (0-1, step 0.01). Omitted by default; show only when user explicitly sets it or when there are 3+ keyframes
     - Property rows: each has a text input for CSS property name (with `datalist` autocomplete of common CSS properties: `opacity`, `transform`, `background-color`, `color`, `clip-path`, `filter`, `border-radius`, `box-shadow`, `width`, `height`, `padding`, `margin`, `font-size`, `letter-spacing`) and a text input for value
     - "+ add property" button appends a new empty property row
     - "×" button removes the property row (min 1 property per keyframe)
   - "×" button on keyframe header removes that keyframe (min 2 keyframes enforced — button hidden when at 2)
   - Property names use camelCase in the data model but the input accepts both `background-color` and `backgroundColor` — convert kebab-case to camelCase on blur (the Web Animations API requires camelCase)
   - All inputs use `change` events (not `input`) to avoid focus loss from store-triggered re-renders
   - Default new keyframe effect: `{ name: 'custom', keyframes: [{ opacity: 0 }, { opacity: 1 }] }`

   **Styles**: Follows the same visual patterns as `pg-sequence-editor` — keyframe cards use `.pg-color-bg-tertiary` background with padding, property rows are compact field-rows inside them. Uses shared controls.css classes.

2. **Upgrade `src/components/inspector/pg-time-effect-editor.ts`** — add animation source toggle

   Currently the "Animation" section renders only `<pg-named-effect-picker>`. Change it to:

   **Layout change:**

   ```
   ┌─────────────────────────────────────┐
   │ Animation Source                     │
   │ ( ) Named Effect  ( ) Keyframes    │  ← radio toggle
   ├─────────────────────────────────────┤
   │ [pg-named-effect-picker]            │  ← shown when "Named Effect" selected
   │         — OR —                      │
   │ [pg-keyframe-editor]                │  ← shown when "Keyframes" selected
   └─────────────────────────────────────┘
   ```

   **Behavior:**
   - Detect current source from the effect object: if `namedEffect` is present → "Named Effect"; if `keyframeEffect` is present → "Keyframes". Default to "Named Effect" for new effects.
   - When switching from Named Effect → Keyframes:
     - Strip `namedEffect` property from the effect
     - Add a default `keyframeEffect: { name: 'custom', keyframes: [{ opacity: 0 }, { opacity: 1 }] }`
     - Dispatch `updateEffect`
   - When switching from Keyframes → Named Effect:
     - Strip `keyframeEffect` property from the effect
     - Add a default `namedEffect: { type: 'FadeIn' }` (or the trigger-appropriate default)
     - Dispatch `updateEffect`
   - The timing properties below (duration, easing, fill, etc.) remain unchanged — they apply identically to both sources
   - Wire `pg-keyframe-editor`'s `change` event to update the effect's `keyframeEffect` property

3. **Upgrade `src/components/inspector/pg-scrub-effect-editor.ts`** — same animation source toggle

   Same radio toggle pattern as the time effect editor. When "Keyframes" is selected, show `<pg-keyframe-editor>` instead of `<pg-named-effect-picker>`.
   - Default keyframe effect for scrub: `{ name: 'custom-scroll', keyframes: [{ opacity: 0 }, { opacity: 1 }] }`
   - When switching from Named Effect → Keyframes: strip `namedEffect`, add default `keyframeEffect`
   - When switching from Keyframes → Named Effect: strip `keyframeEffect`, add default `namedEffect: { type: 'FadeScroll' }` (or `TrackMouse` for pointerMove trigger)
   - Allowed named effect categories remain unchanged (Scroll for viewProgress, Mouse for pointerMove)

4. **Upgrade `src/components/inspector/pg-effect-editor.ts`** — minor changes
   - `detectEffectType`: already handles `keyframeEffect` correctly (a TimeEffect with `keyframeEffect` still has `duration`, a ScrubEffect with `keyframeEffect` still lacks `duration`). No change needed to detection logic.
   - `createDefaultEffect`: no change — defaults still use `namedEffect`. The user switches to keyframes via the radio toggle in the sub-editor.

5. **Register in `src/main.ts`** — add import for the new component:
   ```ts
   import './components/inspector/pg-keyframe-editor';
   ```

**File structure addition:**

```
      inspector/
        ...
        pg-keyframe-editor.ts              ← keyframe list editor (CSS property/value rows)
```

**Verification**: Pick "Card" → add a hover interaction on `card` → add a Time effect → switch "Animation Source" to "Keyframes" → editor shows two keyframes with `opacity: 0` and `opacity: 1` → change name to `scale-fade` → add `transform` property to keyframe 1 with value `scale(0.5)` → add `transform` property to keyframe 2 with value `scale(1)` → hover over card on stage → it fades and scales in. Switch to "Named Effect" → effect resets to FadeIn preset → hover still works. Open JSON panel → `keyframeEffect` / `namedEffect` property reflects the active source. Switch component to "Hero Section" → add viewProgress interaction → add Scrub effect → switch to "Keyframes" → add scroll-driven keyframes → scroll stage → animation plays on scroll progress. Export JSON → re-import → keyframeEffect preserved correctly.

---

### Phase 9: Timeline Panel

**Goal**: Add a togglable bottom panel with a visual timeline that shows each effect as a horizontal track, a time ruler, transport controls (play/pause/stop), and a draggable playhead that tracks and controls animation progress. The timeline creates its own preview animations on the stage elements using the Web Animations API, independent of Interact's trigger-based system.

**Background — why independent animations:**

Interact's animations are trigger-driven (hover, click, scroll, etc.) — they start when a trigger fires, not when a "Play" button is pressed. The timeline needs to play all effects simultaneously from a single global playhead. To achieve this, the `TimelineEngine` creates its own WAAPI `Animation` objects directly on the stage's target elements, pauses them immediately, and controls them via `animation.currentTime`. This avoids fighting with Interact's internal lifecycle and gives full scrubbing control.

**Bottom panel architecture — tabbed approach:**

Replace the current `jsonPanelOpen: boolean` state with a `bottomPanel: 'none' | 'json' | 'timeline'` enum. Both the JSON panel and the timeline panel share the same `json` grid area and the same resize handle. Only one is visible at a time. The toolbar shows "JSON" and "Timeline" buttons — clicking one opens it (or toggles it if already active). The existing `pg-json-panel` component is updated to check `bottomPanel === 'json'` instead of `jsonPanelOpen`.

```
┌───────────────────────────────────────────────────────────────────┐
│ Toolbar:  [Component ▼]           [Import] [Export] [JSON] [Timeline] [Clear] │
├───────────┬────────────────────────────────────┬──────────────────┤
│ Sidebar   │            Stage                   │    Inspector     │
│           │                                    │                  │
├───────────┴─── resize handle ──────────────────┴──────────────────┤
│ Bottom Panel (JSON or Timeline)                                   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Files to create:**

1. **`src/timeline/TimelineEngine.ts`** — animation creation and playback controller

   Manages preview animations independently of Interact. Stateless class that operates on a set of `TrackInfo` descriptors.

   ```ts
   interface TrackInfo {
     effectId: string;
     label: string; // display name (e.g., "FadeIn", "opacity → 1", effect ID)
     targetElement: Element | null; // resolved from stage shadow DOM
     delay: number; // ms (from effect.delay or sequence offset)
     duration: number; // ms (from effect.duration; scrub effects use a default of 1000ms)
     keyframes: Keyframe[]; // resolved keyframes (or placeholder for namedEffect)
     easing: string;
     iterations: number;
     fill: FillMode;
     isScrub: boolean; // true if no duration (viewProgress/pointerMove effect)
   }
   ```

   **Effect → TrackInfo resolution:**
   - For each effect in `config.effects`:
     - If `keyframeEffect` present: use its keyframes directly
     - If `namedEffect` present: use a placeholder fade keyframes `[{ opacity: 0.3 }, { opacity: 1 }]` and label with the preset name (resolving real preset keyframes is complex and out of scope for this phase)
     - If `transitionProperties` present: convert to equivalent keyframes (property name → `[{ [name]: 'initial' }, { [name]: value }]`)
   - Timing: `delay` from effect + any sequence stagger offset, `duration` from effect (or 1000ms default for scrub effects)
   - `targetElement`: resolved by finding `[data-interact-key="<key>"]` in the stage's shadow DOM. Falls back to the interaction's key if the effect doesn't specify one.

   **Public API:**

   ```ts
   class TimelineEngine {
     constructor(stageRoot: ShadowRoot);

     // Build tracks from current config
     buildTracks(config: InteractConfig): TrackInfo[];

     // Create paused WAAPI animations for all tracks. Call after buildTracks.
     createAnimations(tracks: TrackInfo[]): void;

     // Destroy all preview animations (cancel + remove)
     destroyAnimations(): void;

     // Transport
     play(): void; // resume from current time
     pause(): void; // freeze at current time
     stop(): void; // pause + seek to 0

     // Scrubbing
     seekTo(timeMs: number): void; // set currentTime on all animations
     get currentTime(): number; // current playhead position in ms
     get totalDuration(): number; // max(delay + duration * iterations) across all tracks
     get isPlaying(): boolean; // true if RAF loop is active

     // Progress observation — calls back on every frame while playing
     onTick(callback: (timeMs: number) => void): void;
   }
   ```

   **Playback loop**: When `play()` is called, a `requestAnimationFrame` loop starts. On each frame, it reads the first animation's `currentTime`, calls the `onTick` callback (so the panel can update the playhead position), and checks if all animations are finished. When all finish or `currentTime >= totalDuration`, auto-pause.

   **Interaction with InteractManager**: When `createAnimations()` is called, it dispatches a custom event (or calls a setter) to tell InteractManager to **pause** — `Interact.destroy()` the current instance so trigger-based animations don't conflict with timeline-controlled ones. When `destroyAnimations()` is called (panel closes or tab switches away), InteractManager re-applies the config.

2. **`src/components/timeline/pg-timeline-panel.ts`** — the timeline UI component

   **Layout:**

   ```
   ┌──────────────────────────────────────────────────────────────────────┐
   │ [▶] [⏸] [⏹]  00:00.000 / 02:00.000                               │ ← transport bar
   ├───────────┬──────────────────────────────────────────────────────────┤
   │           │  0ms    250ms   500ms   750ms   1000ms  1250ms  1500ms │ ← time ruler
   │  TRACKS   ├──────────────────────────────────────────────────────────┤
   │           │  ┃ (playhead — vertical line, draggable)               │
   ├───────────┼──────────────────────────────────────────────────────────┤
   │  FadeIn   │  ░░░░████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░ │ ← track bar
   │  ScaleUp  │  ░░░░░░░░░░██████████████████████████░░░░░░░░░░░░░░░░ │
   │  SlideIn  │  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
   └───────────┴──────────────────────────────────────────────────────────┘
   ```

   **Structure** (HTML within shadow DOM):
   - **Transport bar** (top): flexbox row with play/pause/stop icon buttons + time display (`current / total`). Buttons use `--pg-color-accent` styling.
   - **Track area** (below): two-column layout — fixed-width **label column** (120px, shows effect name/type) and a flexible **timeline column** (scroll horizontally if content exceeds width).
   - **Time ruler**: a thin strip at the top of the timeline column with tick marks at regular intervals. Interval is auto-calculated: pick a round number (100ms, 250ms, 500ms, 1s, 2s) so roughly 8-12 ticks fit.
   - **Track lanes**: each effect gets a horizontal row. Inside the timeline column, a colored bar is positioned at `left: (delay / totalDuration) * 100%` with `width: (duration / totalDuration) * 100%`. The bar uses `--pg-color-accent` with opacity. A progress fill overlay inside the bar shows how much of that effect has played (driven by `onTick`).
   - **Playhead**: an absolutely-positioned vertical line (2px wide, `--pg-color-danger` or a bright accent) spanning the full track area height. Its `left` position is `(currentTime / totalDuration) * 100%` of the timeline column.
   - **Empty state**: when no effects exist, show "Add effects to see the timeline".

   **Track bar colors:**
   - Time effects: `--pg-color-accent` (indigo)
   - Scrub effects: `--pg-color-success` (green)
   - Transition effects: `--pg-color-accent-hover` (lighter indigo)

   **Playhead drag interaction:**
   - `pointerdown` on playhead → `setPointerCapture`, track `pointermove`
   - Convert pointer X to time via the timeline column's bounding rect: `time = (clientX - rect.left) / rect.width * totalDuration`
   - Clamp to `[0, totalDuration]`
   - Call `engine.seekTo(time)` on each move
   - Also: clicking anywhere on the timeline column (not on playhead) jumps the playhead to that time

   **Clicking a track**: selects that effect in the inspector (dispatches `selectEffect(effectId, { source: 'interaction' })`), allowing the user to edit it while seeing its timeline position.

   **Lifecycle:**
   - On `render()` / `onStateChange()`: if `bottomPanel === 'timeline'`, build tracks from `state.config` via `TimelineEngine.buildTracks()`, create animations, render the track layout. If switching away from timeline, destroy animations.
   - On config change while timeline is open: rebuild tracks and recreate animations (debounced, same as InteractManager).
   - On component disconnect: destroy animations.

   **Styles**: follows the same dark-theme patterns as other panels — `--pg-color-bg-secondary` background, `--pg-color-border` dividers, `--pg-font-mono` for time display.

**Files to modify:**

3. **`src/types.ts`** — replace `jsonPanelOpen` with `bottomPanel`

   ```ts
   export type BottomPanel = 'none' | 'json' | 'timeline';

   export interface PlaygroundState {
     // ... existing properties ...
     bottomPanel: BottomPanel; // replaces jsonPanelOpen: boolean
     // ... rest ...
   }
   ```

   Add new action types:

   ```ts
   | { type: 'SET_BOTTOM_PANEL'; payload: BottomPanel }
   ```

   Remove `TOGGLE_JSON_PANEL` action type (replaced by `SET_BOTTOM_PANEL`).

4. **`src/store/actions.ts`** — replace `toggleJsonPanel` with `setBottomPanel`

   ```ts
   export const setBottomPanel = (panel: BottomPanel): Action => ({
     type: 'SET_BOTTOM_PANEL',
     payload: panel,
   });
   ```

   For toolbar button behavior: clicking "JSON" dispatches `setBottomPanel(current === 'json' ? 'none' : 'json')`. Same toggle pattern for "Timeline".

5. **`src/store/reducer.ts`** — handle `SET_BOTTOM_PANEL`

   ```ts
   case 'SET_BOTTOM_PANEL':
     return { ...state, bottomPanel: action.payload };
   ```

   Update `createInitialState()`: replace `jsonPanelOpen: false` with `bottomPanel: 'none'`.

6. **`src/components/toolbar/pg-toolbar.ts`** — add Timeline button, update JSON button

   Add a "Timeline" button next to "JSON". Both use toggle behavior:
   - JSON button: `setBottomPanel(state.bottomPanel === 'json' ? 'none' : 'json')`
   - Timeline button: `setBottomPanel(state.bottomPanel === 'timeline' ? 'none' : 'timeline')`
   - Active button gets a visual highlight (e.g., `--pg-color-accent-muted` background)

   Toolbar needs to subscribe to state changes to update button active states (override `onStateChange`).

7. **`src/components/json-panel/pg-json-panel.ts`** — use `bottomPanel` instead of `jsonPanelOpen`

   Change `state.jsonPanelOpen` references to `state.bottomPanel === 'json'`. The panel visibility logic remains the same (`:host(.open)` CSS class).

8. **`src/components/app/pg-app.ts`** — update resize handle visibility

   The bottom resize handle should be visible when `bottomPanel !== 'none'` (regardless of which tab). Update `_updateJsonHandle` → `_updateBottomHandle`:

   ```ts
   private _updateBottomHandle(panel: BottomPanel): void {
     const handle = this.shadowRoot?.getElementById('resize-bottom');
     if (handle) handle.classList.toggle('visible', panel !== 'none');
   }
   ```

   Update `onStateChange` to react to `SET_BOTTOM_PANEL` action (instead of `TOGGLE_JSON_PANEL`).

9. **`src/interact/InteractManager.ts`** — expose stage element, add pause/resume

   Add:

   ```ts
   export function getStageElement(): HTMLElement | null {
     return stageEl;
   }
   export function pauseInteract(): void {
     /* destroy current instance, set paused flag */
   }
   export function resumeInteract(): void {
     /* clear paused flag, re-apply config */
   }
   ```

   When `paused`, the state-change listener skips `apply()`. This prevents Interact from recreating animations while the timeline has control.

10. **`src/main.ts`** — register timeline panel, add to DOM

    ```ts
    import './components/timeline/pg-timeline-panel';
    ```

    Add `<pg-timeline-panel></pg-timeline-panel>` as a child of `<pg-app>`, after `<pg-json-panel>`. Both share the `json` grid area.

**File structure additions:**

```
    timeline/
      TimelineEngine.ts              ← WAAPI animation creation, playback, scrubbing
    components/
      timeline/
        pg-timeline-panel.ts         ← timeline UI: transport, tracks, ruler, playhead
```

**Verification**: Pick "Card" → add a hover interaction on `card` with a Time effect (FadeIn, 500ms, 200ms delay) → add a second Time effect (scale keyframes, 800ms, no delay) → click "Timeline" button in toolbar → bottom panel opens showing timeline tab → two track lanes visible: "FadeIn" bar starts at 200ms and spans to 700ms, "scale" bar starts at 0ms and spans to 800ms → time ruler shows ticks from 0ms to 800ms → click Play → playhead moves left to right, track bars fill with progress color as playhead crosses them, card on stage animates (fades in after 200ms, scales over 800ms) → click Pause → playhead stops, animations freeze mid-progress → drag playhead to 400ms → card shows its state at that moment → click Stop → playhead jumps to 0, animations reset → click a track label → that effect is selected in the inspector → switch to "JSON" tab → JSON panel shows, timeline hidden → switch back to "Timeline" → tracks rebuild from current config → close bottom panel → Interact resumes normal trigger-based preview.

---

## Critical Files Reference

| File                                     | Purpose                                                 |
| ---------------------------------------- | ------------------------------------------------------- |
| `packages/interact/src/types.ts`         | All InteractConfig, Effect, Trigger types               |
| `packages/interact/src/core/Interact.ts` | `Interact.create()`, `.destroy()`, `.registerEffects()` |
| `packages/interact/src/web/index.ts`     | Web entry point, `defineInteractElement`                |
| `packages/motion-presets/src/index.ts`   | All preset exports by category                          |
| `apps/demo/vite.config.ts`               | Reference for Vite alias pattern                        |
| `apps/demo/tsconfig.json`                | Reference for tsconfig paths pattern                    |

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
