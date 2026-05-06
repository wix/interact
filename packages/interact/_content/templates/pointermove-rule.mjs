import { buildPitfallsBlock, varLine } from './_helpers.mjs';

/**
 * Renders pointermove.md — rules for pointer-driven interactions with 2D mouse tracking.
 * @param {{ triggers: object[], effects: object, meta: object, trigger: object }} data
 * @param {import('../../scripts/build-rules.mjs').Fragments} fragments
 */
export function render(data, fragments) {
  const { trigger } = data;

  const pitfallsBlock = buildPitfallsBlock(trigger, fragments); // no extra newline wrapping — handled by template layout

  const paramsTypeFields = trigger.params
    .map((p) => `  ${p.name}${p.optional ? '?' : ''}: ${p.type};`)
    .join('\n');

  return `# PointerMove Trigger Rules for ${data.meta.packageName}

These rules help generate pointer-driven interactions using \`${data.meta.packageName}\`. PointerMove triggers create real-time animations that respond to mouse movement over elements or the entire viewport.

## Table of Contents

- [Trigger Source Elements with \`hitArea: 'self'\`](#trigger-source-elements-with-hitarea-self)
- [PointerMoveParams](#pointermoveparams)
- [Progress Object Structure](#progress-object-structure)
- [Centering with \`centeredToTarget\`](#centering-with-centeredtotarget)
- [Device Conditions](#device-conditions)
- [Rule 1: namedEffect](#rule-1-namedeffect)
- [Rule 2: keyframeEffect with Single Axis](#rule-2-keyframeeffect-with-single-axis)
- [Rule 3: Two keyframeEffects with Two Axes and \`composite\`](#rule-3-two-keyframeeffects-with-two-axes-and-composite)
- [Rule 4: customEffect](#rule-4-customeffect)

## Trigger Source Elements with \`hitArea: 'self'\`

${pitfallsBlock}

---

## PointerMoveParams

\`params\` object for \`pointerMove\` interactions:

\`\`\`typescript
type PointerMoveParams = {
${paramsTypeFields}
};
\`\`\`

### Properties

- \`hitArea\` — determines where mouse movement is tracked:
  - \`'self'\` — tracks pointer within the source element's bounds only. Use for local pointer-tracking effects on a specific element.
  - \`'root'\` — tracks pointer anywhere in the viewport. Use for global cursor followers, ambient effects.
- \`axis\` — restricts pointer tracking to a single axis. Used with \`keyframeEffect\` to map one axis to 0–1 progress; ignored by \`namedEffect\` and \`customEffect\` which receive the full 2D progress:
  - \`'x'\` — maps horizontal pointer position to 0–1 progress for keyframe interpolation.
  - \`'y'\` — maps vertical pointer position to 0–1 progress for keyframe interpolation. **Default** when \`keyframeEffect\` is used.
  - For \`namedEffect\` or \`customEffect\` both axes are available via the 2D progress object, and will be ignored.

---

## Progress Object Structure

${fragments.get('progress-type', 'detailed')}

---

## Centering with \`centeredToTarget\`

Controls which element's bounds define the 0–1 progress range.

- **\`false\` (default)**: Progress is calculated against the **source element's** (or viewport's) bounds. The \`50%\` progress of the timeline is at the center of the source element.
- **\`true\`**: \`50%\` progress of the timeline is calculated against the **target element's center**. The edges of the timeline are still calculated against the edges of the source element/viewport depending on \`hitArea\`.

---

## Device Conditions

\`pointerMove\` works best on hover-capable devices. Use a \`conditions\` entry with a \`(hover: hover)\` media query to prevent the interaction from registering on touch-only devices. On touch-only devices, consider a fallback to \`viewEnter\` or \`viewProgress\` based interactions:

\`\`\`typescript
{
    conditions: {
        '[CONDITION_NAME]': { type: 'media', predicate: '(hover: hover)' }
    },
    interactions: [
        {
            key: '[SOURCE_KEY]',
            trigger: 'pointerMove',
            conditions: ['[CONDITION_NAME]'],
            params: { hitArea: '[HIT_AREA]' },
            effects: [ /* ... */ ]
        }
    ]
}
\`\`\`

For devices with dynamic viewport sizes (e.g. mobile browsers where the address bar collapses), consider using viewport-relative units carefully and prefer \`lvh\`/\`svh\` over \`dvh\` unless dynamic viewport behavior is specifically desired.

---

## Rule 1: namedEffect

Use pre-built mouse presets from \`${data.meta.presetsPackage}\` that handle 2D mouse tracking internally. Mouse presets are preferred over \`keyframeEffect\` for 2D effects. Available mouse presets: ${data.effects.presets.mouse.map((n) => `\`${n}\``).join(', ')}.

${trigger.showMultipleEffectsNote ? fragments.get('multiple-effects-note', 'pointerMove') : ''}

\`\`\`typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'pointerMove',
    params: {
        hitArea: '[HIT_AREA]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            namedEffect: {
                type: '[NAMED_EFFECT_TYPE]',
                [EFFECT_PROPERTIES]
            },
            centeredToTarget: [CENTERED_TO_TARGET],
            transitionDuration: [TRANSITION_DURATION_MS],
            transitionEasing: '[TRANSITION_EASING]'
        },
        // additional effects targeting other elements can be added here
    ]
}
\`\`\`

### Variables

${varLine('SOURCE_KEY', 'The element that tracks pointer movement.')}
${varLine('TARGET_KEY', "identifier matching the element's key on the element to animate (can be same as source or different).")}
${varLine('HIT_AREA')}
- \`[NAMED_EFFECT_TYPE]\` — a registered effect name, or a preset from \`${data.meta.presetsPackage}\` \`mouse\` library.
- \`[EFFECT_PROPERTIES]\` — preset-specific options. Refer to motion-presets rules for each preset's available options and their value types. Do NOT guess preset option names or types; omit unknown options and rely on defaults.
${varLine('CENTERED_TO_TARGET')}
${varLine('TRANSITION_DURATION_MS')}
${varLine('TRANSITION_EASING')}

---

## Rule 2: keyframeEffect with Single Axis

Use \`keyframeEffect\` when the pointer position along a single axis should drive a keyframe animation. The pointer's position on the chosen axis is mapped to linear 0–1 progress.

\`\`\`typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'pointerMove',
    params: {
        hitArea: '[HIT_AREA]',
        axis: '[AXIS]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            keyframeEffect: {
                name: '[EFFECT_NAME]',
                keyframes: [KEYFRAMES]
            },
            fill: 'both',
            centeredToTarget: [CENTERED_TO_TARGET],
            transitionDuration: [TRANSITION_DURATION_MS],
            transitionEasing: '[TRANSITION_EASING]',
            effectId: '[UNIQUE_EFFECT_ID]'
        },
        // additional effects targeting other elements can be added here
    ]
}
\`\`\`

### Variables

- \`[SOURCE_KEY]\` / \`[TARGET_KEY]\` / \`[HIT_AREA]\` — same as Rule 1.
- \`[AXIS]\` — \`'x'\` (horizontal) or \`'y'\` (vertical). Defaults to \`'y'\` when omitted.
${varLine('EFFECT_NAME')}
- \`[KEYFRAMES]\` — array of CSS keyframe objects (e.g. \`[{ transform: 'rotate(-10deg)' }, { transform: 'rotate(0)' }, { transform: 'rotate(10deg)' }]\`). Distributed evenly across 0–1 progress: first keyframe = progress 0 (left/top edge), last = progress 1 (right/bottom edge). Any number of keyframes is allowed.
- \`[CENTERED_TO_TARGET]\` / \`[TRANSITION_DURATION_MS]\` / \`[TRANSITION_EASING]\` / \`[UNIQUE_EFFECT_ID]\` — same as Rule 1.

---

## Rule 3: Two keyframeEffects with Two Axes and \`composite\`

Use two separate interactions on the same source/target pair — one for \`axis: 'x'\`, one for \`axis: 'y'\` — for independent 2D control with keyframes. When both effects animate the same CSS property (e.g. \`transform\` or \`filter\`), use \`composite\` to combine them.

\`\`\`typescript
{
    interactions: [
        {
            key: '[SOURCE_KEY]',
            trigger: 'pointerMove',
            params: { hitArea: '[HIT_AREA]', axis: 'x' },
            effects: [{ key: '[TARGET_KEY]', effectId: '[X_EFFECT_ID]' }]
        },
        {
            key: '[SOURCE_KEY]',
            trigger: 'pointerMove',
            params: { hitArea: '[HIT_AREA]', axis: 'y' },
            effects: [{ key: '[TARGET_KEY]', effectId: '[Y_EFFECT_ID]' }]
        }
    ],
    effects: {
        '[X_EFFECT_ID]': {
            keyframeEffect: {
                name: '[X_EFFECT_NAME]',
                keyframes: [X_KEYFRAMES]
            },
            fill: '[FILL_MODE]', // usually 'both'
            composite: '[COMPOSITE_OPERATION]',
            transitionDuration: [TRANSITION_DURATION_MS],
            transitionEasing: '[TRANSITION_EASING]'
        },
        '[Y_EFFECT_ID]': {
            keyframeEffect: {
                name: '[Y_EFFECT_NAME]',
                keyframes: [Y_KEYFRAMES]
            },
            fill: '[FILL_MODE]', // usually 'both'
            composite: '[COMPOSITE_OPERATION]',
            transitionDuration: [TRANSITION_DURATION_MS],
            transitionEasing: '[TRANSITION_EASING]'
        }
    }
}
\`\`\`

### Variables

- \`[SOURCE_KEY]\` / \`[TARGET_KEY]\` / \`[HIT_AREA]\` — same as Rule 1.
- \`[X_EFFECT_ID]\` / \`[Y_EFFECT_ID]\` — unique string identifiers for the X-axis and Y-axis effects. Required — they map to keys in the top-level \`effects\` map.
- \`[X_EFFECT_NAME]\` / \`[Y_EFFECT_NAME]\` — unique string names for each keyframe effect.
- \`[X_KEYFRAMES]\` / \`[Y_KEYFRAMES]\` — arrays of WAAPI keyframe objects for the X-axis and Y-axis effects respectively. Each effect can vary in properties and keyframes.
- \`[COMPOSITE_OPERATION]\` — \`'add'\` or \`'accumulate'\`. Required when both effects animate \`transform\` and/or both animate \`filter\`, so their values combine rather than override. \`'add'\`: composited transform functions are appended. \`'accumulate'\`: matching function arguments are summed.
${varLine('FILL_MODE', "typically `'both'` to ensure the effect keeps applying after exiting the effect's active range.")}
- \`[TRANSITION_DURATION_MS]\` / \`[TRANSITION_EASING]\` — same as Rule 1.

---

## Rule 4: customEffect

Use \`customEffect\` when you need full imperative control over pointer-driven animations — custom physics, complex multi-property animations, velocity-reactive effects, or controlling WebGL/WebGPU and other JavaScript-driven effects. The callback receives the 2D progress object (see **Progress Object Structure**).

\`\`\`typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'pointerMove',
    params: {
        hitArea: '[HIT_AREA]'
    },
    effects: [
        {
            key: '[TARGET_KEY]',
            customEffect: (element: Element, progress: Progress) => {
                [CUSTOM_ANIMATION_LOGIC]
            },
            centeredToTarget: [CENTERED_TO_TARGET],
            transitionDuration: [TRANSITION_DURATION_MS],
            transitionEasing: '[TRANSITION_EASING]'
        },
        // additional effects targeting other elements can be added here
    ]
}
\`\`\`

### Variables

- \`[SOURCE_KEY]\` / \`[TARGET_KEY]\` / \`[HIT_AREA]\` — same as Rule 1.
- \`[CUSTOM_ANIMATION_LOGIC]\` — JavaScript using \`progress.x\`, \`progress.y\`, \`progress.v\`, and \`progress.active\` to apply the effect. See **Progress Object Structure** above.
- \`[CENTERED_TO_TARGET]\` / \`[TRANSITION_DURATION_MS]\` / \`[TRANSITION_EASING]\` — same as Rule 1.
`;
}
