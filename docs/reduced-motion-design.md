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
- Effects are never pushed into config arrays. An effect's place in the config drives its fallback id (`getFallbackId`), keyframe slot (`getSlotKey`/`getKeyframeSlots`) and CSS list entries, so it must stay stable.

**Decisions:**

- The default is `collapse`, so reduced motion is respected out of the box.
- `Interact.forceReducedMotion` is folded into the new mechanism, and can also be set per instance.
- Fallback chain: `effectId` → `collapse` → `cancel`.

---

## 1. API

```ts
// a string other than the enum values is an effectId in config.effects
export type ReducedMotionHandling = 'ignore' | 'cancel' | 'collapse' | (string & {});
```

`reducedMotionHandling?: ReducedMotionHandling` is added to:

- `InteractConfig`. An `Interact` instance is created from a single config, so this sets the handling per config and per instance.
- `InteractionTrigger` (so it flows through `...rest` into the cached interactions)
- `SequenceOptionsConfig` and `SequenceConfigRef`
- `EffectBase` (covers inline effects, `EffectRef`, and `config.effects` definitions)

Forcing reduced motion is per instance too: `Interact.create(config, { forceReducedMotion })` overrides the static `Interact.forceReducedMotion` (§3.5).

### Cascade (most specific first)

1. Inline effect
2. `config.effects[effectId]`. Items 1 and 2 come from the existing `{ ...effects[id], ...effect }` merge.
3. Sequence: the `SequenceConfigRef` field overrides the `config.sequences[id]` field. This level applies only to effects inside sequences.
4. Interaction
5. Config
6. Default: `collapse`

### Reduced-motion state

The state is reduced when `(prefers-reduced-motion: reduce)` matches or when it is forced (§3.5).

### Example

```json
{
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
| `collapse`   | Default. The effect is replaced in place by its collapsed form: a single iteration of duration 0, everything else kept (§3.3). It keeps its place and media, so winners never change.                                                                             |
| `ignore`     | Nothing changes, except a sequence's stagger (§3.3).                                                                                                                                                                                                              |
| `cancel`     | The effect gets the media condition `(prefers-reduced-motion: no-preference)` and behaves exactly like a user media condition. It drops out, and in variation competition ("media picks winner") an earlier variation for the same (interaction, target) can win. |
| `<effectId>` | The effect is replaced in place by the body of `config.effects[effectId]`, keeping the original's identity and targeting (§3.2). Winners never change.                                                                                                            |

## 3. Core mechanism: variants under exclusive reserved media

### 3.1 Stable effects and the shared builder

Each effect in the config yields one or two variants. A variant is the effect with a reserved media condition appended. Both paths consume the same variant list:

- **CSS** emits every variant under its media.
- **Runtime** picks the variant whose media matches and listens on it. This is the existing media-condition rule.

A new file, `packages/interact/src/core/reducedMotion.ts`, holds the pure, shared logic:

- `REDUCED_MOTION_CONDITIONS`: two reserved condition ids that can't collide with user ids:
  - `__rm-reduce` → `prefers-reduced-motion: reduce`
  - `__rm-no-preference` → `prefers-reduced-motion: no-preference`

  Both parsers merge them into their conditions map:
  - runtime: `parseConfig` in `core/Interact.ts`
  - CSS: `parseConfig` in `core/css.ts`

  `getMediaQuery` and `getFullPredicateByType` (`utils.ts`) then compose them unchanged.

- `getReducedMotionHandling(...handlings)` implements the cascade in §1. Callers pass the handling values, most specific first, not the objects that hold them.
- `getReducedMotionVariants(effect, handling, { effects, force, collapsesStagger })` returns:
  - `ignore` → `[effect]`
  - `cancel` → `[effect + no-preference]`
  - `collapse` → `[effect + no-preference, collapsed + reduce]`
  - `<id>` → `[effect + no-preference, replaced + reduce]`

  `collapse` and `<id>` both pass through the fallback chain (§3.4). With `collapsesStagger` (§3.3), `ignore` yields `[effect + no-preference, effect + reduce]` so the reduce variant can drop the stagger.

Variants never change indices, `effectId`, `interactionId`, `slotKey`, `suffix` or fallback ids.

### 3.2 Kinds and the replacement merge

Kinds:

- `state` if the effect has `transition` or `transitionProperties`
- otherwise `time` if it has `duration`
- otherwise `scrub`

This is the discriminator `effectToAnimationOptions` (`handlers/utilities.ts`) already uses to tell time from scrub, and the effect schemas encode it: time effects require `duration`, scroll and pointer effects forbid it. The same function classifies the original (merged with its definition) and the replacement. The replacement is compatible only if its kind equals the original's.

Merging:

- **Body fields come from the replacement:** `namedEffect`, `keyframeEffect`, `customEffect`, `transition`, `transitionProperties`, `duration`, `delay`, `easing`, `iterations`, `alternate`, `fill`, `reversed`, `composite`, `rangeStart`, `rangeEnd`, `centeredToTarget`, `transitionDuration`, `transitionEasing`. The original's body fields are removed first, which respects `OneOf`. The list is typed against the keys of `TimeEffect | ScrubEffect | StateEffect`, so adding a field to an effect type fails the build until the field is classified.
- **Kept from the original:** everything else: `key`, `listContainer`, `listItemSelector`, `selector`, `conditions`, `effectId`, `triggerType`, `stateAction`, `interactionId`, `suffix`, `$plugin` fields and the CSS resolver's `initial`.
- **Ignored on the replacement:** its own `key`, `conditions` and `reducedMotionHandling`, so replacements don't chain.

Keyframe naming: the builder names an unnamed replacement `keyframeEffect` after the **replacement's** id. Otherwise both paths would name it after the original `effectId` (`resolveEffectForCSS`, `effectToAnimationOptions`), and its keyframes would collide with the original's.

### 3.3 Collapse transform

- **time:** `duration: 0`, `iterations: 1`.
  - Motion's existing `duration || 1` normalization turns the duration into 1ms in both the `web` and `style` paths, so the paths match.
  - Delay, alternate, reversed, fill, easing, composite and keyframes are kept. A single iteration lands on the end state of the first one, which is the effect's "entered" state. The result is applied after the delay.
  - With `fill: none`, the result is the base style. This matches what the uncollapsed animation leaves after it ends.
  - The `alternate` and `state` trigger types still play, reverse and pause, just instantly.
- **state:** every transition entry gets duration 0 and keeps its delay. The state rule still applies.
  - Today `transitionEffectToTransitionsList` (`utils.ts`) drops 0-duration entries. It must keep those that have a delay. Both paths use this helper.
- **No end state** (infinite iterations, i.e. `iterations` 0 or `Infinity`, or kind `scrub`): falls back to `cancel`.
- **Sequence stagger:** under reduced motion a sequence's `offset` becomes 0, so its items land together, unless the sequence's own handling (ref → definition → interaction → config) is `ignore`.
  - The sequence `delay` and effect delays are kept.
  - Stagger is a sequence-level value, so it can't follow each effect's handling. Effects whose own handling is `ignore` inside such a sequence still get a reduce variant (`collapsesStagger`) that differs only in the stagger. This keeps the runtime's single `Sequence` offset and the CSS per-effect stagger `calc()` in agreement.

### 3.4 Fallback chain

1. `<id>` is missing or has an incompatible kind → `collapse`
2. `collapse` has no end state → `cancel`
3. `cancel` always applies

Both paths fall back silently, so they behave the same. The validator reports these cases (§6).

### 3.5 Forced reduced motion (`forceReducedMotion` folded in)

- With `force: true`, the builder returns only the reduced outcome, with no reserved condition:
  - `ignore` → `[effect]`
  - `cancel` → `[]`. The effect loses, as if a media condition didn't match.
  - `collapse` / `<id>` → `[reducedVariant]`
- **Runtime:** `force` is `Interact.create(config, { forceReducedMotion })`, falling back to the static `Interact.forceReducedMotion`. It's read once at `init` into `InteractCache.forceReducedMotion`, since `parseConfig` derives keyframe slots from it.
- **CSS:** a new `GenerateOptions.forceReducedMotion` (`types/css.ts`). In CSS mode it must equal the instance's value, the same contract `configIndex` already has.
- Interact stops passing `reducedMotion` to motion and to the handlers:
  - It is removed from `InteractOptions` (`types/handlers.ts`).
  - Its uses are removed from `core/add.ts`, all handlers and `effectHandlers.ts`.
  - The `context` argument of `Interact.getSequence` / `addToSequence` is removed.
  - `@wix/motion`'s own `reducedMotion` option stays as is.
- With the default `collapse`, `forceReducedMotion` reproduces the old behavior: 1-iteration animations become instant, looping and scrub animations are dropped. The only difference: animations with finite iterations > 1 now collapse to their end state instead of being dropped.

## 4. Per-path implementation

### 4.1 Runtime (`core/add.ts`)

The merged effect goes through the builder at all three effect-resolution sites:

- `_addInteraction`
- `addEffectsForTarget`
- `_buildAnimationGroupArgsFromSequence`

```ts
const variants = getReducedMotionVariants(effect, getReducedMotionHandling(effect.reducedMotionHandling, inherited, config), {...});
variants.forEach((v, i) => mql(v) && instance.setupMediaQueryListener(`${baseId}::rm${i}`, mql(v), updateKey, onUpdate));
const chosen = variants.find((v) => !mql(v) || mql(v).matches);
// no chosen variant → identical to today's "media didn't match" branch (return / return false / continue)
```

- `inherited` is the interaction's handling for interaction effects, and the sequence's resolved handling for sequence effects.
- `update()` is disconnect + connect. It rebuilds the handlers, the adopted sheet and the sequence cache, so a reduce toggle rides on the existing media machinery.
- `InteractCache` gains the config-level `reducedMotionHandling` and the instance's `forceReducedMotion`.
- Sequences: `Interact.getSequence` gets the sequence options with `offset: 0` when the state is reduced and the sequence's handling isn't `ignore`. Every effect of such a sequence has a reduce variant, so its listeners cover a toggle.
- `addInteraction`:
  - `createTransitionCSS` renders the chosen variant.
  - Its hardcoded `no-preference` wrapper is removed. The default `collapse` collapses the transition instead, and the runtime matches `generate()`.
- The `animationEnd` source matching builds `sourceAnimationOptions` from the source's chosen variant. The source's handling resolves from `effects[id]` and config only, because the use site is unknown (§5).

### 4.2 CSS (`core/resolvers.ts`, `core/css.ts`)

- `resolveEffectForCSS` returns the effect with `variants: ResolvedEffect[]`.
  - Each variant has its own `conditions`, including the reserved condition, and its own `initial` (`shouldUseInitial`).
  - `resolveSequenceForCSS` resolves the sequence's handling once and passes it to its effects as the inherited value, so effect > definition > sequence holds. It also sets it on `ResolvedSequence.reducedMotionHandling` for the stagger.
- `parseEffect` computes `customProps` once per effect.
  - It runs `effectToCSS` per variant against the same `TargetContext`, unions `wrote`, then calls `endEffect` once. List lengths, slots and `@property` counts are unchanged.
  - Each variant starts from the list entries assigned before the effect, and the effect leaves the union of what its variants assigned. The variants' media are exclusive, so each variant writes the same declarations it would write as the only effect in its place: it falls back only entries that an earlier variation assigned. Unused entries are left to their `@property` initial value.
  - A reduce variant, or any variant when forced, is rendered with the sequence's `offset` set to 0 unless the sequence's handling is `ignore`.
- `collectKeyframeEntry` records each variant as a member with the same `slotKey`.
  - `getKeyframeSlots` then picks a suffix that is collision-free for both name sets.
  - The runtime stamps the same suffix in `parseConfig`.
- `initial` rules carry the variant's media.
  - Under `cancel`, the element is not hidden on reduce.
  - A `cancel` effect emits no reduced-motion rules at all.
  - A 0-duration entrance (e.g. a collapsed one) emits only the hide rule (`:not([data-interact-enter])`), not its animation, and falls back the list entries assigned before it. A CSS animation shorter than a frame can finish before the runtime marks it `start`, and `start` would then re-create the animation held until `done`, paused at its first keyframe. Without a CSS animation, the runtime plays the collapsed entrance through WAAPI, as it does without `generate()`. It's detected from the effect's own `duration`, before motion normalizes it.
- Trigger-level CSS is never varied: the `viewProgress` `view-timeline` declaration (`triggerToCSS`) and the sequence list rules (`buildSequenceListsRule`).

## 5. Flows per trigger, and granularity

| Trigger / effect                                 | `collapse` (default)                                             | `ignore`                                              | `cancel`                                                                                                | `<effectId>`                                                                          |
| ------------------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| hover / click / activate / interest – time       | 1ms, delay kept; alternate/state reverse and pause instantly     | as today                                              | dropped by media                                                                                        | time replacement                                                                      |
| hover / click / activate / interest – transition | state applies; 0s transition with delay                          | as today (no runtime wrapper)                         | state rule and transition both dropped                                                                  | state replacement; the state name stays the original `effectId` (same `toggleEffect`) |
| viewEnter – time                                 | instant after delay; `initial` / `data-interact-enter` unchanged | as today                                              | dropped by media; `initial` hide rule dropped too                                                       | time replacement; same `initial` flow                                                 |
| animationEnd – target                            | instant                                                          | as today                                              | dropped                                                                                                 | replacement                                                                           |
| animationEnd – source                            | `animationend` / finish still fire after 1ms; chains continue    | –                                                     | source never plays, so the chain never fires                                                            | the source is matched against the replacement's names                                 |
| viewProgress                                     | → `cancel`                                                       | as today                                              | dropped by media                                                                                        | scrub replacement only                                                                |
| pointerMove                                      | → `cancel`                                                       | as today                                              | dropped                                                                                                 | scrub replacement only                                                                |
| Sequences                                        | per effect; stagger collapses, delays kept                       | per effect; stagger kept only if the sequence ignores | per effect; groups and indices recomputed at runtime, and CSS uses the runtime's `--motion-<seq>-index` | per effect; stagger collapses                                                         |
| List items (`addListItems`)                      | same pure resolution                                             | same                                                  | same                                                                                                    | same                                                                                  |

### Granularity limits

1. **Sequence level is a default for its effects, and decides its stagger.** The sequence's `delay` never changes, and its stagger follows the sequence's handling, not its effects'.
2. **An animationEnd source** resolves its handling from its definition (`effects[id]`) and config only. Overrides at its use site (inline, sequence or interaction) must agree, or the chain filter mismatches. The validator warns about this.
3. **Triggers are never varied.** Listeners, observers and view-timelines stay. Only effects change.
4. **`forceReducedMotion` is per instance** (`Interact.create()` option, falling back to the static flag), not per interaction or effect.

## 6. Validation (`packages/interact-validate`)

- **Schema** (`src/schema/effects.ts`, `interactions.ts`, `sequences.ts`):
  - `z.union([ReducedMotionMode, z.string().min(1)])`, with `ReducedMotionMode = z.enum(['ignore', 'cancel', 'collapse'])`, which also gives the checks their mode set.
  - Applied to the config root, interactions, inline/ref/definition effects, and inline/ref/definition sequences.
  - Update the drift guard, `test/type-parity.spec.ts`.
- **No extra traversal.** The checks run inside the two existing `walkConfig` passes, and `walkConfig` hands each effect its parent sequence:
  - Errors run in the `superRefine` walk: a missing effect named on an effect, and an incompatible replacement set on the effect or its definition.
  - Warnings and info run in `collectSemanticWarnings`' walk.
  - A replacement's kind comes from the effect schema it validates against (`StateEffect`, then `TimeEffect`, else scrub), memoized per definition object across both passes. An effect's own kind follows its trigger, as the interaction schemas pick the effect type by trigger.
  - Unused-effect detection drops a referenced id in the `transform` walk that already collects references.
- **Use sites.** An effect's handling depends on where it plays. A `config.sequences` entry plays wherever it's referenced:
  - Issues from the effect's own handling (on it or its definition) are reported once, on the definition.
  - Inherited issues (from the reference, the definition's sequence-level value, the interaction or the config) are reported on each sequence reference. Each reference is a distinct path, so nothing is reported twice and nothing needs deduplicating.
- **Referential:**
  - A string value must exist in `config.effects`. Explicit at effect level → error. Inherited → warning naming the fallback.
  - An effect id equal to `ignore`, `cancel` or `collapse` is shadowed by the enum → warning.
- **Semantic** (`src/semantic/reducedMotion.ts`):
  - Incompatible kind → error if explicit at effect level, warning if inherited.
  - `collapse` → `cancel` fallback → info, only when a handling is set (the default isn't reported).
  - Self-reference → warning.
  - An animationEnd source whose use-site handling differs from its definition and config → warning.
- Update `packages/interact/rules/validate.md`.

## 7. Behavior changes (release notes)

1. Under OS reduce, effects collapse by default. Looping, `viewProgress` and `pointerMove` effects are dropped, and sequence staggers collapse. Opt out with `ignore`.
2. `forceReducedMotion` applies the `reducedMotionHandling` outcome. With the default `collapse` it keeps its old behavior, except that finite multi-iteration animations collapse to their end state instead of being dropped.
3. Runtime transitions collapse through `reducedMotionHandling` instead of a fixed `no-preference` wrapper.
4. 0-duration transition entries that have a delay are now kept, so the delay is honored.

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
  - A collapsed sequence lands all its items together in both modes.

**Unit tests:**

- `packages/interact/test/css.spec.ts`: variants share list entries, list lengths are unchanged, media is exclusive, each variant falls back only earlier entries, keyframe slots work across variants, stagger collapses.
- `resolvers.spec.ts`, `sequences.spec.ts`, `conditions.spec.ts`, `web.spec.ts`: cascade, default, fallback chain, force (static and per instance), stagger.
- New `reducedMotion.spec.ts` for the builder.
- interact-validate specs, including shared sequence definitions.
- Run `yarn build && yarn lint && yarn format:check && yarn test` (after `nvm use`).

## 9. Files the implementation will touch

- `packages/interact/src/types/`: `config.ts`, `effects.ts`, `internal.ts`, `handlers.ts`, `css.ts`
- `packages/interact/src/core/`: `reducedMotion.ts` (new), `add.ts`, `Interact.ts`, `css.ts`, `resolvers.ts`
- `packages/interact/src/utils.ts`
- `packages/interact/src/handlers/*`
- `packages/interact-validate/src/schema/*`, `packages/interact-validate/src/semantic/*`, `packages/interact-validate/src/walkConfig.ts`
- Docs:
  - `packages/interact/rules/full-lean.md`, `integration.md`, `validate.md`
  - `packages/interact/docs/api/types.md`, `interact-class.md`
  - `packages/interact/docs/guides/conditions-and-media-queries.md`
- `CHANGELOG`
