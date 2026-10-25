# Types

TypeScript reference for the types `@wix/motion` itself defines and exports (`src/types.ts`). These are the shapes accepted by `getWebAnimation()`, `getCSSAnimation()`, `getScrubScene()`, `getSequence()`, `createAnimationGroups()`, and `registerEffects()`.

## Animation options

### `AnimationOptions`

The options object accepted by `getWebAnimation`, `getCSSAnimation`, `getScrubScene`, `getAnimation`, and used inside `AnimationGroupArgs`.

```typescript
type AnimationOptions = (TimeAnimationOptions | ScrubAnimationOptions) & AnimationExtraOptions;
```

> **No top-level `type` field.** `AnimationOptions` is a union of `TimeAnimationOptions` and `ScrubAnimationOptions`, but the engine never reads a discriminant string off it. Which branch applies is determined **structurally**: by which of `keyframeEffect` / `namedEffect` / `customEffect` is present, and by whether a scroll/pointer `trigger` argument was passed. Do not add a `type: 'TimeAnimationOptions'` (or similar) field — it is ignored.
>
> ```typescript
> // ✅ correct — no top-level `type`
> getWebAnimation(el, { namedEffect: { type: 'FadeIn' }, duration: 1000 });
> ```
>
> (`namedEffect.type` _is_ real — see [`NamedEffect`](#namedeffect) below. It's the top-level `type` on the options object that doesn't exist.)

### `TimeAnimationOptions`

Options for a time-based (duration/delay-driven) animation — used when no scroll/pointer trigger is given.

```typescript
type TimeAnimationOptions = {
  id?: string;
  keyframeEffect?: MotionKeyframeEffect;
  namedEffect?: NamedEffect;
  customEffect?: CustomEffect;
  duration?: number; // ms
  delay?: number; // ms
  endDelay?: number; // ms
  easing?: string; // named key or CSS easing string
  iterations?: number; // 0 ⇒ Infinity; undefined ⇒ 1
  alternate?: boolean;
  fill?: AnimationFillMode; // 'none' | 'backwards' | 'forwards' | 'both'
  reversed?: boolean;
};
```

- `keyframeEffect`, `namedEffect`, and `customEffect` are mutually exclusive ways to describe what animates — see [Effects](#effects).
- `duration`, `delay`, and `endDelay` are all in **milliseconds**.
- `iterations: 0` means infinite repeats; an omitted `iterations` means `1`.

### `ScrubAnimationOptions`

Options for a scrub-driven animation — used when a `view-progress` (scroll) or `pointer-move` trigger is passed.

```typescript
type ScrubAnimationOptions = {
  id?: string;
  keyframeEffect?: MotionKeyframeEffect;
  namedEffect?: NamedEffect;
  customEffect?: CustomEffect;
  startOffset?: RangeOffset;
  endOffset?: RangeOffset;
  playbackRate?: number;
  easing?: string;
  iterations?: number;
  fill?: AnimationFillMode;
  alternate?: boolean;
  reversed?: boolean;
  transitionDuration?: number; // pointer smoothing (ms)
  transitionEasing?: ScrubTransitionEasing; // 'linear' | 'hardBackOut' | 'easeOut' | 'elastic' | 'bounce'
  centeredToTarget?: boolean;
  duration?: LengthPercentage; // NOTE: length/percentage, not ms
};
```

- **`duration` here is a [`LengthPercentage`](#length--percentage--lengthpercentage), not a millisecond number** — unlike `TimeAnimationOptions.duration`. It expresses a portion of the scroll/scrub range.
- `startOffset` / `endOffset` live on these options, not on the trigger.
- `transitionDuration` / `transitionEasing` / `centeredToTarget` only apply to pointer-driven (`pointer-move`) scrubbing.

### `AnimationExtraOptions`

Mixed into both `TimeAnimationOptions` and `ScrubAnimationOptions` to form `AnimationOptions`.

```typescript
type AnimationExtraOptions = {
  effectId?: string;
  effect?: (progress: () => number | { x: number | undefined; y: number | undefined }) => void;
  measures?: Record<string, string | number>;
};
```

- `effectId` — an id surfaced on the `animationend` `CustomEvent` dispatched by `AnimationGroup.onFinish` (see [`animation-group.md`](./animation-group.md)).
- `effect` — an optional per-frame progress reader, given a function that returns the current progress.
- `measures` — arbitrary measured values an effect's `prepare()` hook can stash for `web()`/`style()` to consume.

## Effects

`keyframeEffect`, `namedEffect`, and `customEffect` are the three mutually-exclusive ways to describe what an `AnimationOptions` object actually animates.

### `NamedEffect`

References a preset registered via `registerEffects()`.

```typescript
type NamedEffect = { type: string } & Record<string, unknown>;
```

`type` here **is** a real field — it's the registered preset name (e.g. `'FadeIn'`). This is the one place in motion's option types where a `type` string is meaningful; it is unrelated to the (non-existent) top-level `type` field discussed under [`AnimationOptions`](#animationoptions). Everything else on a `NamedEffect` is preset-specific and defined by whichever package registered it (see [Types owned elsewhere](#types-owned-elsewhere)).

### `CustomEffect`

```typescript
type CustomEffect =
  | { ranges: { name: string; min: number; max: number; step?: number }[] }
  | ((element: Element | null, progress: number | null) => void);
```

`CustomEffect` is a union of two shapes, but only the **function** form does anything at runtime in `@wix/motion`:

- **Function form (primary)** — `(element, progress) => void`. Wrapped in a `CustomAnimation` that runs a `requestAnimationFrame` loop, calling your function whenever computed progress changes. On cancellation it is called once with `progress === null` — handle this as a reset/cleanup signal.

  ```typescript
  const customEffect: CustomEffect = (element, progress) => {
    if (progress === null) {
      // cancelled — reset any applied styles here
      return;
    }
    if (element instanceof HTMLElement) {
      element.style.setProperty('opacity', String(progress));
    }
  };
  ```

- **`{ ranges }` object form** — accepted by the type, but **inert** when used with `@wix/motion` alone; it produces no visible effect on its own. Don't rely on it unless a higher-level package (e.g. `@wix/interact`) interprets it.

### `MotionKeyframeEffect`

Inline WAAPI/CSS keyframes — no registration required.

```typescript
type MotionKeyframeEffect = {
  name: string;
  keyframes: Keyframe[];
};
```

No `type` field. `name` becomes the animation/`@keyframes` name; `keyframes` is a standard WAAPI `Keyframe[]`.

## Triggers & scrub

### `TriggerVariant`

The shape of the (optional) 3rd argument to `getWebAnimation` / `getScrubScene` / `getAnimation`.

```typescript
type TriggerVariant = {
  id: string;
  trigger: 'view-progress' | 'pointer-move';
  componentId: string;
};
```

- Callers actually pass `Partial<TriggerVariant> & { element?: HTMLElement }` — and for pointer triggers, `axis?: PointerMoveAxis` as well. `element` and `axis` are **not** fields of `TriggerVariant` itself; they're read directly off the object passed as the trigger argument.
- Omitting `trigger` (or passing neither `'view-progress'` nor `'pointer-move'`) produces a time-based animation.

### `RangeOffset`

```typescript
type RangeOffset = {
  name?: 'entry' | 'exit' | 'contain' | 'cover' | 'entry-crossing' | 'exit-crossing';
  offset?: LengthPercentage;
};
```

Used for `startOffset` / `endOffset` on `ScrubAnimationOptions`, and shows up on `AnimationGroup.animations[i].start` / `.end` for scroll-driven groups.

### `ScrubTransitionEasing`

```typescript
type ScrubTransitionEasing = 'linear' | 'hardBackOut' | 'easeOut' | 'elastic' | 'bounce';
```

Named easing curves for smoothing pointer-driven scrub transitions (`transitionEasing` on `ScrubAnimationOptions`). These are a distinct, closed set from the general `easing` string — `'elastic'` and `'bounce'` exist only here, not as named JS/CSS easings.

### `PointerMoveAxis`

```typescript
type PointerMoveAxis = 'x' | 'y';
```

Set on the **trigger** object (e.g. `{ trigger: 'pointer-move', axis: 'y' }`), not on the effect or options. It selects whether a keyframe pointer effect reads `progress.x` or `progress.y`.

### `Progress`

```typescript
type Progress = { x: number; y: number; v?: { x: number; y: number }; active?: boolean };
```

The payload driving pointer-based scrubbing: normalized `x`/`y` position, an optional velocity vector `v`, and whether the interaction is currently `active`.

### `MouseAnimationInstance` / `CustomMouseAnimationInstance`

Returned by `getWebAnimation` on the `pointer-move` + non-`keyframeEffect` path (instead of an `AnimationGroup`).

```typescript
interface MouseAnimationInstance {
  target: HTMLElement;
  play: () => void;
  progress: (progress: Progress) => void;
  cancel: () => void;
}

interface CustomMouseAnimationInstance extends MouseAnimationInstance {
  getProgress: () => Progress;
}
```

- `play()` arms the instance; `progress(p)` feeds it a `Progress` sample (typically from a pointer-move listener); `cancel()` tears it down.
- `CustomMouseAnimationInstance` adds `getProgress()` for reading back the last-applied `Progress`.

## Sequences

### `SequenceOptions`

Constructor options for `Sequence` / the first argument to `getSequence()`. See [`sequence.md`](./sequence.md) for the full stagger-offset formula and examples.

```typescript
type SequenceOptions = {
  delay?: number; // ms base delay, default 0
  offset?: number; // ms stagger interval, default 0
  offsetEasing?: string | ((p: number) => number);
  sequenceId?: string; // links the Sequence to CSS generated for the same id
};
```

`SequenceOptions` is also the optional 4th argument to `getCSSAnimation()`, which compiles `delay`/`offset`/`offsetEasing` into a `calc()` delay driven by `--motion-<sequenceId>-index`. See [CSS-Driven Stagger](./sequence.md#css-driven-stagger).

### `AnimationGroupArgs`

One entry in the array passed to `getSequence()` / `createAnimationGroups()`.

```typescript
type AnimationGroupArgs = {
  target: HTMLElement | HTMLElement[] | string | null;
  options: AnimationOptions;
  context?: Record<string, any>;
};
```

- `target` — element(s) to animate. `HTMLElement[]` and `string` selectors expand to one group per matched element.
- `options` — the `AnimationOptions` to apply to that target.
- `context` — forwarded to animation creation (e.g. `{ reducedMotion: true }`).

## Units & fill mode

### `Length` / `Percentage` / `LengthPercentage`

```typescript
type Length = { value: number; unit: 'px' | 'em' | 'rem' | 'vh' | 'vw' | 'vmin' | 'vmax' };
type Percentage = { value: number; unit: 'percentage' };
type LengthPercentage = Length | Percentage;
```

Used anywhere motion needs a dimension that could be either an absolute length or a percentage — e.g. `RangeOffset.offset` and `ScrubAnimationOptions.duration`.

### `AnimationFillMode`

```typescript
type AnimationFillMode = 'none' | 'backwards' | 'forwards' | 'both';
```

Standard WAAPI fill mode, used by both `TimeAnimationOptions.fill` and `ScrubAnimationOptions.fill`.

## Authoring / effect modules

These types define the contract for writing and registering your own effect modules via `registerEffects()`. Most consumers of `@wix/motion` won't need them unless they're authoring presets.

### `AnimationData`

The shape an effect module's `web()` / `style()` hook returns — one entry per animated part/property group.

```typescript
type AnimationData = (TimeAnimationOptions | AnimationDataForScrub) & {
  name?: string;
  keyframes: Record<string, string | number | undefined>[];
  custom?: Record<string, string | number | undefined>;
  composite?: CompositeOperation;
  part?: string;
  timing?: Partial<EffectTiming>;
};
```

- `keyframes` — plain property-bag keyframes (not a WAAPI `Keyframe[]`) that motion turns into a `KeyframeEffect` or CSS `@keyframes` block.
- `part` — targets a sub-element via `[data-motion-part~="<part>"]` instead of the root target.
- `AnimationDataForScrub` mirrors `ScrubAnimationOptions`'s fields, with `duration?: LengthPercentage | number` plus internal `startOffsetAdd` / `endOffsetAdd` string fields.

### `AnimationEffectAPI`

The primary contract for a registered effect module.

```typescript
type AnimationOptionsTypes = {
  time: TimeAnimationOptions & AnimationExtraOptions;
  scrub: ScrubAnimationOptions & AnimationExtraOptions;
};

type AnimationEffectAPI<Enum extends keyof AnimationOptionsTypes> = {
  web: (
    animationOptions: AnimationOptionsTypes[Enum],
    dom?: DomApi,
    options?: Record<string, any>,
  ) => AnimationData[];
  getNames: (animationOptions: AnimationOptionsTypes[Enum]) => string[];
  style?: (options: AnimationOptionsTypes[Enum]) => AnimationData[]; // enables the CSS path (getCSSAnimation)
  prepare?: (options: AnimationOptionsTypes[Enum], dom?: DomApi) => void; // measure/mutate before animating
};
```

- `Enum` (`'time'` or `'scrub'`) selects which options shape the module handles.
- `web` builds the `AnimationData[]` used for WAAPI playback; `style`, if present, enables `getCSSAnimation`'s CSS-generation path; `prepare` runs a measure/mutate step via `fastdom` before animating.

### `DomApi` / `MeasureCallback`

Passed to an effect module's `web`/`style`/`prepare` hooks for batched, layout-thrash-free DOM access.

```typescript
type MeasureCallback = (fn: (target: HTMLElement | null) => void) => void;
type DomApi = { measure: MeasureCallback; mutate: MeasureCallback };
```

Both `measure` and `mutate` schedule `fn` through `fastdom`'s read/write batching.

### `EffectModule`

The union of shapes `registerEffects()` accepts.

```typescript
type EffectModule =
  | AnimationEffectAPI<'time'>
  | AnimationEffectAPI<'scrub'>
  | ScrollEffectModule // { web(options, dom?): AnimationData[] }
  | MouseEffectModule // { web(options): (el: HTMLElement) => object }
  | WebAnimationEffectFactory<'scrub'>;
```

Most presets implement `AnimationEffectAPI`; `ScrollEffectModule` and `MouseEffectModule` are narrower shapes for scroll-only / mouse-only modules.

### `ScrubScrollScene`

One entry of the array returned by `getScrubScene()` on the polyfilled (no `window.ViewTimeline`) scroll path.

```typescript
interface ScrubScrollScene {
  start: RangeOffset;
  end: RangeOffset;
  viewSource: HTMLElement;
  ready: Promise<void>;
  getProgress(): number;
  effect(__: any, p: number): void; // p is 0..1 scroll progress
  disabled: boolean;
  destroy(): void;
  groupId?: string;
}
```

Callers drive `effect(_, progress)` from their own scroll/IntersectionObserver logic (`@wix/interact` does this via its bundled [`fizban`](https://github.com/wix-incubator/fizban) polyfill) and call `destroy()` to clean up.

### `ScrubPointerScene`

Returned by `getScrubScene()` on the `pointer-move` path.

```typescript
interface ScrubPointerScene {
  target?: HTMLElement;
  centeredToTarget?: boolean;
  transitionDuration?: number;
  transitionEasing?: ScrubTransitionEasing;
  getProgress(): Progress | number;
  effect(__: any, p: Progress): void; // p is the pointer Progress payload
  disabled: boolean;
  destroy(): void;
  allowActiveEvent?: boolean;
  ready?: Promise<void>;
}
```

Callers drive `effect(_, progress)` from their own `pointermove`/`mousemove` listener with a `Progress` sample.

## Types owned elsewhere

`@wix/motion` only defines the types above. It does **not** own:

- **Per-effect/preset types** (e.g. entrance, ongoing, scroll, mouse, or background-scroll preset option shapes) — those belong to `@wix/motion-presets`, which registers them via `registerEffects()`.
- **Declarative config types** (trigger→effect wiring, component/interaction config) — those belong to `@wix/interact`.

---

Return to [API Reference](./README.md).
