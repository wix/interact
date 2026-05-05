import { capitalize, when } from './_helpers.mjs';

/**
 * Renders a trigger-specific rule file (click.md or hover.md).
 * @param {{ trigger: object, meta: object }} data — must include `trigger` (from triggers.yaml) and `meta`
 * @param {import('../../scripts/build-rules.mjs').Fragments} fragments
 */
export function render(data, fragments) {
  const { trigger } = data;
  const { name, variableOverrides: vo } = trigger;
  const Name = capitalize(name);
  const hasReversed = trigger.templateFields.includes('reversed');
  const hasEffectId = trigger.templateFields.includes('effectId');

  const pitfallsBlock = when(
    trigger.pitfalls.length > 0,
    '\n' + trigger.pitfalls.map((p) => fragments.get(`pitfalls/${p.id}`, name)).join('\n') + '\n',
  );

  const multipleEffectsNote = when(
    trigger.showMultipleEffectsNote,
    `\n${fragments.get('multiple-effects-note', 'default', { triggerName: name, triggerEvent: `${name} event` })}\n`,
  );

  return `# ${Name} Trigger Rules for ${data.meta.packageName}

This document contains rules for generating ${name}-triggered interactions in \`${data.meta.packageName}\`.

**CRITICAL — Accessible ${name}**: ${trigger.a11yNote}
${pitfallsBlock}
## Table of Contents

- [Rule 1: keyframeEffect / namedEffect (TimeEffect)](#rule-1-keyframeeffect--namedeffect-timeeffect)
- [Rule 2: transition / transitionProperties (StateEffect)](#rule-2-transition--transitionproperties-stateeffect)
- [Rule 3: customEffect (TimeEffect)](#rule-3-customeffect-timeeffect)
- [Rule 4: Sequences](#rule-4-sequences)

---

## Rule 1: keyframeEffect / namedEffect (TimeEffect)

Use \`keyframeEffect\` or \`namedEffect\` when the ${name} should play an animation (CSS or WAAPI). Set \`triggerType\` on each effect to control playback behavior.

**CRITICAL:** ${vo.fillCritical}
${multipleEffectsNote}
\`\`\`typescript
{
    key: '[SOURCE_KEY]',
    trigger: '${name}',
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

            fill: '[FILL_MODE]',${when(hasReversed, `\n            reversed: [INITIAL_REVERSED_BOOL],`)}
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]',
            delay: [DELAY_MS],
            iterations: [ITERATIONS],
            alternate: [ALTERNATE_BOOL]${when(hasEffectId, `,\n            effectId: '[UNIQUE_EFFECT_ID]'`)}
        },
        // additional effects targeting other elements can be added here
    ]
}
\`\`\`

### Variables

${buildVariables(trigger, hasReversed, hasEffectId)}

---

## Rule 2: transition / transitionProperties (StateEffect)

Use \`transition\` or \`transitionProperties\` when the ${name} should toggle styles via DOM attribute change and CSS transitions rather than keyframe animations. Set \`stateAction\` on the effect to control how the style is applied.

Use \`transition\` when all properties share timing. Use \`transitionProperties\` when each property needs independent \`duration\`, \`delay\`, or \`easing\`.

\`\`\`typescript
{
    key: '[SOURCE_KEY]',
    trigger: '${name}',
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
\`\`\`

### Variables

- \`[SOURCE_KEY]\` / \`[TARGET_KEY]\` — same as Rule 1.
- \`[STATE_ACTION]\` — \`stateAction\` on the effect. One of:
${Object.entries(trigger.stateActionDescriptions)
  .map(([k, v]) => `  - \`'${k}'\` — ${v}`)
  .join('\n')}
- \`[CSS_PROP]\` — CSS property name as a string in camelCase format (e.g. \`'backgroundColor'\`, \`'borderRadius'\`, \`'opacity'\`).
- \`[VALUE]\` — target CSS value for the property.
- \`[DURATION_MS]\` — transition duration in milliseconds.
- \`[DELAY_MS]\` — optional transition delay in milliseconds.
- \`[EASING_FUNCTION]\` — CSS easing string, or named easing from \`@wix/motion\`.

---

## Rule 3: customEffect (TimeEffect)

Use \`customEffect\` when you need imperative control over the animation (e.g. counters, canvas drawing, custom DOM manipulation${when(vo.customEffectExamples, vo.customEffectExamples)}). The callback receives the target element and a \`progress\` value (0–1) driven by the animation timeline.

\`\`\`typescript
{
    key: '[SOURCE_KEY]',
    trigger: '${name}',
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
\`\`\`

### Variables

- \`[SOURCE_KEY]\` / \`[TARGET_KEY]\` / \`[TRIGGER_TYPE]\` — same as Rule 1.
- \`[CUSTOM_EFFECT_CALLBACK]\` — function with signature \`(element: HTMLElement, progress: number) => void\`. Called on each animation frame with the target element and \`progress\` from 0 to 1.
- \`[DURATION_MS]\` — animation duration in milliseconds.
- \`[EASING_FUNCTION]\` — CSS easing string, or named easing from \`@wix/motion\`.

---

## Rule 4: Sequences

Use sequences when a ${name} should sync/stagger animations across multiple elements. Set \`triggerType\` on the sequence config to control playback behavior.

\`\`\`typescript
{
    key: '[SOURCE_KEY]',
    trigger: '${name}',
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
\`\`\`

### Variables

- \`[SOURCE_KEY]\` / \`[TRIGGER_TYPE]\` — same as Rule 1. \`triggerType\` is set on the sequence config, not on individual effects within the sequence.
- \`[OFFSET_MS]\` — time offset for staggering each child's animation start, in milliseconds.
- \`[OFFSET_EASING]\` — easing curve for the offset staggering distribution.${when(vo.offsetEasingSuffix, vo.offsetEasingSuffix)} Defaults to \`'linear'\`.
- \`[EFFECT_DEFINITION]\` — a definition of or a reference to a time-based animation effect.
`;
}

function buildVariables(trigger, hasReversed, hasEffectId) {
  const vo = trigger.variableOverrides;

  const lines = [
    `- \`[SOURCE_KEY]\` — identifier matching the element's key (\`data-interact-key\` for web, \`interactKey\` for React). ${vo.sourceKeySuffix}`,
    `- \`[TARGET_KEY]\` — ${vo.targetKeyDesc}`,
    `- \`[TRIGGER_TYPE]\` — \`triggerType\` on the effect. One of:`,
    ...Object.entries(trigger.triggerTypeDescriptions).map(([k, v]) => `  - \`'${k}'\` — ${v}`),
    `- \`[KEYFRAMES]\` — array of keyframe objects (e.g. \`[{ opacity: 0 }, { opacity: 1 }]\`). Property names in camelCase.`,
    `- \`[EFFECT_NAME]\` — unique string identifier for a \`keyframeEffect\`.`,
    `- \`[NAMED_EFFECT_DEFINITION]\` — object with properties of pre-built effect from \`@wix/motion-presets\`. Refer to motion-presets rules for available presets and their options.`,
    `- \`[FILL_MODE]\` — ${vo.fillModeDesc}`,
  ];
  if (hasReversed) {
    lines.push(
      `- \`[INITIAL_REVERSED_BOOL]\` — optional. \`true\` to start in the finished state so the entire effect is reversed.`,
    );
  }
  lines.push(
    `- \`[DURATION_MS]\` — animation duration in milliseconds.`,
    `- \`[EASING_FUNCTION]\` — ${vo.easingDesc}`,
    `- \`[DELAY_MS]\` — optional delay before the effect starts, in milliseconds.`,
    `- \`[ITERATIONS]\` — ${vo.iterationsDesc}`,
    `- \`[ALTERNATE_BOOL]\` — optional. \`true\` to alternate direction on every other iteration (within a single playback).${when(vo.alternateBoolSuffix, vo.alternateBoolSuffix)}`,
  );
  if (hasEffectId) {
    lines.push(
      `- \`[UNIQUE_EFFECT_ID]\` — optional. String identifier used by \`animationEnd\` triggers for chaining, and by sequences for referencing effects from the top-level \`effects\` map.`,
    );
  }
  return lines.join('\n');
}
