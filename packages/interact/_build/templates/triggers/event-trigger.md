# {{trigger.Name}} Trigger Rules for {{meta.packageName}}

This document contains rules for generating {{trigger.name}}-triggered interactions in `{{meta.packageName}}`.

**CRITICAL — Accessible {{trigger.name}}**: {{trigger.a11yNote}}
{{#each trigger.pitfalls as pitfall}}
{{> pitfalls#hit-area-hover-rule}}{{/each}}

## Table of Contents

- [Rule 1: keyframeEffect / namedEffect (TimeEffect)](#rule-1-keyframeeffect--namedeffect-timeeffect)
- [Rule 2: transition / transitionProperties (StateEffect)](#rule-2-transition--transitionproperties-stateeffect)
- [Rule 3: customEffect (TimeEffect)](#rule-3-customeffect-timeeffect)
- [Rule 4: Sequences](#rule-4-sequences)

---

## Rule 1: keyframeEffect / namedEffect (TimeEffect)

Use `keyframeEffect` or `namedEffect` when the {{trigger.name}} should play an animation (CSS or WAAPI). Set `triggerType` on each effect to control playback behavior.

**CRITICAL:** {{trigger.prose.fillCritical}}
{{#if trigger.flags.showMultipleEffectsNote}}
**Multiple effects:** The `effects` array can contain multiple effects — all share the same {{trigger.name}} trigger and fire together. Use this to animate different targets from a single {{trigger.name}} event.
{{/if}}
```typescript
{
    key: '[SOURCE_KEY]',
    trigger: '{{trigger.name}}',
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

            fill: '[FILL_MODE]',{{#if trigger.flags.hasReversed}}
            reversed: [INITIAL_REVERSED_BOOL],{{/if}}
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]',
            delay: [DELAY_MS],
            iterations: [ITERATIONS],
            alternate: [ALTERNATE_BOOL]{{#if trigger.flags.hasEffectId}},
            effectId: '[UNIQUE_EFFECT_ID]'{{/if}}
        },
        // additional effects targeting other elements can be added here
    ]
}
```

### Variables

- `[SOURCE_KEY]` — {{var.SOURCE_KEY}}
- `[TARGET_KEY]` — {{var.TARGET_KEY}}
- `[TRIGGER_TYPE]` — `triggerType` on the effect. One of:
{{#each trigger.triggerTypes as tt}}  - `'{{tt.key}}'` — {{tt.value.full}}
{{/each}}- `[KEYFRAMES]` — {{var.KEYFRAMES}}
- `[EFFECT_NAME]` — {{var.EFFECT_NAME}}
- `[NAMED_EFFECT_DEFINITION]` — {{var.NAMED_EFFECT_DEFINITION}}
- `[FILL_MODE]` — {{var.FILL_MODE}}
{{#if trigger.flags.hasReversed}}- `[INITIAL_REVERSED_BOOL]` — optional. `true` to start in the finished state so the entire effect is reversed.
{{/if}}- `[DURATION_MS]` — {{var.DURATION_MS}}
- `[EASING_FUNCTION]` — {{var.EASING_FUNCTION}}
- `[DELAY_MS]` — {{var.DELAY_MS}}
- `[ITERATIONS]` — {{var.ITERATIONS}}
- `[ALTERNATE_BOOL]` — {{var.ALTERNATE_BOOL}}
{{#if trigger.flags.hasEffectId}}- `[UNIQUE_EFFECT_ID]` — {{var.UNIQUE_EFFECT_ID}}
{{/if}}
---

## Rule 2: transition / transitionProperties (StateEffect)

Use `transition` or `transitionProperties` when the {{trigger.name}} should toggle styles via DOM attribute change and CSS transitions rather than keyframe animations. Set `stateAction` on the effect to control how the style is applied.

Use `transition` when all properties share timing. Use `transitionProperties` when each property needs independent `duration`, `delay`, or `easing`.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: '{{trigger.name}}',
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
        },
        // additional effects targeting other elements can be added here
    ]
}
```

### Variables

- `[SOURCE_KEY]` / `[TARGET_KEY]` — same as Rule 1.
- `[STATE_ACTION]` — `stateAction` on the effect. One of:
{{#each trigger.stateActions as sa}}  - `'{{sa.key}}'` — {{sa.value.full}}
{{/each}}- `[CSS_PROP]` — CSS property name as a string in camelCase format (e.g. `'backgroundColor'`, `'borderRadius'`, `'opacity'`).
- `[VALUE]` — target CSS value for the property.
- `[DURATION_MS]` — transition duration in milliseconds.
- `[DELAY_MS]` — optional transition delay in milliseconds.
- `[EASING_FUNCTION]` — CSS easing string, or named easing from `@wix/motion`.

---

## Rule 3: customEffect (TimeEffect)

Use `customEffect` when you need imperative control over the animation (e.g. counters, canvas drawing, custom DOM manipulation{{trigger.prose.customEffectExamples}}). The callback receives the target element and a `progress` value (0–1) driven by the animation timeline.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: '{{trigger.name}}',
    effects: [
        {
            key: '[TARGET_KEY]',
            triggerType: '[TRIGGER_TYPE]',
            customEffect: [CUSTOM_EFFECT_CALLBACK],
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]'
        },
        // additional effects targeting other elements can be added here
    ]
}
```

### Variables

- `[SOURCE_KEY]` / `[TARGET_KEY]` / `[TRIGGER_TYPE]` — same as Rule 1.
- `[CUSTOM_EFFECT_CALLBACK]` — {{var.CUSTOM_EFFECT_CALLBACK}}
- `[DURATION_MS]` — animation duration in milliseconds.
- `[EASING_FUNCTION]` — CSS easing string, or named easing from `@wix/motion`.

---

## Rule 4: Sequences

Use sequences when a {{trigger.name}} should sync/stagger animations across multiple elements. Set `triggerType` on the sequence config to control playback behavior.

```typescript
{
    key: '[SOURCE_KEY]',
    trigger: '{{trigger.name}}',
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
- `[OFFSET_EASING]` — easing curve for the offset staggering distribution.{{trigger.prose.offsetEasingSuffix}} Defaults to `'linear'`.
- `[EFFECT_DEFINITION]` — a definition of or a reference to a time-based animation effect.
