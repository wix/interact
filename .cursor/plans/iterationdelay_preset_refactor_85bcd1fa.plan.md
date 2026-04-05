---
name: iterationDelay preset refactor
overview: Refactor all 13 ongoing presets so that `delay` (from `TimeAnimationOptions`) is passed through as actual WAAPI start delay, and a new `iterationDelay` preset parameter (on each namedEffect type) takes over the current "bake delay into keyframe offsets" behavior.
todos:
  - id: types
    content: 'Add `iterationDelay?: number` to all 13 ongoing namedEffect types in types.ts'
    status: completed
  - id: presets
    content: Refactor all 13 ongoing preset files to use namedEffect.iterationDelay for keyframe-offset compression and pass through options.delay as actual start delay
    status: completed
  - id: tests
    content: 'Update all 13 ongoing preset test files: move delay to iterationDelay in options, update assertions, add new tests for actual delay passthrough'
    status: completed
  - id: docs
    content: Update docs in motion-presets/docs, motion/docs, and interact/docs to reflect new iterationDelay parameter and corrected delay semantics
    status: completed
  - id: rules
    content: Update presets-main.md, ongoing-presets.md, and any interact rules that reference ongoing delay behavior
    status: completed
isProject: false
---

# Refactor ongoing presets: `delay` to actual start delay, new `iterationDelay` parameter

## Problem

All 13 ongoing presets (except DVD) hijack `TimeAnimationOptions.delay` to simulate iteration delay. They:

1. Compute `timingFactor = duration / (duration + delay)` via `getTimingFactor()`
2. Compress keyframe offsets into `[0, timingFactor]`
3. Return `delay: 0` and `duration: duration + delay`

This means there is **no way** to set an actual WAAPI start delay on these presets.

## Solution

- `**delay`\*\* (from `TimeAnimationOptions`): pass through as actual WAAPI start delay
- `**iterationDelay`\*\* (new param on each `namedEffect` type): takes over the current keyframe-offset-compression behavior

DVD is **excluded** -- it already uses `delay` as actual start delay and does not use `getTimingFactor`.

---

## 1. Type definitions

**File:** `[packages/motion-presets/src/types.ts](packages/motion-presets/src/types.ts)`

Add `iterationDelay?: number` to each of these 13 types:

`Bounce`, `Breathe`, `Cross`, `Flash`, `Flip`, `Fold`, `Jello`, `Poke`, `Pulse`, `Rubber`, `Spin`, `Swing`, `Wiggle`

Example:

```typescript
export type Spin = {
  type: 'Spin';
  direction?: 'clockwise' | 'counter-clockwise';
  iterationDelay?: number; // new
};
```

---

## 2. Preset implementations (13 files)

**Directory:** `packages/motion-presets/src/library/ongoing/`

**Files:** `Bounce.ts`, `Breathe.ts`, `Cross.ts`, `Flash.ts`, `Flip.ts`, `Fold.ts`, `Jello.ts`, `Poke.ts`, `Pulse.ts`, `Rubber.ts`, `Spin.ts`, `Swing.ts`, `Wiggle.ts`

For each file, apply the same transformation pattern. Using **Spin.ts** as the canonical example:

**Before:**

```typescript
const duration = options.duration || 1;
const delay = options.delay || 0;
const timingFactor = getTimingFactor(duration, delay) as number;
// ...
return [
  {
    ...options,
    delay: 0,
    duration: duration + delay,
    keyframes: [{ offset: 0 /* ... */ }, { offset: timingFactor /* ... */ }],
  },
];
```

**After:**

```typescript
const duration = options.duration || 1;
const iterationDelay = namedEffect?.iterationDelay || 0;
const timingFactor = getTimingFactor(duration, iterationDelay) as number;
// ...
return [
  {
    ...options,
    duration: duration + iterationDelay,
    keyframes: [{ offset: 0 /* ... */ }, { offset: timingFactor /* ... */ }],
  },
];
```

Key changes per file:

- Read `iterationDelay` from `namedEffect` (already destructured/cast in each preset)
- Remove `const delay = options.delay || 0`
- Remove `delay: 0` from returned object (let `...options` pass through the original `delay`)
- Replace `duration + delay` with `duration + iterationDelay`
- Replace `getTimingFactor(duration, delay)` with `getTimingFactor(duration, iterationDelay)`

### Special cases

**Swing.ts, Fold.ts, Breathe.ts** -- these presets use a **conditional keyframe sequence** when delay > 0 (switches to a decay-style FACTORS_SEQUENCE). Change the condition from `delay` to `iterationDelay`:

```typescript
// Before
const keyframes = delay ? FACTORS_SEQUENCE.map(...)  : [/* standard keyframes */];

// After
const keyframes = iterationDelay ? FACTORS_SEQUENCE.map(...)  : [/* standard keyframes */];
```

### `getNames` updates

Each file's `getNames()` currently reads `options.delay!`. Change to read from `namedEffect`:

```typescript
// Before
export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const timingFactor = getTimingFactor(options.duration!, options.delay!, true);
  return [`motion-spin-${timingFactor}`];
}

// After
export function getNames(options: TimeAnimationOptions & AnimationExtraOptions) {
  const iterationDelay = (options.namedEffect as Spin)?.iterationDelay || 0;
  const timingFactor = getTimingFactor(options.duration!, iterationDelay, true);
  return [`motion-spin-${timingFactor}`];
}
```

(The `namedEffect` type cast varies per preset -- `Spin`, `Bounce`, etc.)

**Fold.ts `getNames` special case** -- currently has an `if (!delay)` branch. Change to `if (!iterationDelay)`.

---

## 3. Tests (13 + 1 files)

**Directory:** `packages/motion-presets/src/library/ongoing/test/`

**Files:** `Bounce.spec.ts`, `Breathe.spec.ts`, `Cross.spec.ts`, `DVD.spec.ts`, `Flash.spec.ts`, `Flip.spec.ts`, `Fold.spec.ts`, `Jello.spec.ts`, `Poke.spec.ts`, `Pulse.spec.ts`, `Rubber.spec.ts`, `Spin.spec.ts`, `Swing.spec.ts`, `Wiggle.spec.ts`

For each test that currently passes `delay` in `TimeAnimationOptions`:

- Move `delay` value into `namedEffect.iterationDelay`
- Remove `delay` from the outer options (or add a separate test with actual `delay`)
- Update assertions: `delay: 0` in expected result should now either be absent or reflect the actual start delay
- `duration: duration + delay` in assertions becomes `duration: duration + iterationDelay`
- Keyframe offset values (e.g., `0.67`, `0.8`) remain the same since the formula is unchanged
- **Add new test cases** that verify `delay` is passed through as actual start delay when both `delay` and `iterationDelay` are provided

**DVD.spec.ts** -- no changes needed (DVD already uses delay correctly).

Also check `packages/motion-presets/src/test/utils.spec.ts` -- `getTimingFactor` tests don't need changes (utility behavior unchanged).

---

## 4. Documentation updates

### motion-presets docs

- `**[packages/motion-presets/docs/presets/ongoing/pulse.md](packages/motion-presets/docs/presets/ongoing/pulse.md)`\*\* -- Add `iterationDelay` parameter documentation and usage examples
- `**[packages/motion-presets/docs/presets/_template.md](packages/motion-presets/docs/presets/_template.md)`\*\* -- Add `iterationDelay` to ongoing preset template if applicable

### motion docs

- `**[packages/motion/docs/categories/ongoing-animations.md](packages/motion/docs/categories/ongoing-animations.md)`\*\* -- If it documents the delay-as-iteration-delay behavior, update to reflect the new `iterationDelay` param
- `**[packages/motion/docs/api/types.md](packages/motion/docs/api/types.md)**` -- If it documents `TimeAnimationOptions.delay` behavior for ongoing presets, update
- `**[packages/motion/docs/core-concepts.md](packages/motion/docs/core-concepts.md)**` -- If it documents delay semantics, verify accuracy

### interact docs

- `**[packages/interact/docs/guides/effects-and-animations.md](packages/interact/docs/guides/effects-and-animations.md)**` -- If it shows ongoing presets with delay, update examples
- `**[packages/interact/docs/api/types.md](packages/interact/docs/api/types.md)**` -- If it documents the ongoing delay pattern, update

Docs that do NOT reference the ongoing delay pattern do not need changes.

---

## 5. Rules updates

### motion-presets rules

- `**[packages/motion-presets/rules/presets/presets-main.md](packages/motion-presets/rules/presets/presets-main.md)**` -- Lines 64-65: `delay` is listed as "animation delay" in the animation options section. This is now correct for ongoing presets (actual start delay). Add `iterationDelay` documentation under a new "Ongoing-specific parameters" subsection or as a note.
- `**[packages/motion-presets/rules/presets/ongoing-presets.md](packages/motion-presets/rules/presets/ongoing-presets.md)**` -- Add `iterationDelay` parameter to each of the 13 ongoing preset parameter tables (not DVD). Include a brief explanation of what it does.

### interact rules

- `**[packages/interact/rules/viewenter.md](packages/interact/rules/viewenter.md)**`, `**[packages/interact/rules/click.md](packages/interact/rules/click.md)**`, `**[packages/interact/rules/hover.md](packages/interact/rules/hover.md)**`, `**[packages/interact/rules/integration.md](packages/interact/rules/integration.md)**`, `**[packages/interact/rules/full-lean.md](packages/interact/rules/full-lean.md)**` -- Review each for ongoing-preset delay examples. These files primarily deal with entrance/interaction triggers and use `delay` in the `TimeAnimationOptions` sense (which is now correct), so they likely need **no changes** unless they show ongoing preset examples with `delay` meaning iteration delay.

---

## 6. Utility function

`**[packages/motion-presets/src/utils.ts](packages/motion-presets/src/utils.ts)`\*\* -- `getTimingFactor(duration, delay)` does not need changes. Its interface is generic (two numbers). Callers will now pass `iterationDelay` instead of `delay`.

---

## Summary of scope

| Area    | Files | Changes                                       |
| ------- | ----- | --------------------------------------------- |
| Types   | 1     | Add `iterationDelay` to 13 types              |
| Presets | 13    | Refactor delay -> iterationDelay logic        |
| Tests   | 13    | Update test options and assertions            |
| Docs    | 5-7   | Update delay semantics and add iterationDelay |
| Rules   | 2-3   | Add iterationDelay to parameter tables        |
| Utility | 0     | No changes                                    |
