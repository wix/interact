# {{trigger.Name}} Trigger Rules for {{meta.packageName}}

This document contains rules for generating interactions that respond to elements entering the viewport using the `{{meta.packageName}}`. ViewEnter triggers use IntersectionObserver to detect when elements become visible and are ideal for entrance animations, content reveals, and lazy-loading effects.

---
{{#each trigger.pitfalls as pitfall}}
{{> pitfalls#same-element-viewenter-short}}{{/each}}

## Table of Contents

- [Preventing Flash of Unstyled Content (FOUC)](#preventing-flash-of-unstyled-content-fouc)
- [Rule 1: keyframeEffect / namedEffect (TimeEffect)](#rule-1-keyframeeffect--namedeffect-timeeffect)
- [Rule 2: customEffect (TimeEffect)](#rule-2-customeffect-timeeffect)
- [Rule 3: Sequences](#rule-3-sequences)

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
import { generate } from '{{meta.packageName}}';

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

const css = generate(config);
```

{{> fouc#code-inject}}

### Step 2: Mark elements with `initial`

{{> fouc#code-web-rules}}

{{> fouc#code-react-rules}}

{{> fouc#code-vanilla-rules}}

### Rules

- `generate()` should be called server-side or at build time. Can also be called on the client if the page content is initially hidden (e.g. behind a loader/splash screen).
- `initial` is only valid for `viewEnter` + `triggerType: 'once'` (or no `triggerType`, which defaults to `'once'`) where source and target are the same element.
- Do NOT use `initial` for `viewEnter` with `triggerType: 'repeat'`/`'alternate'`/`'state'`. For those, manually apply the initial keyframe as inline styles on the target element and use `fill: 'both'`.
- If other interactions in the config also need FOUC prevention, `generate(config)` covers them all — set `initial` only on the relevant `viewEnter` + `triggerType: 'once'` elements.

## Rule 1: keyframeEffect / namedEffect (TimeEffect)

Use `keyframeEffect` or `namedEffect` when the viewEnter should play an animation (CSS or WAAPI). Set `triggerType` on each effect to control playback behavior. Use `params` only for observer configuration (`threshold`, `inset`).
{{#if trigger.flags.showMultipleEffectsNote}}
{{> multiple-effects-note#viewEnter}}
{{/if}}
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

- `[SOURCE_KEY]` — {{var.SOURCE_KEY}}
- `[TARGET_KEY]` — {{var.TARGET_KEY}}
- `[TARGET_SELECTOR]` - optional. Selector for the child element to select inside the root element. For `triggerType` of `'alternate'`/`'repeat'`/`'state'` MUST either use a separate `[TARGET_KEY]` from `[SOURCE_KEY]` or `selector` for selecting a child element as target.
- `[TRIGGER_TYPE]` — `triggerType` on the effect. One of:
{{#each trigger.triggerTypes as tt}}  - `'{{tt.key}}'`{{#if tt.value.default}} (default){{/if}} — {{tt.value.full}}
{{/each}}- `[VISIBILITY_THRESHOLD]` — {{var.VISIBILITY_THRESHOLD}}
- `[VIEWPORT_INSETS]` — {{var.VIEWPORT_INSETS}}
- `[KEYFRAMES]` — {{var.KEYFRAMES}}
- `[EFFECT_NAME]` — {{var.EFFECT_NAME}}
- `[NAMED_EFFECT_DEFINITION]` — {{var.NAMED_EFFECT_DEFINITION}}
- `[FILL_MODE]` — {{var.FILL_MODE}}
- `[DURATION_MS]` — {{var.DURATION_MS}}
- `[EASING_FUNCTION]` — {{var.EASING_FUNCTION}}
- `[DELAY_MS]` — {{var.DELAY_MS}}
- `[ITERATIONS]` — {{var.ITERATIONS}}
- `[ALTERNATE_BOOL]` — {{var.ALTERNATE_BOOL}}
- `[UNIQUE_EFFECT_ID]` — {{var.UNIQUE_EFFECT_ID}}

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
- `[CUSTOM_EFFECT_CALLBACK]` — {{var.CUSTOM_EFFECT_CALLBACK}}

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
                [EFFECT_DEFINITION],
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
- `[EFFECT_DEFINITION]` — a definition of or a reference to a time-based animation effect.
