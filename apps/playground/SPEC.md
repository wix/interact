# Interact Playground — Specification

> A visual editor for authoring `InteractConfig` objects. Users select pre-made HTML/CSS components, wire up interactions and effects through a GUI, and produce valid configuration JSON for the `@wix/interact` library.

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Application Layout](#application-layout)
- [Component Library](#component-library)
- [State Management](#state-management)
- [Interaction Editing](#interaction-editing)
- [Effect System](#effect-system)
- [Conditions](#conditions)
- [Sequences](#sequences)
- [Easing Picker](#easing-picker)
- [Scroll Preview](#scroll-preview)
- [Timeline Panel](#timeline-panel)
- [JSON Panel](#json-panel)
- [Import / Export](#import--export)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Interact Integration](#interact-integration)
- [CSS Architecture](#css-architecture)
- [File Structure](#file-structure)

---

## Overview

The Interact Playground is a standalone developer tool within the `@wix/interact` monorepo. It provides a GUI for:

1. **Selecting** a pre-made website component (card, carousel, hero section, etc.)
2. **Authoring** interactions — choosing trigger types, source/target elements, effects, conditions, and sequences
3. **Previewing** animations live on the stage via the Interact runtime
4. **Inspecting** the resulting `InteractConfig` JSON for use in production
5. **Previewing** animation timelines with transport controls and scrubbing

The output is always a valid `InteractConfig` object that can be consumed by `@wix/interact`.

**Package**: `@wix/interact-playground` (private, not published)
**Location**: `apps/playground/`
**Dev server**: `http://localhost:4175`

---

## Technology Stack

| Concern           | Choice                                                                    |
| ----------------- | ------------------------------------------------------------------------- |
| Language          | TypeScript                                                                |
| UI framework      | Native Web Components (Custom Elements + Shadow DOM)                      |
| Build tool        | Vite 7                                                                    |
| Animation runtime | `@wix/interact/web` (custom elements entry point) + `@wix/motion-presets` |
| State             | Custom Redux-style store (`EventTarget` + pure reducer)                   |
| Styling           | CSS Layers + CSS Custom Properties, per-component `adoptedStyleSheets`    |

No framework dependencies (React, Vue, etc.). All UI is built with native custom elements extending an abstract `BaseComponent` class.

---

## Application Layout

The app uses a CSS Grid layout with six areas:

```
┌───────────────────────────────────────────────────────────────────┐
│                          Toolbar                                  │
│  [Component ▼]                  [Import] [Export] [JSON] [⏱] [×] │
├───────────┬──────────────────────────────┬────────────────────────┤
│           │                              │                        │
│  Sidebar  │           Stage              │      Inspector         │
│  260px    │        (flexible)            │        320px           │
│           │                              │                        │
├───────────┴──── resize handle ───────────┴────────────────────────┤
│               Bottom Panel (JSON or Timeline)                     │
│                        240px                                      │
└───────────────────────────────────────────────────────────────────┘
```

- **Toolbar** (`<pg-toolbar>`) — component selector, import/export, panel toggles, clear
- **Sidebar** (`<pg-sidebar>`) — interaction list with add/delete controls
- **Stage** (`<pg-stage>`) — live preview of the selected component with `<interact-element>` wrappers
- **Inspector** (`<pg-inspector>`) — context-sensitive editors for the selected interaction/effect
- **Bottom Panel** — tabbed area shared between the JSON editor and Timeline panel

Panel widths (sidebar, inspector) and the bottom panel height are resizable via drag handles on the dividers.

### Component Tree

```
<pg-app>
  <pg-toolbar>
    <pg-component-selector slot="component-selector">
  <pg-sidebar>
    <pg-interaction-list>
  <pg-stage>
  <pg-inspector>
    <pg-interaction-editor>
    <pg-effect-editor>
    <pg-sequence-editor>
    <pg-condition-editor>
  <pg-json-panel>
  <pg-timeline-panel>
```

---

## Component Library

Eight pre-made HTML/CSS website components are available for selection. Each is a self-contained module exporting an HTML template, scoped CSS, and metadata describing its animatable elements via `data-interact-key` targets.

| Component      | Description                                  | Interact Keys                                         |
| -------------- | -------------------------------------------- | ----------------------------------------------------- |
| `card`         | Image, title, text, CTA button               | `card`, `card-image`, `card-title`, `card-cta`        |
| `card-list`    | Vertical list of cards                       | `card-list`, `card-list-item` (list)                  |
| `card-grid`    | 2–3 column responsive grid of cards          | `card-grid`, `card-grid-item` (list)                  |
| `hero-section` | Full-width section with image, title, text   | `hero`, `hero-image`, `hero-title`, `hero-text`       |
| `figure`       | Image with caption                           | `figure`, `figure-image`, `figure-caption`            |
| `header`       | Heading text with subtitle                   | `header`, `header-title`, `header-subtitle`           |
| `nav-menu`     | Horizontal list of text anchors              | `nav-menu`, `nav-menu-item` (list)                    |
| `carousel`     | Horizontal image carousel with title overlay | `carousel`, `carousel-slide` (list), `carousel-title` |

### Key Types

Each component declares its keys as `ComponentKey` objects:

```ts
interface ComponentKey {
  key: string; // data-interact-key value
  label: string; // Display name in the UI
  isList?: boolean; // True for repeated/list elements
  parentKey?: string; // For list items: the parent's interact key
  listContainer?: string; // CSS selector for the list container
  listItemSelector?: string; // CSS selector for items within it
}
```

### interact-element Wrapping Rules

- **Unique keys** (e.g., `card`, `hero-title`) — wrapped with `<interact-element data-interact-key="...">`. The visual element is the first child. `display: contents` on the wrapper prevents layout disruption.
- **List keys** (e.g., `card-list-item`, `nav-menu-item`) — NOT wrapped individually. Discovered via `listContainer` / `listItemSelector` on the parent interaction.
- List selectors use CSS class selectors (`.card-list-item`) rather than `[data-interact-key]` attribute selectors, since the attribute lives on the `<interact-element>` wrapper, not the inner element.
- When a user selects a list item key, `interaction.key` is set to the **parent** key with `listContainer`/`listItemSelector` on the interaction.

### Switching Components

Changing the selected component replaces the stage content entirely, resets all interactions and selections, and produces a fresh empty `InteractConfig`.

---

## State Management

### Store

`PlaygroundStore` extends `EventTarget` and implements a Redux-style pattern:

- **`getState()`** — returns a readonly snapshot of `PlaygroundState`
- **`dispatch(action)`** — runs the action through a pure reducer, emits a `'state-change'` CustomEvent
- **`canUndo`** — whether the undo stack has entries

### State Shape

```ts
interface PlaygroundState {
  config: InteractConfig; // The serializable output
  activeComponentId: string; // Which library component is on stage
  selectedInteractionIndex: number | null; // Currently selected interaction
  selectedEffectId: string | null; // Currently selected effect
  selectedEffectContext: EffectContext | null; // Where the selected effect's inline ref lives
  bottomPanel: 'none' | 'json' | 'timeline'; // Which bottom panel is open
  scrollPreview: ScrollPreviewState; // Scroll preview UI state (not in config)
}
```

`EffectContext` tracks whether the selected effect's inline ref lives in `interaction.effects[]` or `sequence.effects[]`:

```ts
type EffectContext =
  | { source: 'interaction' }
  | { source: 'sequence'; sequenceId: string; effectIndex: number };
```

### Actions

| Action               | Payload                          | Purpose                                             |
| -------------------- | -------------------------------- | --------------------------------------------------- |
| `SELECT_COMPONENT`   | `string` (component ID)          | Switch the stage component, reset config            |
| `SET_CONFIG`         | `InteractConfig`                 | Replace entire config (import, JSON edit)           |
| `RESET_CONFIG`       | —                                | Clear all interactions/effects                      |
| `ADD_INTERACTION`    | —                                | Append a new interaction with default hover trigger |
| `REMOVE_INTERACTION` | `number` (index)                 | Delete an interaction                               |
| `UPDATE_INTERACTION` | `{ index, data }`                | Patch an interaction's properties                   |
| `SELECT_INTERACTION` | `number \| null`                 | Set the active interaction for the inspector        |
| `ADD_EFFECT`         | `{ id, effect }`                 | Add a new effect to the config                      |
| `UPDATE_EFFECT`      | `{ id, effect }`                 | Update an effect's properties                       |
| `REMOVE_EFFECT`      | `string` (effect ID)             | Delete an effect and all references                 |
| `SELECT_EFFECT`      | `{ id, context? }`               | Set the active effect and its context               |
| `ADD_CONDITION`      | `{ id, condition }`              | Add a condition to the config                       |
| `UPDATE_CONDITION`   | `{ id, condition }`              | Update a condition                                  |
| `REMOVE_CONDITION`   | `string` (condition ID)          | Delete a condition and strip references             |
| `ADD_SEQUENCE`       | `{ id, sequence }`               | Add a sequence to the config                        |
| `UPDATE_SEQUENCE`    | `{ id, sequence }`               | Update a sequence                                   |
| `REMOVE_SEQUENCE`    | `string` (sequence ID)           | Delete a sequence                                   |
| `SET_BOTTOM_PANEL`   | `'none' \| 'json' \| 'timeline'` | Toggle bottom panel visibility/tab                  |
| `SET_SCROLL_PREVIEW` | `Partial<ScrollPreviewState>`    | Update scroll preview UI state                      |
| `UNDO`               | —                                | Revert to the previous state                        |

### Undo System

The store maintains a stack of up to 50 previous states. Only config-modifying actions are undoable (UI-only actions like selection changes are not pushed to the undo stack). `Ctrl/Cmd+Z` triggers undo.

---

## Interaction Editing

### Interaction Editor (`<pg-interaction-editor>`)

Shown in the inspector when an interaction is selected. Provides:

1. **Source Element** dropdown — selects which element listens for the trigger. Sets `interaction.key`. Populated from the active component's `ComponentKey[]` list. List item keys are resolved to their parent key with `listContainer`/`listItemSelector`.
2. **Trigger Type** dropdown — selects the event that fires the animation.

### Supported Trigger Types

| Trigger        | Description                       | Configurable Params                                                                                           |
| -------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `hover`        | Mouse enter/leave                 | Behavior: `type` (once/repeat/alternate/state) or `method` (add/remove/toggle/clear) depending on effect type |
| `click`        | Mouse click                       | Same behavior toggle as hover                                                                                 |
| `activate`     | Focus + click combined            | Same behavior toggle as hover                                                                                 |
| `interest`     | Hover + focus combined            | Same behavior toggle as hover                                                                                 |
| `viewEnter`    | Element enters the viewport       | `type` (once/repeat/alternate/state), `threshold` (0–1 slider), `inset`                                       |
| `viewProgress` | Scroll progress through viewport  | No trigger params (scroll preview controls shown instead)                                                     |
| `pointerMove`  | Mouse movement tracking           | `hitArea` (root/self), `axis` (x/y)                                                                           |
| `pageVisible`  | Page visibility change            | —                                                                                                             |
| `animationEnd` | After another animation completes | —                                                                                                             |

### Trigger Editor (`<pg-trigger-editor>`)

Renders dynamic parameter forms based on the selected trigger type. Key behavior:

- **Pointer triggers** (`hover`/`click`/`activate`/`interest`) — behavior dropdown adapts to effect type:
  - Time effects: shows `PointerTriggerParams.type` values (`once` / `repeat` / `alternate` / `state`)
  - Transition effects: shows `StateParams.method` values (`add` / `remove` / `toggle` / `clear`)
  - Switching effect types auto-migrates params between `type` and `method`
- **Scroll triggers** (`viewEnter`/`viewProgress`) — auto-enable scroll preview mode on the stage
- Number/text inputs use `change` events; range sliders use `input` for real-time feedback

---

## Effect System

### Effect Editor (`<pg-effect-editor>`)

Manages the effects for the selected interaction. Provides:

1. **Effect list** — shows all effects on the interaction with add/remove controls
2. **Target Element** dropdown — selects which element gets animated. Sets the inline ref's `key`/`listContainer`/`listItemSelector` on `interaction.effects[i]`. Defaults to "Same as source" (cascades to `interaction.key`).
3. **Effect type tabs** — Time, Scrub, or Transition (filtered by trigger compatibility)

### Effect Type Constraints by Trigger

| Trigger                                     | Allowed Effect Types |
| ------------------------------------------- | -------------------- |
| `hover` / `click` / `activate` / `interest` | Time, Transition     |
| `viewEnter`                                 | Time only            |
| `viewProgress` / `pointerMove`              | Scrub only           |

When the trigger changes, incompatible effects are auto-converted to the trigger's default type.

### Target Element Cascade

The Interact runtime resolves target elements in this priority order:

1. `interaction.effects[i].key` (inline ref — checked first)
2. `config.effects[effectId].key` (top-level effect — fallback)
3. `interaction.key` (final fallback — same element as source)

The playground stores target selection properties on the **inline ref** to avoid conflicts with the top-level effect's animation properties.

### Time Effect Editor (`<pg-time-effect-editor>`)

For event-triggered animations (hover, click, viewEnter, etc.):

- **Animation Source** toggle: `Named Effect` or `Keyframes` (radio buttons)
  - Named Effect → shows `<pg-named-effect-picker>`
  - Keyframes → shows `<pg-keyframe-editor>`
- **Timing properties**: duration (ms), delay (ms), easing (`<pg-easing-picker>`), iterations, alternate (boolean), fill mode, reversed (boolean)

Switching animation source strips the old property and adds a default for the new one.

### Scrub Effect Editor (`<pg-scrub-effect-editor>`)

For scroll/pointer-driven animations:

- **Animation Source** toggle: same Named Effect / Keyframes radio as Time effects
- **Timing properties**: easing, iterations, alternate, fill, reversed
- **Range** (viewProgress only): `rangeStart` / `rangeEnd` with name (entry/exit/contain/cover) + offset (value + unit)
- **Transition params** (pointerMove only): `transitionDuration`, `transitionDelay`, `transitionEasing`, `centeredToTarget`

### Transition Effect Editor (`<pg-transition-effect-editor>`)

For CSS transition-based state changes:

- **Timing section**: shared duration (default 300ms), delay, easing — propagated to all `transitionProperties` entries
- **Properties section**: list of CSS property name + value pairs (e.g., `transform: scale(1.05)`)
- Add/remove property rows; new properties inherit shared timing

### Named Effect Picker (`<pg-named-effect-picker>`)

Browses the `@wix/motion-presets` catalog (~66 presets across 5 categories). Features:

- **Category filtering by trigger + effect type**:
  - Pointer triggers + Time → Entrance, Ongoing
  - `viewProgress` + Scrub → Scroll
  - `pointerMove` + Scrub → Mouse
  - Background scroll → Background Scroll
- **Per-preset parameter controls**: Each preset exposes its configurable parameters with appropriate control types:
  - `select` — direction, shape, range, axis, pivotAxis, spin
  - `number` — perspective, blur, intensity, scale, spins, angle, rotate
  - `boolean` — inverted, staggered, startFromOffScreen
  - `unit-value` — distance, depth (compound: number + unit dropdown)
- Changing the selected preset resets all parameter values

### Keyframe Editor (`<pg-keyframe-editor>`)

For authoring custom `keyframeEffect` animations (`{ name: string; keyframes: Keyframe[] }`):

- **Effect Name** — text input for `keyframeEffect.name`
- **Keyframe cards** — each card has:
  - Optional `offset` (0–1, step 0.01) — shown for 3+ keyframes
  - CSS property/value rows with text inputs
  - Property name autocomplete via `<datalist>` (opacity, transform, background-color, clip-path, filter, border-radius, etc.)
  - Kebab-case input auto-converts to camelCase on blur (Web Animations API requirement)
  - Add/remove property rows (min 1 per keyframe)
- **Add Keyframe** button — appends an empty keyframe
- Remove keyframe button (min 1 keyframe enforced)
- Default: `{ name: 'custom', keyframes: [{ opacity: 0, offset: 0 }] }`
- All inputs use `change` events (not `input`) to avoid focus loss from re-renders

---

## Conditions

### Condition Editor (`<pg-condition-editor>`)

Manages `config.conditions` — rules that gate when interactions or effects apply.

- **Condition types**:
  - `media` — CSS media query (e.g., `(min-width: 768px)`)
  - `container` — CSS container query
  - `selector` — CSS selector condition
- **Predicate input** — text input for the query/selector string
- **Attachment UI** — checkboxes to attach/detach a condition from individual interactions and effects
- Add/remove conditions with auto-generated IDs

---

## Sequences

### Sequence Editor (`<pg-sequence-editor>`)

Manages `config.sequences` — orchestrated groups of effects with stagger timing.

- **Sequence list** — shows all sequences with add/remove controls
- **Per-sequence configuration**:
  - `delay` (ms) — initial delay before the sequence starts
  - `offset` (ms) — stagger offset between consecutive effects
  - `offsetEasing` — easing for the stagger offset
- **Effect list within sequence** — add/remove/reorder effects
- Effect rows are clickable — dispatches `selectEffect(id, { source: 'sequence', sequenceId, effectIndex })` to enable editing the effect's target and properties in the inspector

---

## Easing Picker

### Easing Picker (`<pg-easing-picker>`)

A composite control for selecting and editing CSS easing curves. Three synchronized parts:

#### 1. Preset Dropdown

Grouped by category using `<optgroup>`:

| Category | Presets                                  |
| -------- | ---------------------------------------- |
| Standard | linear, ease, easeIn, easeOut, easeInOut |
| Sine     | sineIn, sineOut, sineInOut               |
| Quad     | quadIn, quadOut, quadInOut               |
| Cubic    | cubicIn, cubicOut, cubicInOut            |
| Quart    | quartIn, quartOut, quartInOut            |
| Quint    | quintIn, quintOut, quintInOut            |
| Expo     | expoIn, expoOut, expoInOut               |
| Circ     | circIn, circOut, circInOut               |
| Back     | backIn, backOut, backInOut               |
| Custom   | User-defined via the SVG editor          |

#### 2. SVG Bezier Curve Editor

Inline SVG (viewBox: `-20 -20 240 240`) visualizing the cubic-bezier curve:

- **Background rect** with subtle grid
- **Diagonal reference line** (linear baseline)
- **Curve path** computed from control points
- **Control point lines** from endpoints to handles
- **Two draggable circle handles** at (x1, y1) and (x2, y2)

**Drag behavior**:

- `pointerdown` → capture pointer, track `pointermove`
- Convert screen coords to SVG coords via `getScreenCTM().inverse()`
- X clamped to [0, 1] (CSS spec); Y unclamped [-0.5, 1.5] (allows overshoot for back/bounce easings)
- Real-time update of path, handles, and lines
- On `pointerup`: emit `change` event with `cubic-bezier(x1, y1, x2, y2)` string
- Auto-detects named presets (within 0.01 tolerance) and updates dropdown

#### 3. Text Input

Editable field showing the raw `cubic-bezier()` value. Parses on blur and syncs SVG + dropdown.

**Bidirectional sync**: Dropdown → SVG + text. SVG drag → dropdown + text. Text blur → SVG + dropdown.

---

## Scroll Preview

When a `viewProgress` or `viewEnter` trigger is selected, the stage automatically enters scroll mode:

- **Auto-activation**: Driven entirely by trigger type — no manual toggle. Selecting any other trigger disables scroll mode.
- **Stage height expansion**: Inner content expands to a configurable multiplier (2–10x) of the container height, with the component centered vertically. `overflow-y: auto` enables scrolling.
- **Sticky mode** (optional): Applies `position: sticky` to the component wrapper:
  - **Sticky top** — offset in px from the top of the scroll container
  - **Sticky bottom** — offset in px from the bottom (setting one clears the other)
- **Stage height multiplier** — range slider controlling scrollable area height

Scroll preview state is stored in `PlaygroundState.scrollPreview` (UI-only, not part of `InteractConfig`):

```ts
interface ScrollPreviewState {
  enabled: boolean; // Auto-managed by trigger type
  stickyTop?: number; // Sticky top offset (px)
  stickyBottom?: number; // Sticky bottom offset (px)
  stageHeight: number; // Height multiplier
}
```

---

## Timeline Panel

### Overview

A togglable bottom panel (`<pg-timeline-panel>`) scoped to the currently selected interaction, showing each effect as a horizontal track with transport controls and a draggable playhead.

### Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ [▶] [⏸] [⏹]  00:00.000 / 02:00.000                               │  ← Transport bar
├───────────┬──────────────────────────────────────────────────────────┤
│           │  0ms    250ms   500ms   750ms   1000ms  1250ms  1500ms │  ← Time ruler
│  LABELS   ├──────────────────────────────────────────────────────────┤
│           │  ┃ (playhead — vertical line, draggable)               │
├───────────┼──────────────────────────────────────────────────────────┤
│  FadeIn   │  ░░░░████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░ │  ← Track bars
│  ScaleUp  │  ░░░░░░░░░░██████████████████████████░░░░░░░░░░░░░░░░ │
│  SlideIn  │  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└───────────┴──────────────────────────────────────────────────────────┘
```

### Transport Controls

- **Play** — resume from current time
- **Pause** — freeze at current time
- **Stop** — pause + seek to 0
- **Time display** — `current / total` in `mm:ss.SSS` format

### Track Visualization

- **Label column** (120px fixed) — effect name/type
- **Timeline column** (flexible, horizontally scrollable) — colored bars positioned by delay/duration relative to total duration
- **Track bar colors**:
  - Time effects: `--pg-color-accent` (indigo)
  - Scrub effects: `--pg-color-success` (green)
  - Transition effects: `--pg-color-accent-hover` (lighter indigo)
  - Sequence effects: `--pg-color-success` (green)
- **Progress overlay** inside each bar shows how much has played

### Playhead

- 2px vertical line spanning the full track area
- Positioned at `(currentTime / totalDuration) * 100%`
- **Draggable**: `pointerdown` → capture → `pointermove` converts X to time → `seekTo(time)`
- **Click-to-seek**: clicking anywhere on the timeline column jumps the playhead

### Clicking a Track

Selects the corresponding effect in the inspector via `selectEffect(effectId, { source: 'interaction' })`.

### Empty States

- No interaction selected: "Select an interaction to preview its timeline"
- No effects: "Add effects or sequences to see the timeline"

### Timeline Engine (`TimelineEngine`)

Creates its own Web Animations API animations, independent of Interact's trigger system:

- **`buildTracks(config, interactionIndex)`** — resolves effects and sequences into `TrackInfo[]` descriptors
- **`createAnimations(tracks)`** — creates paused WAAPI `Animation` objects on stage elements
- **`play()` / `pause()` / `stop()` / `seekTo(timeMs)`** — transport controls
- **`onTick(callback)`** — RAF-driven progress callback for UI updates
- **`currentTime` / `totalDuration` / `isPlaying`** — read-only properties

**Track resolution**:

- Named effects → resolved to keyframes via preset factory functions
- Keyframe effects → used directly
- Transition effects → converted to equivalent keyframes
- Sequence effects → stagger timing: `delay = seqDelay + (effectIndex × seqOffset) + effect.delay`

**InteractManager coordination**: When timeline opens, `pauseInteract()` destroys the Interact instance to prevent trigger conflicts. When it closes, `resumeInteract()` re-applies the config.

### Rebuild Triggers

The timeline rebuilds tracks and recreates animations in response to:
`ADD_EFFECT`, `UPDATE_EFFECT`, `REMOVE_EFFECT`, `ADD_SEQUENCE`, `UPDATE_SEQUENCE`, `REMOVE_SEQUENCE`, `SELECT_INTERACTION`, `UPDATE_INTERACTION`, and other config-modifying actions.

---

## JSON Panel

### JSON Panel (`<pg-json-panel>`)

A togglable bottom panel showing the live `InteractConfig` as formatted JSON:

- **Read mode** — `JSON.stringify(config, null, 2)` displayed in a `<textarea>`
- **Edit mode** — users can edit the JSON directly. On blur: parse → validate → `dispatch(setConfig())`. Reverts on invalid JSON.
- Shares the bottom panel area with the Timeline panel (only one visible at a time)

---

## Import / Export

### Export

Toolbar "Export" button downloads the current `InteractConfig` as a `.json` file via a programmatic `<a>` download.

### Import

Toolbar "Import" button opens a file picker. Selected `.json` file is read, parsed, validated, and applied via `dispatch(setConfig(parsed))`. Replaces the entire config and clears selections.

---

## Keyboard Shortcuts

| Shortcut               | Action                                    |
| ---------------------- | ----------------------------------------- |
| `Delete` / `Backspace` | Remove the currently selected interaction |
| `Ctrl/Cmd + Z`         | Undo last config-modifying action         |

Handled at the `<pg-app>` level via `keydown` listeners.

---

## Interact Integration

### InteractManager

Bridges the playground's config state to the Interact runtime:

- **`initInteractManager()`** — subscribes to store changes, debounces config application by ~100ms
- **`apply(config)`** — destroys the old `Interact` instance, registers all motion presets via `Interact.registerEffects()`, creates a new `Interact.create(config)`
- **`pauseInteract()` / `resumeInteract()`** — destroy/recreate for timeline isolation
- **`setStageElement(el)` / `getStageElement()`** — register the stage for element lookups

**Stale animation cleanup**: After `Interact.destroy()`, all WAAPI animations on stage elements are cancelled via `Element.getAnimations({ subtree: true })`. This prevents `fill: 'both'` animations from persisting styles.

**Shadow DOM reconnection**: Since components render into the stage's Shadow DOM, `InteractManager` explicitly reconnects `<interact-element>` instances in the shadow root after each `Interact.create()` (the library's default `document.querySelectorAll` reconnection doesn't reach into Shadow DOM).

### Preset Registry

Imports all preset categories from `@wix/motion-presets` and exposes:

- **`presetCatalog`** — flat array of `{ name, category }` for all ~66 presets
- **`getPresetsByCategory(allowedCategories?)`** — filtered map for the picker UI
- **`getAllPresets()`** — the full preset module for `Interact.registerEffects()`

Categories: Entrance (19), Ongoing (14), Scroll (19), Mouse (9), Background Scroll (5).

---

## CSS Architecture

### Layer System

All styles are organized into CSS `@layer` declarations, imported in strict order in `main.ts`:

```css
@layer base, layout, theme, components, utilities, states;
```

| Layer        | Purpose                                                            | File                   |
| ------------ | ------------------------------------------------------------------ | ---------------------- |
| `base`       | CSS reset, box-sizing, typography defaults                         | `styles/base.css`      |
| `layout`     | App grid, panel sizing                                             | `styles/layout.css`    |
| `theme`      | All CSS custom properties (colors, spacing, radii, shadows, etc.)  | `styles/theme.css`     |
| `components` | Per-component styles (via Shadow DOM `adoptedStyleSheets`)         | Per-component CSS      |
| `utilities`  | Helper classes (`.sr-only`, `.truncate`, `.flex-center`, `.gap-*`) | `styles/utilities.css` |
| `states`     | Interactive states (`:hover`, `:focus-visible`, `[aria-selected]`) | `styles/states.css`    |

### Design Tokens (theme.css)

All visual tokens are CSS custom properties under the `--pg-` namespace:

- **Colors**: 6 background levels, 4 text colors, accent (indigo), border, danger (red), success (green)
- **Spacing**: 4px–40px scale (`--pg-space-1` through `--pg-space-10`)
- **Typography**: Inter (UI) + JetBrains Mono (code), 11–18px sizes, 3 weights
- **Layout**: toolbar 48px, sidebar 260px, inspector 320px, JSON panel 240px
- **Borders & Radii**: 4–12px radius scale
- **Shadows**: sm/md/lg depth levels
- **Transitions**: fast (100ms), normal (200ms), slow (300ms)
- **Z-index**: panel (10), dropdown (20), tooltip (30), modal (40)

### Component Styling Pattern

Each component adopts the theme stylesheet plus its own component-layer stylesheet via Shadow DOM `adoptedStyleSheets`:

```ts
// In BaseComponent constructor
const themeSheet = new CSSStyleSheet();
themeSheet.replaceSync(themeCSS);
const componentSheet = new CSSStyleSheet();
componentSheet.replaceSync(componentCSS);
this.shadowRoot.adoptedStyleSheets = [themeSheet, componentSheet];
```

### Shared Control Styles (controls.css)

Reusable form control classes:

- `.pg-input` — text input (28px height, themed background/border/focus)
- `.pg-select` — styled dropdown
- `.pg-button` — primary accent button with `.pg-button--secondary`, `.pg-button--danger`, `.pg-button--small`, `.pg-button--icon` variants
- `.pg-label` — uppercase label text
- `.pg-field` — vertical label + input group
- `.pg-field-row` — horizontal field layout

---

## File Structure

```
apps/playground/
├── index.html                          # Minimal HTML entry, loads src/main.ts
├── package.json                        # @wix/interact-playground (private)
├── tsconfig.json
├── vite.config.ts                      # Aliases for local packages, port 4175
├── SPEC.md                             # This file
└── src/
    ├── main.ts                         # CSS imports, component registration, DOM mount
    ├── types.ts                        # PlaygroundState, Action union, EffectContext
    ├── vite-env.d.ts                   # CSS ?inline module declarations
    │
    ├── store/
    │   ├── PlaygroundStore.ts          # EventTarget-based store with undo stack
    │   ├── actions.ts                  # Action creator functions
    │   └── reducer.ts                  # Pure reducer (state, action) → state
    │
    ├── library/                        # Pre-made component library
    │   ├── types.ts                    # ComponentDefinition, ComponentKey interfaces
    │   ├── index.ts                    # Registry of all 8 components
    │   ├── card/
    │   │   ├── template.ts
    │   │   └── card.css
    │   ├── card-list/
    │   │   ├── template.ts
    │   │   └── card-list.css
    │   ├── card-grid/
    │   │   ├── template.ts
    │   │   └── card-grid.css
    │   ├── hero-section/
    │   │   ├── template.ts
    │   │   └── hero-section.css
    │   ├── figure/
    │   │   ├── template.ts
    │   │   └── figure.css
    │   ├── header/
    │   │   ├── template.ts
    │   │   └── header.css
    │   ├── nav-menu/
    │   │   ├── template.ts
    │   │   └── nav-menu.css
    │   └── carousel/
    │       ├── template.ts
    │       └── carousel.css
    │
    ├── components/
    │   ├── base/
    │   │   └── BaseComponent.ts        # Abstract: Shadow DOM, store sub, adoptedStyleSheets
    │   ├── app/
    │   │   └── pg-app.ts               # Root grid layout, resize handles, keyboard shortcuts
    │   ├── toolbar/
    │   │   ├── pg-toolbar.ts           # Top bar: import/export, panel toggles, clear
    │   │   └── pg-component-selector.ts # Library component dropdown
    │   ├── sidebar/
    │   │   ├── pg-sidebar.ts           # Left panel container
    │   │   └── pg-interaction-list.ts  # Interaction list with add/delete
    │   ├── stage/
    │   │   └── pg-stage.ts             # Live preview, scroll mode, interact-element wrappers
    │   ├── inspector/
    │   │   ├── pg-inspector.ts         # Right panel shell, context-sensitive
    │   │   ├── pg-interaction-editor.ts # Source element + trigger type
    │   │   ├── pg-trigger-editor.ts    # Dynamic trigger param forms
    │   │   ├── pg-effect-editor.ts     # Target element + effect type tabs + list
    │   │   ├── pg-time-effect-editor.ts # Duration, easing, named/keyframe source
    │   │   ├── pg-scrub-effect-editor.ts # Range, transition, named/keyframe source
    │   │   ├── pg-transition-effect-editor.ts # CSS transition properties editor
    │   │   ├── pg-named-effect-picker.ts # Preset browser with per-preset param controls
    │   │   ├── pg-keyframe-editor.ts   # Custom keyframe list editor
    │   │   ├── pg-sequence-editor.ts   # Sequence orchestration
    │   │   └── pg-condition-editor.ts  # Media/container/selector conditions
    │   ├── json-panel/
    │   │   └── pg-json-panel.ts        # Bottom panel: live JSON view/edit
    │   ├── timeline/
    │   │   └── pg-timeline-panel.ts    # Bottom panel: timeline tracks, transport, playhead
    │   └── shared/
    │       ├── pg-select.ts            # Reusable dropdown control
    │       ├── pg-number-input.ts      # Number input with optional range slider
    │       ├── pg-text-input.ts        # Text input with label
    │       ├── pg-toggle.ts            # Boolean toggle switch
    │       └── pg-easing-picker.ts     # Preset dropdown + SVG bezier editor + text input
    │
    ├── interact/
    │   ├── InteractManager.ts          # Interact lifecycle, debounced apply, shadow DOM reconnect
    │   └── preset-registry.ts          # Flat catalog from @wix/motion-presets
    │
    ├── timeline/
    │   └── TimelineEngine.ts           # WAAPI animation creation, playback, scrubbing
    │
    ├── utils/
    │   ├── id.ts                       # Auto-incrementing ID generator
    │   ├── dom.ts                      # Template/DOM helpers
    │   └── bezier.ts                   # Cubic-bezier math: parse, format, preset match, sampling
    │
    └── styles/
        ├── layers.css                  # @layer order declaration
        ├── base.css                    # CSS reset
        ├── theme.css                   # All CSS custom properties
        ├── layout.css                  # App grid layout
        ├── controls.css                # Shared form control styles
        ├── utilities.css               # Utility classes
        └── states.css                  # Interactive state styles
```
