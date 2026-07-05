# Core Functions

Reference for the functions Wix Motion exports to create and drive animations directly — WAAPI, CSS, scroll-driven, and pointer-driven.

> **Gotchas**
>
> - There is **no top-level `type` field** on the options object. `AnimationOptions` is discriminated **structurally** by the presence of `keyframeEffect` / `namedEffect` / `customEffect` (`namedEffect.type` is valid — that's the registered preset name).
> - `getWebAnimation()`, `getScrubScene()`, and `getAnimation()` can all return `null`. Don't type a const as `AnimationGroup` — check the result before calling methods on it.
> - `getWebAnimation()` takes a **single** `AnimationOptions` object, never an array. To coordinate multiple elements/effects, use `getSequence()`.
> - `getCSSAnimation()` returns an **array of descriptor objects**, not a string.
> - `startOffset` / `endOffset` live on the animation **options**, not the trigger. Pointer `axis` lives on the **trigger**, not the effect.
> - `iterations: 0` means infinite (not just `Infinity`, though that also works).
> - Named easings are limited to the sets listed under [`getEasing` / `getJsEasing`](#geteasing--getjseasing) below — `cubic-bezier(...)` is hyphenated, not `cubicBezier(...)`.
>
> Looking for `getSequence()` or `createAnimationGroups()`? They're documented in [Sequence Creation](./get-sequence.md) rather than duplicated here.

## getWebAnimation

Creates a WAAPI-backed animation for a single element — time-based, scroll-linked (native `ViewTimeline`), or pointer-driven.

### Signature

```typescript
function getWebAnimation(
  target: HTMLElement | string | null,
  animationOptions: AnimationOptions,
  trigger?: Partial<TriggerVariant> & { element?: HTMLElement },
  options?: Record<string, any>,
  ownerDocument?: Document,
): AnimationGroup | MouseAnimationInstance | null;
```

### Parameters

| Parameter          | Type                                                      | Description                                                                                                                                                                                                              |
| ------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `target`           | `HTMLElement \| string \| null`                            | Element to animate. A `string` is resolved as an element id or CSS selector.                                                                                                                                             |
| `animationOptions` | `AnimationOptions`                                         | A single animation configuration — never an array. Discriminated structurally by `keyframeEffect` / `namedEffect` / `customEffect`; see [Type Definitions](./types.md).                                                 |
| `trigger`          | `Partial<TriggerVariant> & { element?: HTMLElement }`      | Optional. Omitted (or without `trigger.trigger`) produces a time-based animation. `{ trigger: 'view-progress' }` links to a scroll `ViewTimeline`. `{ trigger: 'pointer-move', axis?: 'x' \| 'y' }` drives on pointer movement — `axis` picks which pointer axis feeds a `keyframeEffect`. |
| `options`          | `Record<string, any>`                                      | Optional. The engine reads `{ reducedMotion }` from this bag. `effectId` is **not** read here — set `animationOptions.effectId` instead.                                                                                 |
| `ownerDocument`    | `Document`                                                 | Optional. Document context; defaults to `document`.                                                                                                                                                                      |

### Returns

`AnimationGroup | MouseAnimationInstance | null`

- Returns `null` when no effect data can be generated — e.g. an unregistered `namedEffect`, reduced motion dropping a multi-iteration animation, or a pointer factory that couldn't be built.
- Returns `MouseAnimationInstance` only on the `pointer-move` + non-`keyframeEffect` path (i.e. a `namedEffect`/`customEffect` driven by the pointer); every other path returns an `AnimationGroup`.
- With `{ trigger: 'view-progress' }` and `window.ViewTimeline` present, the animation is linked to a native `ViewTimeline` (`duration: 'auto'`) and plays automatically.
- With `view-progress` but no `window.ViewTimeline`, the animation is created with a scrubbable `duration: 99.99ms` / `delay: 0.01ms`, meant to be driven via [`getScrubScene()`](#getscrubscene).

### Example

```typescript
import { getWebAnimation } from '@wix/motion';

const group = getWebAnimation(document.getElementById('hero'), {
  keyframeEffect: {
    name: 'fade-up',
    keyframes: [
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
  duration: 600,
  easing: 'ease-out',
});

group?.play();
```

## getCSSAnimation

Generates CSS animation descriptors for stylesheet-based rendering — the SSR / FOUC-free path.

### Signature

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

### Parameters

| Parameter          | Type                | Description                                                                                                                                                             |
| ------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `target`           | `string \| null`     | Element id or CSS selector. CSS rules target selectors, so — unlike `getWebAnimation` — an `HTMLElement` reference is not accepted here.                                |
| `animationOptions` | `AnimationOptions`   | Same shape as `getWebAnimation`.                                                                                                                                          |
| `trigger`          | `TriggerVariant`     | Optional. `view-progress` animations always resolve to `duration: 'auto'` through this function, regardless of runtime `ViewTimeline` support (the SSR-safe `forCSS` path). |

### Returns

**An array of descriptor objects — never a string.** Each entry describes one `@keyframes` block plus the `animation` shorthand that applies it:

| Field               | Type                                                     | Description                                                                                              |
| ------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `target`            | `string`                                                   | Selector for the animated element or sub-part, e.g. `"#hero"` or `"#hero[data-motion-part~='icon']"`; `""` if no target resolved. |
| `animation`         | `string`                                                   | The CSS `animation` shorthand value. **Paused by default** — toggle `animation-play-state` or add a class to start it. |
| `composition`       | `CompositeOperation \| undefined`                          | Composite operation, if set.                                                                              |
| `custom`            | `Record<string, string \| number \| undefined> \| undefined` | Custom property values referenced by the keyframes.                                                        |
| `name`              | `string`                                                   | The `@keyframes` name.                                                                                     |
| `keyframes`         | `Record<string, string \| number \| undefined>[]`          | Ordered keyframe declarations, rendered as `@keyframes` steps.                                             |
| `id`                | `string \| undefined`                                      | Effect id, if provided.                                                                                    |
| `animationTimeline` | `string`                                                   | `` `--${trigger.id}` `` for `view-progress` triggers, else `""`.                                          |
| `animationRange`    | `string`                                                   | e.g. `"cover 0% cover 100%"` for `view-progress` triggers, else `""`.                                      |

### Example

```typescript
import { getCSSAnimation } from '@wix/motion';

const descriptors = getCSSAnimation('hero', {
  keyframeEffect: {
    name: 'fade-up',
    keyframes: [
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
  duration: 600,
  easing: 'ease-out',
});
// descriptors: Array<{ target, animation, name, keyframes, ... }>

const sheet = new CSSStyleSheet();

descriptors.forEach(({ target, animation, name, keyframes }) => {
  const steps = keyframes
    .map((frame, i) => {
      const percent = (i / (keyframes.length - 1)) * 100;
      const decls = Object.entries(frame)
        .map(([prop, value]) => `${prop}: ${value};`)
        .join(' ');
      return `${percent}% { ${decls} }`;
    })
    .join(' ');

  sheet.insertRule(`@keyframes ${name} { ${steps} }`);
  sheet.insertRule(`${target || '#hero'} { animation: ${animation}; }`);
});

document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

// Or render to a <style> tag on the server using the same fields:
// descriptors.map((d) => `@keyframes ${d.name} { ... } ${d.target} { animation: ${d.animation}; }`).join('\n')
```

## getScrubScene

Builds scroll-polyfill or pointer-driven scrub scenes for cases where a native `ViewTimeline` isn't available or driving.

### Signature

```typescript
function getScrubScene(
  target: HTMLElement | string | null,
  animationOptions: AnimationOptions,
  trigger: Partial<TriggerVariant> & { element?: HTMLElement },
  sceneOptions?: Record<string, any>,
): ScrubScrollScene[] | ScrubPointerScene | ScrubPointerScene[] | null;
```

### Parameters

| Parameter          | Type                                                   | Description                                                                                                                                |
| ------------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `target`           | `HTMLElement \| string \| null`                          | Same resolution as `getWebAnimation`.                                                                                                       |
| `animationOptions` | `AnimationOptions`                                       | `startOffset` / `endOffset` (the scroll range) live **here**, on the options — not on `trigger`.                                            |
| `trigger`          | `Partial<TriggerVariant> & { element?: HTMLElement }`    | Required. `{ trigger: 'view-progress' }` or `{ trigger: 'pointer-move', axis?: 'x' \| 'y' }`. Pointer `axis` also lives here, not on the effect. |
| `sceneOptions`     | `Record<string, any>`                                    | Optional. `{ disabled, allowActiveEvent, ...rest }` — remaining keys are forwarded to the underlying `getWebAnimation` call.                 |

### Returns

`ScrubScrollScene[] | ScrubPointerScene | ScrubPointerScene[] | null`

- `view-progress` with **no** `window.ViewTimeline` → `ScrubScrollScene[]` (one per partial animation). This is the only branch that emits scroll scenes — when `ViewTimeline` is available, use [`getWebAnimation()`](#getwebanimation) for the native path instead.
- `pointer-move` + `keyframeEffect` → a single `ScrubPointerScene` driving an `AnimationGroup`'s progress.
- `pointer-move` + `namedEffect` / `customEffect` → a single `ScrubPointerScene` wrapping a `MouseAnimationInstance`.
- `null` if the underlying animation couldn't be created.

Drive each scene yourself: call `scene.effect(scene, progress)` from your own `IntersectionObserver` / scroll / pointer listener, and `scene.destroy()` to clean up. `@wix/interact` automates this via its bundled scroll polyfill, [`fizban`](https://github.com/wix-incubator/fizban).

### Example

```typescript
import { getScrubScene } from '@wix/motion';

const scrollRoot = document.getElementById('scrollRoot');

const scenes = getScrubScene(
  document.getElementById('parallax'),
  {
    keyframeEffect: {
      name: 'parallax',
      keyframes: [{ transform: 'translateY(80px)' }, { transform: 'translateY(-80px)' }],
    },
    startOffset: { name: 'cover', offset: { value: 0, unit: 'percentage' } },
    endOffset: { name: 'cover', offset: { value: 100, unit: 'percentage' } },
  },
  { trigger: 'view-progress', element: scrollRoot },
);

if (Array.isArray(scenes)) {
  scenes.forEach((scene) => {
    // Drive scene.effect(scene, progress) from your own scroll/IntersectionObserver
    // listener when ViewTimeline is unavailable, and call scene.destroy() on teardown.
  });
}
```

## getAnimation

Reuses an existing CSS animation on the element if one is present; otherwise falls back to `getWebAnimation()`.

### Signature

```typescript
function getAnimation(
  target: HTMLElement | string | null,
  animationOptions: AnimationOptions,
  trigger?: Partial<TriggerVariant> & { element?: HTMLElement },
  reducedMotion?: boolean,
): AnimationGroup | MouseAnimationInstance | null;
```

### Parameters

| Parameter          | Type                                                   | Description                                                        |
| ------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| `target`           | `HTMLElement \| string \| null`                          | Same resolution as `getWebAnimation`.                                |
| `animationOptions` | `AnimationOptions`                                       | Same shape as `getWebAnimation`.                                     |
| `trigger`          | `Partial<TriggerVariant> & { element?: HTMLElement }`    | Optional. Same shape as `getWebAnimation`.                            |
| `reducedMotion`    | `boolean`                                                | Optional, default `false`. Forwarded to the CSS/WAAPI creation path.  |

### Returns

`AnimationGroup | MouseAnimationInstance | null`

Checks for an existing CSS animation on the element first (via `getElementCSSAnimation`) — if found, returns that `AnimationGroup`, whose `ready` promise runs `prepareAnimation` internally. Otherwise falls back to `getWebAnimation`, with the same return semantics (including `null`).

### Example

```typescript
import { getAnimation } from '@wix/motion';

const group = getAnimation(document.getElementById('hero'), {
  keyframeEffect: {
    name: 'fade-up',
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
  },
  duration: 600,
});

group?.play();
```

## prepareAnimation

Runs an effect's optional `prepare(options, domApi)` hook — measure/mutate via `fastdom` — before an animation plays.

### Signature

```typescript
function prepareAnimation(
  target: HTMLElement | string | null,
  animation: AnimationOptions,
  callback?: () => void,
): void;
```

### Parameters

| Parameter   | Type                             | Description                                                            |
| ----------- | --------------------------------- | -------------------------------------------------------------------------- |
| `target`    | `HTMLElement \| string \| null`   | Element to prepare (same resolution as `getWebAnimation`).               |
| `animation` | `AnimationOptions`                | The animation configuration to prepare for.                              |
| `callback`  | `() => void`                      | Optional. Called inside a `fastdom.mutate` once preparation completes.   |

### Returns

`void`

### Example

```typescript
import { prepareAnimation } from '@wix/motion';

prepareAnimation(
  document.getElementById('hero'),
  {
    keyframeEffect: {
      name: 'fade-up',
      keyframes: [{ opacity: 0 }, { opacity: 1 }],
    },
  },
  () => {
    console.log('Prepared — safe to play the CSS animation now');
  },
);
```

## registerEffects

Merges effect modules into the global registry, keyed by name, so they can be referenced via `namedEffect: { type: '<name>' }`.

### Signature

```typescript
function registerEffects(effects: Record<string, EffectModule>): void;
```

### Parameters

| Parameter | Type                            | Description                                                                              |
| --------- | -------------------------------- | ---------------------------------------------------------------------------------------------- |
| `effects` | `Record<string, EffectModule>`   | Map of effect name → `EffectModule` (`{ web, getNames, style?, prepare? }`). See [Type Definitions](./types.md). |

### Returns

`void`

If a `namedEffect.type` isn't registered, `getRegisteredEffect(name)` logs a warning and returns `null` — which is why an unregistered `namedEffect` makes `getWebAnimation` (and friends) return `null`.

### Example

```typescript
import { registerEffects } from '@wix/motion';

registerEffects({
  FadeUp: {
    getNames: () => ['FadeUp'],
    web: () => [
      {
        name: 'fade-up',
        keyframes: [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
      },
    ],
  },
});

// Now usable anywhere as:
// getWebAnimation(el, { namedEffect: { type: 'FadeUp' }, duration: 600 });
```

`@wix/motion-presets` ships a large catalog of ready-made modules built to this same contract — see its docs for the preset list. Motion only documents the registry contract, not the presets themselves.

## getEasing / getJsEasing

Resolve a named or raw easing value into a CSS easing string or a JS easing function.

### Signature

```typescript
function getEasing(easing?: string): string;
function getJsEasing(easing?: string): ((t: number) => number) | undefined;
```

### Parameters

| Parameter | Type     | Description                                                                                                                     |
| --------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `easing`  | `string` | Optional. A named easing key, a raw `cubic-bezier(x1, y1, x2, y2)` string (hyphenated), or — for `getJsEasing` only — a CSS `linear(...)` string. |

### Returns

- `getEasing(easing?)` → `string` — resolves a named key via the CSS easing map, falling back to the raw string if unresolved, else `'linear'`.
- `getJsEasing(easing?)` → `((t: number) => number) | undefined` — resolves a named key via the JS easing map, else parses a `cubic-bezier(...)` string, else parses a CSS `linear(...)` string, else falls back to the linear JS easing. Returns `undefined` only when `easing` is falsy.

Valid named keys:

- **JS easings** (Penner functions, usable via `getJsEasing` and as `Sequence`'s `offsetEasing`): `linear`, `sineIn`, `sineOut`, `sineInOut`, `quadIn`, `quadOut`, `quadInOut`, `cubicIn`, `cubicOut`, `cubicInOut`, `quartIn`, `quartOut`, `quartInOut`, `quintIn`, `quintOut`, `quintInOut`, `expoIn`, `expoOut`, `expoInOut`, `circIn`, `circOut`, `circInOut`, `backIn`, `backOut`, `backInOut`.
- **CSS easings** (usable via `getEasing` and the `easing` option): `linear`, `ease`, `easeIn`, `easeOut`, `easeInOut`, plus every JS key above (except `linear`/`ease*`) mapped to a `cubic-bezier(...)` value.

Names like `easeOutCubic`, `elasticOut`, `bounceOut`, and `bounceIn` don't exist. (`elastic` / `bounce` exist only as `ScrubTransitionEasing` values for pointer smoothing — a different field.)

### Example

```typescript
import { getEasing, getJsEasing } from '@wix/motion';

getEasing('quadIn'); // → a 'cubic-bezier(...)' string
getEasing(); // → 'linear' (default)

const ease = getJsEasing('backOut'); // → (t: number) => number
getJsEasing(); // → undefined (falsy input)
```

---

**Next**: See [Sequence Creation](./get-sequence.md) for `getSequence()` / `createAnimationGroups()`, or return to the [API Reference](./README.md).
