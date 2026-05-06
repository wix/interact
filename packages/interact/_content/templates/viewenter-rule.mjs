import { buildPitfallsBlock, varLine } from './_helpers.mjs';

/**
 * Renders viewenter.md — rules for viewport-entry triggered animations.
 * @param {{ triggers: object[], effects: object, meta: object, trigger: object }} data
 * @param {import('../../scripts/build-rules.mjs').Fragments} fragments
 */
export function render(data, fragments) {
  const { trigger } = data;

  const pitfallsBlock = buildPitfallsBlock(trigger, fragments, { wrapped: true });

  const paramDescriptions = trigger.params
    .map((p) => {
      const vn = p.varName || p.name.toUpperCase();
      const optionalPrefix = p.optional ? 'optional. ' : '';
      return `- \`[${vn}]\` — ${optionalPrefix}${p.description}`;
    })
    .join('\n');

  return `# ViewEnter Trigger Rules for ${data.meta.packageName}

This document contains rules for generating interactions that respond to elements entering the viewport using the \`${data.meta.packageName}\`. ViewEnter triggers use IntersectionObserver to detect when elements become visible and are ideal for entrance animations, content reveals, and lazy-loading effects.

---
${pitfallsBlock}
## Table of Contents

- [Preventing Flash of Unstyled Content (FOUC)](#preventing-flash-of-unstyled-content-fouc)
- [Rule 1: keyframeEffect / namedEffect (TimeEffect)](#rule-1-keyframeeffect--namedeffect-timeeffect)
- [Rule 2: customEffect (TimeEffect)](#rule-2-customeffect-timeeffect)
- [Rule 3: Sequences](#rule-3-sequences)

---

## Preventing Flash of Unstyled Content (FOUC)

${fragments.get('fouc', 'short')}

### Step 1: Generate CSS and inject into \`<head>\` (preferred), or beginning of \`<body>\`

Call \`generate(config)\` server-side or at build time. Inject the resulting CSS into the document \`<head>\` (or in \`<body>\` before your content) so it loads before the page content is painted:

${fragments.get('fouc', 'code-generate-viewenter')}

${fragments.get('fouc', 'code-inject')}

### Step 2: Mark elements with \`initial\`

${fragments.get('fouc', 'code-web', { key: '[SOURCE_KEY]', classAttr: '' })}

${fragments.get('fouc', 'code-react', { key: '[SOURCE_KEY]', classAttr: '' })}

${fragments.get('fouc', 'code-vanilla', { key: '[SOURCE_KEY]', classAttr: '' })}

${fragments.get('fouc', 'rules-viewenter')}

## Rule 1: keyframeEffect / namedEffect (TimeEffect)

Use \`keyframeEffect\` or \`namedEffect\` when the viewEnter should play an animation (CSS or WAAPI). Set \`triggerType\` on each effect to control playback behavior. Use \`params\` only for observer configuration (\`threshold\`, \`inset\`).

**Multiple effects:** The \`effects\` array can contain multiple effects — all share the same viewEnter trigger and fire together when the element enters the viewport. Each effect can have its own \`triggerType\`. Use this to animate different targets from a single viewport entry event.

\`\`\`typescript
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
\`\`\`

### Variables

${varLine('SOURCE_KEY', 'The **source element** is observed for viewport intersection. This is the element the IntersectionObserver watches.')}
${varLine('TARGET_KEY', "identifier matching the element's key on the element that animates.")}
- \`[TARGET_SELECTOR]\` - optional. Selector for the child element to select inside the root element. For \`triggerType\` of \`'alternate'\`/\`'repeat'\`/\`'state'\` MUST either use a separate \`[TARGET_KEY]\` from \`[SOURCE_KEY]\` or \`selector\` for selecting a child element as target.
- \`[TRIGGER_TYPE]\` — \`triggerType\` on the effect. One of:
  - \`'once'\` (default) — plays once when the source element first enters the viewport and never again. Source and target may be the same element.
  - \`'repeat'\` — restarts the animation every time the source element enters the viewport. Use separate source and target.
  - \`'alternate'\` — plays forward when the source element enters the viewport, reverses when it leaves. Use separate source and target.
  - \`'state'\` — resumes on enter, pauses on leave. Useful for continuous loops (\`iterations: Infinity\`). Use separate source and target.
${paramDescriptions}
${varLine('KEYFRAMES')}
${varLine('EFFECT_NAME')}
${varLine('NAMED_EFFECT_DEFINITION')}
${varLine('FILL_MODE', "`'both'` for `triggerType: 'alternate'`, `'repeat'`, or `'state'`. For `triggerType: 'once'`: use `'backwards'` when the animation's final keyframe has no additional effect (over element's base style); use `'both'` otherwise.")}
${varLine('DURATION_MS')}
${varLine('EASING_FUNCTION')}
${varLine('DELAY_MS')}
${varLine('ITERATIONS', "optional. Number of iterations, or `Infinity` for continuous loops. Primarily useful with `triggerType: 'state'`.")}
${varLine('ALTERNATE_BOOL')}
${varLine('UNIQUE_EFFECT_ID')}

---

## Rule 2: customEffect (TimeEffect)

Use \`customEffect\` when you need imperative control over the animation (e.g. counters, canvas drawing, custom DOM manipulation). The callback receives the target element and a \`progress\` value (0–1) driven by the animation timeline.

\`\`\`typescript
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
\`\`\`

### Variables

- \`[SOURCE_KEY]\` / \`[TARGET_KEY]\` / \`[TRIGGER_TYPE]\` / \`[VISIBILITY_THRESHOLD]\` / \`[VIEWPORT_INSETS]\` / \`[DURATION_MS]\` / \`[EASING_FUNCTION]\` / \`[UNIQUE_EFFECT_ID]\` — same as Rule 1.
- \`[CUSTOM_EFFECT_CALLBACK]\` — function with signature \`(element: HTMLElement, progress: number) => void\`. Called on each animation frame with \`element\` being the target element, and \`progress\` from 0 to 1.

---

## Rule 3: Sequences

Use sequences when a viewEnter should sync/stagger animations across multiple elements. Set \`triggerType\` on the sequence config to control playback behavior.

\`\`\`typescript
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
\`\`\`

### Variables

- \`[SOURCE_KEY]\` / \`[VISIBILITY_THRESHOLD]\` / \`[VIEWPORT_INSETS]\` — same as Rule 1.
- \`[TRIGGER_TYPE]\` — same as Rule 1. \`triggerType\` is set on the sequence config, not on individual effects within the sequence.
- \`[OFFSET_MS]\` — time offset between each child's animation start, in milliseconds.
- \`[OFFSET_EASING]\` — CSS easing or named easing from \`@wix/motion\`, for the stagger distribution. Defaults to \`'linear'\`.
- \`[EFFECT_DEFINITION]\` — a definition of or a reference to a time-based animation effect.
`;
}
