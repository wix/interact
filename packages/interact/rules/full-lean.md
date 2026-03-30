# @wix/interact — Rules

Declarative configuration-driven interaction library. Binds animations to triggers via JSON config.

## Table of Contents

- [Common Pitfalls](#common-pitfalls)
- [Quick Start](#quick-start)
- [Element Binding](#element-binding)
- [Config Structure](#config-structure)
- [Interactions](#interactions)
- [Triggers](#triggers)
  - [hover / click](#hover--click)
  - [viewEnter](#viewenter)
  - [viewProgress](#viewprogress)
  - [pointerMove](#pointermove)
  - [animationEnd](#animationend)
- [Effects](#effects)
  - [Time-based Effect](#time-based-effect)
  - [Scroll / Pointer-driven Effect](#scroll--pointer-driven-effect)
  - [Transition Effect](#transitioneffect-css-style-toggle)
  - [Animation Payloads](#animation-payloads)
- [Sequences](#sequences)
- [Conditions](#conditions)
- [FOUC Prevention](#fouc-prevention)
- [Element Resolution](#element-resolution)
- [Static API](#static-api)

---

## Common Pitfalls

Each item here is CRITICAL — ignoring any of them will break animations.

- **CRITICAL — `overflow: hidden` breaks `viewProgress`**: Replace with `overflow: clip` on all ancestors between source and scroll container. In Tailwind, replace `overflow-hidden` with `overflow-clip`.
- **CRITICAL**: When using `viewEnter` trigger and source (trigger) and target (effect) elements are the **same element**, use ONLY `type: 'once'`. For all other types (`'repeat'`, `'alternate'`, `'state'`) MUST use **separate** source and target elements — animating the observed element itself can cause it to leave/re-enter the viewport, leading to rapid re-triggers or the animation never firing.
- **CRITICAL - Hit-area shift**: When a hover effect changes the size or position of the hovered element (e.g., `transform: scale(…)`), MUST use a separate source and target elements. Otherwise the hit-area shifts, causing rapid enter/leave.
  events and flickering. Use `selector` to target a child element, or set the effect's `key` to a different element.
- **CRITICAL**: For `pointerMove` trigger MUST AVOID using the same element as both source and target with `hitArea: 'self'` and effects that change size or position (e.g. `transform: translate(…)`, `scale(…)`). The transform shifts the hit area, causing jittery re-entry cycles. Instead, use `selector` to target a child element for the animation.
- **CRITICAL — Do NOT guess preset options**: If you don't know the expected type/structure for a `namedEffect` param, omit it — rely on defaults rather than guessing.
- **Reduced motion**: Use conditions to provide gentler alternatives (shorter durations, fewer transforms, no perpetual motion) for users who prefer reduced motion. You can also set `Interact.forceReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches` to force a global reduced-motion behavior programmatically.
- **Perspective**: Prefer `transform: perspective(...)` inside keyframes. Use the CSS `perspective` property only when multiple children share the same `perspective-origin`.

---

## Quick Start

```bash
npm install @wix/interact @wix/motion-presets
```

Create the full config up-front and pass it in a single `create` call. Subsequent calls create new `Interact` instances. When creating multiple instances, each manages its own set of interactions independently — use separate instances for isolated component scopes or lazy-loaded sections.

**Web (Custom Elements):**

```ts
import { Interact } from '@wix/interact/web';
const instance = Interact.create(config);
```

The `config` object is an `InteractConfig` containing `interactions` (required), and optionally shared `effects`, `sequences`, and `conditions`.

**React:**

```ts
import { Interact } from '@wix/interact/react';
const instance = Interact.create(config);
```

**Vanilla JS:**

```ts
import { Interact } from '@wix/interact';
const instance = Interact.create(config);
instance.add(element, 'hero'); // bind after element exists in DOM
instance.remove('hero'); // unregister
```

**CDN (no build tools):**

```html
<script type="module">
  import { Interact } from 'https://esm.sh/@wix/interact';
  Interact.create(config);
</script>
```

**Registering presets** — MUST be called before calling `Interact.create()` with usage of `namedEffect`:

```ts
import * as presets from '@wix/motion-presets';
Interact.registerEffects(presets);
```

Or selectively:

```ts
import { FadeIn, ParallaxScroll } from '@wix/motion-presets';
Interact.registerEffects({ FadeIn, ParallaxScroll });
```

---

## Element Binding

**CRITICAL:** Do NOT add observers/event listeners manually. The runtime binds triggers and effects via element keys.

### Web: `<interact-element>`

- MUST set `data-interact-key` to a unique value.
- MUST contain at least one child element (the library targets `.firstElementChild`).
- If an effect targets a different element, that element also needs its own `<interact-element>`.

```html
<interact-element data-interact-key="hero">
  <section class="hero">...</section>
</interact-element>
```

### React: `<Interaction>` component

- MUST set `tagName` to the replaced element's HTML tag.
- MUST set `interactKey` to a unique string.

```tsx
import { Interaction } from '@wix/interact/react';

<Interaction tagName="section" interactKey="hero" className="hero">
  ...
</Interaction>;
```

---

## Config Structure

```ts
type InteractConfig = {
  interactions: Interaction[]; // REQUIRED
  effects?: Record<string, Effect>; // reusable effects referenced by effectId
  sequences?: Record<string, SequenceConfig>; // reusable sequences by sequenceId
  conditions?: Record<string, Condition>; // named conditions; keys are condition ids
};
```

All cross-references (by id) MUST point to existing entries. Element keys MUST be stable for the config's lifetime.

---

## Interactions

Each interaction maps a source element + trigger to one or more effects.

**Multiple effects per interaction:** A single interaction can contain multiple effects in its `effects` array. All effects in the same interaction share the same trigger — they all fire together when the trigger activates. Use this to apply different animations to different targets from the same trigger event, rather than creating separate interactions with duplicate trigger configs.

```ts
{
  key: string;                   // REQUIRED — matches data-interact-key / interactKey - the root element
  trigger: TriggerType;          // REQUIRED
  params?: TriggerParams;        // trigger-specific options
  effects?: (Effect | EffectRef)[]; // possible to add multiple effects for same trigger
  sequences?: (SequenceConfig | SequenceConfigRef)[]; // possible to add multiple sequences for same trigger
  conditions?: string[];         // ids referencing the top-level conditions map; all must pass
  selector?: string;             // optional - CSS selector to refine source element selection within the root element
  listContainer?: string;        // optional — CSS selector for list container
  listItemSelector?: string;     // optional — CSS selector to filter which children of listContainer are observed as sources
}
```

At least one of `effects` or `sequences` MUST be provided.

For most use cases, `key` alone is sufficient for both source and target resolution. The `selector`, `listContainer`, and `listItemSelector` fields are only needed for advanced patterns (lists, delegated triggers, child targeting). See [Element Resolution](#element-resolution) for details.

---

## Triggers

| Trigger        | Description                     | Accessible variant                          |
| :------------- | :------------------------------ | :------------------------------------------ |
| `hover`        | Mouse enter/leave               | `interest` (hover + focusin/out)            |
| `click`        | Mouse click                     | `activate` (click + keydown on Enter/Space) |
| `viewEnter`    | Element enters viewport         | —                                           |
| `viewProgress` | Scroll-driven (ViewTimeline)    | —                                           |
| `pointerMove`  | Continuous pointer motion       | —                                           |
| `animationEnd` | Fires after an effect completes | —                                           |

### hover / click

Use `type` (via `PointerTriggerParams`) for keyframe/named effects, `method` (via `StateParams`) for transitions. Do NOT use both `type` and `method` together.

**PointerTriggerParams** (`type`):

| Type                    | hover behavior                          | click behavior                   |
| :---------------------- | :-------------------------------------- | :------------------------------- |
| `'alternate'` (default) | Play on enter, reverse on leave         | Alternate play/reverse per click |
| `'repeat'`              | Play on enter, stop and rewind on leave | Restart per click                |
| `'once'`                | Play once on first enter only           | Play once on first click only    |
| `'state'`               | Play on enter, pause on leave           | Toggle play/pause per click      |

**StateParams** (`method`) — for `TransitionEffect`:

| Method               | hover behavior                                  | click behavior               |
| :------------------- | :---------------------------------------------- | :--------------------------- |
| `'toggle'` (default) | Add style state on enter, remove on leave       | Toggle style state per click |
| `'add'`              | Add style state on enter; leave does NOT remove | Add style state on click     |
| `'remove'`           | Remove style state on enter                     | Remove style state on click  |
| `'clear'`            | Clear/reset all style states on enter           | Clear/reset all style states |

### viewEnter

```ts
params: {
  type: 'once' | 'repeat' | 'alternate' | 'state';
  threshold?: number;  // 0–1, IntersectionObserver threshold
  inset?: string;      // like view-timeline-inset, e.g. '-100px' or '-50px 0px'
}
```

**CRITICAL:** When source and target are the **same element**, MUST use `type: 'once'`. For `repeat` / `alternate` / `state`, ALWAYS use **separate** source and target elements — animating the observed element can cause it to leave/re-enter the viewport, causing rapid re-triggers.

### viewProgress

Scroll-driven animations using native `ViewTimeline`. Progress is driven by scroll position. Control the range via `rangeStart`/`rangeEnd` on the effect (see [Scroll / Pointer-driven Effect](#scroll--pointer-driven-effect)).

`viewProgress` has no trigger params. Range configuration (`rangeStart`/`rangeEnd`) is on the effect, not on the trigger.

**CRITICAL:** Replace ALL `overflow: hidden` with `overflow: clip` on every element between the trigger source and the scroll container. `overflow: hidden` creates a new scroll context that breaks ViewTimeline. In Tailwind replace `overflow-hidden` with `overflow-clip`.

### pointerMove

```ts
params: {
  hitArea?: 'self' | 'root';  // 'self' = source element bounds, 'root' = viewport
  axis?: 'x' | 'y';           // restricts tracking to a single axis (for keyframeEffect)
}
```

**Rules:**

- Source element MUST NOT have `pointer-events: none`.
- MUST NOT use the same element as both source and target with size or position effects — use `selector` to target a child or set a different `key`.
- Use a `(hover: hover)` media condition to disable on touch-only devices. On touch-only devices prefer `viewEnter` or `viewProgress` fallbacks.
- For 2D effects, use `namedEffect` mouse presets or `customEffect`. `keyframeEffect` only supports a single axis.
- For independent 2-axis control with keyframes, use two separate interactions (one `axis: 'x'`, one `axis: 'y'`) with `composite: 'add'` or `'accumulate'` on the second effect.

**`centeredToTarget`** — set `true` to remap the `0–1` progress range so that `0.5` progress corresponds to the center of the target element. Use when source and target are different elements, or when `hitArea: 'root'` is used, so that the pointer resting over the target center produces 50% progress regardless of position in viewport.

**Progress object** (for `customEffect`):

```ts
{ x: number; y: number; v?: { x: number; y: number }; active?: boolean }
// x, y: 0–1 normalized position within hit area
// v: velocity vector (unbounded, typically -1 to 1 range at moderate speed; 0 = stationary)
// active: whether pointer is within the active hit area
```

### animationEnd

```ts
params: {
  effectId: string;
} // the effect to wait for
```

Fires when the specified effect completes on the source element. Useful for chaining sequences.

---

## Effects

Each effect applies a visual change to a target element. An effect is either inline or referenced by `effectId` from the top-level `effects` registry (`EffectRef`). An `EffectRef` inherits all properties from the registry entry, and can override any of them (e.g. `key`, `duration`, `easing`, `fill`, etc.) — not just the target. See [Element Resolution](#element-resolution) for how the target is determined.

### Common fields

```ts
{
  key?: string;              // target element key; omit to target the source
  effectId?: string;         // reference to effects registry (EffectRef)
  conditions?: string[];     // ids referencing the top-level conditions map; all must pass
  selector?: string;         // CSS selector to refine target
  listContainer?: string;
  listItemSelector?: string; // optional — filter which children of listContainer are selected
  composite?: 'replace' | 'add' | 'accumulate';
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
}
```

**`fill` guidance:**

- `'both'` — use for scroll-driven (`viewProgress`), pointer-driven (`pointerMove`), and toggling effects (`hover`/`click` with `alternate`, `repeat`, or `state` type).
- `'backwards'` — use for entrance animations with `type: 'once'` when the element's own CSS already matches the final keyframe (applies the initial keyframe during any `delay`).

**`composite`** — same as CSS's `animation-composition`. Controls how this effect combines with others on the same property (transforms & filters):

- `'replace'` (default): fully replaces prior values.
- `'add'`: concatenates transform/filter functions after any existing ones (e.g. existing `translateX(10px)` + added `translateY(20px)` → both apply).
- `'accumulate'`: merges arguments of matching functions (e.g. `translateX(10px)` + `translateX(20px)` → `translateX(30px)`); non-matching functions concatenate like `'add'`.

### Time-based Effect

Used with `hover`, `click`, `viewEnter`, `animationEnd` triggers.

```ts
{
  duration: number;            // REQUIRED (ms)
  easing?: string;             // CSS easing or named easing (see below)
  delay?: number;              // ms
  iterations?: number;         // >=1 or Infinity; 0 is treated as Infinity
  alternate?: boolean;
  reversed?: boolean;
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
  composite?: 'replace' | 'add' | 'accumulate';
  // + exactly one animation payload (see below)
}
```

**Named easings** from `@wix/motion` (in addition to standard CSS easings):

`'linear'`, `'ease'`, `'ease-in'`, `'ease-out'`, `'ease-in-out'`, `'sineIn'`, `'sineOut'`, `'sineInOut'`, `'quadIn'`, `'quadOut'`, `'quadInOut'`, `'cubicIn'`, `'cubicOut'`, `'cubicInOut'`, `'quartIn'`, `'quartOut'`, `'quartInOut'`, `'quintIn'`, `'quintOut'`, `'quintInOut'`, `'expoIn'`, `'expoOut'`, `'expoInOut'`, `'circIn'`, `'circOut'`, `'circInOut'`, `'backIn'`, `'backOut'`, `'backInOut'`, or any `'cubic-bezier(...)'` / `'linear(...)'` string.

### Scroll / Pointer-driven Effect

Used with `viewProgress` and `pointerMove` triggers.

```ts
{
  rangeStart?: RangeOffset;    // REQUIRED for viewProgress
  rangeEnd?: RangeOffset;      // REQUIRED for viewProgress
  easing?: string;             // CSS easing or named easing (see above)
  iterations?: number;         // NOT Infinity
  alternate?: boolean;
  reversed?: boolean;
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
  composite?: 'replace' | 'add' | 'accumulate';
  centeredToTarget?: boolean;
  transitionDuration?: number; // ms, smoothing on progress jumps (primarily for pointerMove)
  transitionDelay?: number;    // ms (primarily for pointerMove)
  transitionEasing?: 'linear' | 'hardBackOut' | 'easeOut' | 'elastic' | 'bounce';
  // + exactly one animation payload (see below)
}
```

**RangeOffset** — works like CSS's `animation-range`:

```ts
{
  name?: 'entry' | 'exit' | 'contain' | 'cover' | 'entry-crossing' | 'exit-crossing';
  offset?: { value: number; unit: 'percentage' | 'px' | 'vh' | 'vw' }
}
```

| Range name       | Meaning                                                        |
| :--------------- | :------------------------------------------------------------- |
| `entry`          | Element entering viewport                                      |
| `exit`           | Element exiting viewport                                       |
| `contain`        | After `entry` range and before `exit` range                    |
| `cover`          | Full range from `entry` through `contain` and `exit`           |
| `entry-crossing` | From element's leading edge entering to trailing edge entering |
| `exit-crossing`  | From element's leading edge exiting to trailing edge exiting   |

**Sticky container pattern** — for scroll-driven animations inside a stuck `position: sticky` container:

- Tall wrapper: height defines scroll distance (e.g. `300vh` for ~2 viewport-heights of scroll travel).
- Sticky child (`key`) with `position: sticky; top: 0; height: 100vh`: stays fixed while the wrapper scrolls. This is the ViewTimeline source.
- Use `rangeStart/rangeEnd` with `name: 'contain'` to animate only during the stuck phase.

### TransitionEffect (CSS style toggle)

Used with `hover` / `click` triggers. Pair with `StateParams` (`method`).

```ts
// Shared timing for all properties:
{
  transition: {
    duration?: number; delay?: number; easing?: string;
    styleProperties: [{ name: string; value: string }]
  }
}

// Per-property timing:
{
  transitionProperties: [
    { name: string; value: string; duration?: number; delay?: number; easing?: string }
  ]
}
```

CSS property names use **camelCase** (e.g. `'backgroundColor'`, `'borderRadius'`).

### Animation Payloads

Exactly one MUST be provided per time-based or scroll/pointer-driven effect:

1. **`namedEffect`** (preferred) — pre-built presets from `@wix/motion-presets`. GPU-friendly and tuned.

   ```ts
   namedEffect: {
     type: '[PRESET_NAME]',
     // ...optional [PRESET_OPTIONS] as additional properties
   }
   ```

   - `[PRESET_NAME]` — one of the registered preset names (see table below).
   - `[PRESET_OPTIONS]` — optional preset-specific properties spread as additional keys on the object. **CRITICAL:** Do NOT guess option names/types. Omit unknown options and rely on defaults.

   Available presets:

   | Category | Presets                                                                                                                                                                                                                                                                                      |
   | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | Entrance | `FadeIn`, `GlideIn`, `SlideIn`, `FloatIn`, `RevealIn`, `ExpandIn`, `BlurIn`, `FlipIn`, `ArcIn`, `ShuttersIn`, `CurveIn`, `DropIn`, `FoldIn`, `ShapeIn`, `TiltIn`, `WinkIn`, `SpinIn`, `TurnIn`, `BounceIn`                                                                                   |
   | Ongoing  | `Pulse`, `Spin`, `Breathe`, `Bounce`, `Wiggle`, `Flash`, `Flip`, `Fold`, `Jello`, `Poke`, `Rubber`, `Swing`, `Cross`                                                                                                                                                                         |
   | Scroll   | `FadeScroll`, `RevealScroll`, `ParallaxScroll`, `MoveScroll`, `SlideScroll`, `GrowScroll`, `ShrinkScroll`, `TiltScroll`, `PanScroll`, `BlurScroll`, `FlipScroll`, `SpinScroll`, `ArcScroll`, `ShapeScroll`, `ShuttersScroll`, `SkewPanScroll`, `Spin3dScroll`, `StretchScroll`, `TurnScroll` |
   | Mouse    | `TrackMouse`, `Tilt3DMouse`, `Track3DMouse`, `SwivelMouse`, `AiryMouse`, `ScaleMouse`, `BlurMouse`, `SkewMouse`, `BlobMouse`                                                                                                                                                                 |
   - **CRITICAL** — Scroll presets (`*Scroll`) used with `viewProgress` MUST include `range` in options: `'in'` (ends at idle state), `'out'` (starts from idle state), or `'continuous'` (passes through idle). Prefer `'continuous'`.
   - Mouse presets are preferred over `keyframeEffect` for `pointerMove` 2D effects.

2. **`keyframeEffect`** — custom keyframe animations.

   ```ts
   keyframeEffect: { name: '[EFFECT_NAME]', keyframes: [KEYFRAMES] }
   ```

   - `[EFFECT_NAME]` — unique string identifier for this effect.
   - `[KEYFRAMES]` — array of keyframe objects using standard WAAPI format (e.g. `[{ opacity: '0' }, { opacity: '1' }]`). Property names in camelCase.

3. **`customEffect`** — imperative update callback. Use only when CSS-based effects cannot express the desired behavior (e.g., animating SVG attributes, canvas, text content).

   ```ts
   customEffect: [CUSTOM_EFFECT_CALLBACK];
   ```

   - `[CUSTOM_EFFECT_CALLBACK]` — function with signature `(element: Element, progress: number | ProgressObject) => void`. Called on each animation frame.

---

## Sequences

Coordinate multiple effects with staggered timing. Prefer sequences over manual delay stagger.

### Sequence As type

```ts
{
  effects: (Effect | EffectRef)[];      // REQUIRED
  delay?: number;                       // ms before sequence starts
  offset?: number;                      // ms between each child's animation start
  offsetEasing?: string;                // easing curve for staggering offsets
  sequenceId?: string;                  // for caching/referencing
  conditions?: string[];                // ids referencing the top-level conditions map
}
```

### Template

```ts
{
  interactions: [
    {
      key: '[SOURCE_KEY]',
      trigger: '[TRIGGER]',
      params: [TRIGGER_PARAMS],
      sequences: [
        {
          offset: [OFFSET_MS],           // optional
          offsetEasing: '[OFFSET_EASING]', // optional
          delay: [DELAY_MS],             // optional
          effects: [
            // if used `listContainer` each item in the list is a target of a child effect
            {
              effectId: '[EFFECT_ID]',
              listContainer: '[LIST_CONTAINER_SELECTOR]',
            },
            // if multiple effects are given each generated effect is added to the sequence
          ],
        },
      ],
    },
  ],
  effects: {
    '[EFFECT_ID]': {
      // effect definition (namedEffect, keyframeEffect, or customEffect)
    },
  },
}
```

### Variables

- `[SOURCE_KEY]` — identifier matching the element's key (`data-interact-key` for /vanilla, `interactKey` for React).
- `[TRIGGER]` — any trigger for time-based animation effects (e.g., `'viewEnter'`, `'activate'`, `'interest'`).
- `[TRIGGER_PARAMS]` — trigger-specific parameters (e.g., `{ type: 'once', threshold: 0.3 }`).
- `[OFFSET_MS]` — ms between each child's animation start.
- `[OFFSET_EASING]` — easing curve for staggering offsets. One of: `'linear'`, `'quadIn'`, `'quadOut'`, `'sineOut'`, `'cubicIn'`, `'cubicOut'`, `'cubicInOut'`, `'cubic-bezier(...)'`, or `'linear(...)'`.
- `[DELAY_MS]` — optional. Base delay (ms) before the entire sequence starts.
- `[EFFECT_ID]` — string key referencing an entry in the top-level `effects` map.
- `[LIST_CONTAINER_SELECTOR]` — CSS selector for the container whose children will be staggered.

Reusable sequences can be defined in `InteractConfig.sequences` and referenced by `sequenceId`.

---

## Conditions

Named conditions that gate interactions, effects, or sequences.

| Type       | Predicate                                                                 |
| :--------- | :------------------------------------------------------------------------ |
| `media`    | CSS media query condition without `@media` (e.g., `'(min-width: 768px)'`) |
| `selector` | CSS selector; `&` is replaced with the base element selector              |

Attach via `conditions: ['[CONDITION_ID]']` on interactions, effects, or sequences. On an interaction, conditions gate the entire trigger; on an effect, only that specific effect is skipped. All listed conditions must pass.

### Examples

```ts
conditions: {
  'desktop': { type: 'media', predicate: '(min-width: 768px)' },
  'hover-device': { type: 'media', predicate: '(hover: hover)' },
  'reduced-motion': { type: 'media', predicate: '(prefers-reduced-motion: reduce)' },
  'odd-items': { type: 'selector', predicate: ':nth-of-type(odd)' },
}
```

---

## FOUC Prevention

**Problem:** Elements with entrance animations (e.g. `viewEnter` + `type: 'once'` with `FadeIn`) start in their final visible state. Before the animation framework initializes and applies the starting keyframe (e.g. `opacity: 0`), the element is briefly visible at full opacity — causing a flash of unstyled/un-animated content (FOUC).

**Solution:** Two things are required — both MUST be present:

1. **Generate critical CSS** using `generate(config)` — produces CSS rules that hide entrance-animated elements from the moment the page renders.
2. **Mark elements with `initial`** — tells the runtime which elements have critical CSS applied so it can coordinate with the generated styles.

### Step 1: Generate CSS

Call `generate(config)` server-side or at build time and inject the result into the `<head>` (preferred), or insert to beginning of `<body>`, so it loads before the page content is painted:

```ts
import { generate } from '@wix/interact/web';
const css = generate(config);
```

**Append to `<head>` or beginning of `<body>`:**

```html
<style>
  ${css}
</style>
```

### Step 2: Mark elements

**Web (Custom Elements):**

```html
<interact-element data-interact-key="hero" data-interact-initial="true">
  <section class="hero">...</section>
</interact-element>
```

**React:**

```tsx
<Interaction tagName="section" interactKey="hero" initial={true} className="hero">
  ...
</Interaction>
```

**Vanilla:**

```html
<section data-interact-key="hero" data-interact-initial="true" class="hero">...</section>
```

### Rules

- `generate()` should be called server-side or at build time. Can also be called on client-side if page content is initially hidden (e.g. behind a loader/splash screen).
- **Both** `generate(config)` CSS **and** `initial` on the element are required. Using only one has no effect.
- `initial` is only valid for `viewEnter` + `type: 'once'` where source and target are the same element.
- For `repeat`/`alternate`/`state`, do NOT use `initial`. Instead, manually apply the initial keyframe as inline styles on the target element and use `fill: 'both'`.

---

## Element Resolution

For simple use cases, `key` on the interaction matches the element, and the same element is both trigger source and animation target. The fields below are only needed for advanced patterns (lists, delegated triggers, child targeting).

### Source element resolution (Interaction level)

The source element is what the trigger attaches to. Resolved in priority order:

1. **`listContainer` + `listItemSelector`** — trigger attaches to each element matching `listItemSelector` within the `listContainer`. Use `listItemSelector` only when you need to **filter** which children participate (e.g. select only `.active` items). If all immediate children should participate, omit `listItemSelector`.
2. **`listContainer` only** — trigger attaches to each immediate child of the container. This is the common case for lists.
3. **`listContainer` + `selector`** — trigger attaches to the element found via `querySelector` within each immediate child of the container.
4. **`selector` only** — trigger attaches to all elements matching `querySelectorAll` within the root `<interact-element>`.
5. **Fallback** — first child of `<interact-element>` (web) or the root element (react/vanilla).

### Target element resolution (Effect level)

The target element is what the effect animates. Resolved in priority order:

1. **`Effect.key`** — the `<interact-element>` with matching `data-interact-key`.
2. **Registry Effect's `key`** — if the effect is an `EffectRef`, the `key` from the referenced registry entry is used.
3. **Fallback to `Interaction.key`** — the source element acts as the target.
4. After resolving the root target, `selector`, `listContainer`, and `listItemSelector` on the effect further refine which child elements within that target are animated (same priority order as source resolution).

---

## Static API

| Method / Property                   | Description                                                                                                   |
| :---------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| `Interact.create(config)`           | Initialize with a config. Returns the instance. Store the instance to manage its lifecycle.                   |
| `Interact.registerEffects(presets)` | Register named effect presets. MUST be called before `create`.                                                |
| `Interact.destroy()`                | Tear down all instances. Call on unmount or route change to prevent memory leaks.                             |
| `Interact.forceReducedMotion`       | `boolean` (default: `false`) — force reduced-motion behavior regardless of OS setting.                        |
| `Interact.allowA11yTriggers`        | `boolean` (default: `false`) — enable accessibility trigger variants (`interest`, `activate`).                |
| `Interact.setup(options)`           | Configure global options for scroll, pointer, and viewEnter systems. Call before `create`. See options below. |

**`Interact.setup(options)`** — optional configuration object:

| Option                 | Type                           | Description                                                           |
| :--------------------- | :----------------------------- | :-------------------------------------------------------------------- |
| `scrollOptionsGetter`  | `() => Partial<scrollConfig>`  | Function returning defaults for scroll-driven animation configuration |
| `pointerOptionsGetter` | `() => Partial<PointerConfig>` | Function returning defaults for pointer-move animation configuration  |
| `viewEnter`            | `Partial<ViewEnterParams>`     | Defaults for all viewEnter triggers (`threshold`,`inset`)             |
| `allowA11yTriggers`    | `boolean`                      | Enable accessibility trigger variants (use `interest` and `activate`) |

Use `setup()` when you need to override default observer thresholds or provide global configuration that applies to all interactions of a given trigger type.

Each `Interact.create()` call returns an instance. Store instances and call `instance.destroy()` when no longer needed (e.g. on component unmount) to prevent stale listeners and memory leaks.
