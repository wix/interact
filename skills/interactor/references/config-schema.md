# Config schema reference (@wix/interact)

The complete `InteractConfig` schema, every effect variant, sequences, conditions,
element resolution, FOUC, and the static API. This is source-accurate as of
`@wix/interact` 2.5.1.

## Table of contents

- [InteractConfig](#interactconfig)
- [Interaction](#interaction)
- [Effects](#effects) — Time, Scrub, State, payloads
- [Sequences](#sequences)
- [Conditions](#conditions)
- [Element resolution (source vs target)](#element-resolution)
- [CSS generation & FOUC](#css-generation--fouc)
- [Static & instance API](#static--instance-api)
- [Known doc bugs](#known-doc-bugs)

---

## InteractConfig

```ts
type InteractConfig = {
  interactions: Interaction[]; // REQUIRED
  effects?: Record<string, Effect>; // reusable effects, keyed by effectId
  sequences?: Record<string, SequenceConfig>; // reusable sequences, keyed by sequenceId
  conditions?: Record<string, Condition>; // named media/selector/container gates
};
```

Build the whole config up front and pass it to a single `Interact.create(config)`.
Each `create()` call makes an **independent** instance — prefer a single instance for
the entire page/app, unless there are special cases for separate creation/cleanup.
All id cross-references must resolve to an existing entry; element keys must be stable
for the config's lifetime.

---

## Interaction

Maps one **source element + trigger** to one or more **effects** (and/or sequences).

```ts
type Interaction = {
  key: string; // REQUIRED — matches data-interact-key / interactKey (the source root)
  trigger: TriggerType; // REQUIRED — see triggers.md
  params?: TriggerParams; // trigger-specific options
  effects?: (Effect | EffectRef)[]; // ≥1 of effects/sequences REQUIRED
  sequences?: (SequenceConfig | SequenceConfigRef)[];
  conditions?: string[]; // condition ids; ALL must pass; gates the whole trigger
  selector?: string; // CSS selector refining the source within the keyed root
  listContainer?: string; // CSS selector for a list container context
  listItemSelector?: string; // filter which children of listContainer participate
  $[pluginName]?: unknown; // plugin config — routes to Interact.use('<pluginName>', …); see plugins.md
};
```

**At least one of `effects` or `sequences` is required.**

**Multiple effects per interaction:** all effects in one interaction share the
trigger and fire together. Use this to animate several targets from one trigger
event rather than duplicating the trigger across interactions.

For most cases `key` alone resolves both source and target (same element). The
`selector` / `listContainer` / `listItemSelector` fields are only for advanced
patterns — see [Element resolution](#element-resolution).

> **Source vs target selector — this trips people up.** `selector` (and
> `listContainer`/`listItemSelector`) on the **interaction** refines the **source**
> (what the trigger attaches to). The same fields on an **effect** refine the
> **target** (what gets animated). To keep a trigger on a stable parent while
> animating a child (e.g. to avoid hit-area shift on hover/pointerMove), put
> `selector` on the **effect**, not the interaction.

> **Keys must be unique.** The runtime stores one controller per key (a `Map`), so
> two elements with the same `data-interact-key`/`interactKey` collide — only the
> last one binds. For repeated items (lists/cards), do **not** reuse one key across
> N elements. Instead key a single wrapper and fan out: put **`selector`** on the
> effect when one trigger staggers/animates many targets (e.g. a `viewEnter`
> sequence), or **`listContainer`** on the interaction when each item needs its own
> trigger (e.g. per-card `hover`/`pointerMove`). See [Element resolution](#element-resolution).

> **Layers that animate as one → one container, not one effect per layer.** A single
> visual element built from stacked layers (hero: background + overlay + content;
> card: image + heading + text) that should enter/animate **together** belongs on
> **one** keyed wrapper with **one** effect — not the same effect copied onto every
> layer, which spins up N controllers that drift out of sync and cost N× per frame.
> This is the opposite of scroll parallax, where you deliberately give each layer its
> own effect at a different rate. See invariant 11 in `SKILL.md`.

`TriggerType` = `'hover' | 'click' | 'viewEnter' | 'animationEnd' |
'viewProgress' | 'pointerMove' | 'activate' | 'interest'`. Param shapes and
per-trigger semantics live in `triggers.md`.

---

## Effects

An effect is either **inline** or referenced by `effectId` from the top-level
`effects` registry (an `EffectRef`). An `EffectRef` inherits all fields of the
referenced entry and may override any of them (`key`, `duration`, `easing`,
`fill`, …):

```ts
{ effectId: 'fade-in', duration: 1200 }   // reuse 'fade-in' but override duration
```

### Common fields (all effect variants)

```ts
{
  key?: string;              // target element key; omit to target the source
  effectId?: string;         // reference into the effects registry (EffectRef)
  conditions?: string[];     // condition ids; all must pass (gates just this effect)
  selector?: string;         // refine the target within its root
  listContainer?: string;    // list container for the target
  listItemSelector?: string; // filter children of listContainer
  $[pluginName]?: unknown;   // plugin config — routes to Interact.use('<pluginName>', …); see plugins.md
  composite?: 'replace' | 'add' | 'accumulate';   // = CSS animation-composition
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
  easing?: string;
}
```

**`fill` guidance:** use `'both'` for scroll/pointer-driven and for toggling
hover/click (`alternate`/`repeat`/`state`). Entrance presets default to
`'backwards'`. Set `fill: 'backwards'` explicitly for `viewEnter` + `once`
`keyframeEffect` entrances. Use `'both'` when the final keyframe must persist
after the animation (see [CSS generation & FOUC](#css-generation--fouc)).

**`composite`:** `'replace'` (default) overwrites prior values; `'add'`
concatenates transform/filter functions; `'accumulate'` sums matching function args
(`translateX(10px)` + `translateX(20px)` → `translateX(30px)`).

**`easing`:** any CSS easing, or a `@wix/motion` named easing: `linear`, `ease`,
`ease-in/out/in-out`, `sineIn/Out/InOut`, `quadIn/Out/InOut`, `cubicIn/Out/InOut`,
`quartIn/Out/InOut`, `quintIn/Out/InOut`, `expoIn/Out/InOut`, `circIn/Out/InOut`,
`backIn/Out/InOut`, or any `cubic-bezier(...)` / `linear(...)` string. (Note:
names like `easeOutCubic`/`elasticOut` are **not** valid and silently no-op.)

### Exactly one payload per effect

| Payload                               | Shape                                     | Use for                                                                                                                |
| :------------------------------------ | :---------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| `namedEffect`                         | `{ type: string, ...presetOptions }`      | Prebuilt preset (preferred). Do **not** guess option names — omit unknowns.                                            |
| `keyframeEffect`                      | `{ name: string, keyframes: Keyframe[] }` | Inline custom keyframes (WAAPI; camelCase or kebab-case props).                                                        |
| `customEffect`                        | `(element, progress) => void`             | Imperative; only when CSS can't express it (SVG/canvas/text). `progress` is `0–1`, or the 2D object for `pointerMove`. |
| `transition` / `transitionProperties` | see [State effect](#state-effect)         | CSS-state toggle (transitions) on hover/click.                                                                         |

### Time effect

For `hover`, `click`, `viewEnter`, `animationEnd`.

```ts
{
  duration: number;          // REQUIRED (ms)
  easing?: string;
  delay?: number;            // ms
  iterations?: number;       // ≥1 or Infinity; 0 is treated as Infinity
  alternate?: boolean;
  reversed?: boolean;
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
  composite?: 'replace' | 'add' | 'accumulate';
  triggerType?: 'once' | 'repeat' | 'alternate' | 'state';   // playback; see triggers.md
  // + exactly one payload
}
```

### Scrub effect

For `viewProgress` and `pointerMove`. Progress is driven by scroll/pointer, not time.

`rangeStart`/`rangeEnd` apply to **`viewProgress` only** — they define a scroll
window. For `pointerMove`, **omit them**: the pointer position drives progress
directly. The pointer-relevant fields are `transitionDuration`/`transitionEasing`/
`centeredToTarget`.

```ts
{
  rangeStart?: RangeOffset;  // viewProgress ONLY (required there); OMIT for pointerMove
  rangeEnd?: RangeOffset;    // viewProgress ONLY (required there); OMIT for pointerMove
  easing?: string;
  iterations?: number;       // NOT Infinity
  alternate?: boolean;
  reversed?: boolean;
  fill?: 'none' | 'forwards' | 'backwards' | 'both';
  composite?: 'replace' | 'add' | 'accumulate';
  centeredToTarget?: boolean;     // remap 0.5 progress to the target's center
  transitionDuration?: number;    // ms — smoothing on progress jumps (mainly pointerMove)
  transitionDelay?: number;       // ms
  transitionEasing?: 'linear' | 'hardBackOut' | 'easeOut' | 'elastic' | 'bounce';
  // + exactly one payload
}
```

**`RangeOffset`** (works like CSS `animation-range`) — the type of the effect-level
`rangeStart`/`rangeEnd` scroll window. Don't confuse it with the `range:
'in'|'out'|'continuous'` **preset option** that some `*Scroll` presets take inside
`namedEffect` (see `presets.md`); they're different things.

```ts
{ name?: 'entry' | 'exit' | 'contain' | 'cover' | 'entry-crossing' | 'exit-crossing';
  offset?: { value: number; unit: 'percentage' | 'px' | 'vh' | 'vw' } }
```

| Range name       | Meaning                                        |
| :--------------- | :--------------------------------------------- |
| `entry`          | element entering the viewport                  |
| `exit`           | element exiting the viewport                   |
| `contain`        | between full `entry` and start of `exit`       |
| `cover`          | full span: `entry` → `contain` → `exit`        |
| `entry-crossing` | leading edge entering → trailing edge entering |
| `exit-crossing`  | leading edge exiting → trailing edge exiting   |

**Sticky scroll pattern:** a tall wrapper (e.g. `height: 300vh`) defines scroll
distance; a `position: sticky; top: 0; height: 100vh` child (the `key`, the
ViewTimeline source) stays fixed; animate during `name: 'contain'`.

### State effect

For `hover` / `click` CSS-state toggles. Set `stateAction` (not `triggerType`).

```ts
{
  key?: string;
  effectId?: string;
  stateAction?: 'add' | 'remove' | 'toggle' | 'clear';   // default 'toggle'
  // ONE of:
  transition?: {
    duration?: number; delay?: number; easing?: string;
    styleProperties: { name: string; value: string }[];  // shared timing for all props
  };
  transitionProperties?: Array<{
    name: string; value: string; duration?: number; delay?: number; easing?: string;
  }>;  // per-property timing
}
```

CSS property names may be **kebab-case** (`background-color`) or **camelCase**
(`backgroundColor`) — both are accepted and normalized; prefer kebab-case here,
since these are written into CSS. Custom properties (`--*`) are verbatim. If both
`transition` and `transitionProperties` are given, per-property entries win for
overlapping properties.

---

## Sequences

Coordinate multiple effects with **staggered** timing. Prefer sequences over
manually incrementing `delay` per item.

```ts
type SequenceConfig = {
  effects: (Effect | EffectRef)[]; // REQUIRED
  delay?: number; // ms before the sequence starts
  offset?: number; // ms between each child's start
  offsetEasing?: string | ((p: number) => number); // stagger distribution curve (default 'linear')
  sequenceId?: string; // defaults to `seq-<interactionIndex>-<sequenceIndex>`
  conditions?: string[];
  triggerType?: 'once' | 'repeat' | 'alternate' | 'state'; // set on the sequence, NOT its child effects
};

type SequenceConfigRef = {
  sequenceId: string; // points at config.sequences[sequenceId]
  delay?: number;
  offset?: number;
  offsetEasing?: string | ((p: number) => number);
  conditions?: string[];
};
```

Prefer a **string** `offsetEasing`. `generate()` compiles the stagger into a `calc()` delay driven by
`--motion-<sequenceId>-index` custom properties, and a `(p: number) => number` function has no CSS form —
such a sequence is dropped from the generated CSS and loses FOUC prevention (it still runs at runtime). The validator flags this as `FUNCTION_OFFSET_EASING` (warning).

A common pattern: one trigger fires a sequence whose single effect uses `selector`
to pick the items — each matched element becomes a staggered child. (Use `selector`
here, not `listContainer`: one trigger fanning across many targets is the `selector`
case; `listContainer` is for when each item needs its _own_ trigger, like per-card
`hover`/`pointerMove`. See `triggers.md`.)

```ts
{
  interactions: [{
    key: 'cards', trigger: 'viewEnter',
    sequences: [{ offset: 120, offsetEasing: 'quadOut', effects: [{ effectId: 'card-in', selector: '.card' }] }],
  }],
  effects: { 'card-in': { duration: 600, easing: 'ease-out', fill: 'backwards', namedEffect: { type: 'FadeIn' }, triggerType: 'once' } },
}
```

---

## Conditions

Named gates that enable/disable interactions, effects, or sequences.

```ts
type Condition = { type: 'media' | 'container' | 'selector'; predicate?: string };
```

| Type       | Predicate                                                                                                                  |
| :--------- | :------------------------------------------------------------------------------------------------------------------------- |
| `media`    | a media query **without** `@media` — e.g. `'(min-width: 768px)'`, `'(hover: hover)'`, `'(prefers-reduced-motion: reduce)'` |
| `selector` | a CSS selector; `&` is replaced by the base element selector — e.g. `':nth-of-type(odd)'`                                  |

Attach with `conditions: ['desktop']` on an interaction (gates the whole trigger),
an effect (skips just that effect), or a sequence. **All** listed conditions must
pass. Conditions re-evaluate when the media state changes — the primary mechanism
for reduced-motion alternatives.

```ts
conditions: {
  desktop:        { type: 'media', predicate: '(min-width: 768px)' },
  hoverDevice:    { type: 'media', predicate: '(hover: hover)' },
  reducedMotion:  { type: 'media', predicate: '(prefers-reduced-motion: reduce)' },
  oddItems:       { type: 'selector', predicate: ':nth-of-type(odd)' },
}
```

---

## Element resolution

For simple cases the interaction `key` is both the trigger source and the animation
target (same element). The fields below only matter for lists/delegation/child
targeting.

**Source element** (where the trigger attaches), priority order:

1. `listContainer` + `listItemSelector` → each matching child within the container.
2. `listContainer` only → each immediate child (common list case).
3. `listContainer` + `selector` → `querySelector` within each child.
4. `selector` only → `querySelectorAll` within the keyed root.
5. Fallback → first child of `<interact-element>` (web) or the keyed root (react/vanilla).

`listContainer`/`selector` are matched **within** the keyed root (via
`querySelector`), so they must point at a **descendant** — the keyed element itself
can't be its own `listContainer`. Key an ancestor wrapper and target the inner
container.

**Target element** (what the effect animates), priority order:

1. `Effect.key`.
2. The referenced registry effect's `key` (for an `EffectRef`).
3. Fallback to `Interaction.key` (source = target).
4. Then `selector` / `listContainer` / `listItemSelector` on the effect refine within that target.

---

## CSS generation & FOUC

`generate(config, options?)` returns a complete CSS string for **all**
interactions: `@keyframes`, animation/transition custom properties, native
`view-timeline` declarations for `viewProgress`, state-selector rules, coordinated
list aggregation, and FOUC initial rules.

**Static site policy:** Follow the canonical policy in
`references/integration-recipes.md` under
“CSS generation policy for static and pre-rendered output.”

```ts
import { generate } from '@wix/interact/web';
const css = generate(config, true); // true for web; false for vanilla/React
```

**`useFirstChild`:** `true` for the **web** (`<interact-element>`) entry point —
selectors target `:first-child`; `false` for **vanilla** and **React**. The default
is `true`, so vanilla/React callers must pass `false` explicitly. Pass it as a bare
boolean (`generate(config, false)`) or in the options bag
(`generate(config, { useFirstChild: false })`); the bag also carries `plugins`,
a map of plugin name → SSR style generator for `$<name>` config fields. When a
config uses plugin fields, pass the matching generator here **and** register the
runtime plugin with `Interact.use()` before `create()` — see `plugins.md`.

**FOUC prevention (viewEnter + once):** For entrance animations where source and
target are the **same** element, `generate()` emits author-important initial rules
that hide the target and neutralize transforms until its animation starts (gated
by `:not([data-interact-enter])`). When source ≠ target, `generate()` emits **no**
hiding rules for the targets. In both cases, set `fill: 'backwards'` on every
`viewEnter` + `once` animation effect so any `delay` holds the first keyframe
after the entrance marker is set. Use `'both'` when the final keyframe must
persist. Entrance presets default to `backwards`. For `repeat`/`alternate`/`state`,
inline the starting keyframe and use `fill: 'both'`. `viewProgress` needs no FOUC rules.

For when and where to emit this CSS, follow the canonical static/pre-rendered
policy in `references/integration-recipes.md`.

For the web entry point, `interact-element { display: contents; }` is **optional** —
add it if you don't want the custom-element wrapper to participate in layout (the
common choice); omit it if you'd rather it lay out like a normal block.

---

## Static & instance API

`Interact.create(config)` returns an instance. Keep the reference to manage its
lifecycle.

| Member                                                      | Description                                                                                                                                          |
| :---------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Interact.create(config, options?)`                         | Initialize; returns an independent instance. `options.useCustomElement` toggles `<interact-element>` mode.                                           |
| `Interact.registerEffects(presets)`                         | Register named-effect presets. **Call before `create()`/`generate()`** when using `namedEffect`. Same function as `@wix/motion`'s `registerEffects`. |
| `Interact.use(name, plugin)`                                | Register a plugin under `name`. When the config carries `$<name>`, Interact invokes the plugin. **Call before `create()`.** See `plugins.md`.        |
| `Interact.getPlugin(name)` / `Interact.getPluginsNames()`   | Inspect the plugin registry.                                                                                                                         |
| `Interact.setup(options)`                                   | Global defaults — call before `create()`. See below.                                                                                                 |
| `Interact.destroy()`                                        | Static — tears down **all** instances (e.g. on route change).                                                                                        |
| `Interact.getInstance(key)` / `Interact.getController(key)` | Look up the instance/controller owning a key.                                                                                                        |
| `Interact.forceReducedMotion`                               | `boolean`, default `false` — force reduced-motion globally.                                                                                          |
| `Interact.allowA11yTriggers`                                | `boolean`, **default `true`** — enable `interest`/`activate` and layer a11y behavior onto `hover`/`click`.                                           |
| `instance.destroy()`                                        | Tear down just this instance — call on component unmount.                                                                                            |
| `instance.has(key)` / `instance.get(key)`                   | Instance lookups.                                                                                                                                    |

**Standalone functions** (exported from every entry point):

```ts
import { add, remove, generate } from '@wix/interact';

add(element: HTMLElement, key?: string): void;  // key defaults to element.dataset.interactKey
remove(key: string): void;                       // unbind everything for a key
generate(config: InteractConfig, options?: boolean | { useFirstChild?: boolean; plugins?: InteractPluginStyles }): string;
```

**`Interact.setup(options)`:**

```ts
Interact.setup({
  scrollOptionsGetter?:  () => Partial<scrollConfig>,
  pointerOptionsGetter?: () => Partial<PointerConfig>,
  viewEnter?:            Partial<ViewEnterParams>,   // global default threshold/inset
  allowA11yTriggers?:    boolean,
});
```
