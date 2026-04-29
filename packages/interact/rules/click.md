# Click Trigger Rules for @wix/interact

This document contains rules for generating click-triggered interactions in `@wix/interact`.

**CRITICAL — Accessible click**: Use `trigger: 'activate'` instead of `trigger: 'click'` to also respond to keyboard activation (Enter / Space).

## Table of Contents

- [Rule 1: keyframeEffect / namedEffect (TimeEffect)](#rule-1-keyframeeffect--namedeffect-timeeffect)
- [Rule 2: transition / transitionProperties (StateEffect)](#rule-2-transition--transitionproperties-stateeffect)
- [Rule 3: customEffect (TimeEffect)](#rule-3-customeffect-timeeffect)
- [Rule 4: Sequences](#rule-4-sequences)

---

## Rule 1: keyframeEffect / namedEffect (TimeEffect)

Use `keyframeEffect` or `namedEffect` when the click should play an animation (CSS or WAAPI). Set `triggerType` on each effect to control playback behavior.

**CRITICAL:** Always include `fill: 'both'` for `triggerType: 'alternate'` or `'repeat'` — keeps the effect applied while finished and prevents garbage-collection, allowing efficient toggling. For `triggerType: 'once'` use `fill: 'backwards'`.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'click',
    effects: [
        {
            key: '[TARGET_KEY]',
            triggerType: '[TRIGGER_TYPE]',

            // --- pick ONE of the two effect types ---
            keyframeEffect: {
                name: '[EFFECT_NAME]',
                keyframes: [KEYFRAMES],
            },
            // OR
            namedEffect: [NAMED_EFFECT_DEFINITION],

            fill: '[FILL_MODE]',
            reversed: [INITIAL_REVERSED_BOOL],
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

- `[SOURCE_KEY]` — identifier matching the element's key (`data-interact-key` for web, `interactKey` for React). The element that listens for clicks.
- `[TARGET_KEY]` — identifier matching the element's key on the element that animates. If missing it defaults to `[SOURCE_KEY]` for targeting the source element.
- `[TRIGGER_TYPE]` — `triggerType` on the effect. One of:
  - `'alternate'` — plays forward on first click, reverses on next click. Default.
  - `'repeat'` — restarts the animation from the beginning on each click.
  - `'once'` — plays once on the first click and never again.
  - `'state'` — resumes/pauses the animation on each click. Useful for continuous loops (`iterations: Infinity`).
- `[KEYFRAMES]` — array of keyframe objects (e.g. `[{ opacity: 0 }, { opacity: 1 }]`). Property names in camelCase.
- `[EFFECT_NAME]` — unique string identifier for a `keyframeEffect`.
- `[NAMED_EFFECT_DEFINITION]` — object with properties of pre-built, time-based animation effect from `@wix/motion-presets`. Refer to motion-presets rules for available presets and their options.
- `[FILL_MODE]` - optional. Always `'both'` with `triggerType: 'alternate'` or `'repeat'`, otherwise depends on the effect.
- `[INITIAL_REVERSED_BOOL]` — optional. `true` to start in the finished state so the entire effect is reversed.
- `[DURATION_MS]` — animation duration in milliseconds.
- `[EASING_FUNCTION]` — CSS easing string, or named easing from `@wix/motion`.
- `[DELAY_MS]` — optional delay before the effect starts, in milliseconds.
- `[ITERATIONS]` — optional. Number of iterations, or `Infinity` for continuous loops.
- `[ALTERNATE_BOOL]` — optional. `true` to alternate direction on every other iteration (within a single playback). Different from `triggerType: 'alternate'` which alternates per click.
- `[UNIQUE_EFFECT_ID]` — optional. String identifier used by `animationEnd` triggers for chaining, and by sequences for referencing effects from the top-level `effects` map.

---

## Rule 2: transition / transitionProperties (StateEffect)

Use `transition` or `transitionProperties` when the click should toggle styles via DOM attribute change and CSS transitions rather than keyframe animations. Uses the `transition` CSS property. Set `stateAction` on the effect to control how the style is applied.

Use `transition` when all properties share timing. Use `transitionProperties` when each property needs independent `duration`, `delay`, or `easing`.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'click',
    effects: [
        {
            key: '[TARGET_KEY]',
            stateAction: '[STATE_ACTION]',

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
        }
    ]
}
```

### Variables

- `[SOURCE_KEY]` / `[TARGET_KEY]` — same as Rule 1.
- `[STATE_ACTION]` — `stateAction` on the effect. One of:
  - `'toggle'` — applies the style state, removes it on next click. Default.
  - `'add'` — applies the style state. Does not remove on subsequent clicks.
  - `'remove'` — removes a previously applied style state.
  - `'clear'` — clears all previously applied style states. Useful for resetting multiple stacked style states at once.
- `[CSS_PROP]` — CSS property name as a string in camelCase format (e.g. `'backgroundColor'`, `'borderRadius'`, `'opacity'`).
- `[VALUE]` — target CSS value for the property.
- `[DURATION_MS]` — transition duration in milliseconds.
- `[DELAY_MS]` — optional transition delay in milliseconds.
- `[EASING_FUNCTION]` — CSS easing string, or named easing from `@wix/motion`.

---

## Rule 3: customEffect (TimeEffect)

Use `customEffect` when you need imperative control over the animation (e.g. counters, canvas drawing, custom DOM manipulation, randomized behavior). The callback receives the target element and a `progress` value (0–1) driven by the animation timeline.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'click',
    effects: [
        {
            key: '[TARGET_KEY]',
            triggerType: '[TRIGGER_TYPE]',
            customEffect: [CUSTOM_EFFECT_CALLBACK],
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]'
        }
    ]
}
```

### Variables

- `[SOURCE_KEY]` / `[TARGET_KEY]` / `[TRIGGER_TYPE]` — same as Rule 1.
- `[CUSTOM_EFFECT_CALLBACK]` — function with signature `(element: HTMLElement, progress: number) => void`. Called on each animation frame with target element and `progress` from 0 to 1.
- `[DURATION_MS]` — animation duration in milliseconds.
- `[EASING_FUNCTION]` — CSS easing string, or named easing from `@wix/motion`.

---

## Rule 4: Sequences

Use sequences when a click should sync/stagger animations across multiple elements. Set `triggerType` on the sequence config to control playback behavior.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'click',
    sequences: [
        {
            triggerType: '[TRIGGER_TYPE]',
            offset: [OFFSET_MS],
            offsetEasing: '[OFFSET_EASING]',
            effects: [
                [EFFECT_DEFINITION],
                // .. more effects as necessary
            ]
        }
    ]
}
```

### Variables

- `[SOURCE_KEY]` / `[TRIGGER_TYPE]` — same as Rule 1. `triggerType` is set on the sequence config, not on individual effects within the sequence.
- `[OFFSET_MS]` — time offset for staggering each child's animation start, in milliseconds.
- `[OFFSET_EASING]` — easing curve for the offset staggering distribution. Defaults to `'linear'`.
- `[EFFECT_DEFINITION]` — a definition of, or a reference to a time-based animation effect.
