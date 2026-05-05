import { capitalize } from './_helpers.mjs';

export function render(trigger, data, fragments) {
  const name = trigger.name;
  const Name = capitalize(name);
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

  const fillModeVarDash = trigger.fillModeDash || '—';

  const reversedVar = hasReversed
    ? `\n- \`[INITIAL_REVERSED_BOOL]\` — optional. \`true\` to start in the finished state so the entire effect is reversed.`
    : '';

  const effectIdVar = hasEffectId
    ? `\n- \`[UNIQUE_EFFECT_ID]\` — optional. String identifier used by \`animationEnd\` triggers for chaining, and by sequences for referencing effects from the top-level \`effects\` map.`
    : '';

  const fillModeVar = `- \`[FILL_MODE]\` ${fillModeVarDash} ${trigger.fillModeDesc}`;

  const variablesBlock = trigger.fillModeAtEnd
    ? buildVariablesEndFill(trigger, fillModeVar, reversedVar, effectIdVar)
    : buildVariablesMidFill(trigger, fillModeVar, reversedVar, effectIdVar);

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

${trigger.timeEffectIntro}

**CRITICAL:** ${trigger.fillCritical}
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

${trigger.stateEffectIntro}

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

${trigger.customEffectIntro}

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
- \`[CUSTOM_EFFECT_CALLBACK]\` — ${trigger.customEffectCallbackDesc}
- \`[DURATION_MS]\` — animation duration in milliseconds.
- \`[EASING_FUNCTION]\` — CSS easing string, or named easing from \`@wix/motion\`.

---

## Rule 4: Sequences

${trigger.sequencesIntro}

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
- \`[OFFSET_EASING]\` — ${trigger.sequenceOffsetEasingDesc}
- \`[EFFECT_DEFINITION]\` — ${trigger.sequenceEffectDefDesc}
`;
}

function buildVariablesMidFill(trigger, fillModeVar, reversedVar, effectIdVar) {
  const lines = [
    `- \`[SOURCE_KEY]\` — identifier matching the element's key (\`data-interact-key\` for web, \`interactKey\` for React). ${trigger.sourceKeyDesc}`,
    `- \`[TARGET_KEY]\` — ${trigger.targetKeyDesc}`,
    `- \`[TRIGGER_TYPE]\` — \`triggerType\` on the effect. One of:`,
    ...Object.entries(trigger.triggerTypeDescriptions).map(([k, v]) => `  - \`'${k}'\` — ${v}`),
    `- \`[KEYFRAMES]\` — array of keyframe objects (e.g. \`[{ opacity: 0 }, { opacity: 1 }]\`). Property names in camelCase.`,
    `- \`[EFFECT_NAME]\` — unique string identifier for a \`keyframeEffect\`.`,
    `- \`[NAMED_EFFECT_DEFINITION]\` — ${trigger.namedEffectDesc}`,
    fillModeVar,
  ];
  if (reversedVar) lines.push(reversedVar.trim());
  lines.push(
    `- \`[DURATION_MS]\` — animation duration in milliseconds.`,
    `- \`[EASING_FUNCTION]\` — ${trigger.easingDesc}`,
    `- \`[DELAY_MS]\` — optional delay before the effect starts, in milliseconds.`,
    `- \`[ITERATIONS]\` — ${trigger.iterationsDesc}`,
    `- \`[ALTERNATE_BOOL]\` — ${trigger.alternateDesc}`,
  );
  if (effectIdVar) lines.push(effectIdVar.trim());
  return lines.join('\n');
}

function buildVariablesEndFill(trigger, fillModeVar, reversedVar, effectIdVar) {
  const lines = [
    `- \`[SOURCE_KEY]\` — identifier matching the element's key (\`data-interact-key\` for web, \`interactKey\` for React). ${trigger.sourceKeyDesc}`,
    `- \`[TARGET_KEY]\` — ${trigger.targetKeyDesc}`,
    `- \`[TRIGGER_TYPE]\` — \`triggerType\` on the effect. One of:`,
    ...Object.entries(trigger.triggerTypeDescriptions).map(([k, v]) => `  - \`'${k}'\` — ${v}`),
    `- \`[KEYFRAMES]\` — array of keyframe objects (e.g. \`[{ opacity: 0 }, { opacity: 1 }]\`). Property names in camelCase.`,
    `- \`[EFFECT_NAME]\` — unique string identifier for a \`keyframeEffect\`.`,
    `- \`[NAMED_EFFECT_DEFINITION]\` — ${trigger.namedEffectDesc}`,
    `- \`[DURATION_MS]\` — animation duration in milliseconds.`,
    `- \`[EASING_FUNCTION]\` — ${trigger.easingDesc}`,
    `- \`[DELAY_MS]\` — optional delay before the effect starts, in milliseconds.`,
    `- \`[ITERATIONS]\` — ${trigger.iterationsDesc}`,
    `- \`[ALTERNATE_BOOL]\` — ${trigger.alternateDesc}`,
    fillModeVar,
  ];
  return lines.join('\n');
}
