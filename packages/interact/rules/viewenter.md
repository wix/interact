# ViewEnter Trigger Rules for @wix/interact

This document contains rules for generating interactions that respond to elements entering the viewport using the `@wix/interact`. ViewEnter triggers use IntersectionObserver to detect when elements become visible and are ideal for entrance animations, content reveals, and lazy-loading effects.

---

> **CRITICAL:** When the source (trigger) and target (effect) elements are the **same element**, use ONLY `triggerType: 'once'`. For all other types (`'repeat'`, `'alternate'`, `'state'`), MUST use **separate** source and target elements — animating the observed element itself can cause it to leave/re-enter the viewport, leading to rapid re-triggers or the animation never firing.

## Table of Contents

- [Preventing Flash of Unstyled Content (FOUC)](#preventing-flash-of-unstyled-content-fouc)
- [Rule 1: keyframeEffect / namedEffect (TimeEffect)](#rule-1-keyframeeffect--namedeffect-timeeffect)
- [Rule 2: customEffect (TimeEffect)](#rule-2-customeffect-timeeffect)
- [Rule 3: Sequences](#rule-3-sequences)

---

## Preventing Flash of Unstyled Content (FOUC)

> **Note:** `generate(config)` produces complete CSS for **all** interactions in the config — `@keyframes`, animation/transition properties, scroll-driven timelines, state effects, and more — not only the FOUC-prevention rules described here. The generated CSS uses attribute selectors, so animations bind reactively as elements appear in the DOM without JS-managed DOM references. See the [generate() documentation](../docs/api/functions.md#generate) for the full scope.

**Problem:** Elements with entrance animations (e.g. `FadeIn`) start in their final visible state (e.g. `opacity: 1`). Before the animation framework initializes and applies the starting keyframe (e.g. `opacity: 0`), the element is briefly visible at full opacity — a flash of un-animated content.

**Solution:** Call `generate(config, useFirstChild)` server-side or at build time and inject the resulting CSS into the document `<head>` (or at the beginning of `<body>`) so it loads before the page content is painted. Among all the CSS it produces, `generate()` includes initial rules that hide entrance-animated elements from the moment the page renders, before JavaScript runs. The rules use `:not([data-interact-enter])` so elements become visible once the animation starts.

### Generate CSS and inject into `<head>` (preferred), or beginning of `<body>`

Call `generate(config)` server-side or at build time. Inject the resulting CSS into the document `<head>` (or in `<body>` before your content) so it loads before the page content is painted:

```typescript
import { generate } from '@wix/interact';

const config: InteractConfig = {
  interactions: [
    {
      key: '[SOURCE_KEY]',
      trigger: 'viewEnter',
      params: {
        threshold: [VIEW_TRIGGER_THRESHOLD],
        inset: [VIEW_TRIGGER_INSET],
      },
      effects: [EFFECT_DEFINITIONS],
      // and/or
      sequences: [SEQUENCE_DEFINITIONS],
    },
  ],
};

const css = generate(config, useFirstChild);
```

**Append to `<head>` or beginning of `<body>`:**

```html
<style>
  ${css}
</style>
```

### Rules

- `generate()` should be called server-side or at build time. Can also be called on the client if the page content is initially hidden (e.g. behind a loader/splash screen).
- FOUC initial rules apply only to `viewEnter` + `triggerType: 'once'` (or no `triggerType`, which defaults to `'once'`) where source and target are the same element.
- For `viewEnter` with `triggerType: 'repeat'`/`'alternate'`/`'state'`, manually apply the starting keyframe as inline styles on the target element and use `fill: 'both'`.
- `generate(config)` processes all interactions in the config, not just `viewEnter`.

## Rule 1: keyframeEffect / namedEffect (TimeEffect)

Use `keyframeEffect` or `namedEffect` when the viewEnter should play an animation (CSS or WAAPI). Set `triggerType` on each effect to control playback behavior. Use `params` only for observer configuration (`threshold`, `inset`).

**Multiple effects:** The `effects` array can contain multiple effects — all share the same viewEnter trigger and fire together when the element enters the viewport. Each effect can have its own `triggerType`. Use this to animate different targets from a single viewport entry event.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'viewEnter',
    params: {
        threshold: [VISIBILITY_THRESHOLD],
        inset: '[VIEWPORT_INSETS]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            selector: '[TARGET_SELECTOR]',
            triggerType: '[TRIGGER_TYPE]',

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
- `[TARGET_SELECTOR]` - optional. Selector for the child element to select inside the root element. For `triggerType` of `'alternate'`/`'repeat'`/`'state'` MUST either use a separate `[TARGET_KEY]` from `[SOURCE_KEY]` or `selector` for selecting a child element as target.
- `[TRIGGER_TYPE]` — `triggerType` on the effect. One of:
  - `'once'` (default) — plays once when the source element first enters the viewport and never again. Source and target may be the same element.
  - `'repeat'` — restarts the animation every time the source element enters the viewport. Use separate source and target.
  - `'alternate'` — plays forward when the source element enters the viewport, reverses when it leaves. Use separate source and target.
  - `'state'` — resumes on enter, pauses on leave. Useful for continuous loops (`iterations: Infinity`). Use separate source and target.
- `[VISIBILITY_THRESHOLD]` — optional. Number between 0–1 indicating how much of the source element must be visible to trigger (e.g. `0.3` = 30%).
- `[VIEWPORT_INSETS]` — optional. String adjusting the viewport detection area (e.g. `'-100px'` extends it, `'50px'` shrinks it).
- `[KEYFRAMES]` — array of keyframe objects (e.g. `[{ opacity: 0 }, { opacity: 1 }]`). Property names in camelCase.
- `[EFFECT_NAME]` — unique string identifier for a `keyframeEffect`.
- `[NAMED_EFFECT_DEFINITION]` — object with properties of pre-built effect from `@wix/motion-presets`. Refer to motion-presets rules for available presets and their options.
- `[FILL_MODE]` — `'both'` for `triggerType: 'alternate'`, `'repeat'`, or `'state'`. For `triggerType: 'once'`: use `'backwards'` when the animation's final keyframe has no additional effect (over element's base style); use `'both'` otherwise.
- `[DURATION_MS]` — animation duration in milliseconds.
- `[EASING_FUNCTION]` — CSS easing string or named easing from `@wix/motion`.
- `[DELAY_MS]` — optional delay before the effect starts, in milliseconds.
- `[ITERATIONS]` — optional. Number of iterations, or `Infinity` for continuous loops. Primarily useful with `triggerType: 'state'`.
- `[ALTERNATE_BOOL]` — optional. `true` to alternate direction on every other iteration (within a single playback).
- `[UNIQUE_EFFECT_ID]` — optional. String identifier used by `animationEnd` triggers for chaining, and by sequences for referencing effects.

---

## Rule 2: customEffect (TimeEffect)

Use `customEffect` when you need imperative control over the animation (e.g. counters, canvas drawing, custom DOM manipulation). The callback receives the target element and a `progress` value (0–1) driven by the animation timeline.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'viewEnter',
    params: {
        threshold: [VISIBILITY_THRESHOLD],
        inset: '[VIEWPORT_INSETS]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            triggerType: '[TRIGGER_TYPE]',
            customEffect: [CUSTOM_EFFECT_CALLBACK],
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]',
            effectId: '[UNIQUE_EFFECT_ID]'
        }
    ]
}
```

### Variables

- `[SOURCE_KEY]` / `[TARGET_KEY]` / `[TRIGGER_TYPE]` / `[VISIBILITY_THRESHOLD]` / `[VIEWPORT_INSETS]` / `[DURATION_MS]` / `[EASING_FUNCTION]` / `[UNIQUE_EFFECT_ID]` — same as Rule 1.
- `[CUSTOM_EFFECT_CALLBACK]` — function with signature `(element: HTMLElement, progress: number) => void`. Called on each animation frame with `element` being the target element, and `progress` from 0 to 1.

---

## Rule 3: Sequences

Use sequences when a viewEnter should sync/stagger animations across multiple elements. Set `triggerType` on the sequence config to control playback behavior.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'viewEnter',
    params: {
        threshold: [VISIBILITY_THRESHOLD],
        inset: '[VIEWPORT_INSETS]'
    },
    sequences: [
        {
            triggerType: '[TRIGGER_TYPE]',
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

- `[SOURCE_KEY]` / `[VISIBILITY_THRESHOLD]` / `[VIEWPORT_INSETS]` — same as Rule 1.
- `[TRIGGER_TYPE]` — same as Rule 1. `triggerType` is set on the sequence config, not on individual effects within the sequence.
- `[OFFSET_MS]` — time offset between each child's animation start, in milliseconds.
- `[OFFSET_EASING]` — CSS easing or named easing from `@wix/motion`, for the stagger distribution. Defaults to `'linear'`.
- `[EFFECT_DEFINTION]` — a definition of or a reference to a time-based animation effect.
