### Basic usage (quick start)

- Import the runtime and create it with a config defining the interactions.
- Call `Interact.create(config)` once to initialize.
- Create the full configuration up‑front and pass it in a single `create` call to avoid unintended overrides; subsequent calls replace the previous config.

**For web (Custom Elements):**

```ts
import { Interact } from '@wix/interact/web';
import type { InteractConfig } from '@wix/interact';

const config: InteractConfig = {
  // config-props
};

Interact.create(config);
```

**For React:**

```ts
import { Interact } from '@wix/interact/react';
import type { InteractConfig } from '@wix/interact';

const config: InteractConfig = {
  // config-props
};

Interact.create(config);
```

### Using `namedEffect` presets (`registerEffects`)

Before using `namedEffect`, you must register the presets with the `Interact` instance. Without this, `namedEffect` types will not resolve.

```ts
import { Interact } from '@wix/interact/web'; // or /react
import * as presets from '@wix/motion-presets';

Interact.registerEffects(presets);
Interact.create(config);
```

Or register only what you need:

```ts
import { FadeIn, ParallaxScroll } from '@wix/motion-presets';
Interact.registerEffects({ FadeIn, ParallaxScroll });
```

- Without Node/build tools: add a `<script type="module">` and import from the CDN.

```html
<script type="module">
  import { Interact } from 'https://esm.sh/@wix/interact';

  const config = {
    // config-props
  };

  Interact.create(config);
</script>
```

### Preventing FOUC for entrance animations

- Use `generate(config)` to create critical CSS that hides elements until their `viewEnter` entrance animation plays.
- Add `data-interact-initial="true"` to the `<interact-element>` that should have its first child hidden initially.
- Only use `data-interact-initial="true"` for `<interact-element>` with `viewEnter` trigger and `type: 'once'`, where the source and target elements are the same.
- Do NOT use for `hover` or `click` interactions.

**Usage:**

```javascript
import { generate } from '@wix/interact/web';

const config = {
  /*...*/
};

// Generate CSS at build time or on server
const css = generate(config);

// Include in your HTML template
const html = `
<!DOCTYPE html>
<html>
<head>
    <style>${css}</style>
</head>
<body>
    <interact-element data-interact-key="hero" data-interact-initial="true">
        <section class="hero">
            <h1>Welcome to Our Site</h1>
            <p>This content fades in smoothly without flash</p>
        </section>
    </interact-element>
    <script type="module" src="./main.js"></script>
</body>
</html>
`;
```

### General guidelines (avoiding common pitfalls)

- Missing required fields or invalid references SHOULD be treated as no-ops for the offending interaction/effect while leaving the rest of the config functional.
- Params with incorrect types or shapes (especially for `namedEffect` preset options) can produce console errors. If you do not know the expected type/structure for a param, omit it and rely on defaults rather than guessing.
- Using `overflow: hidden` or `overflow: auto` can break viewProgress animations. Prefer `overflow: clip` for clipping semantics while preserving normal ViewTimeline.
- When animating with perspective, prefer `transform: perspective(...)` inside keyframes/presets. Reserve the static CSS `perspective` property for the specific case where multiple children of the same container must share the same viewpoint (`perspective-origin`).
- Stacking contexts and `viewProgress` (ViewTimeline): Creating a new stacking context on the target or any of its ancestors can prevent or freeze ViewTimeline sampling in some engines and setups. Avoid stacking‑context‑creating styles on the observed subtree (target and ancestors), including `transform`, `filter`, `perspective`, `opacity < 1`, `mix-blend-mode`, `isolation: isolate`, aggressive `will-change`, and `contain: paint/layout/size`. If needed for visuals, wrap the content and apply these styles to an inner child so the element that owns the timeline remains “flat”. Also avoid turning the scroll container into a stacking context; if you need clipping, prefer `overflow: clip` and avoid `transform` on the container. Typical symptoms are `viewProgress` not running, jumping 0→1, or never reaching anchors—remove or relocate the offending styles.

### InteractConfig – Rules for authoring interactions (AI-agent oriented)

This configuration declares what user/system triggers occur on which source element(s), and which visual effects should be applied to which target element(s). It is composed of three top-level sections: `effects`, `conditions`, and `interactions`.

### Global rules

- **Required/Optional**: You MUST provide an `interactions` array. You SHOULD provide an `effects` registry when you want to reference reusable effects by id. `conditions` and `sequences` are OPTIONAL.
- **Cross-references**: All cross-references (by id) MUST point to existing entries (e.g., an `EffectRef.effectId` MUST exist in `effects`).
- **Element keys**: All element keys (`key` fields) refer to the element path string (e.g., the value used in `data-interact-key`) and MUST be stable for the lifetime of the configuration.
- **List context**: Where both a list container and list item selector are provided, they MUST describe the same list context across an interaction and its effects. Mismatched list contexts will be ignored by the system.
- **Conditions**: Conditions act as guards. If any condition on an interaction or effect evaluates to false, the corresponding trigger/effect WILL NOT be applied.
- **Element binding**: Do NOT add observers/listeners manually. For web, wrap the DOM subtree with `<interact-element>` and set `data-interact-key` to the element key. For React, use the `<Interaction>` component with `interactKey` prop. Use the same key in your config (`Interaction.key`/`Effect.key`). The runtime binds triggers/effects via this attribute.

### Structure

- **effects: Record<string, Effect>**
  - **Purpose**: A registry of reusable, named effect definitions that can be referenced from interactions via `EffectRef`.
  - **Key (string)**: The effect id. MUST be unique across the registry.
  - **Value (Effect)**: A full effect definition. See Effect rules below.

- **sequences?: Record<string, SequenceConfig>**
  - **Purpose**: A registry of reusable sequence definitions that can be referenced from interactions via `SequenceConfigRef`.
  - **Key (string)**: The sequence id. MUST be unique across the registry.
  - **Value (SequenceConfig)**: A full sequence definition. See Sequences section below.

- **conditions?: Record<string, Condition>**
  - **Purpose**: Named predicates that gate interactions/effects by runtime context.
  - **Key (string)**: The condition id. MUST be unique across the registry.
  - **Value (Condition)**:
    - **type**: `'media' | 'container' | 'selector'`
      - `'media'`: The predicate MUST be a valid CSS media query expression without the outer `@media` keyword (e.g., `'(min-width: 768px)'`).
      - `'container'`: The predicate SHOULD be a valid CSS container query condition string relative to the relevant container context.
      - `'selector'`: The predicate is a CSS selector pattern. If it contains `&`, the `&` is replaced with the base element selector; otherwise the predicate is appended to the base selector. Used for conditional styling (e.g., `:nth-of-type(odd)`, `.active`).
    - **predicate?**: OPTIONAL textual predicate for the given type. If omitted, the condition is treated as always-true (i.e., a no-op guard).

- **interactions: Interaction[]**
  - **Purpose**: Declarative mapping from a source element and trigger to one or more target effects.
  - Each `Interaction` contains:
    - **key: string**
      - REQUIRED. The source element path. The trigger attaches to this element.
    - **listContainer?: string**
      - OPTIONAL. A CSS selector for a list container context. When present, the trigger is scoped to items within this list.
    - **listItemSelector?: string**
      - OPTIONAL. A CSS selector used to select items within `listContainer`.
    - **trigger: TriggerType**
      - REQUIRED. One of:
        - `'hover' | 'click' | 'activate' | 'interest'`: Pointer interactions (`activate` = click with keyboard Space/Enter; `interest` = hover with focus).
        - `'viewEnter' | 'pageVisible' | 'viewProgress'`: Viewport visibility/progress triggers.
        - `'animationEnd'`: Fires when a specific effect completes on the source element.
        - `'pointerMove'`: Continuous pointer motion over an area.
    - **params?: TriggerParams**
      - OPTIONAL. Parameter object that MUST match the trigger:
        - hover/click/activate/interest: `StateParams | PointerTriggerParams` (activate uses same params as click; interest uses same params as hover).
          - `StateParams.method`: `'add' | 'remove' | 'toggle' | 'clear'`
          - `PointerTriggerParams.type?`: `'once' | 'repeat' | 'alternate' | 'state'`
          - Usage:
            - When the effect is a `TransitionEffect`, use `StateParams.method` to control the state toggle invoked on interaction:
              - `'toggle'` (default): Hover — adds on enter and removes on leave. Click — toggles on each click.
              - `'add'`: Apply the state on the event; hover leave will NOT auto‑remove.
              - `'remove'`: Remove the state on the event.
              - `'clear'`: Clear/reset the effect’s state for the element (or list item when list context is used).
              - With lists (`listContainer`/`listItemSelector`), the state is set on the matching item only.
            - When the effect is a time animation (`namedEffect`/`keyframeEffect`), use `PointerTriggerParams.type`:
              - `'alternate'` (default): Hover — play on enter, reverse on leave. Click — alternate play/reverse on successive clicks.
              - `'repeat'`: Restart from progress 0 on each event; on hover leave the animation is canceled.
              - `'once'`: Play once and remove the listener (hover attaches only the enter listener; no leave).
              - `'state'`: Hover — play on enter if idle/paused, pause on leave if running. Click — toggle play/pause on successive clicks until finished.
        - viewEnter/pageVisible/viewProgress: `ViewEnterParams`
          - `type?`: `'once' | 'repeat' | 'alternate' | 'state'`
          - `threshold?`: number in [0,1] describing intersection threshold
          - `inset?`: string CSS-style inset for rootMargin/observer geometry
          - Usage:
            - `'once'`: Play on first visibility and unobserve the element.
            - `'repeat'`: Play each time the element re‑enters visibility according to `threshold`/`inset`.
            - `'alternate'`: Triggers on re‑entries; if you need alternating direction, set it on the effect (e.g., `alternate: true`) rather than relying on the trigger.
            - `'state'`: Play on entry, pause on exit (for looping/continuous animations).
            - `threshold`: Passed to `IntersectionObserver.threshold` — typical values are 0.1–0.6 for entrances.
            - `inset`: Applied as vertical `rootMargin` (`top/bottom`), e.g., `'-100px'` to trigger earlier/later; left/right remain 0.
            - Note: For `viewProgress`, `threshold` and `inset` are ignored; progress is driven by ViewTimeline/scroll scenes. Control the range via `ScrubEffect.rangeStart/rangeEnd` and `namedEffect.range`.
        - animationEnd: `AnimationEndParams`
          - `effectId`: string of the effect to wait for completion
          - Usage: Fire when the specified effect (by `effectId`) on the source element finishes, useful for chaining sequences.
        - pointerMove: `PointerMoveParams`
          - `hitArea?`: `'root' | 'self'` (default `'self'`)
          - `axis?`: `'x' | 'y'` - when using `keyframeEffect` with `pointerMove`, selects which pointer coordinate maps to linear 0-1 progress; defaults to `'y'`. Ignored for `namedEffect` and `customEffect`.
          - Usage:
            - `'self'`: Track pointer within the source element’s bounds.
            - `'root'`: Track pointer anywhere in the viewport (document root).
            - Only use with `ScrubEffect` mouse presets (`namedEffect`) or `customEffect` that consumes pointer progress; avoid `keyframeEffect` with `pointerMove` unless mapping a single axis via `axis`.
          - When using `customEffect` with `pointerMove`, the progress parameter is an object:
            - ```typescript
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
              ```

    - **conditions?: string[]**
      - OPTIONAL. Array of condition ids that MUST all pass for this trigger to be active.
    - **selector?: string**
      - OPTIONAL. Additional CSS selector to refine element selection:
        - Without `listContainer`: Uses `querySelectorAll` to match all elements within the root element as separate items.
        - With `listContainer`: Uses `querySelectorAll` within the container to find matching elements as list items. For dynamically added list items, uses `querySelector` within each item to find a single matching element.
    - **effects?: Array<Effect | EffectRef>**
      - The effects to apply when the trigger fires. Ordering is significant: the first array entry is applied first. The system may reverse internal storage to preserve this application order.
      - At least one of `effects` or `sequences` MUST be provided.
    - **sequences?: Array<SequenceConfig | SequenceConfigRef>**
      - OPTIONAL. Sequences to play when the trigger fires. Each sequence coordinates multiple effects with staggered timing. See Sequences section below.

### Sequences (coordinated multi-effect stagger)

Sequences let you group multiple effects into a single coordinated timeline with staggered delays. Instead of manually setting `delay` on each effect, you define `offset` (ms between items) and `offsetEasing` (how that offset is distributed).

**Prefer sequences over manual delay stagger** for any multi-element entrance or orchestration pattern.

- **SequenceConfig** type:
  - `effects: (Effect | EffectRef)[]` — REQUIRED. The effects in this sequence, applied in array order.
  - `delay?: number` — Base delay (ms) before the entire sequence starts. Default `0`.
  - `offset?: number` — Stagger offset (ms) between consecutive effects. Default `0`.
  - `offsetEasing?: string | ((p: number) => number)` — Easing function for stagger distribution. Named easings: `'linear'`, `'quadIn'`, `'quadOut'`, `'sineOut'`, `'cubicIn'`, `'cubicOut'`, `'cubicInOut'`. Also accepts `'cubic-bezier(...)'` strings or a JS function `(p: number) => number`. Default `'linear'`.
  - `sequenceId?: string` — Id for caching and referencing. Auto-generated if omitted.
  - `conditions?: string[]` — Condition ids that MUST all pass for this sequence to be active.

- **SequenceConfigRef** type (referencing a reusable sequence):
  - `sequenceId: string` — REQUIRED. MUST match a key in `InteractConfig.sequences`.
  - `delay?`, `offset?`, `offsetEasing?`, `conditions?` — OPTIONAL overrides merged on top of the referenced sequence.

- Effects within a sequence follow the same rules as standalone effects. Each effect can:
  - Target a different element via `key` (cross-element sequences).
  - Use `listContainer` to target list children (each child becomes a separate effect in the sequence).
  - Reference the effects registry via `effectId`.

- A sequence is treated as a single animation unit by the trigger handler—it plays, reverses, and alternates as one.

**Example — viewEnter staggered list using `listContainer`**:

```typescript
{
  interactions: [
    {
      key: 'card-grid',
      trigger: 'viewEnter',
      params: { type: 'once', threshold: 0.3 },
      sequences: [
        {
          offset: 100,
          offsetEasing: 'quadIn',
          effects: [
            {
              effectId: 'card-entrance',
              listContainer: '.card-grid',
            },
          ],
        },
      ],
    },
  ],
  effects: {
    'card-entrance': {
      // ...
    },
  },
}
```

### Working with elements

#### Web: `<interact-element>` custom element

- Wrap the interactive DOM subtree with the custom element and set `data-interact-key` to a stable key. Reference that same key from your config via `Interaction.key` (and optionally `Effect.key`). No observers/listeners or manual DOM querying are needed—the runtime binds triggers and effects via this attribute.
- If an effect targets an element that is not the interaction's source, you MUST also wrap that target element's subtree with its own `<interact-element>` and set `data-interact-key` to the target's key (the value used in `Effect.key` or the referenced registry Effect's `key`). This is required so the runtime can locate and apply effects to non-source targets.
- MUST have a `data-interact-key` attribute with a value that is unique within the scope.
- MUST contain at least one child element.

```html
<interact-element data-interact-key="my-button">
  <button id="my-button">Click me</button>
</interact-element>
```

```ts
import type { InteractConfig } from '@wix/interact';

const config: InteractConfig = {
  interactions: [
    {
      key: 'my-button', // matches data-interact-key
      trigger: 'hover',
      effects: [
        {
          // key omitted -> targets the source element ('my-button')
          // effect props go here (e.g., transition | keyframeEffect | namedEffect | customEffect)
        },
      ],
    },
  ],
};
```

For a different target element:

```html
<interact-element data-interact-key="my-button">
  <button id="my-button">Click me</button>
</interact-element>

<interact-element data-interact-key="my-badge">
  <span id="my-badge">Badge</span>
</interact-element>
```

```ts
const config: InteractConfig = {
  interactions: [
    {
      key: 'my-button',
      trigger: 'click',
      effects: [
        {
          key: 'my-badge', // target is different than source
          // effect props (e.g., transition | keyframeEffect | namedEffect)
        },
      ],
    },
  ],
};
```

#### React: `<Interaction>` component

- MUST replace the element itself with the `<Interaction/>` component.
- MUST set the `tagName` prop with the tag of the replaced element.
- MUST set the `interactKey` prop to a unique string within the scope.

```tsx
import { Interaction } from '@wix/interact/react';

function MyComponent() {
  return (
    <Interaction tagName="button" interactKey="my-button" className="btn">
      Click me
    </Interaction>
  );
}
```

For a different target element:

```tsx
import { Interaction } from '@wix/interact/react';

function MyComponent() {
  return (
    <>
      <Interaction tagName="button" interactKey="my-button" className="btn">
        Click me
      </Interaction>

      <Interaction tagName="span" interactKey="my-badge" className="badge">
        Badge
      </Interaction>
    </>
  );
}
```

The config remains the same for both integrations—only the HTML/JSX setup differs.

### Effect rules (applies to both registry-defined Effect and inline Effect within interactions)

- Common fields (`EffectBase`):
  - **key?: string**
    - OPTIONAL. Target element path. If omitted, resolution follows TARGET CASCADE:
      1. `Effect.key` (if provided)
      2. If Effect is an `EffectRef`: lookup registry by `effectId` and use that registry Effect’s `key`
      3. Fallback to the `Interaction.key` (i.e., source acts as target)
  - **listContainer?: string, listItemSelector?: string**
    - OPTIONAL. If provided, MUST match the interaction's list context when both exist.
  - **conditions?: string[]**
    - OPTIONAL. All conditions MUST pass for the effect to run (in addition to interaction conditions).
  - **selector?: string**
    - OPTIONAL. Additional CSS selector to refine target element selection:
      - Without `listContainer`: Uses `querySelectorAll` to match all elements within the target root as separate items.
      - With `listContainer`: Uses `querySelectorAll` within the container to find matching elements as list items. For dynamically added list items, uses `querySelector` within each item to find a single matching element.
  - **effectId?: string**
    - For `EffectRef` this field is REQUIRED and MUST reference an entry in `effects`.

- Composition and fill usage
  - **composite** (similar to CSS `animation-composition` / WAAPI `composite`):
    - Controls how this effect combines with other effects targeting the same element/property.
    - `'replace'` (default): this effect fully replaces prior values for overlapping properties.
    - `'add'`: this effect adds to the underlying value where the property supports additive composition (e.g., transforms, filters, opacity).
    - `'accumulate'`: values build up across iterations/repeats where supported.
    - Note: If a property is not additive, the runtime will treat `'add'`/`'accumulate'` like `'replace'`.
  - **fill** (like CSS `animation-fill-mode`):
    - `'none'`: styles are only applied while the effect is actively running/in-range.
    - `'forwards'`: the effect’s end state is retained after completion (or last sampled value for scrub).
    - `'backwards'`: the start state applies before the effect begins (or before `rangeStart` for scrub/during `delay` for time effects).
    - `'both'`: combines `'backwards'` and `'forwards'`.
    - For scroll-driven animations (`viewProgress`), prefer `fill: 'both'` to preserve start/end states around the active range and avoid flicker on rapid scroll.

- Types of `Effect` (exactly one MUST be provided via discriminated fields):
  1. **TimeEffect** (discrete animation over time)
     - `duration`: number (REQUIRED)
     - `easing?`: string (CSS/WAAPI easing)
     - `iterations?`: number (>=1 or Infinity)
     - `alternate?`: boolean (direction alternation)
     - `fill?`: `'none' | 'forwards' | 'backwards' | 'both'`
     - `composite?`: `'replace' | 'add' | 'accumulate'`
     - `reversed?`: boolean
     - `delay?`: number (ms)
     - One of:
       - `keyframeEffect`: `{ name: string; keyframes: Keyframe[] }`
       - `namedEffect`: `NamedEffect` (from `@wix/motion-presets`)
       - `customEffect`: `(element: Element, progress: any) => void`

  2. **ScrubEffect** (animation driven by scroll/progress)
     - `easing?`: string
     - `iterations?`: number (NOT Infinity)
     - `alternate?`: boolean
     - `fill?`: `'none' | 'forwards' | 'backwards' | 'both'`
     - `composite?`: `'replace' | 'add' | 'accumulate'`
     - `reversed?`: boolean
     - `rangeStart`: `RangeOffset`
     - `rangeEnd`: `RangeOffset`
     - `centeredToTarget?`: boolean // If `true` centers the coordinate range at the target element, otherwise uses source element
     - `transitionDuration?`: number (ms for smoothing on progress jumps)
     - `transitionDelay?`: number
     - `transitionEasing?`: `ScrubTransitionEasing`
     - One of `keyframeEffect | namedEffect | customEffect` (see above)
     - For mouse-effects driven by the `pointerMove` trigger, avoid `keyframeEffect` unless using `params: { axis: 'x' | 'y' }` to map a single pointer axis to linear 0–1 progress. For 2D effects, use `namedEffect` mouse presets or `customEffect` instead.
     - For scroll `namedEffect` presets (e.g., `*Scroll`) used with a `viewProgress` trigger, include `range: 'in' | 'out' | 'continuous'` in the `namedEffect` options; prefer `'continuous'` for simplicity.
     - RangeOffset (used by `rangeStart`/`rangeEnd`):
       - Type: `{ name: 'entry' | 'exit' | 'contain' | 'cover' | 'entry-crossing' | 'exit-crossing'; offset: LengthPercentage }`
       - name?: Optional logical anchor derived from ViewTimeline concepts.
         - 'entry': Leading edge of the target crosses into the view/container.
         - 'exit': Trailing edge of the target crosses out of the view/container.
         - 'contain': Interval where the target is fully within the view/container.
         - 'cover': Interval where the view/container is fully covered by the target.
         - 'entry-crossing': The moment the target's center crosses the entry boundary.
         - 'exit-crossing': The moment the target's center crosses the exit boundary.
         - If omitted, the runtime chooses a context-appropriate anchor; specify explicitly for deterministic behavior.
       - offset: A `LengthPercentage` that shifts the anchor boundary.
         - Explicit format: `{ value: number; unit: 'percentage' | 'px' | 'em' | 'rem' | 'vh' | 'vw' | 'vmin' | 'vmax' }`
         - Percentages are interpreted along the relevant scroll axis relative to the observation area (e.g., viewport or container size).
         - Positive values move the anchor "forward" along the scroll direction; negative values move it "backward".
       - Examples:
         - Start when the element is 20% inside the viewport: `rangeStart: { name: 'entry', offset: { value: 20, unit: 'percentage' } }`
         - End when the element is leaving: `rangeEnd: { name: 'exit', offset: { value: 0, unit: 'percentage' } }`

  3. **TransitionEffect** (CSS transition-style state toggles)
     - `key?`: string (target override; see TARGET CASCADE)
     - `effectId?`: string (when used as a reference identity)
     - One of:
       - `transition?`: `{ duration?: number; delay?: number; easing?: string; styleProperties: { name: string; value: string }[] }`
         - Applies a single transition options block to all listed style properties.
       - `transitionProperties?`: `Array<{ name: string; value: string; duration?: number; delay?: number; easing?: string }>`
         - Allows per-property transition options. If both `transition` and `transitionProperties` are provided, the system SHOULD apply both with per-property entries taking precedence for overlapping properties.

### Authoring rules for animation payloads (`namedEffect`, `keyframeEffect`, `customEffect`):

- **namedEffect (Preferred)**: Use first for best performance. These are pre-built presets from `@wix/motion-presets` that are GPU-friendly and tuned.
  - Structure: `namedEffect: { type: '<PresetName>', /* optional preset options like direction (bottom|top|left|right), etc. do not use those without having proper documentation of which options exist and of what types. */ }`
  - Short list of common preset names:
    - Entrance: `FadeIn`, `BounceIn`, `SlideIn`, `FlipIn`, `ArcIn`
    - Ongoing: `Pulse`, `Spin`, `Wiggle`, `Bounce`
    - Scroll: `ParallaxScroll`, `FadeScroll`, `RevealScroll`, `TiltScroll` — for `viewProgress`, `namedEffect` options MUST include `range: 'in' | 'out' | 'continuous'`; prefer `'continuous'`
    - Mouse: `TrackMouse`, `Tilt3DMouse`, `ScaleMouse`, `BlurMouse` — for `pointerMove`; prefer over `keyframeEffect` for 2D pointer effects
- **keyframeEffect (Default for custom animations)**: Prefer this when you need a custom-made animation.
  - Structure: `keyframeEffect: { name: string; keyframes: Keyframe[] }` (keyframes use standard CSS/WAAPI properties).
  - When used with `pointerMove`, requires `params: { axis: 'x' | 'y' }` to select which pointer coordinate maps to linear progress. Without `axis`, pointer progress is two-dimensional and cannot drive keyframe animations. For 2D pointer effects, use `namedEffect` or `customEffect`.
- **customEffect (Last resort)**: Use only when you must perform DOM manipulation or produce randomized/non-deterministic visuals that cannot be expressed as keyframes or presets.
  - Structure: `customEffect: (element: Element, progress: any) => void`

### Target resolution and list context

- When applying an effect, the system resolves the final target as:
  `Effect.key -> registry Effect.key (for EffectRef) -> Interaction.key`.
- If a `listContainer` is present on the interaction, the selector resolution may be widened to include list items (optionally filtered by `listItemSelector`), and then further refined by any provided `selector`.

### Reduced motion

- The runtime MAY force reduced motion globally. Authors SHOULD keep effects resilient to reduced motion by avoiding reliance on specific durations or continuous motion.
- Use `conditions` to provide responsive and accessible behavior:
  - Define media conditions such as `'(prefers-reduced-motion: reduce)'` and breakpoint queries, and attach them to interactions/effects to disable, simplify, or swap animations when appropriate.
  - Provide alternative reduced‑motion variants (e.g., shorter durations, fewer transforms, no perpetual motion/parallax/3D), and select them via `conditions` or effect references so that users who prefer reduced motion get a gentler experience.
