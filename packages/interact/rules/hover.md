# Hover Trigger Rules for @wix/interact

This document contains rules for generating hover-triggered interactions in `@wix/interact`.

**CRITICAL — Accessible hover**: Use `trigger: 'interest'` instead of `trigger: 'hover'` to also respond to keyboard focus.

**CRITICAL — Hit-area shift**: To avoid flickering, use a **separate source and target elements** when the effect changes size or position:

- source element: the element that triggering event is attached to.
- target element: — the inner element that actually animates.

## Table of Contents

- [Rule 1: keyframeEffect / namedEffect with PointerTriggerParams](#rule-1-keyframeeffect--namedeffect-with-pointertriggerparams)
- [Rule 2: transition / transitionProperties with StateParams](#rule-2-transition--transitionproperties-with-stateparams)
- [Rule 3: customEffect with PointerTriggerParams](#rule-3-customeffect-with-pointertriggerparams)
- [Rule 4: Sequences](#rule-4-sequences)

---

## Rule 1: keyframeEffect / namedEffect with PointerTriggerParams

Use `keyframeEffect` or `namedEffect` when the hover should play an animation (CSS or WAAPI). Pair with `PointerTriggerParams` to control playback behavior.

**CRITICAL:** Always include `fill: 'both'` for `type: 'alternate'`, `'repeat'` — keeps the effect applied while hovering and prevents garbage-collection. For `type: 'once'` use `fill: 'backwards'`.

**Multiple effects:** The `effects` array can contain multiple effects — all share the same hover trigger and fire together. Use this to animate different targets from a single hover event.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'hover',
    params: {
        type: '[EVENT_TRIGGER_TYPE]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',

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
            alternate: [ALTERNATE_BOOL]
        },
        // additional effects targeting other elements can be added here
    ]
}
```

### Variables

- `[SOURCE_KEY]` — identifier matching the element's key (`data-interact-key` for web, `interactKey` for React). The element that listens for hover.
- `[TARGET_KEY]` — identifier matching the element's key on the element that animates. Use a different key from `[SOURCE_KEY]` when source and target must be separated (see hit-area shift above).
- `[EVENT_TRIGGER_TYPE]` — `PointerTriggerParams.type`. One of:
  - `'alternate'` — plays forward on enter, reverses on leave. Default. Most common for hover.
  - `'repeat'` — restarts the animation from the beginning on each enter. On leave, jumps to the beginning and pauses.
  - `'once'` — plays once on the first enter and never again.
  - `'state'` — resumes on enter, pauses on leave. Useful for continuous loops (`iterations: Infinity`).
- `[KEYFRAMES]` — array of keyframe objects (e.g. `[{ opacity: 0 }, { opacity: 1 }]`). Property names in camelCase.
- `[EFFECT_NAME]` — unique string identifier for a `keyframeEffect`.
- `[NAMED_EFFECT_DEFINITION]` — object with properties of pre-built effect from `@wix/motion-presets`. Refer to motion-presets rules for available presets and their options.
- `[DURATION_MS]` — animation duration in milliseconds.
- `[EASING_FUNCTION]` — CSS easing string (e.g. `'ease-out'`, `'ease-in-out'`, `'cubic-bezier(0.4, 0, 0.2, 1)'`), or named easing from `@wix/motion`.
- `[DELAY_MS]` — optional delay before the effect starts, in milliseconds.
- `[ITERATIONS]` — optional. Number of iterations, or `Infinity` for continuous loops. Primarily useful with `type: 'state'`.
- `[ALTERNATE_BOOL]` — optional. `true` to alternate direction on every other iteration (within a single playback).
- `[FILL_MODE]` — usually `'both'`. Keeps the final state applied while hovering, and prevents garbage-collection of animation when finished.

---

## Rule 2: transition / transitionProperties with StateParams

Use `transition` or `transitionProperties` when the hover should toggle styles via DOM attribute change and CSS transitions rather than keyframe animations. Pair with `StateParams` to control how the style is applied.

Use `transition` when all properties share timing. Use `transitionProperties` when each property needs independent `duration`, `delay`, or `easing`.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'hover',
    params: {
        method: '[TRANSITION_METHOD]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',

            // --- pick ONE of the two transition forms ---
            transition: {
                duration: [DURATION_MS],
                delay: [DELAY_MS],
                easing: '[EASING_FUNCTION]',
                styleProperties: [
                    { name: '[CSS_PROP]', value: '[VALUE]' },
                    // ... more properties
                ]
            },
            // OR (when each property needs its own timing)
            transitionProperties: [
                {
                    name: '[CSS_PROP]',
                    value: '[VALUE]',
                    duration: [DURATION_MS],
                    delay: [DELAY_MS],
                    easing: '[EASING_FUNCTION]'
                },
                // ... more properties
            ]
        },
        // additional effects targeting other elements can be added here
    ]
}
```

### Variables

- `[SOURCE_KEY]` / `[TARGET_KEY]` — same as Rule 1.
- `[TRANSITION_METHOD]` — `StateParams.method`. One of:
  - `'toggle'` — applies the style state on enter, removes on leave. Default.
  - `'add'` — applies the style state on enter. Leave does NOT remove it.
  - `'remove'` — removes a previously applied style state on enter. Use with provided `effectId` to map to a matching interaction with `add` and effect with same `effectId`.
  - `'clear'` — clears all previously applied style states on enter. Use to reset multiple stacked `'add'` style changes at once (e.g. a "reset" hover area that undoes several accumulated states).
- `[CSS_PROP]` — CSS property name as a string in camelCase format (e.g. `'backgroundColor'`, `'borderRadius'`, `'opacity'`).
- `[VALUE]` — target CSS value for the property.
- `[DURATION_MS]` — transition duration in milliseconds.
- `[DELAY_MS]` — optional transition delay in milliseconds.
- `[EASING_FUNCTION]` — CSS easing string, or named easing from `@wix/motion`.

---

## Rule 3: customEffect with PointerTriggerParams

Use `customEffect` when you need imperative control over the animation (e.g. counters, canvas drawing, custom DOM manipulation). The callback receives the target element and a `progress` value (0–1) driven by the animation timeline.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'hover',
    params: {
        type: '[EVENT_TRIGGER_TYPE]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            customEffect: [CUSTOM_EFFECT_CALLBACK],
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]'
        },
        // additional effects targeting other elements can be added here
    ]
}
```

### Variables

- `[SOURCE_KEY]` / `[TARGET_KEY]` / `[EVENT_TRIGGER_TYPE]` — same as Rule 1.
- `[CUSTOM_EFFECT_CALLBACK]` — function with signature `(target: HTMLElement, progress: number) => void`. Called on each animation frame with the target element and `progress` from 0 to 1.
- `[DURATION_MS]` — animation duration in milliseconds.
- `[EASING_FUNCTION]` — CSS easing string, or named easing from `@wix/motion`.

---

## Rule 4: Sequences

Use sequences when a hover should sync/stagger animations across multiple elements.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'hover',
    params: {
        type: '[EVENT_TRIGGER_TYPE]'
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

- `[SOURCE_KEY]` / `[EVENT_TRIGGER_TYPE]` — same as Rule 1.
- `[OFFSET_MS]` — time offset for staggering each child's animation start, in milliseconds.
- `[OFFSET_EASING]` — easing curve for the offset staggering distribution. Defaults to `'linear'`.
- `[EFFECT_DEFINTION]` — a definition of or a reference to a time-based animation effect.
