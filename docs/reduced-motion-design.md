# Reduced-motion handling in `@wix/interact` — design

## Context

Today, reduced motion is handled inconsistently:

- `Interact.forceReducedMotion` is a runtime-only static flag. Interact passes it to motion as `reducedMotion`. Motion then collapses 1-iteration animations to 1ms and drops looping ones (`packages/motion/src/api/webAnimations.ts`). `viewProgress` and `pointerMove` skip themselves entirely (`handlers/viewProgress.ts`, `handlers/pointerMove.ts`).
- In CSS mode the flag is ignored for animations. `getAnimation` finds the generated CSS animation first (`packages/motion/src/motion.ts`) and never applies `reducedMotion`.
- Runtime transitions always wrap `transition` in `@media (prefers-reduced-motion: no-preference)` (`createTransitionCSS` in `packages/interact/src/utils.ts`). Transitions from `generate()` don't (`effectToCSS` in `core/css.ts`).
- The OS `prefers-reduced-motion` setting is never read for animations.

**Goal:** a declarative, cascading `reducedMotionHandling` field with these properties:

- Every outcome is defined for every trigger.
- The WAAPI and CSS paths match by construction.
- Effects are never pushed into config arrays. Config positions drive fallback ids (`getFallbackId`), keyframe slots (`getSlotKey`/`getKeyframeSlots`) and CSS list entries, so they must stay stable.

**Decisions:**

- The default is `ignore`.
- `Interact.forceReducedMotion` is folded into the new mechanism.
- Fallback chain: `effectId` → `collapse` → `cancel`.

---

## 1. API

```ts
// a string other than the enum values is an effectId in config.effects
export type ReducedMotionHandling = 'ignore' | 'cancel' | 'collapse' | (string & {});
```

`reducedMotionHandling?: ReducedMotionHandling` is added to:

- `InteractConfig` (global)
- `InteractionTrigger` (so it flows through `...rest` into the cached interactions)
- `SequenceOptionsConfig` and `SequenceConfigRef`
- `EffectBase` (covers inline effects, `EffectRef`, and `config.effects` definitions)

### Cascade (most specific first)

1. Inline effect
2. `config.effects[effectId]`. Items 1 and 2 come from the existing `{ ...effects[id], ...effect }` merge.
3. Sequence: the `SequenceConfigRef` field overrides the `config.sequences[id]` field. This level applies only to effects inside sequences.
4. Interaction
5. Config
6. Default: `ignore`

### Reduced-motion state

The state is reduced when `(prefers-reduced-motion: reduce)` matches or when it is forced (§3.5).

### Example

```json
{
  "reducedMotionHandling": "collapse",
  "effects": {
    "fade-in": { "namedEffect": { "type": "FadeIn" }, "duration": 300 },
    "fly-in": { "namedEffect": { "type": "FlyIn", "direction": "left" }, "duration": 800 }
  },
  "interactions": [
    {
      "key": "hero",
      "trigger": "viewEnter",
      "effects": [{ "effectId": "fly-in", "reducedMotionHandling": "fade-in" }]
    },
    {
      "key": "bg",
      "trigger": "viewProgress",
      "reducedMotionHandling": "cancel",
      "effects": [{ "namedEffect": { "type": "ParallaxScroll" } }]
    }
  ]
}
```

## 2. Value semantics

| Value        | Under reduced motion                                                                                                                                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ignore`     | Nothing changes.                                                                                                                                                                                                                                                  |
| `cancel`     | The effect gets the media condition `(prefers-reduced-motion: no-preference)` and behaves exactly like a user media condition. It drops out, and in variation competition ("media picks winner") an earlier variation for the same (interaction, target) can win. |
| `collapse`   | The effect is replaced in place by its collapsed form: duration 0, everything else kept (§3.3). It keeps its position and media, so winners never change.                                                                                                         |
| `<effectId>` | The effect is replaced in place by the body of `config.effects[effectId]`, keeping the original's identity and targeting (§3.2). Winners never change.                                                                                                            |

## 3. Core mechanism: variants under exclusive reserved media

### 3.1 Position invariant and the shared builder

Each config position yields one or two variants. A variant is the effect with a reserved media condition appended. Both paths consume the same variant list:

- **CSS** emits every variant under its media.
- **Runtime** picks the variant whose media matches and listens on it. This is the existing media-condition rule.

A new file, `packages/interact/src/core/reducedMotion.ts`, holds the pure, shared logic:

- `REDUCED_MOTION_CONDITIONS`: two reserved condition ids that can't collide with user ids:
  - `__rm-reduce` → `prefers-reduced-motion: reduce`
  - `__rm-no-preference` → `prefers-reduced-motion: no-preference`

  Both parsers merge them into their conditions map:
  - runtime: `parseConfig` in `core/Interact.ts`
  - CSS: `parseConfig` in `core/css.ts`, and `resolvers.ts`, which today filters conditions against `config.conditions`

  `getMediaQuery` and `getFullPredicateByType` (`utils.ts`) then compose them unchanged.

- `getReducedMotionHandling(effect, sequence | undefined, interaction, config)` implements the cascade in §1.
- `getReducedMotionVariants(effect, handling, { kind, effects, force })` returns:
  - `ignore` → `[effect]`
  - `cancel` → `[effect + no-preference]`
  - `collapse` → `[effect + no-preference, collapsed + reduce]`
  - `<id>` → `[effect + no-preference, replaced + reduce]`

  `collapse` and `<id>` both pass through the fallback chain (§3.4).

Variants never change indices, `effectId`, `interactionId`, `slotKey`, `suffix` or fallback ids.

### 3.2 Kinds and the replacement merge

Kinds:

- **Original:**
  - `state` if it has `transition` or `transitionProperties`
  - otherwise `scrub` if the trigger is `viewProgress` or `pointerMove`
  - otherwise `time`
- **Replacement:**
  - `state` if it has `transition` or `transitionProperties`
  - otherwise `time` if it has `duration`
  - otherwise `scrub`
- The replacement is compatible only if its kind equals the original's.

Merging:

- **Body fields come from the replacement:** `namedEffect`, `keyframeEffect`, `customEffect`, `transition`, `transitionProperties`, `duration`, `delay`, `easing`, `iterations`, `alternate`, `fill`, `reversed`, `composite`, `rangeStart`, `rangeEnd`, `centeredToTarget`, `transitionDuration`, `transitionEasing`. The original's body fields are removed first, which respects `OneOf`.
- **Kept from the original:** `key`, `listContainer`, `listItemSelector`, `selector`, `conditions`, `effectId`, `triggerType`, `stateAction`, `interactionId`, `suffix`, and `$plugin` fields.
- **Ignored on the replacement:** its own `key`, `conditions` and `reducedMotionHandling`, so replacements don't chain.

Keyframe naming: the builder names an unnamed replacement `keyframeEffect` after the **replacement's** id. Otherwise both paths would name it after the original `effectId` (`resolveEffectForCSS`, `effectToAnimationOptions`), and its keyframes would collide with the original's.

### 3.3 Collapse transform

- **time:** `duration: 0`.
  - Motion's existing `duration || 1` normalization turns this into 1ms in both the `web` and `style` paths, so the paths match.
  - Delay, finite iterations, alternate, reversed, fill, easing, composite and keyframes are kept. The result is the state the animation would leave, applied after its delay.
  - With `fill: none`, the result is the base style. This matches what the uncollapsed animation leaves after it ends.
  - The `alternate` and `state` trigger types still play, reverse and pause, just instantly.
- **state:** every transition entry gets duration 0 and keeps its delay. The state rule still applies.
  - Today `transitionEffectToTransitionsList` (`utils.ts`) drops 0-duration entries. It must keep those that have a delay. Both paths use this helper.
- **No end state** (infinite iterations, i.e. `iterations` 0 or `Infinity`, or kind `scrub`): falls back to `cancel`.
- Delays and sequence stagger are never collapsed. This is what makes effect-level granularity work inside sequences (§5).

### 3.4 Fallback chain

1. `<id>` is missing or has an incompatible kind → `collapse`
2. `collapse` has no end state → `cancel`
3. `cancel` always applies

The runtime warns once. `generate()` is silent. The validator reports these cases (§6).

### 3.5 Forced reduced motion (`forceReducedMotion` folded in)

- With `force: true`, the builder returns only the reduced outcome, with no reserved condition:
  - `ignore` → `[effect]`
  - `cancel` → `[]`. The position loses, as if a media condition didn't match.
  - `collapse` / `<id>` → `[reducedVariant]`
- **Runtime:** `force = Interact.forceReducedMotion`.
- **CSS:** a new `GenerateOptions.forceReducedMotion` (`types/css.ts`). In CSS mode it must equal the runtime flag, the same contract `configIndex` already has.
- Interact stops passing `reducedMotion` to motion and to the handlers:
  - It is removed from `InteractOptions` (`types/handlers.ts`).
  - Its uses are removed from `core/add.ts`, all handlers and `effectHandlers.ts`.
  - The `context` argument of `Interact.getSequence` / `addToSequence` is removed.
  - `@wix/motion`'s own `reducedMotion` option stays as is.
- **Breaking:** with the default `ignore`, `forceReducedMotion` alone no longer changes anything.
  - **Migration:** set `reducedMotionHandling: 'collapse'` at config level. Through the fallback chain this reproduces the old behavior: 1-iteration animations become instant, looping and scrub animations are dropped.
  - The only difference: animations with finite iterations > 1 now collapse instead of being dropped.

## 4. Per-path implementation

### 4.1 Runtime (`core/add.ts`)

The merged `effectOptions` goes through the builder at all three effect-resolution sites:

- `_addInteraction`
- `addEffectsForTarget`
- `_buildAnimationGroupArgsFromSequence`

```ts
const variants = getReducedMotionVariants(effectOptions, getReducedMotionHandling(...), {...});
variants.forEach((v, i) => mql(v) && instance.setupMediaQueryListener(`${baseId}::rm${i}`, mql(v), updateKey, onUpdate));
const chosen = variants.find((v) => !mql(v) || mql(v).matches);
// no chosen variant → identical to today's "media didn't match" branch (return / return false / continue)
```

- `update()` is disconnect + connect. It rebuilds the handlers, the adopted sheet and the sequence cache, so a reduce toggle rides on the existing media machinery.
- `InteractCache` gains the config-level `reducedMotionHandling`.
- `addInteraction`:
  - `createTransitionCSS` renders the chosen variant.
  - Its hardcoded `no-preference` wrapper is removed. This follows the default-`ignore` decision and makes the runtime match `generate()`.
- The `animationEnd` source matching builds `sourceAnimationOptions` from the source's chosen variant. The source's handling resolves from `effects[id]` and config only, because the use site is unknown (§5).

### 4.2 CSS (`core/resolvers.ts`, `core/css.ts`)

- `resolveEffectForCSS` returns the position with `variants: ResolvedEffect[]`.
  - Each variant has its own `conditions`, including the reserved condition, and its own `initial` (`shouldUseInitial`).
  - `resolveSequenceForCSS` passes the sequence's handling as a fallback argument instead of merging it into the effect, so effect > definition > sequence holds.
- `parseEffect` computes `customProps` once per position.
  - It runs `effectToCSS` per variant against the same `TargetContext`, unions `wrote`, then calls `endEffect` once. List lengths, slots and `@property` counts are unchanged.
  - For a two-variant position, all list entries of the position's kind are marked as assigned before writing, so each variant writes the list fallback (`none` / `_`) to any entry it doesn't use. Example: a keyframe original with a `customEffect` replacement. This keeps the variants symmetric.
- `collectKeyframeEntry` records each variant as a member with the same `slotKey`.
  - `getKeyframeSlots` then picks a suffix that is collision-free for both name sets.
  - The runtime stamps the same suffix in `parseConfig`.
- `initial` rules carry the variant's media.
  - Under `cancel`, the element is not hidden on reduce.
  - A `cancel` position emits no reduced-motion rules at all.
  - A 0-duration (e.g. collapsed) entrance emits only the hide rule (`:not([data-interact-enter])`) and writes list fallbacks instead of its animation. A CSS animation shorter than a frame can finish before the runtime marks it `start`, and `start` would then re-create the animation held until `done`, paused at its first keyframe. Without a CSS animation, the runtime plays the collapsed entrance through WAAPI, as it does without `generate()`.
- Trigger-level CSS is never varied: the `viewProgress` `view-timeline` declaration (`triggerToCSS`) and the sequence list rules (`buildSequenceListsRule`).

## 5. Flows per trigger, and granularity

| Trigger / effect                                 | `ignore`                      | `cancel`                                                                                                | `collapse`                                                       | `<effectId>`                                                                          |
| ------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| hover / click / activate / interest – time       | as today                      | dropped by media                                                                                        | 1ms, delay kept; alternate/state reverse and pause instantly     | time replacement                                                                      |
| hover / click / activate / interest – transition | as today (no runtime wrapper) | state rule and transition both dropped                                                                  | state applies; 0s transition with delay                          | state replacement; the state name stays the original `effectId` (same `toggleEffect`) |
| viewEnter – time                                 | as today                      | dropped by media; `initial` hide rule dropped too                                                       | instant after delay; `initial` / `data-interact-enter` unchanged | time replacement; same `initial` flow                                                 |
| animationEnd – target                            | as today                      | dropped                                                                                                 | instant                                                          | replacement                                                                           |
| animationEnd – source                            | –                             | source never plays, so the chain never fires                                                            | `animationend` / finish still fire after 1ms; chains continue    | the source is matched against the replacement's names                                 |
| viewProgress                                     | as today                      | dropped by media                                                                                        | → `cancel`                                                       | scrub replacement only                                                                |
| pointerMove                                      | as today                      | dropped                                                                                                 | → `cancel`                                                       | scrub replacement only                                                                |
| Sequences                                        | per effect                    | per effect; groups and indices recomputed at runtime, and CSS uses the runtime's `--motion-<seq>-index` | per effect; sequence delay, offset and stagger kept              | per effect                                                                            |
| List items (`addListItems`)                      | same pure resolution          | same                                                                                                    | same                                                             | same                                                                                  |

### Granularity limits

1. **Sequence level is only a default for its effects.** The sequence's own timing (delay, offset, stagger) never changes.
2. **An animationEnd source** resolves its handling from its definition (`effects[id]`) and config only. Overrides at its use site (inline, sequence or interaction) must agree, or the chain filter mismatches. The validator warns about this.
3. **Triggers are never varied.** Listeners, observers and view-timelines stay. Only effects change.
4. **`forceReducedMotion` is global** (static) and can't be set per config.

## 6. Validation (`packages/interact-validate`)

- **Schema** (`src/schema/effects.ts`, `interactions.ts`, `sequences.ts`):
  - `z.union([z.enum(['ignore', 'cancel', 'collapse']), z.string().min(1)])`
  - Applied to the config root, interactions, inline/ref/definition effects, and inline/ref/definition sequences.
  - Update the drift guard, `test/type-parity.spec.ts`.
- **Referential:**
  - A string value must exist in `config.effects`. Explicit at effect level → error. Inherited → warning naming the fallback.
  - An effect id equal to `ignore`, `cancel` or `collapse` is shadowed by the enum → warning.
- **Semantic** (`src/semantic/`):
  - Incompatible kind → error if explicit at effect level, warning if inherited.
  - `collapse` → `cancel` fallback → info.
  - Self-reference → warning.
  - An animationEnd source whose use-site handling differs from its definition and config → warning.
- Update `packages/interact/rules/validate.md`.

## 7. Behavior changes (release notes)

1. Runtime transitions no longer collapse automatically on OS reduce. Opt in with `collapse`.
2. `forceReducedMotion` does nothing without a handling value. See the migration in §3.5.
3. 0-duration transition entries that have a delay are now kept, so the delay is honored.

## 8. Verification plan

**Browser-verified** (Playwright Chromium / Firefox / WebKit, bundled with esbuild):

- Run each row of §5 under `page.emulateMedia({ reducedMotion: 'reduce' | 'no-preference' })`, in two modes:
  - WAAPI only, with no `generate()` CSS
  - CSS mode, with `generate()` injected

  The two modes must produce identical computed styles and `getAnimations()` timing.

- Toggle the media live to exercise listeners, the sequence cache and transitions.
- Confirm specifically:
  - `animationend` / finish fire for collapsed 1ms CSS and WAAPI animations.
  - A 0s transition with a delay applies after the delay in all three engines.
  - The `initial` hide rule is never stuck under `cancel` or `collapse`.
  - The sequence cache is invalidated on a reduce toggle for target-side sequences (`_processSequencesForTarget` keys by source).

**Unit tests:**

- `packages/interact/test/css.spec.ts`: variants share list entries, list lengths are unchanged, media is exclusive, keyframe slots work across variants.
- `resolvers.spec.ts`, `sequences.spec.ts`, `conditions.spec.ts`, `web.spec.ts`: cascade, fallback chain, force.
- New `reducedMotion.spec.ts` for the builder.
- interact-validate specs.
- Run `yarn build && yarn lint && yarn format:check && yarn test` (after `nvm use`).

## 9. Files the implementation will touch

- `packages/interact/src/types/`: `config.ts`, `effects.ts`, `internal.ts`, `handlers.ts`, `css.ts`
- `packages/interact/src/core/`: `reducedMotion.ts` (new), `add.ts`, `Interact.ts`, `css.ts`, `resolvers.ts`
- `packages/interact/src/utils.ts`
- `packages/interact/src/handlers/*`
- `packages/interact-validate/src/schema/*`, `packages/interact-validate/src/semantic/*`
- Docs:
  - `packages/interact/rules/full-lean.md`, `integration.md`, `validate.md`
  - `packages/interact/docs/api/types.md`
  - `packages/interact/docs/guides/conditions-and-media-queries.md`
- `CHANGELOG`
