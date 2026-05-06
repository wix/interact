import { capitalize, buildPitfallsBlock, varLine } from './_helpers.mjs';

const VARIABLE_OVERRIDES_BASE = {
  sourceKeySuffix: '',
  targetKeyDesc:
    "identifier matching the element's key on the element that animates.",
  fillModeDesc: '',
  easingDesc: 'CSS easing string, or named easing from `@wix/motion`.',
  iterationsDesc: 'optional. Number of iterations, or `Infinity` for continuous loops.',
  fillCritical: '',
  customEffectExamples: '',
  offsetEasingSuffix: '',
  alternateBoolSuffix: '',
};

const VARIABLE_OVERRIDES = {
  hover: {
    ...VARIABLE_OVERRIDES_BASE,
    sourceKeySuffix: 'The element that listens for hover.',
    targetKeyDesc:
      "identifier matching the element's key on the element that animates. Use a different key from `[SOURCE_KEY]` when source and target must be separated (see hit-area shift above).",
    fillModeDesc:
      "usually `'both'`. Keeps the final state applied while hovering, and prevents garbage-collection of animation when finished.",
    easingDesc:
      "CSS easing string (e.g. `'ease-out'`, `'ease-in-out'`, `'cubic-bezier(0.4, 0, 0.2, 1)'`), or named easing from `@wix/motion`.",
    iterationsDesc:
      "optional. Number of iterations, or `Infinity` for continuous loops. Primarily useful with `triggerType: 'state'`.",
    fillCritical:
      "Always include `fill: 'both'` for `triggerType: 'alternate'`, `'repeat'` — keeps the effect applied while hovering and prevents garbage-collection. For `triggerType: 'once'` use `fill: 'backwards'`.",
    offsetEasingSuffix: ' CSS easing string, or named easing from `@wix/motion`.',
  },
  click: {
    ...VARIABLE_OVERRIDES_BASE,
    sourceKeySuffix: 'The element that listens for clicks.',
    targetKeyDesc:
      "identifier matching the element's key on the element that animates. If missing it defaults to `[SOURCE_KEY]` for targeting the source element.",
    fillModeDesc:
      "optional. Always `'both'` with `triggerType: 'alternate'` or `'repeat'`, otherwise depends on the effect.",
    fillCritical:
      "Always include `fill: 'both'` for `triggerType: 'alternate'` or `'repeat'` — keeps the effect applied while finished and prevents garbage-collection, allowing efficient toggling. For `triggerType: 'once'` use `fill: 'backwards'`.",
    customEffectExamples: ', randomized behavior',
    alternateBoolSuffix: "Different from `triggerType: 'alternate'` which alternates per click.",
  },
};

/**
 * Renders a trigger-specific rule file (click.md or hover.md).
 * @param {{ triggers: object[], effects: object, meta: object, trigger: object }} data
 * @param {import('../../scripts/build-rules.mjs').Fragments} fragments
 */
export function render(data, fragments) {
  const { trigger } = data;
  const { name } = trigger;
  const vo = VARIABLE_OVERRIDES[name];
  const Name = capitalize(name);
  const hasReversed = trigger.hasReversed;
  const hasEffectId = trigger.hasEffectId;

  const pitfallsBlock = buildPitfallsBlock(trigger, fragments, { wrapped: true });

  const multipleEffectsNote = trigger.showMultipleEffectsNote
    ? `\n${fragments.get('multiple-effects-note', 'default', { triggerName: name, triggerEvent: `${name} event`, triggerContext: '', extraNote: '' })}\n`
    : '';

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

            fill: '[FILL_MODE]',${hasReversed ? `\n            reversed: [INITIAL_REVERSED_BOOL],` : ''}
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]',
            delay: [DELAY_MS],
            iterations: [ITERATIONS],
            alternate: [ALTERNATE_BOOL]${hasEffectId ? `,\n            effectId: '[UNIQUE_EFFECT_ID]'` : ''}
        },
        // additional effects targeting other elements can be added here
    ]
}
\`\`\`

### Variables

${buildVariables(trigger, vo, hasReversed, hasEffectId)}

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
  .map(([k, v]) => `  - \`'${k}'\` — ${v.full}`)
  .join('\n')}
- \`[CSS_PROP]\` — CSS property name as a string in camelCase format (e.g. \`'backgroundColor'\`, \`'borderRadius'\`, \`'opacity'\`).
- \`[VALUE]\` — target CSS value for the property.
- \`[DURATION_MS]\` — transition duration in milliseconds.
- \`[DELAY_MS]\` — optional transition delay in milliseconds.
- \`[EASING_FUNCTION]\` — CSS easing string, or named easing from \`@wix/motion\`.

---

## Rule 3: customEffect (TimeEffect)

Use \`customEffect\` when you need imperative control over the animation (e.g. counters, canvas drawing, custom DOM manipulation${vo.customEffectExamples || ''}). The callback receives the target element and a \`progress\` value (0–1) driven by the animation timeline.

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
- \`[OFFSET_EASING]\` — easing curve for the offset staggering distribution.${vo.offsetEasingSuffix || ''} Defaults to \`'linear'\`.
- \`[EFFECT_DEFINITION]\` — a definition of or a reference to a time-based animation effect.
`;
}

function buildVariables(trigger, vo, hasReversed, hasEffectId) {
  const lines = [
    varLine('SOURCE_KEY', vo.sourceKeySuffix),
    varLine('TARGET_KEY', vo.targetKeyDesc),
    `- \`[TRIGGER_TYPE]\` — \`triggerType\` on the effect. One of:`,
    ...Object.entries(trigger.triggerTypeDescriptions).map(([k, v]) => `  - \`'${k}'\` — ${v.full}`),
    varLine('KEYFRAMES'),
    varLine('EFFECT_NAME'),
    varLine('NAMED_EFFECT_DEFINITION'),
    varLine('FILL_MODE', vo.fillModeDesc),
  ];
  if (hasReversed) {
    lines.push(
      `- \`[INITIAL_REVERSED_BOOL]\` — optional. \`true\` to start in the finished state so the entire effect is reversed.`,
    );
  }
  lines.push(
    varLine('DURATION_MS'),
    varLine('EASING_FUNCTION', vo.easingDesc),
    varLine('DELAY_MS'),
    varLine('ITERATIONS', vo.iterationsDesc),
    varLine('ALTERNATE_BOOL', vo.alternateBoolSuffix || undefined),
  );
  if (hasEffectId) {
    lines.push(varLine('UNIQUE_EFFECT_ID'));
  }
  return lines.join('\n');
}
