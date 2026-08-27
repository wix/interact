# Triggers reference (@wix/interact)

Per-trigger semantics, the playback fields each one needs, and the gotchas that
break them. Pair this with `config-schema.md` (effect field definitions) and
`presets.md` (which effect to use).

`TriggerType` = `'hover' | 'click' | 'viewEnter' | 'animationEnd' |
'viewProgress' | 'pointerMove' | 'activate' | 'interest'`.

The trigger sets _when_; the effect's playback field sets _how it plays_:

- **Time effects** (keyframe/named/custom) on hover/click/viewEnter/animationEnd → `triggerType`.
- **State effects** (CSS transitions) on hover/click → `stateAction`.
- **Scrub effects** on viewProgress → `rangeStart`/`rangeEnd`; pointerMove → `centeredToTarget`; (no `triggerType`).

Never set both `triggerType` and `stateAction` on the same effect.

---

## viewEnter — entrance when scrolled into view

Uses IntersectionObserver. Params:

```ts
params?: {
  threshold?: number;        // 0–1 intersection ratio before firing
  inset?: string;            // like view-timeline-inset, e.g. '-100px' or '-50px 0px'
  useSafeViewEnter?: boolean;
}
```

Playback is set per effect via `triggerType` (default `'once'`):

| `triggerType`      | Behavior                                                |
| :----------------- | :------------------------------------------------------ |
| `'once'` (default) | Play once, the first time it enters. The entrance case. |
| `'repeat'`         | Replay every time it re-enters.                         |
| `'alternate'`      | Play forwards in, reverse out.                          |
| `'state'`          | Play on enter, pause on exit.                           |

**CRITICAL:** when source and target are the **same** element, use **only**
`'once'`. With `repeat`/`alternate`/`state`, the animation can push the element
out of / back into the viewport and re-trigger forever (or never settle). For those,
use **separate** source and target elements (trigger on a stable wrapper, animate a
child via `selector`, or point the effect at a different `key`).

**FOUC:** `once` entrances need injected `generate()` CSS before first paint (see
`config-schema.md` and SKILL.md invariant 3). Set `fill: 'backwards'` on every
`viewEnter` + `once` animation effect so any `delay` holds the first keyframe.
When source ≠ target (staggering children via `selector`) `generate()` emits no
hiding rules for those targets — `fill: 'backwards'` is still required.

```ts
{ interactions: [{ key: 'hero', trigger: 'viewEnter', params: { threshold: 0.2 },
    effects: [{ effectId: 'hero-in' }] }],
  effects: { 'hero-in': { duration: 800, easing: 'ease-out', namedEffect: { type: 'FadeIn' }, triggerType: 'once' } } }
```

---

## viewProgress — scroll-driven (ViewTimeline)

The element's animation progress is tied to its scroll position through the
viewport (native `ViewTimeline`, with a bundled polyfill where unsupported). **No
trigger params** — the range lives on the _effect_ via `rangeStart` / `rangeEnd`
(see `RangeOffset` in `config-schema.md`).

```ts
{ interactions: [{ key: 'bg', trigger: 'viewProgress', effects: [{ effectId: 'parallax' }] }],
  effects: { parallax: {
    rangeStart: { name: 'cover', offset: { value: 0,   unit: 'percentage' } },
    rangeEnd:   { name: 'cover', offset: { value: 100, unit: 'percentage' } },
    fill: 'both',
    namedEffect: { type: 'ParallaxScroll', parallaxFactor: 0.4 },
  } } }
```

**CRITICAL — `overflow`:** `overflow: hidden` on any ancestor between the element
and its scroll container creates a scroll context that **breaks** ViewTimeline.
Replace every such `overflow: hidden` with `overflow: clip` (Tailwind:
`overflow-clip`).

**Scroll presets need `range`.** Every `*Scroll` preset takes
`range: 'in' | 'out' | 'continuous'` (prefer `'continuous'` unless you specifically
want enter-only / exit-only) — **except** `ParallaxScroll`, which uses
`parallaxFactor`. Use `fill: 'both'` for scrub effects.

---

## hover / click (and accessible variants interest / activate)

No trigger params — behavior is configured entirely on the effect. Two flavors:

**Time effect → `triggerType`:**

| `triggerType`           | hover                               | click                            |
| :---------------------- | :---------------------------------- | :------------------------------- |
| `'alternate'` (default) | play on enter, reverse on leave     | alternate play/reverse per click |
| `'repeat'`              | play on enter, stop+rewind on leave | restart per click                |
| `'once'`                | play once on first enter            | play once on first click         |
| `'state'`               | play on enter, pause on leave       | toggle play/pause per click      |

**State effect (CSS transition) → `stateAction`:**

| `stateAction`        | hover                               | click            |
| :------------------- | :---------------------------------- | :--------------- |
| `'toggle'` (default) | add state on enter, remove on leave | toggle per click |
| `'add'`              | add on enter, leave doesn't remove  | add on click     |
| `'remove'`           | remove on enter                     | remove on click  |
| `'clear'`            | clear all states on enter           | clear all states |

**CRITICAL — hit-area shift:** if a hover effect changes the element's size or
position (`scale`, `translate`), the hovered region shifts and the pointer
rapidly enters/leaves → flicker. Keep the **trigger on the stable parent** and
animate a **child** as the target. Do this by putting `selector` (or `key`) on the
**effect** — `selector` on the _effect_ refines the **target**; `selector` on the
_interaction_ would instead move the trigger's **source** onto the scaling element
(the opposite of what you want). See "source vs target selector" in
`config-schema.md`.

```ts
// hover-scale a button safely: trigger stays on the <button> (key 'cta'),
// the grow targets its inner label — selector is on the EFFECT (the target).
{ interactions: [{ key: 'cta', trigger: 'hover', effects: [{ effectId: 'grow', selector: '.cta-label' }] }],
  effects: { grow: { duration: 200, easing: 'ease-out', triggerType: 'state',
    keyframeEffect: { name: 'grow', keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }] }, fill: 'both' } } }
```

State-effect example (CSS transition toggle):

```ts
{ interactions: [{ key: 'card', trigger: 'hover', effects: [{ effectId: 'lift' }] }],
  effects: { lift: { stateAction: 'toggle', transition: {
    duration: 200, easing: 'ease-out',
    styleProperties: [{ name: 'boxShadow', value: '0 8px 24px rgb(0 0 0 / 20%)' }, { name: 'transform', value: 'translateY(-4px)' }],
  } } } }
```

**Accessibility variants:** `interest` = hover **+** focus; `activate` = click **+**
keyboard Enter/Space. They are gated by `Interact.allowA11yTriggers` (default
**`true`**). With a11y on, `hover`→`interest` and `click`→`activate` behavior is
also layered in automatically. Prefer `interest`/`activate` for anything keyboard
users must reach.

---

## pointerMove — cursor-following / tilt / mouse parallax

```ts
params?: {
  hitArea?: 'self' | 'root';   // 'self' = source element bounds (default); 'root' = whole viewport
  axis?: 'x' | 'y';            // restrict to one axis (for keyframeEffect only); default 'y'
}
```

Use a **scrub effect**, but **without `rangeStart`/`rangeEnd`** — those are
`viewProgress`-only (they define a scroll window). For `pointerMove` the pointer
position drives progress directly, so omit them. For 2D motion, prefer a
`namedEffect` **mouse preset** (`TrackMouse`, `Tilt3DMouse`, `Track3DMouse`, etc. —
see `presets.md`) or a `customEffect`. A `keyframeEffect` only maps a single axis.

**Progress object** passed to `customEffect`:

```ts
{ x: number; y: number; v?: { x: number; y: number }; active?: boolean }
// x,y: 0–1 within the hit area · v: velocity vector · active: pointer inside hit area
```

**Rules / gotchas:**

- The source element must **not** have `pointer-events: none`.
- **CRITICAL — hit-area shift:** never use the same element as source and target with `hitArea: 'self'` and a size/position effect — the transform shifts the hit area → jitter. Keep the trigger on the parent and animate a child by putting `selector` (or `key`) on the **effect** (the target) — not on the interaction (that moves the source).
- **Multiple items (grid of cards):** use `listContainer` so each item becomes its own source with its own pointer tracker — one interaction, not a hand-written list of per-card interactions. Key an ancestor wrapper, point `listContainer` at the cards' container; the effect's `selector` then resolves the target within each card.
- Gate on touch devices with a `(hover: hover)` media condition; `pointerMove` behaves differently on touch. Provide a `viewEnter`/`viewProgress` fallback there.
- `centeredToTarget: true` remaps progress so `0.5` = the target's center — use with `hitArea: 'root'` or when source ≠ target.
- For independent 2-axis keyframe control, use two interactions (`axis: 'x'` and `axis: 'y'`) with `composite: 'add'`/`'accumulate'` on the second.
- `transitionDuration` / `transitionEasing` smooth the follow so it doesn't snap to the cursor.

```ts
// 3D tilt-to-cursor across a grid of cards. One interaction keyed to the wrapper;
// listContainer makes EACH card its own source (its own pointer tracker). The tilt
// targets each card's inner child via selector on the EFFECT (avoids hit-area shift).
// No rangeStart/rangeEnd — those are viewProgress-only; the pointer drives progress.
{ interactions: [{ key: 'cards', trigger: 'pointerMove', params: { hitArea: 'self' },
    listContainer: '.card-grid', conditions: ['hoverDevice'],
    effects: [{ effectId: 'tilt', selector: '.card-inner' }] }],
  effects: { tilt: {
    fill: 'both', transitionDuration: 200, transitionEasing: 'easeOut',
    namedEffect: { type: 'Tilt3DMouse', angle: 8 },
  } },
  conditions: { hoverDevice: { type: 'media', predicate: '(hover: hover)' } } }
```

---

## animationEnd — chain after another effect

```ts
params: {
  effectId: string;
} // the effect to wait for, on the same source
```

Fires when the named effect completes on the source element. Use it to sequence
phases that aren't a simple stagger (e.g. play B only after A finishes).

---

## Sequences & staggering

For animating many items with offset timing (cards, list items, nav links), use a
**sequence** — don't hand-roll incrementing `delay`s. One trigger fires the whole
sequence; the effect's **`selector`** picks the items to stagger, and each matched
element becomes a staggered participant. The same pattern applies to split text
spans (`.split-c`, `.split-w`, etc.) — use `$splitText` on the interaction, then
`selector` on the effect with `fill: 'backwards'`; see `plugins.md`.

```ts
// One viewEnter trigger on the section; selector on the effect picks the cards to stagger.
{ interactions: [{ key: 'features', trigger: 'viewEnter',
    sequences: [{ offset: 120, offsetEasing: 'quadOut',
      effects: [{ effectId: 'card-in', selector: '.feature-card' }] }] }],
  effects: { 'card-in': { duration: 600, easing: 'ease-out', fill: 'backwards', namedEffect: { type: 'SlideIn', direction: 'bottom' }, triggerType: 'once' } } }
```

- `offset` = ms between consecutive items' starts.
- `offsetEasing` = distribution curve of those offsets (e.g. `quadOut` clusters early items, spreads later ones).
- `delay` = ms before the whole sequence starts.
- Reusable sequences go in `config.sequences` and are referenced by `sequenceId`.
- Set `triggerType` on the **sequence**, not on its child effects.

**`selector` vs `listContainer` for groups of items** — pick by _who triggers_:

- **One trigger fans an effect/sequence across many targets** (a single `viewEnter` staggering a row of cards): put **`selector`** on the effect to select the items. This is the sequence case above. Here source ≠ target, so `generate()` emits **no** FOUC-hiding rules for the items — set **`fill: 'backwards'`** on the effect so each target holds its first-keyframe state before the trigger fires (see [viewEnter](#viewenter) and “CSS generation & FOUC” in `config-schema.md`).
- **Each item needs its own trigger** (per-card `hover`/`pointerMove`, one tracker each): put **`listContainer`** on the interaction so each child becomes its own source.

**Two rules that silently break list binding either way:**

- **A `listContainer`/`selector` must match a descendant of the keyed element**, not the keyed element itself — they're resolved _within_ the keyed root. Key an **ancestor wrapper** (e.g. `key: 'features'` on a section). Keying the grid itself and pointing `listContainer` at that same grid matches nothing → zero items bind.
- **Don't put the same key on every item.** The runtime stores one controller per key (a `Map`), so N items sharing one `interactKey`/`data-interact-key` clobber each other and only the last binds. Use a keyed wrapper + `selector`/`listContainer`, not duplicated keys.

See the sequences section of `config-schema.md` for the full type.
