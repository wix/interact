# ViewEnter Trigger Rules for @wix/interact

This document contains rules for generating interactions that respond to elements entering the viewport using the `@wix/interact`. ViewEnter triggers use IntersectionObserver to detect when elements become visible and are ideal for entrance animations, content reveals, and lazy-loading effects.

---

> **CRITICAL:** When the source (trigger) and target (effect) elements are the **same element**, use ONLY `type: 'once'`. For all other types (`'repeat'`, `'alternate'`, `'state'`), MUST use **separate** source and target elements — animating the observed element itself can cause it to leave/re-enter the viewport, leading to rapid re-triggers or the animation never firing.

## Table of Contents

- [Preventing Flash of Unstyled Content (FOUC)](#preventing-flash-of-unstyled-content-fouc)
- [Rule 1: keyframeEffect / namedEffect with ViewEnterParams](#rule-1-keyframeeffect--namedeffect-with-viewenterparams)
- [Rule 2: customEffect with ViewEnterParams](#rule-2-customeffect-with-viewenterparams)
- [Rule 3: Sequences with ViewEnterParams](#rule-3-sequences-with-viewenterparams)

---

## Preventing Flash of Unstyled Content (FOUC)

**Problem:** Elements with entrance animations (e.g. `FadeIn`) start in their final visible state (e.g. `opacity: 1`). Before the animation framework initializes and applies the starting keyframe (e.g. `opacity: 0`), the element is briefly visible at full opacity — a flash of un-animated content.

**Solution:** Two things are required — **both** MUST be present for FOUC prevention to work:

1. **Generate critical CSS** using `generate(config)` — produces CSS rules that hide entrance-animated elements from the moment the page renders, before JavaScript runs.
2. **Mark elements with `initial`** — set `data-interact-initial="true"` on `<interact-element>`, or `initial={true}` on the `<Interaction>` React component. This tells the runtime which elements have critical CSS applied.

If only one of these is present, FOUC prevention will **not** work. Both the CSS and the `initial` attribute are required.

### Step 1: Generate CSS and inject into `<head>` (preferred), or beginning of `<body>`

Call `generate(config)` server-side or at build time. Inject the resulting CSS into the document `<head>` (or in `<body>` before your content) so it loads before the page content is painted:

```typescript
import { generate } from '@wix/interact';

const config: InteractConfig = {
  interactions: [
    {
      key: '[SOURCE_KEY]',
      trigger: 'viewEnter',
      params: {
        type: [VIEW_TRIGGER_TYPE],
        threshold: [VIEW_TRIGGER_THRESHOLD],
        inset: [VIEW_TRIGGER_INSET],
      },
      effects: [EFFECT_DEFINITIONS],
      // and/or
      sequences: [SEQUENCE_DEFINITIONS],
    },
  ],
};

const css = generate(config);
```

**Append to `<head>` or beginning of `<body>`:**

```html
<style>
  ${css}
</style>
```

### Step 2: Mark elements with `initial`

**Web (Custom Elements):**

```html
<interact-element data-interact-key="[SOURCE_KEY]" data-interact-initial="true">
  <section>...</section>
</interact-element>
```

**React:**

```tsx
<Interaction tagName="section" interactKey="[SOURCE_KEY]" initial={true}>
  ...
</Interaction>
```

**Vanilla:**

```html
<section data-interact-key="[SOURCE_KEY]" data-interact-initial="true">...</section>
```

### Rules

- `generate()` should be called server-side or at build time. Can also be called on the client if the page content is initially hidden (e.g. behind a loader/splash screen).
- Only valid for `viewEnter` + `params.type: 'once'` where source and target are the same element.
- Do NOT use for `viewEnter` with `repeat`/`alternate`/`state` types. For those, manually apply the initial keyframe as inline styles on the target element and use `fill: 'both'`.
- If other interactions in the config also need FOUC prevention, `generate(config)` covers them all — set `initial` only on the relevant `viewEnter` + `type: 'once'` elements.

## Rule 1: keyframeEffect / namedEffect with ViewEnterParams

Use `keyframeEffect` or `namedEffect` when the viewEnter should play an animation (CSS or WAAPI). Pair with `params: ViewEnterParams` to configure the IntersectionObserver trigger.

**Multiple effects:** The `effects` array can contain multiple effects — all share the same viewEnter trigger and fire together when the element enters the viewport. Use this to animate different targets from a single viewport entry event.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'viewEnter',
    params: {
        type: '[VIEW_ENTER_TYPE]',
        threshold: [VISIBILITY_THRESHOLD],
        inset: '[VIEWPORT_INSETS]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            selector: '[TARGET_SELECTOR]',

            // --- pick ONE of the two effect types ---
            keyframeEffect: {
                name: '[EFFECT_NAME]',
                keyframes: [KEYFRAMES],
            },
            // OR
            namedEffect: [NAMED_EFFECT_DEFINITION],

            fill: '[FILL_MODE]',
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]',
            delay: [DELAY_MS],
            iterations: [ITERATIONS],
            alternate: [ALTERNATE_BOOL],
            effectId: '[UNIQUE_EFFECT_ID]'
        },
        // additional effects targeting other elements can be added here
    ]
}
```

### Variables

- `[SOURCE_KEY]` — identifier matching the element's key (`data-interact-key` for web/vanilla, `interactKey` for React). The **source element** is observed for viewport intersection. This is the element the IntersectionObserver watches.
- `[TARGET_KEY]` — identifier matching the element's key on the element that animates.
- `[TARGET_SELECTOR]` - optional. Selector for the child element to select inside the root element. For `type` of `'alternate'`/`'repeat'`/`'state'` MUST either use a separate `[TARGET_KEY]` from `[SOURCE_KEY]` or `selector` for selecting a child element as target.
- `[VIEW_ENTER_TYPE]` — `ViewEnterParams.type`. One of:
  - `'once'` — plays once when the source element first enters the viewport and never again. Source and target may be the same element.
  - `'repeat'` — restarts the animation every time the source element enters the viewport. Use separate source and target.
  - `'alternate'` — plays forward when the source element enters the viewport, reverses when it leaves. Use separate source and target.
  - `'state'` — resumes on enter, pauses on leave. Useful for continuous loops (`iterations: Infinity`). Use separate source and target.
- `[VISIBILITY_THRESHOLD]` — optional. Number between 0–1 indicating how much of the source element must be visible to trigger (e.g. `0.3` = 30%).
- `[VIEWPORT_INSETS]` — optional. String adjusting the viewport detection area (e.g. `'-100px'` extends it, `'50px'` shrinks it).
- `[KEYFRAMES]` — array of keyframe objects (e.g. `[{ opacity: 0 }, { opacity: 1 }]`). Property names in camelCase.
- `[EFFECT_NAME]` — unique string identifier for a `keyframeEffect`.
- `[NAMED_EFFECT_DEFINITION]` — object with properties of pre-built effect from `@wix/motion-presets`. Refer to motion-presets rules for available presets and their options.
- `[FILL_MODE]` — `'both'` for `'alternate'`, `'repeat'`, or `'state'` types. For `type: 'once'`: use `'backwards'` when the animation's final keyframe has no additional effect (over element's base style); use `'both'` otherwise.
- `[DURATION_MS]` — animation duration in milliseconds.
- `[EASING_FUNCTION]` — CSS easing string or named easing from `@wix/motion`.
- `[DELAY_MS]` — optional delay before the effect starts, in milliseconds.
- `[ITERATIONS]` — optional. Number of iterations, or `Infinity` for continuous loops. Primarily useful with `type: 'state'`.
- `[ALTERNATE_BOOL]` — optional. `true` to alternate direction on every other iteration (within a single playback).
- `[UNIQUE_EFFECT_ID]` — optional. String identifier used by `animationEnd` triggers for chaining, and by sequences for referencing effects.

---

## Rule 2: customEffect with ViewEnterParams

Use `customEffect` when you need imperative control over the animation (e.g. counters, canvas drawing, custom DOM manipulation). The callback receives the target element and a `progress` value (0–1) driven by the animation timeline.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'viewEnter',
    params: {
        type: '[VIEW_ENTER_TYPE]',
        threshold: [VISIBILITY_THRESHOLD],
        inset: '[VIEWPORT_INSETS]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            customEffect: [CUSTOM_EFFECT_CALLBACK],
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]',
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

### Variables

- `[SOURCE_KEY]` / `[TARGET_KEY]` / `[VIEW_ENTER_TYPE]` / `[VISIBILITY_THRESHOLD]` / `[VIEWPORT_INSETS]` / `[DURATION_MS]` / `[EASING_FUNCTION]` / `[UNIQUE_EFFECT_ID]` — same as Rule 1.
- `[CUSTOM_EFFECT_CALLBACK]` — function with signature `(element: HTMLElement, progress: number) => void`. Called on each animation frame with `progress` from 0 to 1.

---

## Rule 3: Sequences with ViewEnterParams

Use sequences when a viewEnter should sync/stagger animations across multiple elements.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'viewEnter',
    params: {
        type: '[VIEW_ENTER_TYPE]',
        threshold: [VISIBILITY_THRESHOLD],
        inset: '[VIEWPORT_INSETS]'
    },
    sequences: [
        {
            offset: [OFFSET_MS],
            offsetEasing: '[OFFSET_EASING]',
            effects: [
                [EFFECT_DEFINTION],
                // .. more effects as necessary
            ]
        }
    ]
}
```

### Variables

- `[SOURCE_KEY]` / `[VIEW_ENTER_TYPE]` / `[VISIBILITY_THRESHOLD]` / `[VIEWPORT_INSETS]` — same as Rule 1.
- `[OFFSET_MS]` — time offset between each child's animation start, in milliseconds.
- `[OFFSET_EASING]` — CSS easing or named easing from `@wix/motion`, for the stagger distribution. Defaults to `'linear'`.
- `[EFFECT_DEFINTION]` — a definition of or a reference to a time-based animation effect.
