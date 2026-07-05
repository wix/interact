---
name: css-generation
description: Read when generating CSS animations for SSR / FOUC-free rendering via getCSSAnimation.
---

# CSS Generation (`getCSSAnimation`)

`getCSSAnimation` is `@wix/motion`'s SSR/FOUC-free path: it turns the same `AnimationOptions` used by
`getWebAnimation` into plain CSS building blocks (`@keyframes` + an `animation` shorthand) that can be
rendered into a `<style>` tag before any JS runs. For the imperative WAAPI/scrub-driving APIs, see
[`./motion-main.md`](./motion-main.md). For declarative trigger wiring and the **full**
FOUC-prevention CSS (including initial-hide rules), use `@wix/interact`'s `generate()` — this file
documents only the lower-level `@wix/motion` primitive it is built on.

## Table of Contents

- [Package Boundary](#package-boundary)
- [Signature](#signature)
- [Return Shape: an Array of Descriptors](#return-shape-an-array-of-descriptors)
- [`forCSS` and `duration: 'auto'`](#forcss-and-duration-auto)
- [Injecting the Output](#injecting-the-output)
- [The `iterations` Idiom in CSS](#the-iterations-idiom-in-css)
- [Relationship to `@wix/interact`'s `generate()`](#relationship-to-wixinteracts-generate)
- [Gotchas / Rules](#gotchas--rules)
- [See Also](#see-also)

## Package Boundary

| Need | Use |
| --- | --- |
| Full page CSS incl. FOUC-prevention initial rules, declarative trigger wiring | `@wix/interact`'s `generate()` |
| Ready-made effect catalog (entrance/scroll/ongoing/mouse presets) | `@wix/motion-presets` (register via `registerEffects`) |
| The raw per-animation CSS descriptor primitive | `@wix/motion` (this file) |

## Signature

```typescript
// ../src/api/cssAnimations.ts:51-80
function getCSSAnimation(
  target: string | null,
  animationOptions: AnimationOptions,
  trigger?: TriggerVariant,
): Array<{
  target: string;
  animation: string;
  composition?: CompositeOperation;
  custom?: Record<string, string | number | undefined>;
  name: string;
  keyframes: Record<string, string | number | undefined>[];
  id: string | undefined;
  animationTimeline: string;
  animationRange: string;
}>
```

> **`getCSSAnimation` RETURNS AN ARRAY OF DESCRIPTOR OBJECTS. IT DOES NOT RETURN A STRING.** This was
> a historical documentation error — do not repeat it. Consumers `.map()`/`.forEach()` the array to
> build the actual CSS text (see [Injecting the Output](#injecting-the-output)).

Unlike `getWebAnimation`, `target` here is `string | null` **only** — an element `id`, never an
`HTMLElement` — because this runs before the target necessarily exists in a live DOM (SSR has no
`document`).

## Return Shape: an Array of Descriptors

One descriptor is produced per `AnimationData` the effect's `web`/`style` returns (see
[`./custom-effects.md`](./custom-effects.md)), so a multi-part effect yields multiple descriptors —
one per `part` (`../src/api/cssAnimations.ts:63-79`).

| Field | Meaning |
| --- | --- |
| `target` | `#<id>` or `#<id>[data-motion-part~="<part>"]` (see [`./custom-effects.md#data-motion-part-sub-targeting`](./custom-effects.md#data-motion-part-sub-targeting)); `''` if `target` was `null`. |
| `animation` | The CSS `animation` shorthand: `<name> <duration> <delay> <easing> <fill> <iterations> <direction> <playState>`. **Paused by default** for time-based/pointer animations; **not** paused for `view-progress` (the timeline governs playback instead) — see `getAnimationAsCSS`, `../src/api/cssAnimations.ts:14-32`. |
| `composition?` | The effect's `CompositeOperation` (`'replace' \| 'add' \| 'accumulate'`), if set — apply as `animation-composition` when building the rule; not embedded in the `animation` shorthand itself. |
| `custom?` | CSS custom properties the effect needs on the target (e.g. `--motion-rotate`) — apply as inline declarations alongside `animation`. |
| `name` | The `@keyframes` name — use it both to declare `@keyframes <name> { … }` and it is already embedded in the `animation` shorthand. |
| `keyframes` | The keyframe list to render into the `@keyframes` block. |
| `id` | `${effectId}-${index + 1}` if the animation options had an `effectId`, else `undefined`. For tracking the descriptor back to its source effect — not itself required in the emitted CSS. |
| `animationTimeline` | `--${trigger.id}` when `trigger.trigger === 'view-progress'`, else `''` — apply as `animation-timeline`. |
| `animationRange` | e.g. `"cover 0% cover 100%"` for `view-progress`, else `''` — apply as `animation-range`. |

## `forCSS` and `duration: 'auto'`

`getCSSAnimation` internally calls the shared `getEffectsData(..., forCSS = true)`
(`../src/api/cssAnimations.ts:60`). For a `view-progress` trigger, this **forces `duration: 'auto'`
regardless of whether the current runtime supports `window.ViewTimeline`**:

```typescript
// ../src/api/common.ts:110-113
// forCSS bypasses the runtime ViewTimeline check so that SSR / CSS generation
// always emits `duration: auto` for scroll-driven animations.
if (trigger?.trigger === 'view-progress' && (forCSS || window.ViewTimeline)) {
  effectOptions.duration = 'auto';
}
```

This is what makes the generated CSS **FOUC-free and environment-independent**: the same CSS renders
correctly whether or not the browser that eventually loads the page supports native `ViewTimeline`.
Server-side code has no `window` at all — without the `forCSS` override this branch would fall
through to the polyfill's `99.99ms` / `0.01ms` values, which is wrong for static CSS output (see
`./scrub-scenes.md` for the polyfill path itself).

## Injecting the Output

Build `@keyframes` from `name`/`keyframes`, and an animation rule targeting `target`, then
concatenate into one `<style>` string:

```typescript
import { getCSSAnimation } from '@wix/motion';

function keyframesToCss(keyframes: Record<string, string | number | undefined>[]): string {
  const last = keyframes.length - 1;
  return keyframes
    .map((kf, i) => {
      const { offset, ...props } = kf;
      const fraction = offset !== undefined ? Number(offset) : last ? i / last : 0;
      const decls = Object.entries(props)
        .filter(([, value]) => value !== undefined)
        .map(([prop, value]) => `${prop}: ${value};`)
        .join(' ');
      return `${(fraction * 100).toFixed(3)}% { ${decls} }`;
    })
    .join(' ');
}

function toCssText(target: string, animationOptions: Parameters<typeof getCSSAnimation>[1]): string {
  return getCSSAnimation(target, animationOptions)
    .map(
      ({ target: selector, animation, name, keyframes, custom, composition, animationTimeline, animationRange }) => {
        const customDecls = custom
          ? Object.entries(custom)
              .map(([prop, value]) => `${prop}: ${value};`)
              .join(' ')
          : '';

        return `@keyframes ${name} { ${keyframesToCss(keyframes)} }
${selector} {
  animation: ${animation};
  ${composition ? `animation-composition: ${composition};` : ''}
  ${animationTimeline ? `animation-timeline: ${animationTimeline};` : ''}
  ${animationRange ? `animation-range: ${animationRange};` : ''}
  ${customDecls}
}`;
      },
    )
    .join('\n');
}

const css = toCssText('hero', { namedEffect: { type: 'FadeIn' }, duration: 800 });

document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
```

On the server, write the same `css` string into the rendered HTML's `<head>` instead of calling
`document.head.insertAdjacentHTML`.

## The `iterations` Idiom in CSS

```typescript
// ../src/api/cssAnimations.ts:30-31
!iterations || iterations === Infinity ? 'infinite' : iterations
```

By the time this runs, `iterations` has already been normalized by `getEffectsData`
(`../src/api/common.ts:100`): `effect.iterations === 0 ? Infinity : effect.iterations || 1`. Net
effect: **`iterations: 0` on the options ⇒ `infinite` in the generated CSS; `undefined` ⇒ `1`.** Use
`0`, not `Infinity`, as the idiom — it's what the rest of the codebase standardizes on.

## Relationship to `@wix/interact`'s `generate()`

`@wix/interact` builds its own `generate(config, useFirstChild)` on top of this primitive to emit
**complete** page CSS: `@keyframes`, animation/transition custom properties, `view-timeline`
declarations, state-selector rules, coordinated-list aggregation, and — critically —
**FOUC-prevention initial rules** that hide `viewEnter` + `once` entrance targets until the animation
starts. If you're integrating declaratively via `@wix/interact`, call its `generate()` instead of
hand-rolling the loop above — see `@wix/interact`'s `integration.md`
(`../../interact/rules/integration.md`). This file documents only the lower-level `@wix/motion`
contract `generate()` is built on; it intentionally does not duplicate `@wix/interact`'s FOUC/initial-
rule logic.

## Gotchas / Rules

- **MUST** treat the return value of `getCSSAnimation` as an **array of descriptors** — never as a
  CSS string.
- **MUST** pass `target` as a `string | null` (an id) — not an `HTMLElement` — this function has no
  live-DOM requirement.
- **Rule:** the `animation` shorthand is paused by default for time-based/pointer animations; the
  caller (or `@wix/interact`) is responsible for playing it once the trigger fires. `view-progress`
  animations are emitted unpaused because `animation-timeline` governs their progress instead.
- **Rule:** `iterations: 0` ⇒ `infinite` in the emitted CSS — same idiom as `getWebAnimation`
  (`./waapi.md`).
- **Rule:** for full FOUC-prevention and declarative CSS generation, use `@wix/interact`'s
  `generate()` rather than reimplementing it against these descriptors.
- A registered effect only participates in `getCSSAnimation` output if it implements the optional
  `style` member of `AnimationEffectAPI` — see [`./custom-effects.md`](./custom-effects.md).

## See Also

- [`./motion-main.md`](./motion-main.md) — entry point, function map, package boundary, easing
  reference.
- [`./custom-effects.md`](./custom-effects.md) — the `AnimationEffectAPI`/`style()` contract that
  feeds `getCSSAnimation`, and `data-motion-part` sub-targeting.
- `./scrub-scenes.md` — the native-`ViewTimeline`-vs-polyfill duration branch this file's `forCSS`
  override bypasses.
- `../../interact/rules/integration.md` — `@wix/interact`'s `generate()`, which builds full
  FOUC-prevention page CSS on top of `getCSSAnimation`.
