import { capitalize, buildMarkdownTable } from './_helpers.mjs';

const FULL_LEAN_PITFALL_ORDER = [
  { id: 'overflow-clip', section: 'long' },
  { id: 'same-element-viewenter', section: 'long' },
  { id: 'hit-area', section: 'detailed-hover' },
  { id: 'hit-area', section: 'detailed-pointermove' },
];

function buildBehaviorTable(headerLabel, behaviorKey, hover, click, { defaultKey } = {}) {
  const hoverDescs = hover[behaviorKey];
  const clickDescs = click[behaviorKey];
  const keys = Object.keys(hoverDescs);

  const rows = keys.map((k) => {
    const isDefault = defaultKey ? k === defaultKey : false;
    const label = isDefault ? `\`'${k}'\` (default)` : `\`'${k}'\``;
    return [label, hoverDescs[k].short, clickDescs[k].short];
  });

  return buildMarkdownTable([headerLabel, 'hover behavior', 'click behavior'], rows);
}

function buildFullLeanPitfalls(pitfallOrder, fragments) {
  return pitfallOrder.map((p) => fragments.get(`pitfalls/${p.id}`, p.section)).join('\n');
}

/**
 * Renders full-lean.md — the comprehensive reference for all triggers, effects, and API surface.
 *
 * The largest static prose sections (Element Binding, Interactions, StateEffect) are extracted to
 * `full-lean/` fragments for editor ergonomics (markdown highlighting, spell-checking). Remaining
 * static sections (Effects preamble, FOUC Prevention) are kept inline — they interleave with
 * dynamic content and extracting them would fragment the template's flow.
 *
 * @param {{ triggers: object[], effects: object, meta: object }} data — no `trigger`; receives the full data object
 * @param {import('../../scripts/build-rules.mjs').Fragments} fragments
 */
export function render(data, fragments) {
  const hover = data.triggers.find((t) => t.name === 'hover');
  const click = data.triggers.find((t) => t.name === 'click');
  const viewEnter = data.triggers.find((t) => t.name === 'viewEnter');

  const triggerTypeUnion = data.effects.triggerTypes.map((t) => `'${t}'`).join(' | ');
  const rangeNameUnion = Object.keys(data.effects.rangeNames)
    .map((n) => `'${n}'`)
    .join(' | ');
  const easingList = data.effects.easings.map((e) => `\`'${e}'\``).join(', ');

  const presetEntries = Object.entries(data.effects.presets).map(([category, names]) => ({
    label: capitalize(category),
    value: `\`${names.join('`, `')}\``,
  }));
  const maxPresetLen = Math.max(...presetEntries.map((e) => e.value.length));
  const presetTable = presetEntries
    .map((e) => `   | ${e.label.padEnd(8)} | ${e.value.padEnd(maxPresetLen)} |`)
    .join('\n');

  const rangeTable = buildMarkdownTable(
    ['Range name', 'Meaning'],
    Object.entries(data.effects.rangeNames).map(([name, desc]) => [`\`${name}\``, desc]),
  );

  return `# ${data.meta.packageName} — Rules

Declarative configuration-driven interaction library. Binds animations to triggers via JSON config.

## Table of Contents

- [Common Pitfalls](#common-pitfalls)
- [Quick Start](#quick-start)
- [Element Binding](#element-binding)
- [Config Structure](#config-structure)
- [Interactions](#interactions)
- [Triggers](#triggers)
  - [hover / click](#hover--click)
  - [viewEnter](#viewenter)
  - [viewProgress](#viewprogress)
  - [pointerMove](#pointermove)
  - [animationEnd](#animationend)
- [Effects](#effects)
  - [Time-based Effect](#time-based-effect)
  - [Scroll / Pointer-driven Effect](#scroll--pointer-driven-effect)
  - [State Effect](#stateeffect-css-style-toggle)
  - [Animation Payloads](#animation-payloads)
- [Sequences](#sequences)
- [Conditions](#conditions)
- [FOUC Prevention](#fouc-prevention)
- [Element Resolution](#element-resolution)
- [Static API](#static-api)

---

## Common Pitfalls

Each item here is CRITICAL — ignoring any of them will break animations.

${buildFullLeanPitfalls(FULL_LEAN_PITFALL_ORDER, fragments)}
${fragments.get('pitfalls/dont-guess-presets', 'default')}
${fragments.get('pitfalls/reduced-motion', 'default')}
${fragments.get('pitfalls/perspective', 'default')}

---

## Quick Start

${fragments.get('quick-start', 'install')}

${fragments.get('quick-start', 'multiple-instances')}

${fragments.get('quick-start', 'web')}

${fragments.get('quick-start', 'react')}

${fragments.get('quick-start', 'vanilla')}

${fragments.get('quick-start', 'cdn')}

${fragments.get('quick-start', 'register-presets')}

---

${fragments.get('full-lean/element-binding')}

---

## Config Structure

${fragments.get('config-structure', 'detailed')}

---

${fragments.get('full-lean/interactions')}

---

## Triggers

- **interactions: Interaction[]**
  - **Purpose**: Declarative mapping from a source element and trigger to one or more target effects.
  - Each \`Interaction\` contains:
    - **key: string**
      - REQUIRED. The source element path. The trigger attaches to this element.
    - **listContainer?: string**
      - OPTIONAL. A CSS selector for a list container context. When present, the trigger is scoped to items within this list.
    - **listItemSelector?: string**
      - OPTIONAL. A CSS selector used to select items within \`listContainer\`.
    - **trigger: TriggerType**
      - REQUIRED. One of:
        - \`'hover' | 'click' | 'activate' | 'interest'\`: Pointer interactions (\`activate\` = click with keyboard Space/Enter; \`interest\` = hover with focus).
        - \`'viewEnter' | 'viewProgress'\`: Viewport visibility/progress triggers.
        - \`'animationEnd'\`: Fires when a specific effect completes on the source element.
        - \`'pointerMove'\`: Continuous pointer motion over an area.
    - **params?: TriggerParams**
      - OPTIONAL. Parameter object that MUST match the trigger:
        - hover/click/activate/interest: No params needed. Behavior is configured on the effect itself.
        - viewEnter: \`ViewEnterParams\`
          - \`threshold?\`: number in [0,1] describing intersection threshold
          - \`inset?\`: string CSS-style inset for rootMargin/observer geometry
        - viewProgress: No trigger params. Progress is driven by ViewTimeline/scroll scenes. Control the range via \`ScrubEffect.rangeStart/rangeEnd\` and \`namedEffect.range\`.
        - animationEnd: \`AnimationEndParams\`
          - \`effectId\`: string of the effect to wait for completion
          - Usage: Fire when the specified effect (by \`effectId\`) on the source element finishes, useful for chaining sequences.
        - pointerMove: \`PointerMoveParams\`
          - \`hitArea?\`: \`'root' | 'self'\` (default \`'self'\`)
          - \`axis?\`: \`'x' | 'y'\` - when using \`keyframeEffect\` with \`pointerMove\`, selects which pointer coordinate maps to linear 0-1 progress; defaults to \`'y'\`. Ignored for \`namedEffect\` and \`customEffect\`.
          - Usage:
            - \`'self'\`: Track pointer within the source element's bounds.
            - \`'root'\`: Track pointer anywhere in the viewport (document root).
            - Only use with \`ScrubEffect\` mouse presets (\`namedEffect\`) or \`customEffect\` that consumes pointer progress; avoid \`keyframeEffect\` with \`pointerMove\` unless mapping a single axis via \`axis\`.
          - When using \`customEffect\` with \`pointerMove\`, the progress parameter is an object:
            - \`\`\`typescript
              type Progress = {
                x: number; // 0-1: horizontal position (0 = left edge, 1 = right edge)
                y: number; // 0-1: vertical position (0 = top edge, 1 = bottom edge)
                v?: {
                  // Velocity (optional)
                  x: number; // Horizontal velocity
                  y: number; // Vertical velocity
                };
                active?: boolean; // Whether mouse is currently in the hit area
              };
              \`\`\`

### hover / click

For \`TimeEffect\` (keyframe/named/custom effects), set \`triggerType\` on the effect. For \`StateEffect\` (transitions), set \`stateAction\` on the effect. Do NOT mix \`triggerType\` and \`stateAction\` on the same effect.

**\`triggerType\`** — on \`TimeEffect\`:

${buildBehaviorTable('Type', 'triggerTypeDescriptions', hover, click, { defaultKey: hover.defaultTriggerType })}

**\`stateAction\`** — on \`StateEffect\`:

${buildBehaviorTable('Action', 'stateActionDescriptions', hover, click, { defaultKey: 'toggle' })}

### viewEnter

\`\`\`ts
params: {
  threshold?: number;  // 0–1, IntersectionObserver threshold
  inset?: string;      // like view-timeline-inset, e.g. '-100px' or '-50px 0px'
}
// Playback behavior is set on each effect:
effect.triggerType: ${triggerTypeUnion};  // default: '${viewEnter.defaultTriggerType}'
\`\`\`

${fragments.get('pitfalls/same-element-viewenter', 'full-lean')}

### viewProgress

Scroll-driven animations using native \`ViewTimeline\`, with polyfill where not supported. Progress is driven by scroll position. Control the range via \`rangeStart\`/\`rangeEnd\` on the effect (see [Scroll / Pointer-driven Effect](#scroll--pointer-driven-effect)).

\`viewProgress\` has no trigger params. Range configuration (\`rangeStart\`/\`rangeEnd\`) is on the effect, not on the trigger.

${fragments.get('pitfalls/overflow-clip', 'full-lean')}

### pointerMove

\`\`\`ts
params: {
  hitArea?: 'self' | 'root';  // 'self' = source element bounds, 'root' = viewport
  axis?: 'x' | 'y';           // restricts tracking to a single axis (for keyframeEffect)
}
\`\`\`

**Rules:**

- Source element MUST NOT have \`pointer-events: none\`.
- MUST NOT use the same element as both source and target with size or position effects — use \`selector\` to target a child or set a different \`key\`.
- Use a \`(hover: hover)\` media condition to disable on touch-only devices. On touch-only devices prefer \`viewEnter\` or \`viewProgress\` fallbacks.
- For 2D effects, use \`namedEffect\` mouse presets or \`customEffect\`. \`keyframeEffect\` only supports a single axis.
- For independent 2-axis control with keyframes, use two separate interactions (one \`axis: 'x'\`, one \`axis: 'y'\`) with \`composite: 'add'\` or \`'accumulate'\` on the second effect.

**\`centeredToTarget\`** — set \`true\` to remap the \`0–1\` progress range so that \`0.5\` progress corresponds to the center of the target element. Use when source and target are different elements, or when \`hitArea: 'root'\` is used, so that the pointer resting over the target center produces 50% progress regardless of position in viewport.

${fragments.get('progress-type', 'brief')}

### animationEnd

\`\`\`ts
params: {
  effectId: string;
} // the effect to wait for
\`\`\`

Fires when the specified effect completes on the source element. Useful for chaining sequences.

---

## Effects

Each effect applies a visual change to a target element. An effect is either inline or referenced by \`effectId\` from the top-level \`effects\` registry (\`EffectRef\`). An \`EffectRef\` inherits all properties from the registry entry, and can override any of them (e.g. \`key\`, \`duration\`, \`easing\`, \`fill\`, etc.) — not just the target. See [Element Resolution](#element-resolution) for how the target is determined.

### Common fields

\`\`\`ts
{
  key?: string;              // target element key; omit to target the source
  effectId?: string;         // reference to effects registry (EffectRef)
  conditions?: string[];     // ids referencing the top-level conditions map; all must pass
  selector?: string;         // optional — CSS selector to refine target element
  listContainer?: string;    // optional — CSS selector for list container
  listItemSelector?: string; // optional — filter which children of listContainer are selected
  composite?: 'replace' | 'add' | 'accumulate';
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
}
\`\`\`

**\`fill\` guidance:**

- \`'both'\` — use for scroll-driven (\`viewProgress\`), pointer-driven (\`pointerMove\`), and toggling effects (\`hover\`/\`click\` with \`alternate\`, \`repeat\`, or \`state\` type).
- \`'backwards'\` — use for entrance animations with \`type: 'once'\` when the element's own CSS already matches the final keyframe (applies the initial keyframe during any \`delay\`).

**\`composite\`** — same as CSS's \`animation-composition\`. Controls how this effect combines with others on the same property (transforms & filters):

- \`'replace'\` (default): fully replaces prior values.
- \`'add'\`: concatenates transform/filter functions after any existing ones (e.g. existing \`translateX(10px)\` + added \`translateY(20px)\` → both apply).
- \`'accumulate'\`: merges arguments of matching functions (e.g. \`translateX(10px)\` + \`translateX(20px)\` → \`translateX(30px)\`); non-matching functions concatenate like \`'add'\`.

**\`easing\` guidance:** from \`@wix/motion\` (in addition to standard CSS easings):

${easingList}, or any \`'cubic-bezier(...)'\` / \`'linear(...)'\` string.

### Time-based Effect

Used with \`hover\`, \`click\`, \`viewEnter\`, \`animationEnd\` triggers.

\`\`\`ts
{
  duration: number;            // REQUIRED (ms)
  easing?: string;             // CSS easing or named easing (see below)
  delay?: number;              // ms
  iterations?: number;         // >=1 or Infinity; 0 is treated as Infinity
  alternate?: boolean;
  reversed?: boolean;
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
  composite?: 'replace' | 'add' | 'accumulate';
  // + exactly one animation payload (see below)
}
\`\`\`

### Scroll / Pointer-driven Effect

Used with \`viewProgress\` and \`pointerMove\` triggers.

\`\`\`ts
{
  rangeStart?: RangeOffset;    // REQUIRED for viewProgress
  rangeEnd?: RangeOffset;      // REQUIRED for viewProgress
  easing?: string;             // CSS easing or named easing (see above)
  iterations?: number;         // NOT Infinity
  alternate?: boolean;
  reversed?: boolean;
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
  composite?: 'replace' | 'add' | 'accumulate';
  centeredToTarget?: boolean;
  transitionDuration?: number; // ms, smoothing on progress jumps (primarily for pointerMove)
  transitionDelay?: number;    // ms (primarily for pointerMove)
  transitionEasing?: '${data.effects.transitionEasings.join("' | '")}';
  // + exactly one animation payload (see below)
}
\`\`\`

**RangeOffset** — works like CSS's \`animation-range\`:

\`\`\`ts
{
  name?: ${rangeNameUnion};
  offset?: { value: number; unit: 'percentage' | 'px' | 'vh' | 'vw' }
}
\`\`\`

${rangeTable}

**Sticky container pattern** — for scroll-driven animations inside a stuck \`position: sticky\` container:

- Tall wrapper: height defines scroll distance (e.g. \`300vh\` for ~2 viewport-heights of scroll travel).
- Sticky child (\`key\`) with \`position: sticky; top: 0; height: 100vh\`: stays fixed while the wrapper scrolls. This is the ViewTimeline source.
- Use \`rangeStart/rangeEnd\` with \`name: 'contain'\` to animate only during the stuck phase.

${fragments.get('full-lean/state-effect')}

### Animation Payloads

Exactly one MUST be provided per time-based or scroll/pointer-driven effect:

1. **\`namedEffect\`** (preferred) — pre-built presets from \`${data.meta.presetsPackage}\`. GPU-friendly and tuned.

   \`\`\`ts
   namedEffect: {
     type: '[PRESET_NAME]',
     // ...optional [PRESET_OPTIONS] as additional properties
   }
   \`\`\`

   - \`[PRESET_NAME]\` — one of the registered preset names (see table below).
   - \`[PRESET_OPTIONS]\` — optional preset-specific properties spread as additional keys on the object. **CRITICAL:** Do NOT guess option names/types. Omit unknown options and rely on defaults.

   Available presets:

   | Category | Presets                                                                                                                                                                                                                                                                                      |
   | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
${presetTable}
   - **CRITICAL** — Scroll presets (\`*Scroll\`) used with \`viewProgress\` MUST include \`range\` in options: \`'in'\` (ends at idle state), \`'out'\` (starts from idle state), or \`'continuous'\` (passes through idle). Prefer \`'continuous'\`.
   - Mouse presets are preferred over \`keyframeEffect\` for \`pointerMove\` 2D effects.

2. **\`keyframeEffect\`** — custom keyframe animations.

   \`\`\`ts
   keyframeEffect: { name: '[EFFECT_NAME]', keyframes: [KEYFRAMES] }
   \`\`\`

   - \`[EFFECT_NAME]\` — unique string identifier for this effect.
   - \`[KEYFRAMES]\` — array of keyframe objects using standard WAAPI format (e.g. \`[{ opacity: '0' }, { opacity: '1' }]\`). Property names in camelCase.

3. **\`customEffect\`** — imperative update callback. Use only when CSS-based effects cannot express the desired behavior (e.g., animating SVG attributes, canvas, text content).

   \`\`\`ts
   customEffect: [CUSTOM_EFFECT_CALLBACK];
   \`\`\`

   - \`[CUSTOM_EFFECT_CALLBACK]\` — function with signature \`(element: Element, progress: number | ProgressObject) => void\`. Called on each animation frame.

---

## Sequences

${fragments.get('sequences', 'detailed')}

---

## Conditions

${fragments.get('conditions', 'default')}

---

## FOUC Prevention

**Problem:** Elements with entrance animations (e.g. \`viewEnter\` + \`type: 'once'\` with \`FadeIn\`) start in their final visible state. Before the animation framework initializes and applies the starting keyframe (e.g. \`opacity: 0\`), the element is briefly visible at full opacity — causing a flash of unstyled/un-animated content (FOUC).

**Solution:** Two things are required — both MUST be present:

1. **Generate critical CSS** using \`generate(config)\` — produces CSS rules that hide entrance-animated elements from the moment the page renders.
2. **Mark elements with \`initial\`** — tells the runtime which elements have critical CSS applied so it can coordinate with the generated styles.

### Step 1: Generate CSS

Call \`generate(config)\` server-side or at build time and inject the result into the \`<head>\` (preferred), or insert to beginning of \`<body>\`, so it loads before the page content is painted:

\`\`\`ts
import { generate } from '@wix/interact/web';
const css = generate(config);
\`\`\`

${fragments.get('fouc', 'code-inject')}

### Step 2: Mark elements

${fragments.get('fouc', 'code-web', { key: 'hero', classAttr: ' class="hero"' })}

${fragments.get('fouc', 'code-react', { key: 'hero', classAttr: ' className="hero"' })}

${fragments.get('fouc', 'code-vanilla', { key: 'hero', classAttr: ' class="hero"' })}

### Rules

- \`generate()\` should be called server-side or at build time. Can also be called on client-side if page content is initially hidden (e.g. behind a loader/splash screen).
- **Both** \`generate(config)\` CSS **and** \`initial\` on the element are required. Using only one has no effect.
- \`initial\` is only valid for \`viewEnter\` + \`type: 'once'\` where source and target are the same element.
- For \`repeat\`/\`alternate\`/\`state\`, do NOT use \`initial\`. Instead, manually apply the initial keyframe as inline styles on the target element and use \`fill: 'both'\`.

---

## Element Resolution

${fragments.get('element-resolution', 'intro')}

${fragments.get('element-resolution', 'source')}

${fragments.get('element-resolution', 'target')}

---

## Static API

${fragments.get('static-api', 'detailed')}
`;
}
