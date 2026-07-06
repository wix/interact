# SSR & CSS Generation

`getCSSAnimation()` generates plain data — `@keyframes` and `animation` descriptors — instead of a live
`AnimationGroup`. Nothing runs; nothing touches an `Animation` instance. That makes it usable anywhere
you don't have a DOM to animate against, most importantly on the server or at build time, so an
animation's CSS is already in the page before any JavaScript executes. This is the path to avoiding a
flash of unstyled/unanimated content (FOUC).

> **Gotcha**: `getCSSAnimation()` returns an **array of descriptor objects**, never a string. Iterate it
> to build your own stylesheet.

## The descriptor shape

```typescript
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
}>;
```

`target` is a string (element id or selector) here, not an `HTMLElement` — unlike `getWebAnimation`, CSS
rules target selectors, so there's no element reference to accept. One entry is returned per generated
`@keyframes`/`animation` pair (e.g. one per `data-motion-part` sub-target).

| Field               | Meaning                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `target`            | Selector for the animated element or sub-part, e.g. `"#hero"` or `"#hero[data-motion-part~='icon']"`; `""` if nothing resolved. |
| `animation`         | The CSS `animation` shorthand value. **Paused by default** — see [below](#paused-by-default).                                   |
| `composition`       | `CompositeOperation`, if the effect set one.                                                                                    |
| `custom`            | Custom property values referenced by the keyframes, if any.                                                                     |
| `name`              | The `@keyframes` name — pair it with `keyframes` to build the `@keyframes` block.                                               |
| `keyframes`         | Ordered keyframe declarations (property-bag objects, not a WAAPI `Keyframe[]`) — the steps of the `@keyframes` block.           |
| `id`                | Effect id, if `animationOptions.effectId` was set.                                                                              |
| `animationTimeline` | `` `--${trigger.id}` `` for `view-progress` triggers, else `""`. Maps to the CSS `animation-timeline` property.                 |
| `animationRange`    | e.g. `"cover 0% cover 100%"` for `view-progress` triggers, else `""`. Maps to `animation-range`.                                |

## Building a stylesheet from descriptors

The `keyframes` array holds plain property maps with no explicit offsets, so distribute them evenly
across `0%`–`100%` the same way the browser does when keyframe offsets are omitted:

```typescript
import { getCSSAnimation } from '@wix/motion';

function keyframesToCSS(name: string, keyframes: Record<string, string | number | undefined>[]) {
  const steps = keyframes
    .map((keyframe, i) => {
      const offset = keyframes.length > 1 ? (i / (keyframes.length - 1)) * 100 : 0;
      const decls = Object.entries(keyframe)
        .filter(([, value]) => value !== undefined)
        .map(([prop, value]) => `${prop}: ${value};`)
        .join(' ');

      return `${offset}% { ${decls} }`;
    })
    .join('\n  ');

  return `@keyframes ${name} {\n  ${steps}\n}`;
}

function ruleToCSS({
  target,
  animation,
  animationTimeline,
  animationRange,
}: ReturnType<typeof getCSSAnimation>[number]) {
  if (!target) return '';

  const extra = [
    animationTimeline ? `animation-timeline: ${animationTimeline};` : '',
    animationRange ? `animation-range: ${animationRange};` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `${target} { animation: ${animation}; ${extra} }`;
}

const descriptors = getCSSAnimation('hero', {
  namedEffect: { type: 'FadeIn' },
  duration: 800,
});

const css = descriptors
  .map((d) => `${keyframesToCSS(d.name, d.keyframes)}\n${ruleToCSS(d)}`)
  .join('\n\n');
```

`css` is a plain string at this point — inject it however fits your rendering target:

```typescript
// Server-side / build-time: embed directly in the HTML response.
const html = `<style>${css}</style>${markup}`;

// Client-side, e.g. hydrating the same string: replace a stylesheet's contents.
const sheet = new CSSStyleSheet();
sheet.replaceSync(css);
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
```

## `forCSS` and native `ViewTimeline` support

For a `view-progress` trigger, `getWebAnimation()` picks between a native, `ViewTimeline`-linked
animation (`duration: 'auto'`) and a scrubbable polyfill duration (`99.99ms` / `0.01ms` delay) based on
whether `window.ViewTimeline` exists **at runtime**. `getCSSAnimation()` can't make that runtime check —
there is no `window` on the server, and even in the browser you want the same CSS regardless of which
client renders it. So it always passes an internal `forCSS` flag that forces `duration: 'auto'` for
`view-progress` animations, independent of `window.ViewTimeline` support. This is what makes the
generated CSS safe to render ahead of time: it's native-`ViewTimeline` CSS every time, which any browser
that doesn't support `ViewTimeline` will simply treat as a paused/static animation rather than break.

## Paused by default

The `animation` shorthand generated for **time-based** animations is paused by default — the CSS is
ready before your JavaScript runs, but it won't start playing on its own. Flip
`animation-play-state: running` (e.g. by toggling a class once your JS is ready, or via whatever
condition should start the animation) to let it play. `view-progress` animations aren't paused this way —
they're driven by the scroll timeline instead.

## Relationship to `@wix/interact`'s `generate()`

`@wix/interact` builds on `getCSSAnimation()` to emit a **complete** CSS string for an entire
`InteractConfig` in one call — `@keyframes`, animation/transition custom properties, view-timeline
declarations, state-selector rules, and FOUC-prevention rules that hide entrance-animated elements until
their animation starts. If you're working with `@wix/interact` configs, use its `generate()` function
instead of assembling descriptors yourself — see
[`generate()` in the `@wix/interact` function reference](../../../interact/docs/api/functions.md#generate)
for the full contract. Reach for `getCSSAnimation()` directly only when you're generating CSS for a
`keyframeEffect` or `namedEffect` outside of `@wix/interact`.

## See also

- [Core Functions](../api/core-functions.md) — the full `getCSSAnimation()` signature alongside the rest
  of the core API.
- [Custom Effects](./custom-effects.md) — implement an effect module's optional `style()` hook to opt
  into this path.
