# Rules Build v2 — Implementation Spec

> Replaces the `_content/` + `scripts/build-rules.mjs` pipeline (PR #204) with a markdown-first system.

## 1. Directory Layout

All build sources live under `packages/interact/_build/`. Generated output stays in `packages/interact/rules/`.

```
packages/interact/
├── _build/
│   ├── glossary.mjs                          ← single source of truth
│   ├── assemble.mjs                          ← build script (CLI entry point)
│   └── templates/
│       ├── sections/                         ← shared reusable prose blocks
│       │   ├── fouc.md
│       │   ├── quick-start.md
│       │   ├── static-api.md
│       │   ├── element-resolution.md
│       │   ├── config-structure.md
│       │   ├── sequences.md
│       │   ├── pitfalls.md
│       │   ├── progress-type.md
│       │   └── multiple-effects-note.md
│       ├── triggers/                         ← per-trigger rule templates
│       │   ├── event-trigger.md              ← renders click.md AND hover.md
│       │   ├── viewenter.md                  ← renders viewenter.md
│       │   ├── viewprogress.md               ← renders viewprogress.md
│       │   └── pointermove.md                ← renders pointermove.md
│       └── composites/                       ← large reference file templates
│           ├── integration.md                ← renders integration.md
│           └── full-lean.md                  ← renders full-lean.md
├── rules/                                    ← generated output (committed to git)
│   ├── click.md
│   ├── hover.md
│   ├── viewenter.md
│   ├── viewprogress.md
│   ├── pointermove.md
│   ├── integration.md
│   └── full-lean.md
└── package.json                              ← "build:rules": "node _build/assemble.mjs"
```

## 2. Glossary (`glossary.mjs`)

Single default export. All technical terms, types, descriptions, and per-trigger data in one flat, greppable module. No YAML, no external dependencies.

### 2.1 Structure

```javascript
export const glossary = {

  // ═══════════════════════════════════════════════════════════
  // Package metadata
  // ═══════════════════════════════════════════════════════════
  meta: {
    packageName:    '@wix/interact',
    presetsPackage: '@wix/motion-presets',
    motionPackage:  '@wix/motion',
    installCommand: 'npm install @wix/interact @wix/motion-presets',
    entry: {
      web:     '@wix/interact/web',
      react:   '@wix/interact/react',
      vanilla: '@wix/interact',
    },
  },

  // ═══════════════════════════════════════════════════════════
  // Variable definitions (the [VARIABLE] placeholders in rules)
  // ═══════════════════════════════════════════════════════════
  //
  // Each key matches a [VARIABLE_NAME] used in code templates.
  // Value is the default description rendered as:
  //   - `[KEY]` — <description>
  //
  // Per-trigger overrides live in triggers.<name>.vars and take
  // precedence when the template is rendered for that trigger.
  //
  vars: {
    SOURCE_KEY:             "identifier matching the element's key (`data-interact-key` for web, `interactKey` for React).",
    TARGET_KEY:             "identifier matching the element's key on the element that animates.",
    EFFECT_NAME:            'unique string identifier for a `keyframeEffect`.',
    NAMED_EFFECT_DEFINITION:'object with properties of pre-built effect from `@wix/motion-presets`. Refer to motion-presets rules for available presets and their options.',
    KEYFRAMES:              'array of keyframe objects (e.g. `[{ opacity: 0 }, { opacity: 1 }]`). Property names in camelCase.',
    FILL_MODE:              "fill mode for the animation (`'none'`, `'forwards'`, `'backwards'`, `'both'`).",
    DURATION_MS:            'animation duration in milliseconds.',
    EASING_FUNCTION:        'CSS easing string or named easing from `@wix/motion`.',
    DELAY_MS:               'optional delay before the effect starts, in milliseconds.',
    ITERATIONS:             'optional. Number of iterations, or `Infinity` for continuous loops.',
    ALTERNATE_BOOL:         'optional. `true` to alternate direction on every other iteration (within a single playback).',
    UNIQUE_EFFECT_ID:       'optional. String identifier used by `animationEnd` triggers for chaining, and by sequences for referencing effects from the top-level `effects` map.',
    CUSTOM_EFFECT_CALLBACK: 'function with signature `(element: HTMLElement, progress: number) => void`. Called on each animation frame with the target element and `progress` from 0 to 1.',
    TRANSITION_DURATION_MS: 'optional number. Milliseconds for smoothing (interpolating) between progress updates. Use to add inertia/lag to the effect (e.g. `200`–`600`).',
    TRANSITION_EASING:      'optional string. CSS easing or named easing from `@wix/motion`. Adds a natural deceleration feel when used with `transitionDuration`.',
    CENTERED_TO_TARGET:     '`true` or `false`. See **Centering with `centeredToTarget`** above.',
    HIT_AREA:               "`'self'` (track pointer within source element) or `'root'` (track pointer anywhere in viewport).",
    VISIBILITY_THRESHOLD:   'optional. Number between 0–1 indicating how much of the source element must be visible to trigger (e.g. `0.3` = 30%).',
    VIEWPORT_INSETS:        "optional. String adjusting the viewport detection area (e.g. `'-100px'` extends it, `'50px'` shrinks it).",
  },

  // ═══════════════════════════════════════════════════════════
  // Effects data
  // ═══════════════════════════════════════════════════════════
  effects: {
    triggerTypes: ['once', 'repeat', 'alternate', 'state'],

    easings: [
      'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out',
      'sineIn', 'sineOut', 'sineInOut',
      'quadIn', 'quadOut', 'quadInOut',
      'cubicIn', 'cubicOut', 'cubicInOut',
      'quartIn', 'quartOut', 'quartInOut',
      'quintIn', 'quintOut', 'quintInOut',
      'expoIn', 'expoOut', 'expoInOut',
      'circIn', 'circOut', 'circInOut',
      'backIn', 'backOut', 'backInOut',
    ],

    transitionEasings: ['linear', 'hardBackOut', 'easeOut', 'elastic', 'bounce'],

    presets: {
      entrance: [
        'FadeIn', 'GlideIn', 'SlideIn', 'FloatIn', 'RevealIn', 'ExpandIn',
        'BlurIn', 'FlipIn', 'ArcIn', 'ShuttersIn', 'CurveIn', 'DropIn',
        'FoldIn', 'ShapeIn', 'TiltIn', 'WinkIn', 'SpinIn', 'TurnIn', 'BounceIn',
      ],
      ongoing: [
        'Pulse', 'Spin', 'Breathe', 'Bounce', 'Wiggle', 'Flash',
        'Flip', 'Fold', 'Jello', 'Poke', 'Rubber', 'Swing', 'Cross',
      ],
      scroll: [
        'FadeScroll', 'RevealScroll', 'ParallaxScroll', 'MoveScroll', 'SlideScroll',
        'GrowScroll', 'ShrinkScroll', 'TiltScroll', 'PanScroll', 'BlurScroll',
        'FlipScroll', 'SpinScroll', 'ArcScroll', 'ShapeScroll', 'ShuttersScroll',
        'SkewPanScroll', 'Spin3dScroll', 'StretchScroll', 'TurnScroll',
      ],
      mouse: [
        'TrackMouse', 'Tilt3DMouse', 'Track3DMouse', 'SwivelMouse', 'AiryMouse',
        'ScaleMouse', 'BlurMouse', 'SkewMouse', 'BlobMouse',
      ],
    },

    ranges: {
      cover:          'full visibility span from first pixel entering to last pixel leaving.',
      entry:          'the phase while the element is entering the viewport.',
      exit:           'the phase while the element is exiting the viewport.',
      contain:        'while the element is fully contained in the viewport. Typically used with a `position: sticky` container.',
      'entry-crossing':'from the element\'s leading edge entering to its leading edge reaching the opposite side.',
      'exit-crossing': 'from the element\'s trailing edge reaching the start to its trailing edge leaving.',
    },
  },

  // ═══════════════════════════════════════════════════════════
  // Per-trigger data
  // ═══════════════════════════════════════════════════════════
  //
  // Each trigger entry contains:
  //   name          — trigger identifier
  //   a11yAlias     — accessible trigger name (if any)
  //   a11yNote      — CRITICAL note about accessible alternative
  //   vars          — overrides for the global vars above (only fields that differ)
  //   pitfalls      — array of { id, variant } referencing sections/pitfalls.md
  //   triggerTypes  — { name: { short, full } } for behavior tables
  //   stateActions  — { name: { short, full } } for state effect tables (event triggers only)
  //   defaultTriggerType — default triggerType value
  //   flags         — boolean flags: hasReversed, hasEffectId, showMultipleEffectsNote
  //   params        — trigger-specific params array (for pointerMove params type rendering)
  //   prose         — trigger-specific overrides for prose strings (fillCritical, customEffectExamples, offsetEasingSuffix)
  //
  triggers: {

    hover: {
      name: 'hover',
      a11yAlias: 'interest',
      a11yNote: "Use `trigger: 'interest'` instead of `trigger: 'hover'` to also respond to keyboard focus.",
      defaultTriggerType: 'alternate',
      flags: { hasReversed: false, hasEffectId: false, showMultipleEffectsNote: true },
      vars: {
        SOURCE_KEY:      'The element that listens for hover.',
        TARGET_KEY:      "identifier matching the element's key on the element that animates. Use a different key from `[SOURCE_KEY]` when source and target must be separated (see hit-area shift above).",
        FILL_MODE:       "usually `'both'`. Keeps the final state applied while hovering, and prevents garbage-collection of animation when finished.",
        EASING_FUNCTION: "CSS easing string (e.g. `'ease-out'`, `'ease-in-out'`, `'cubic-bezier(0.4, 0, 0.2, 1)'`), or named easing from `@wix/motion`.",
        ITERATIONS:      "optional. Number of iterations, or `Infinity` for continuous loops. Primarily useful with `triggerType: 'state'`.",
        ALTERNATE_BOOL:  '',
      },
      prose: {
        fillCritical:         "Always include `fill: 'both'` for `triggerType: 'alternate'`, `'repeat'` — keeps the effect applied while hovering and prevents garbage-collection. For `triggerType: 'once'` use `fill: 'backwards'`.",
        customEffectExamples: '',
        offsetEasingSuffix:   ' CSS easing string, or named easing from `@wix/motion`.',
      },
      pitfalls: [{ id: 'hit-area', variant: 'full-lean-hover' }],
      triggerTypes: {
        alternate: { full: 'plays forward on enter, reverses on leave. Default. Most common for hover.',              short: 'Play on enter, reverse on leave' },
        repeat:    { full: 'restarts the animation from the beginning on each enter. On leave, jumps to the beginning and pauses.', short: 'Play on enter, stop and rewind on leave' },
        once:      { full: 'plays once on the first enter and never again.',                                           short: 'Play once on first enter only' },
        state:     { full: 'resumes on enter, pauses on leave. Useful for continuous loops (`iterations: Infinity`).', short: 'Play on enter, pause on leave' },
      },
      stateActions: {
        toggle: { full: 'applies the style state on enter, removes on leave. Default.',                                      short: 'Add style state on enter, remove on leave' },
        add:    { full: 'applies the style state on enter. Leave does NOT remove it.',                                        short: 'Add style state on enter; leave does NOT remove' },
        remove: { full: "removes a previously applied style state on enter. Use with provided `effectId` to map to a matching interaction with `add` and effect with same `effectId`.", short: 'Remove style state on enter' },
        clear:  { full: "clears all previously applied style states on enter. Use to reset multiple stacked `'add'` style changes at once (e.g. a \"reset\" hover area that undoes several accumulated states).", short: 'Clear/reset all style states on enter' },
      },
    },

    click: {
      name: 'click',
      a11yAlias: 'activate',
      a11yNote: "Use `trigger: 'activate'` instead of `trigger: 'click'` to also respond to keyboard activation (Enter / Space).",
      defaultTriggerType: 'alternate',
      flags: { hasReversed: true, hasEffectId: true, showMultipleEffectsNote: false },
      vars: {
        SOURCE_KEY:      'The element that listens for clicks.',
        TARGET_KEY:      "identifier matching the element's key on the element that animates. If missing it defaults to `[SOURCE_KEY]` for targeting the source element.",
        FILL_MODE:       "optional. Always `'both'` with `triggerType: 'alternate'` or `'repeat'`, otherwise depends on the effect.",
        EASING_FUNCTION: 'CSS easing string, or named easing from `@wix/motion`.',
        ALTERNATE_BOOL:  "Different from `triggerType: 'alternate'` which alternates per click.",
      },
      prose: {
        fillCritical:         "Always include `fill: 'both'` for `triggerType: 'alternate'` or `'repeat'` — keeps the effect applied while finished and prevents garbage-collection, allowing efficient toggling. For `triggerType: 'once'` use `fill: 'backwards'`.",
        customEffectExamples: ', randomized behavior',
        offsetEasingSuffix:   '',
      },
      pitfalls: [],
      triggerTypes: {
        alternate: { full: 'plays forward on first click, reverses on next click. Default.',                                     short: 'Alternate play/reverse per click' },
        repeat:    { full: 'restarts the animation from the beginning on each click.',                                            short: 'Restart per click' },
        once:      { full: 'plays once on the first click and never again.',                                                      short: 'Play once on first click only' },
        state:     { full: 'resumes/pauses the animation on each click. Useful for continuous loops (`iterations: Infinity`).', short: 'Toggle play/pause per click' },
      },
      stateActions: {
        toggle: { full: 'applies the style state, removes it on next click. Default.',                                           short: 'Toggle style state per click' },
        add:    { full: 'applies the style state. Does not remove on subsequent clicks.',                                         short: 'Add style state on click' },
        remove: { full: 'removes a previously applied style state.',                                                              short: 'Remove style state on click' },
        clear:  { full: 'clears all previously applied style states. Useful for resetting multiple stacked style states at once.', short: 'Clear/reset all style states' },
      },
    },

    viewEnter: {
      name: 'viewEnter',
      defaultTriggerType: 'once',
      flags: { showMultipleEffectsNote: true },
      pitfalls: [{ id: 'same-element-viewenter', variant: 'short' }],
      triggerTypes: {
        once:      { full: 'plays once when the source element first enters the viewport and never again. Source and target may be the same element.', short: 'Play once on first enter only' },
        repeat:    { full: 'restarts the animation every time the source element enters the viewport. Use separate source and target.',                short: 'Restart on each viewport enter' },
        alternate: { full: 'plays forward when the source element enters the viewport, reverses when it leaves. Use separate source and target.',      short: 'Play on enter, reverse on leave' },
        state:     { full: 'resumes on enter, pauses on leave. Useful for continuous loops (`iterations: Infinity`). Use separate source and target.',  short: 'Play on enter, pause on leave' },
      },
    },

    viewProgress: {
      name: 'viewProgress',
      flags: { showMultipleEffectsNote: true },
      pitfalls: [{ id: 'overflow-clip', variant: 'short' }],
    },

    pointerMove: {
      name: 'pointerMove',
      flags: { showMultipleEffectsNote: true },
      pitfalls: [{ id: 'hit-area', variant: 'pointermove-source' }],
      params: [
        { name: 'hitArea', type: "'root' | 'self'", optional: true, description: 'determines where mouse movement is tracked' },
        { name: 'axis',    type: "'x' | 'y'",       optional: true, description: 'restricts pointer tracking to a single axis' },
      ],
    },

    animationEnd: {
      name: 'animationEnd',
      params: [{ name: 'effectId', type: 'string', optional: false, description: 'ID of the preceding effect' }],
      pitfalls: [],
    },

    pageVisible: {
      name: 'pageVisible',
      params: [],
      pitfalls: [],
    },
  },
};
```

### 2.2 Rules

- All values are plain strings, arrays, or shallow objects (max 3 levels deep).
- Per-trigger `vars` override global `vars` — the assembler merges `{ ...glossary.vars, ...glossary.triggers[name].vars }` when resolving `{{var.X}}` for a trigger template.
- The glossary is the **only** `.mjs` file a maintainer edits for data changes (adding presets, fixing descriptions, changing package names).
- Adding a new easing or preset = adding one string to one array.

## 3. Templating Syntax

Templates are plain `.md` files with four directives. The assembler resolves them in order: includes first (recursive), then conditionals, then each-loops, then value substitutions.

### 3.1 Value Substitution: `{{path.to.value}}`

Replaces with the resolved value from the render context (glossary + trigger-specific data merged).

```markdown
This document contains rules for `{{meta.packageName}}`.
```

For variable definitions, `{{var.SOURCE_KEY}}` resolves to the merged variable description (trigger override if available, else global default).

**Computed values:** Some values need formatting before insertion. The assembler pre-computes these into the render context before template resolution:

| Context key | Value |
|---|---|
| `computed.easingList` | All easings formatted as `` `'name'` `` joined with `, ` |
| `computed.presetTable` | Markdown table of preset categories |
| `computed.rangeTable` | Markdown table of range names |
| `computed.rangeList` | Bullet list of range names with descriptions |
| `computed.triggerTypeUnion` | `'once' \| 'repeat' \| ...` |
| `computed.rangeNameUnion` | `'cover' \| 'entry' \| ...` |
| `computed.transitionEasingUnion` | `'linear' \| 'hardBackOut' \| ...` |
| `computed.paramsType` | Formatted TypeScript type for pointerMove params |

### 3.2 Section Include: `{{> path#variant}}`

Includes content from a section file. The path is relative to `templates/sections/` (no `.md` extension needed). The `#variant` part selects a specific section within the file (defaults to `#default` if omitted).

```markdown
{{> fouc#code-web}}
```

Resolves to the content of the `## code-web` section in `templates/sections/fouc.md`.

**Section file format:** Standard markdown with `##` headings as variant keys:

```markdown
## default
Content for the default variant.

## brief
Shorter version.

## detailed
Longer version with more context.
```

The `##` heading line is stripped from output. Content runs until the next `##` heading or EOF.

**Parameterized includes:** Section content can itself contain `{{}}` placeholders. These are resolved using the same render context as the parent template. If a section needs caller-specific values, the caller sets them in the render context before the section is included.

**Recursive includes:** Sections can include other sections. The assembler resolves recursively (with cycle detection).

### 3.3 Conditional: `{{#if path.to.value}} ... {{/if}}`

Includes the block only if the value is truthy. Supports `{{#else}}`.

```markdown
{{#if trigger.flags.hasReversed}}
            reversed: [INITIAL_REVERSED_BOOL],
{{/if}}
```

Nesting is allowed. The condition path is resolved against the render context.

### 3.4 Iteration: `{{#each path.to.array as item}} ... {{/each}}`

Iterates over an array or object entries. Inside the block, `{{item}}` refers to the current element. For object iteration, `{{item.key}}` and `{{item.value}}` are available.

```markdown
{{#each trigger.triggerTypes as tt}}
  - `'{{tt.key}}'` — {{tt.value.full}}
{{/each}}
```

For array iteration:

```markdown
{{#each effects.presets.mouse as preset}}
`{{preset}}`{{#if !last}}, {{/if}}
{{/each}}
```

## 4. Section Files (`templates/sections/`)

Each section file contains one or more variants of a reusable prose block. Variants are separated by `## variantName` headings.

### 4.1 `fouc.md`

Migrated from `_content/fragments/fouc.md`. Variants:

| Variant | Content | Used by |
|---------|---------|---------|
| `code-inject` | The `<style>${css}</style>` HTML snippet | viewenter, integration, full-lean |
| `code-web` | Web custom element with `data-interact-initial` | viewenter, integration, full-lean |
| `code-react` | React `<Interaction>` with `initial={true}` | viewenter, integration, full-lean |
| `code-vanilla` | Vanilla HTML with `data-interact-initial` | viewenter, integration, full-lean |

The code examples use `{{key}}` and `{{classAttr}}` which are set in the render context by the calling template. For viewenter templates, `key` = `[SOURCE_KEY]`, `classAttr` = `""`. For composites, `key` = `hero`, `classAttr` = ` class="hero"` or ` className="hero"`.

### 4.2 `quick-start.md`

Migrated from `_content/fragments/quick-start.md`. Variants:

| Variant | Used by |
|---------|---------|
| `install` | integration, full-lean |
| `web` | full-lean |
| `web-brief` | integration |
| `react` | full-lean |
| `vanilla` | full-lean |
| `vanilla-brief` | integration |
| `cdn` | full-lean |
| `register-presets` | full-lean |
| `multiple-instances` | full-lean |

All variants use `{{meta.entry.web}}`, `{{meta.entry.react}}`, `{{meta.entry.vanilla}}`, `{{meta.presetsPackage}}`, `{{meta.installCommand}}` from the glossary.

### 4.3 `static-api.md`

Variants: `detailed`, `brief`. Migrated from `_content/fragments/static-api.md`. Pure markdown tables, no dynamic content.

### 4.4 `element-resolution.md`

Variants: `intro`, `source`, `target`, `source-brief`, `target-brief`. Migrated from `_content/fragments/element-resolution.md`. Pure prose, no dynamic content.

### 4.5 `config-structure.md`

Variants: `detailed`, `brief`. Migrated from `_content/fragments/config-structure.md`. Pure prose with code blocks.

### 4.6 `sequences.md`

Variants: `detailed`, `brief`. Migrated from `_content/fragments/sequences.md`. Pure prose with code blocks.

### 4.7 `pitfalls.md`

**All pitfalls consolidated in one file.** Each pitfall has multiple variants for different rendering contexts (trigger-specific rule files vs full-lean overview).

| Section heading | Variant meaning | Used by |
|-----------------|-----------------|---------|
| `hit-area-trigger` | Trigger-specific (pointermove-source context) | pointermove |
| `hit-area-full-lean-hover` | Full-lean hover context | full-lean |
| `hit-area-full-lean-pointermove` | Full-lean pointermove context | full-lean |
| `same-element-viewenter-short` | Short version for trigger file | viewenter |
| `same-element-viewenter-long` | Long version for full-lean | full-lean |
| `overflow-clip-short` | Short version for trigger file | viewprogress |
| `overflow-clip-long` | Long version for full-lean | full-lean |
| `dont-guess-presets` | Single variant | full-lean |
| `reduced-motion` | Single variant | full-lean |
| `perspective` | Single variant | full-lean |

### 4.8 `progress-type.md`

Variants: `detailed`, `brief`. Migrated from `_content/fragments/progress-type.md`.

### 4.9 `multiple-effects-note.md`

Variants: `default`, `viewEnter`, `viewProgress`, `pointerMove`. Migrated from `_content/fragments/multiple-effects-note.md`.

## 5. Trigger Templates (`templates/triggers/`)

### 5.1 `event-trigger.md` → `click.md`, `hover.md`

One template, rendered twice (once with `trigger = glossary.triggers.click`, once with `trigger = glossary.triggers.hover`).

**Structure:**

```
# {{trigger.Name}} Trigger Rules for {{meta.packageName}}
  intro paragraph
  a11y note
  pitfalls (if any)

## Table of Contents

## Rule 1: keyframeEffect / namedEffect (TimeEffect)
  fill critical note
  multiple-effects note (if flag set)
  code template with:
    {{#if trigger.flags.hasReversed}} reversed field {{/if}}
    {{#if trigger.flags.hasEffectId}} effectId field {{/if}}
  variables section:
    SOURCE_KEY — {{var.SOURCE_KEY}}        ← trigger override
    TARGET_KEY — {{var.TARGET_KEY}}        ← trigger override
    TRIGGER_TYPE — {{#each trigger.triggerTypes}}
    FILL_MODE — {{var.FILL_MODE}}          ← trigger override
    etc.

## Rule 2: transition / transitionProperties (StateEffect)
  code template
  stateAction descriptions: {{#each trigger.stateActions}}

## Rule 3: customEffect (TimeEffect)
  code template

## Rule 4: Sequences
  code template
```

**Conditional blocks** (the ~5 places click/hover differ):

1. `{{var.SOURCE_KEY}}` — trigger-specific override in glossary
2. `{{var.TARGET_KEY}}` — trigger-specific override
3. `{{var.FILL_MODE}}` — trigger-specific override
4. `{{var.EASING_FUNCTION}}` — trigger-specific override for hover
5. `{{var.ALTERNATE_BOOL}}` — trigger-specific override for click
6. `{{#if trigger.flags.hasReversed}}` — `reversed` field in code template (click only)
7. `{{#if trigger.flags.hasEffectId}}` — `effectId` field in code template (click only)
8. `{{trigger.prose.fillCritical}}` — different fill guidance wording
9. `{{trigger.prose.customEffectExamples}}` — click has extra examples
10. `{{trigger.prose.offsetEasingSuffix}}` — hover has extra suffix

Most of these are handled by glossary variable overrides (no `{{#if}}` needed). Only `hasReversed` and `hasEffectId` need actual conditional blocks in the code template.

### 5.2 `viewenter.md` → `viewenter.md`

Rendered with `trigger = glossary.triggers.viewEnter`.

**Structure:**

```
# ViewEnter Trigger Rules for {{meta.packageName}}
  intro paragraph
  pitfalls

## Preventing Flash of Unstyled Content (FOUC)
  explanation prose
  Step 1: {{> fouc#code-inject}}
  Step 2: {{> fouc#code-web}}, {{> fouc#code-react}}, {{> fouc#code-vanilla}}
  rules list

## Rule 1: keyframeEffect / namedEffect (TimeEffect)
  multiple-effects note
  code template (has params.threshold, params.inset, selector)
  variables with triggerType descriptions

## Rule 2: customEffect (TimeEffect)
  code template

## Rule 3: Sequences
  code template
```

### 5.3 `viewprogress.md` → `viewprogress.md`

Rendered with `trigger = glossary.triggers.viewProgress`.

**Structure:**

```
# ViewProgress Trigger Rules for {{meta.packageName}}
  intro paragraph
  pitfalls
  offset semantics note

## Rule 1: keyframeEffect or namedEffect
  multiple-effects note
  code template (has rangeStart/rangeEnd, no duration)
  variables with range name list: {{computed.rangeList}}

## Rule 2: customEffect
  code template

## Rule 3: Tall Wrapper + Sticky Container (contain range)
  layout explanation
  code template
```

### 5.4 `pointermove.md` → `pointermove.md`

Rendered with `trigger = glossary.triggers.pointerMove`.

**Structure:**

```
# PointerMove Trigger Rules for {{meta.packageName}}
  intro paragraph

## Trigger Source Elements with hitArea
  pitfalls

## PointerMoveParams
  params type: {{computed.paramsType}}

## Progress Object Structure
  {{> progress-type#detailed}}

## Centering with centeredToTarget
  explanation

## Device Conditions
  code example

## Rule 1: namedEffect
  mouse presets list
  code template

## Rule 2: keyframeEffect with Single Axis
  code template

## Rule 3: Two keyframeEffects with Two Axes and composite
  code template

## Rule 4: customEffect
  code template
```

## 6. Composite Templates (`templates/composites/`)

### 6.1 `integration.md` → `integration.md`

A mid-level integration guide. Uses section includes for shared content. Links to per-trigger files for detailed rules.

**Structure:**

```
# {{meta.packageName}} Integration Rules
  intro

## Entry Points
  {{> quick-start#install}}
  Web: {{> quick-start#web-brief}}
  React: inline (uses {{meta.entry.react}})
  Vanilla: {{> quick-start#vanilla-brief}}

## Named Effects & registerEffects
  register pattern, links to full-lean for effect type syntax

## Configuration Schema
  {{> config-structure#brief}}
  Interaction type block
  Element Selection prose
  {{> element-resolution#source-brief}}
  {{> element-resolution#target-brief}}

## Triggers
  summary table (all 9 triggers, hardcoded markdown table with {{meta.packageName}} refs)

## Sequences
  {{> sequences#brief}}

## Critical CSS (FOUC Prevention)
  summary + {{> fouc#code-inject}}, {{> fouc#code-web}}, {{> fouc#code-react}}, {{> fouc#code-vanilla}}

## Static API
  {{> static-api#brief}}
```

### 6.2 `full-lean.md` → `full-lean.md`

The comprehensive reference. Largest template (~350 lines). Uses section includes, glossary refs, and computed tables.

**Structure:**

```
# {{meta.packageName}} — Rules
  intro

## Table of Contents

## Common Pitfalls
  all pitfalls from all triggers (full-lean variants) +
  dont-guess-presets, reduced-motion, perspective

## Quick Start
  {{> quick-start#install}}
  {{> quick-start#multiple-instances}}
  {{> quick-start#web}}
  {{> quick-start#react}}
  {{> quick-start#vanilla}}
  {{> quick-start#cdn}}
  {{> quick-start#register-presets}}

## Element Binding
  web + react examples (uses {{meta.entry.react}})

## Config Structure
  {{> config-structure#detailed}}

## Interactions
  interaction type block, prose

## Triggers
  detailed trigger reference:
  - hover/click: behavior tables using {{#each}} over triggerTypes/stateActions
  - viewEnter: params, pitfall
  - viewProgress: no params, pitfall
  - pointerMove: params, rules, centeredToTarget, progress type
  - animationEnd: params

## Effects
  common fields, fill/composite/easing guidance
  Time-based Effect type
  Scroll/Pointer-driven Effect type (with range table, sticky pattern)
  StateEffect type
  Animation Payloads (namedEffect with preset table, keyframeEffect, customEffect)

## Sequences
  {{> sequences#detailed}}

## Conditions
  inline prose (single consumer)

## FOUC Prevention
  full explanation + {{> fouc}} includes

## Element Resolution
  {{> element-resolution#intro}}
  {{> element-resolution#source}}
  {{> element-resolution#target}}

## Static API
  {{> static-api#detailed}}
```

## 7. Assembler (`assemble.mjs`)

### 7.1 CLI Interface

```bash
node _build/assemble.mjs           # generate all rule files
node _build/assemble.mjs --check   # compare without writing (for CI)
```

### 7.2 Build Manifest

Hardcoded in the script (no separate config file):

```javascript
const manifest = [
  { template: 'triggers/event-trigger.md', trigger: 'hover', output: 'hover.md' },
  { template: 'triggers/event-trigger.md', trigger: 'click', output: 'click.md' },
  { template: 'triggers/viewenter.md',     trigger: 'viewEnter',    output: 'viewenter.md' },
  { template: 'triggers/viewprogress.md',  trigger: 'viewProgress', output: 'viewprogress.md' },
  { template: 'triggers/pointermove.md',   trigger: 'pointerMove',  output: 'pointermove.md' },
  { template: 'composites/integration.md', trigger: null,           output: 'integration.md' },
  { template: 'composites/full-lean.md',   trigger: null,           output: 'full-lean.md' },
];
```

### 7.3 Algorithm

```
1. Import glossary.mjs

2. Load all section files:
   - Read templates/sections/*.md
   - Parse into Map<filename, Map<variant, content>>
   - Variant = text between ## heading and next ## or EOF
   - The ## line itself is stripped

3. Pre-compute derived values:
   - computed.easingList = glossary.effects.easings formatted
   - computed.presetTable = markdown table from glossary.effects.presets
   - computed.rangeTable = markdown table from glossary.effects.ranges
   - computed.rangeList = bullet list from glossary.effects.ranges
   - computed.triggerTypeUnion = union string
   - computed.rangeNameUnion = union string
   - computed.transitionEasingUnion = union string

4. For each manifest entry:
   a. Read the template .md file
   b. Build render context:
      - Base: { ...glossary, computed }
      - If trigger: merge trigger-specific data:
        context.trigger = glossary.triggers[trigger]
        context.var = { ...glossary.vars, ...glossary.triggers[trigger].vars }
        context.trigger.Name = capitalize(trigger)
   c. Resolve directives (in order):
      i.   {{> path#variant}} — recursive include resolution
      ii.  {{#if condition}} ... {{/if}} — conditional blocks
      iii. {{#each collection as item}} ... {{/each}} — iteration
      iv.  {{path.to.value}} — value substitution
   d. Trim trailing whitespace per line, ensure single trailing newline
   e. Write to rules/<output> or compare in --check mode

5. --check mode:
   - Compare each output against existing file
   - Show first differing line on mismatch
   - Exit 1 if any file is stale
```

### 7.4 Directive Resolution Details

**Include resolution (`{{> path#variant}}`):**

```javascript
function resolveIncludes(text, sections, context, depth = 0) {
  if (depth > 10) throw new Error('Circular include detected');
  return text.replace(/\{\{>\s*([\w/.-]+)(?:#([\w-]+))?\s*\}\}/g, (_, path, variant) => {
    variant = variant || 'default';
    const file = sections.get(path);
    if (!file) throw new Error(`Section not found: ${path}`);
    const content = file.get(variant);
    if (content === undefined) throw new Error(`Variant "${variant}" not found in ${path}`);
    return resolveIncludes(content, sections, context, depth + 1);
  });
}
```

**Conditional resolution (`{{#if}}`):**

```javascript
function resolveConditionals(text, context) {
  // Supports nesting. Processes from innermost outward.
  const IF_RE = /\{\{#if\s+([\w.]+)\}\}([\s\S]*?)(?:\{\{#else\}\}([\s\S]*?))?\{\{\/if\}\}/g;
  let prev;
  do {
    prev = text;
    text = text.replace(IF_RE, (_, path, thenBlock, elseBlock) => {
      return resolve(context, path) ? thenBlock : (elseBlock || '');
    });
  } while (text !== prev);
  return text;
}
```

**Each resolution (`{{#each}}`):**

```javascript
function resolveEach(text, context) {
  const EACH_RE = /\{\{#each\s+([\w.]+)\s+as\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  return text.replace(EACH_RE, (_, path, itemName, body) => {
    const collection = resolve(context, path);
    if (Array.isArray(collection)) {
      return collection.map((item, i) =>
        resolveValues(body, { ...context, [itemName]: item, last: i === collection.length - 1 })
      ).join('');
    }
    // Object: iterate entries as { key, value }
    const entries = Object.entries(collection);
    return entries.map(([key, value], i) =>
      resolveValues(body, { ...context, [itemName]: { key, value }, last: i === entries.length - 1 })
    ).join('');
  });
}
```

**Value resolution (`{{path.to.value}}`):**

```javascript
function resolveValues(text, context) {
  return text.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
    const val = resolve(context, path);
    if (val === undefined) throw new Error(`Unresolved placeholder: ${path}`);
    if (val === '') return '';
    return String(val);
  });
}

function resolve(context, path) {
  return path.split('.').reduce((obj, key) => obj?.[key], context);
}
```

### 7.5 Error Handling

The assembler throws on:
- Unknown section path or variant
- Unresolved `{{placeholder}}` in final output
- Circular includes (depth > 10)
- Missing trigger name in glossary
- Missing template file

Errors include the template filename and the problematic placeholder/path for quick debugging.

## 8. Section File Format

Section files use `## variantName` headings as delimiters. The heading line is stripped from output.

**Example (`fouc.md`):**

```markdown
## code-inject
**Append to `<head>` or beginning of `<body>`:**

```html
<style>
  ${css}
</style>
```

## code-web
**Web (Custom Elements):**

```html
<interact-element data-interact-key="{{key}}" data-interact-initial="true">
  <section{{classAttr}}>...</section>
</interact-element>
```

## code-react
**React:**

```tsx
<Interaction tagName="section" interactKey="{{key}}" initial={true}{{classAttr}}>
  ...
</Interaction>
```

## code-vanilla
**Vanilla:**

```html
<section data-interact-key="{{key}}" data-interact-initial="true"{{classAttr}}>...</section>
```
```

Rules:
- First `##` heading is required (content before it is ignored or errors)
- Variant names are lowercase, hyphen-separated: `code-web`, `source-brief`
- Content runs from after the `##` line to the next `##` or EOF
- Leading/trailing blank lines within a variant are preserved (they're part of the markdown)
- Section files can contain `{{}}` placeholders — resolved using the caller's context

## 9. CI Integration

The existing CI step stays the same:

```yaml
- name: Verify generated rules are up to date
  run: yarn workspace @wix/interact build:rules --check
```

The `package.json` script changes from:

```json
"build:rules": "node scripts/build-rules.mjs"
```

to:

```json
"build:rules": "node _build/assemble.mjs"
```

## 10. Migration Checklist

### Phase 1: Setup
- [ ] Create `_build/` directory structure
- [ ] Write `glossary.mjs` from existing data modules
- [ ] Write `assemble.mjs` with directive resolution

### Phase 2: Sections
- [ ] Migrate each fragment to a section file (new `##` format)
- [ ] Consolidate all pitfall files into one `pitfalls.md`
- [ ] Verify section content matches original fragment content

### Phase 3: Templates
- [ ] Write `event-trigger.md` from `event-trigger-rule.mjs` output
- [ ] Write `viewenter.md` from `viewenter-rule.mjs` output
- [ ] Write `viewprogress.md` from `viewprogress-rule.mjs` output
- [ ] Write `pointermove.md` from `pointermove-rule.mjs` output
- [ ] Write `integration.md` from `integration.mjs` output
- [ ] Write `full-lean.md` from `full-lean.mjs` output

### Phase 4: Verify
- [ ] Run `node _build/assemble.mjs`
- [ ] Diff output against current `rules/*.md` — must match exactly (except planned typo fixes)
- [ ] Run `node _build/assemble.mjs --check` — must pass

### Phase 5: Cleanup
- [ ] Delete `_content/` directory entirely
- [ ] Delete `scripts/build-rules.mjs`
- [ ] Update `package.json` build:rules script
- [ ] Update `.prettierignore`
- [ ] Verify CI passes

## 11. File Size Budget

Target: source-to-output ratio < 0.9:1.

| File | Target lines |
|------|-------------|
| `glossary.mjs` | 230–270 |
| `assemble.mjs` | 100–130 |
| `sections/*.md` (9 files) | 230–270 total |
| `triggers/*.md` (4 files) | 700–800 total |
| `composites/*.md` (2 files) | 320–380 total |
| **Total source** | **1,580–1,850** |
| **Total output** | **~2,036** |

If any template exceeds 250 lines, consider extracting more sections. If the glossary exceeds 300 lines, it's still acceptable — it's a single file and every line is data.

## 12. What NOT to Do

- **Don't use a templating library** (Handlebars, EJS, Mustache). The four directives above are trivial to implement (~60 lines) and avoid a dependency.
- **Don't generate composites from rendered trigger files.** After analysis, `full-lean.md` and `integration.md` have their own condensed trigger coverage — they don't include full trigger rules. They share *sections* with trigger files, which is where deduplication lives.
- **Don't over-abstract.** If a piece of text appears in only one template, inline it. Extract to a section only when it appears in 2+ templates.
- **Don't add computed columns/helpers to the glossary.** Keep it pure data. Formatting (capitalize, join, table rendering) belongs in `assemble.mjs` pre-computation.
