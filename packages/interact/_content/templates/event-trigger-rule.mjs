import { capitalize } from './_helpers.mjs';

const PROSE = {
  hover: {
    timeEffectIntro: "Use `keyframeEffect` or `namedEffect` when the hover should play an animation (CSS or WAAPI). Set `triggerType` on each effect to control playback behavior.",
    stateEffectIntro: "Use `transition` or `transitionProperties` when the hover should toggle styles via DOM attribute change and CSS transitions rather than keyframe animations. Set `stateAction` on the effect to control how the style is applied.",
    customEffectIntro: "Use `customEffect` when you need imperative control over the animation (e.g. counters, canvas drawing, custom DOM manipulation). The callback receives the target element and a `progress` value (0–1) driven by the animation timeline.",
    sequencesIntro: "Use sequences when a hover should sync/stagger animations across multiple elements. Set `triggerType` on the sequence config to control playback behavior.",
    fillCritical: "Always include `fill: 'both'` for `triggerType: 'alternate'`, `'repeat'` — keeps the effect applied while hovering and prevents garbage-collection. For `triggerType: 'once'` use `fill: 'backwards'`.",
    sourceKeyDesc: "The element that listens for hover.",
    targetKeyDesc: "identifier matching the element's key on the element that animates. Use a different key from `[SOURCE_KEY]` when source and target must be separated (see hit-area shift above).",
    fillModeDesc: "usually `'both'`. Keeps the final state applied while hovering, and prevents garbage-collection of animation when finished.",
    namedEffectDesc: "object with properties of pre-built effect from `@wix/motion-presets`. Refer to motion-presets rules for available presets and their options.",
    easingDesc: "CSS easing string (e.g. `'ease-out'`, `'ease-in-out'`, `'cubic-bezier(0.4, 0, 0.2, 1)'`), or named easing from `@wix/motion`.",
    iterationsDesc: "optional. Number of iterations, or `Infinity` for continuous loops. Primarily useful with `triggerType: 'state'`.",
    alternateDesc: "optional. `true` to alternate direction on every other iteration (within a single playback).",
    customEffectCallbackDesc: "function with signature `(target: HTMLElement, progress: number) => void`. Called on each animation frame with the target element and `progress` from 0 to 1.",
    sequenceEffectDefDesc: "a definition of or a reference to a time-based animation effect.",
    sequenceOffsetEasingDesc: "easing curve for the offset staggering distribution. CSS easing string, or named easing from `@wix/motion`. Defaults to `'linear'`.",
  },
  click: {
    timeEffectIntro: "Use `keyframeEffect` or `namedEffect` when the click should play an animation (CSS or WAAPI). Set `triggerType` on each effect to control playback behavior.",
    stateEffectIntro: "Use `transition` or `transitionProperties` when the click should toggle styles via DOM attribute change and CSS transitions rather than keyframe animations. Uses the `transition` CSS property. Set `stateAction` on the effect to control how the style is applied.",
    customEffectIntro: "Use `customEffect` when you need imperative control over the animation (e.g. counters, canvas drawing, custom DOM manipulation, randomized behavior). The callback receives the target element and a `progress` value (0–1) driven by the animation timeline.",
    sequencesIntro: "Use sequences when a click should sync/stagger animations across multiple elements. Set `triggerType` on the sequence config to control playback behavior.",
    fillCritical: "Always include `fill: 'both'` for `triggerType: 'alternate'` or `'repeat'` — keeps the effect applied while finished and prevents garbage-collection, allowing efficient toggling. For `triggerType: 'once'` use `fill: 'backwards'`.",
    sourceKeyDesc: "The element that listens for clicks.",
    targetKeyDesc: "identifier matching the element's key on the element that animates. If missing it defaults to `[SOURCE_KEY]` for targeting the source element.",
    fillModeDesc: "optional. Always `'both'` with `triggerType: 'alternate'` or `'repeat'`, otherwise depends on the effect.",
    namedEffectDesc: "object with properties of pre-built, time-based animation effect from `@wix/motion-presets`. Refer to motion-presets rules for available presets and their options.",
    easingDesc: "CSS easing string, or named easing from `@wix/motion`.",
    iterationsDesc: "optional. Number of iterations, or `Infinity` for continuous loops.",
    alternateDesc: "optional. `true` to alternate direction on every other iteration (within a single playback). Different from `triggerType: 'alternate'` which alternates per click.",
    customEffectCallbackDesc: "function with signature `(element: HTMLElement, progress: number) => void`. Called on each animation frame with target element and `progress` from 0 to 1.",
    sequenceEffectDefDesc: "a definition of, or a reference to a time-based animation effect.",
    sequenceOffsetEasingDesc: "easing curve for the offset staggering distribution. Defaults to `'linear'`.",
  },
};

export function render(trigger, data, fragments) {
  const name = trigger.name;
  const Name = capitalize(name);
  const prose = PROSE[name];
  const hasReversed = trigger.templateFields.timeEffect.includes('reversed');
  const hasEffectId = trigger.templateFields.timeEffect.includes('effectId');
  const showMultipleEffects = trigger.showMultipleEffectsNote;

  const pitfallsBlock = trigger.pitfalls.length > 0
    ? '\n' + trigger.pitfalls.map(p => fragments.get(`pitfalls/${p.id}`, name)).join('\n') + '\n'
    : '';

  const multipleEffectsNote = showMultipleEffects
    ? `\n${fragments.get('multiple-effects-note', 'default', { triggerName: name, triggerEvent: `${name} event` })}\n`
    : '';

  const rule1Closing = `        },\n        // additional effects targeting other elements can be added here`;
  const rule23Closing = showMultipleEffects
    ? `        },\n        // additional effects targeting other elements can be added here`
    : `        }`;

  const reversedField = hasReversed
    ? `\n            reversed: [INITIAL_REVERSED_BOOL],`
    : '';

  const effectIdField = hasEffectId
    ? `\n            effectId: '[UNIQUE_EFFECT_ID]'`
    : '';

  const reversedVar = hasReversed
    ? `\n- \`[INITIAL_REVERSED_BOOL]\` — optional. \`true\` to start in the finished state so the entire effect is reversed.`
    : '';

  const effectIdVar = hasEffectId
    ? `\n- \`[UNIQUE_EFFECT_ID]\` — optional. String identifier used by \`animationEnd\` triggers for chaining, and by sequences for referencing effects from the top-level \`effects\` map.`
    : '';

  const fillModeVar = `- \`[FILL_MODE]\` — ${prose.fillModeDesc}`;

  const variablesBlock = buildVariables(trigger, prose, fillModeVar, reversedVar, effectIdVar);

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

${prose.timeEffectIntro}

**CRITICAL:** ${prose.fillCritical}
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

            fill: '[FILL_MODE]',${reversedField}
            duration: [DURATION_MS],
            easing: '[EASING_FUNCTION]',
            delay: [DELAY_MS],
            iterations: [ITERATIONS],
            alternate: [ALTERNATE_BOOL]${hasEffectId ? ',' : ''}${effectIdField}
${rule1Closing}
    ]
}
\`\`\`

### Variables

${variablesBlock}

---

## Rule 2: transition / transitionProperties (StateEffect)

${prose.stateEffectIntro}

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
${rule23Closing}
    ]
}
\`\`\`

### Variables

- \`[SOURCE_KEY]\` / \`[TARGET_KEY]\` — same as Rule 1.
- \`[STATE_ACTION]\` — \`stateAction\` on the effect. One of:
${Object.entries(trigger.stateActionDescriptions).map(([k, v]) => `  - \`'${k}'\` — ${v}`).join('\n')}
- \`[CSS_PROP]\` — CSS property name as a string in camelCase format (e.g. \`'backgroundColor'\`, \`'borderRadius'\`, \`'opacity'\`).
- \`[VALUE]\` — target CSS value for the property.
- \`[DURATION_MS]\` — transition duration in milliseconds.
- \`[DELAY_MS]\` — optional transition delay in milliseconds.
- \`[EASING_FUNCTION]\` — CSS easing string, or named easing from \`@wix/motion\`.

---

## Rule 3: customEffect (TimeEffect)

${prose.customEffectIntro}

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
${rule23Closing}
    ]
}
\`\`\`

### Variables

- \`[SOURCE_KEY]\` / \`[TARGET_KEY]\` / \`[TRIGGER_TYPE]\` — same as Rule 1.
- \`[CUSTOM_EFFECT_CALLBACK]\` — ${prose.customEffectCallbackDesc}
- \`[DURATION_MS]\` — animation duration in milliseconds.
- \`[EASING_FUNCTION]\` — CSS easing string, or named easing from \`@wix/motion\`.

---

## Rule 4: Sequences

${prose.sequencesIntro}

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
- \`[OFFSET_EASING]\` — ${prose.sequenceOffsetEasingDesc}
- \`[EFFECT_DEFINITION]\` — ${prose.sequenceEffectDefDesc}
`;
}

function buildVariables(trigger, prose, fillModeVar, reversedVar, effectIdVar) {
  const lines = [
    `- \`[SOURCE_KEY]\` — identifier matching the element's key (\`data-interact-key\` for web, \`interactKey\` for React). ${prose.sourceKeyDesc}`,
    `- \`[TARGET_KEY]\` — ${prose.targetKeyDesc}`,
    `- \`[TRIGGER_TYPE]\` — \`triggerType\` on the effect. One of:`,
    ...Object.entries(trigger.triggerTypeDescriptions).map(([k, v]) => `  - \`'${k}'\` — ${v}`),
    `- \`[KEYFRAMES]\` — array of keyframe objects (e.g. \`[{ opacity: 0 }, { opacity: 1 }]\`). Property names in camelCase.`,
    `- \`[EFFECT_NAME]\` — unique string identifier for a \`keyframeEffect\`.`,
    `- \`[NAMED_EFFECT_DEFINITION]\` — ${prose.namedEffectDesc}`,
    fillModeVar,
  ];
  if (reversedVar) lines.push(reversedVar.trim());
  lines.push(
    `- \`[DURATION_MS]\` — animation duration in milliseconds.`,
    `- \`[EASING_FUNCTION]\` — ${prose.easingDesc}`,
    `- \`[DELAY_MS]\` — optional delay before the effect starts, in milliseconds.`,
    `- \`[ITERATIONS]\` — ${prose.iterationsDesc}`,
    `- \`[ALTERNATE_BOOL]\` — ${prose.alternateDesc}`,
  );
  if (effectIdVar) lines.push(effectIdVar.trim());
  return lines.join('\n');
}
