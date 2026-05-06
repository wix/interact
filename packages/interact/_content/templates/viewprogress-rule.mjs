import { buildPitfallsBlock, varLine } from './_helpers.mjs';

/**
 * Renders viewprogress.md — rules for scroll-driven animations using ViewTimeline.
 * @param {{ triggers: object[], effects: object, meta: object, trigger: object }} data
 * @param {import('../../scripts/build-rules.mjs').Fragments} fragments
 */
export function render(data, fragments) {
  const { trigger } = data;

  const pitfalls = buildPitfallsBlock(trigger, fragments);

  const rangeList = Object.entries(data.effects.rangeNames)
    .map(([name, desc]) => {
      return `  - \`'${name}'\` — ${desc}.`;
    })
    .join('\n');

  return `# ViewProgress Trigger Rules for ${data.meta.packageName}

These rules help generate scroll-driven interactions using \`${data.meta.packageName}\`. ViewProgress triggers create animations that update continuously as elements move through the viewport, leveraging native CSS ViewTimelines where supported, and using a polyfill library where unsupported. Use when animation progress should be tied to the element's scroll position.
${pitfalls ? `\n${pitfalls}\n` : ''}
**Offset semantics:** The \`offset\` inside \`rangeStart\`/\`rangeEnd\` is an object \`{ unit: 'percentage', value: NUMBER }\` where value is 0–100. For absolute lengths use \`{ unit: 'px', value: NUMBER }\` (or other CSS length units). Positive values move the effective range boundary forward along the scroll axis.

## Table of Contents

- [Rule 1: ViewProgress with keyframeEffect or namedEffect](#rule-1-viewprogress-with-keyframeeffect-or-namedeffect)
- [Rule 2: ViewProgress with customEffect](#rule-2-viewprogress-with-customeffect)
- [Rule 3: ViewProgress with Tall Wrapper + Sticky Container (contain range)](#rule-3-viewprogress-with-tall-wrapper--sticky-container-contain-range)

---

## Rule 1: ViewProgress with keyframeEffect or namedEffect

**Use Case**: Scroll-driven CSS-based effects.

${trigger.showMultipleEffectsNote ? fragments.get('multiple-effects-note', 'viewProgress') : ''}

### Template

\`\`\`typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'viewProgress',
    effects: [
        {
            key: '[TARGET_KEY]',
            // --- pick ONE of the two effect types ---
            namedEffect: [NAMED_EFFECT_DEFINITION],
            // OR
            keyframeEffect: { name: '[EFFECT_NAME]', keyframes: [EFFECT_KEYFRAMES] },

            rangeStart: { name: '[RANGE_NAME]', offset: { unit: 'percentage', value: [START_PERCENTAGE] } },
            rangeEnd: { name: '[RANGE_NAME]', offset: { unit: 'percentage', value: [END_PERCENTAGE] } },
            easing: '[EASING_FUNCTION]', // usually 'linear'
            fill: 'both',
            effectId: '[UNIQUE_EFFECT_ID]'
        },
        // additional effects targeting other elements can be added here
    ]
}
\`\`\`

### Variables

${varLine('SOURCE_KEY', 'The element whose scroll position drives the animation.')}
${varLine('TARGET_KEY', "identifier matching the element's key (`data-interact-key` for web, `interactKey` for React) on the element to animate (can be same as source or different).")}
- \`[NAMED_EFFECT_DEFINITION]\` — object with properties of pre-built effect from \`@wix/motion-presets\`. **CRITICAL:** Scroll presets (\`*Scroll\`) MUST include \`range: 'in' | 'out' | 'continuous'\` in their options. \`'in'\` ends at the idle state, \`'out'\` starts from the idle state, \`'continuous'\` passes through it.
${varLine('EFFECT_NAME')}
- \`[EFFECT_KEYFRAMES]\` — array of keyframe objects defining CSS property values (e.g. \`[{ opacity: 0 }, { opacity: 1 }]\`). Property names in camelCase.
- \`[RANGE_NAME]\` — scroll range name:
${rangeList}
- \`[START_PERCENTAGE]\` — 0–100, starting point within the named range.
- \`[END_PERCENTAGE]\` — 0–100, end point within the named range.
${varLine('EASING_FUNCTION', "CSS easing string or named easing from `@wix/motion`. Typically `'linear'` for scrolling effects.")}
${varLine('UNIQUE_EFFECT_ID')}

---

## Rule 2: ViewProgress with customEffect

**Use Case**: Scroll-driven effects requiring JavaScript logic (e.g., changing SVG attributes, controlling WebGL/WebGPU effects).

### Template

\`\`\`typescript
{
    key: '[SOURCE_KEY]',
    trigger: 'viewProgress',
    effects: [
        {
            key: '[TARGET_KEY]',
            customEffect: [CUSTOM_EFFECT_CALLBACK],
            rangeStart: { name: '[RANGE_NAME]', offset: { unit: 'percentage', value: [START_PERCENTAGE] } },
            rangeEnd: { name: '[RANGE_NAME]', offset: { unit: 'percentage', value: [END_PERCENTAGE] } },
            easing: '[EASING_FUNCTION]', // usually 'linear'
            fill: 'both',
            effectId: '[UNIQUE_EFFECT_ID]'
        },
        // additional effects targeting other elements can be added here
    ]
}
\`\`\`

### Variables

- \`[SOURCE_KEY]\` / \`[TARGET_KEY]\` — same as Rule 1.
${varLine('CUSTOM_EFFECT_CALLBACK')}
- \`[RANGE_NAME]\` / \`[START_PERCENTAGE]\` / \`[END_PERCENTAGE]\` / \`[EASING_FUNCTION]\` / \`[UNIQUE_EFFECT_ID]\` — same as Rule 1.

---

## Rule 3: ViewProgress with Tall Wrapper + Sticky Container (contain range)

**Use Case**: Scroll-driven animations inside a sticky-positioned container, where the source element is a tall wrapper and the effect applies during the "stuck" phase using \`position: sticky\` to lock a container and \`contain\` range to animate only during the stuck phase. Good for heavy effects on large media elements or scrolly-telling effects.

**Layout Structure**:

- **Tall wrapper** (\`[TALL_WRAPPER_KEY]\`): An element with enough height to create scroll distance (e.g., \`height: 300vh\`). This is the ViewTimeline source. The taller it is relative to the viewport, the longer the scroll distance and the more "duration" the animation has.
- **Sticky container**: A direct child with \`position: sticky; top: 0; height: 100vh\` that stays fixed in the viewport while the wrapper scrolls past.
- **Animated elements** (\`[STICKY_CHILD_KEY]\`): Children of the sticky container that receive the effects.

### Template

\`\`\`typescript
{
    key: '[TALL_WRAPPER_KEY]',
    trigger: 'viewProgress',
    effects: [
        {
            key: '[STICKY_CHILD_KEY]',
            // Use keyframeEffect, namedEffect, or customEffect as in Rules 1–2
            keyframeEffect: { name: '[EFFECT_NAME]', keyframes: [EFFECT_KEYFRAMES] },
            rangeStart: { name: 'contain', offset: { unit: 'percentage', value: [START_PERCENTAGE] } },
            rangeEnd: { name: 'contain', offset: { unit: 'percentage', value: [END_PERCENTAGE] } },
            easing: '[EASING_FUNCTION]', // usually 'linear'
            fill: 'both',
            effectId: '[UNIQUE_EFFECT_ID]'
        },
        // additional effects targeting other elements can be added here
    ]
}
\`\`\`

### Variables

- \`[TALL_WRAPPER_KEY]\` — key for the tall outer element that defines the scroll distance — this is the ViewTimeline source.
- \`[STICKY_CHILD_KEY]\` — key for the animated element inside the sticky container.
- \`[EFFECT_NAME]\` / \`[EFFECT_KEYFRAMES]\` — same as Rule 1.
- \`[START_PERCENTAGE]\` — 0–100, starting point within the \`contain\` range (the stuck phase).
- \`[END_PERCENTAGE]\` — 0–100, end point within the \`contain\` range.
- \`[EASING_FUNCTION]\` / \`[UNIQUE_EFFECT_ID]\` — same as Rule 1.
`;
}
