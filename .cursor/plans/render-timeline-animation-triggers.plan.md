---
name: Render timeline-trigger + animation-trigger CSS
overview: Extend @wix/interact generate() to additionally emit native CSS timeline-trigger + animation-trigger declarations (on by default) for viewEnter entrance animations so they play in pure CSS where supported, keep Sequences WAAPI-timed for correct endDelay/reverse, and make create() skip the JS viewEnter handlers where the browser supports native triggers to prevent double-play.
todos:
  - id: generate-options-flag
    content: Migrate generate()/_generate() trailing arg to an options object and add a nativeTriggers option that DEFAULTS TO true (opt-out). Threaded through parseInteraction, parseEffect, effectToCSS, and triggerToCSS. nativeTriggers:false produces byte-for-byte identical output to today.
    status: pending
  - id: register-animation-trigger-prop
    content: "Register animation-trigger in the coordinated-list machinery: add to ListPropertyName, LIST_PROPERTY_NAMES, and LIST_PROPERTY_FALLBACKS (none); keep it OUT of LIST_ANIMATION_PROPERTY_NAMES and LIST_PROPERTY_NAMES_MOTION."
    status: pending
  - id: supports-on-cssrule
    content: Add an optional supports field to CSSRuleData and have CSSRuleToString wrap the rule in an @supports block when set, composing with the existing @media wrap.
    status: pending
  - id: compute-animation-trigger-value
    content: In effectToCSS (namedEffect/keyframeEffect branch), always include animation-trigger in usedProperties and compute its value as the trigger name plus entry/exit actions per triggerType for viewEnter, else none.
    status: pending
  - id: emit-animation-trigger-rule
    content: Emit the coordinated animation-trigger list as a separate @supports-gated rule, not merged into the shared animation/timeline/range coordinated rule from buildListsRule.
    status: pending
  - id: emit-timeline-trigger
    content: Emit timeline-trigger on the source element for viewEnter (extend triggerToCSS or add a sibling), @supports-gated, using a view() source with derived activation/active range.
    status: pending
  - id: fouc-paused-reuse
    content: Reuse the existing paused animation plus fill for FOUC; do NOT emit the JS-gated visibility:hidden for the native path. Verify resume-via-trigger semantics against a real engine.
    status: pending
  - id: sequence-enddelay-waapi
    content: "For effects inside a Sequence, keep the WAAPI timing layer even when native triggers are ON: CSS cannot express endDelay (or the per-index stagger offset), so apply endDelay via WAAPI so reversing the sequence yields the same effect timing in reverse. Sequences remain a WAAPI-timed hybrid; the native trigger fires play/reverse while WAAPI owns timing. Mechanism (updateTiming on getAnimations() CSSAnimations vs. keeping the JS Sequence) is an open verification point against a real engine."
    status: pending
  - id: create-skip-flag
    content: "Because nativeTriggers is on by default, create()/init must avoid double-play: feature-detect CSS.supports(animation-trigger) and skip binding the JS viewEnter handler when supported. MUST exclude Sequences (keep their WAAPI timing/endDelay). All other triggers bind as before. Flagged as implied-by-default-on."
    status: pending
  - id: unit-tests-css
    content: "Add css.spec.ts tests: nativeTriggers:false byte-for-byte unchanged (baseline); default (on) emits correct timeline-trigger and animation-trigger per triggerType inside @supports; multi-animation alignment; viewProgress/transition/no-effect untouched."
    status: pending
  - id: runtime-test-skip
    content: Test that with native support present (mock CSS.supports), create() attaches no IntersectionObserver for viewEnter while Sequences still get their WAAPI timing and other triggers still bind; with support absent, the JS viewEnter path still binds.
    status: pending
  - id: manual-verification
    content: Manually verify native play-once on scroll in a supporting browser, no double-play, JS fallback when the browser lacks support, and correct reverse-stagger timing for Sequences under native triggers.
    status: pending
isProject: false
---

# Render `timeline-trigger` + `animation-trigger` CSS in `generate()`

## Context

`@wix/interact`'s `generate()` ([`packages/interact/src/core/css.ts`](packages/interact/src/core/css.ts)) turns an interact config into a CSS stylesheet. Today, for `viewEnter` entrance animations it emits a **paused** `animation` shorthand — motion's `getAnimationAsCSS` appends `paused` when `isRunning === false` ([`packages/motion/src/api/cssAnimations.ts`](packages/motion/src/api/cssAnimations.ts), line 31; for `viewEnter`, `isRunning` = `isViewProgress` = `false`, so **every** viewEnter animation is `paused`) — plus, for `viewEnter`+`once`+same-element only (`shouldUseInitial`, [`packages/interact/src/core/utilities.ts`](packages/interact/src/core/utilities.ts)), a FOUC initial-state rule gated on `:not([data-interact-enter])` and an animation-props rule gated on `:not([data-interact-enter="done"])` ([`packages/interact/src/core/css.ts`](packages/interact/src/core/css.ts), lines 246–267; `dataInteractEnterSelector` wiring in [`cssUtils.ts`](packages/interact/src/core/cssUtils.ts), lines 138–140).

The animation only _plays_ when the JS runtime's IntersectionObserver fires and sets `data-interact-enter` / calls `.play()` ([`packages/interact/src/handlers/viewEnter.ts`](packages/interact/src/handlers/viewEnter.ts), [`packages/interact/src/handlers/effectHandlers.ts`](packages/interact/src/handlers/effectHandlers.ts)). **There is no JS-free play path** — a grep for `interact-enter` confirms the only CSS reference is the `:not(...)` gate, which JS opens.

The [CSS Animation Triggers spec](https://drafts.csswg.org/animation-triggers-1/) adds a **decoupled** model that lets these entrance animations play natively, without JS, where supported:

- **`timeline-trigger`** — defines a _named_ trigger driven by a timeline + activation range.
- **`animation-trigger`** — connects an animation to that named trigger via an _action_ (`play-once`, `play`, `replay`, `reset`, `play-forwards`/`play-backwards`, `pause`, …).

**Goal:** make `generate()` additionally emit `timeline-trigger` + `animation-trigger` for view-driven entrance triggers (**on by default**), so they run in pure CSS where the browser supports them, and give `create()` a way to skip the JS viewEnter handlers so the two paths don't both fire ("double-play").

**Decisions already made (with the user):**

- **`nativeTriggers` is ON by default** on `generate()`. It is an **opt-out** flag: pass `nativeTriggers: false` to get output byte-for-byte identical to today (the regression baseline).
- **`create()` must not double-play.** Because native CSS is emitted by default, the runtime skips the JS `viewEnter` handler where the browser supports `animation-trigger` (feature-detected). See Part B — this is a **proposed decision implied by making `nativeTriggers` default-on**; the user asked to flip the flag default, and this is the coherent runtime consequence.
- **Sequences stay WAAPI-timed even under native triggers** (see Part C). CSS `animation` shorthand can express neither the per-index stagger offset nor `endDelay`, both of which motion computes at runtime in `Sequence.applyOffsets`. To keep reverse playback matching forward playback, the WAAPI timing layer must remain; the native trigger only fires play/reverse.
- Scope: `viewEnter` only. `viewProgress` stays on `animation-timeline` scrubbing (it's a scrub, not a discrete trigger). `hover`/`click`/`pointerMove`/`activate`/`interest`/`animationEnd` are out of scope (event-, not timeline-, driven).

---

## Spec grammar (verified against the draft)

```
timeline-trigger:            none | [ <name> <source> <activation-range> [ / <active-range> ]? ]#
timeline-trigger-source:     <single-animation-timeline>#      // auto | none | <dashed-ident> | scroll() | view()
timeline-trigger-name:       none | <dashed-ident>#
animation-trigger:           [ none | [ <dashed-ident> <animation-action>+ ]+ ]#
<animation-action>:          play | play-once | play-forwards | play-backwards | pause | reset | replay | none
```

**Behavioral model:** a trigger is _inactive → active_ on entering the **activation-range** (runs the **entry** action); _active → inactive_ on leaving the **active-range** (runs the **exit** action; active-range defaults to match activation-range). In `animation-trigger`, **1 action = entry only (exit does nothing); 2 actions = entry + exit**; the wrong count makes the trigger inert. Trigger names are **global within the tree scope**, so same-element / parent↔child references resolve with no `trigger-scope` needed.

### `triggerType` → actions + active-range (matches [`handlers/viewEnter.ts`](packages/interact/src/handlers/viewEnter.ts) exactly)

`triggerType` is the effect-level `TimeAnimationTriggerType` = `'once' | 'repeat' | 'alternate' | 'state'` ([`types/effects.ts`](packages/interact/src/types/effects.ts), line 15). For `viewEnter` it defaults to `once`.

| `triggerType` | entry action    | exit action      | active-range                     | matches handler                                             |
| :------------ | :-------------- | :--------------- | :------------------------------- | :---------------------------------------------------------- |
| `once`        | `play-once`     | —                | default                          | plays once, unobserves                                      |
| `alternate`   | `play-forwards` | `play-backwards` | default (narrow, main threshold) | play / reverse on the main observer                         |
| `repeat`      | `replay`        | `reset`          | **wide** (full exit)             | `progress(0)+play` / `pause()+progress(0)` on EXIT_OBSERVER |
| `state`       | `play`          | `pause`          | **wide** (full exit)             | `play` / `pause` on EXIT_OBSERVER                           |

`repeat`/`state` use the runtime's wide `EXIT_OBSERVER_CONFIG` (deactivate only when fully out), so their active-range must be the full timeline (e.g. `… / entry 0% exit 100%`). `alternate` deactivates at the activation threshold, so it keeps the default active-range.

### Trigger source + activation range

- **Source** = a `view()` timeline of the keyed (source) element — `view()` tracks that element entering the viewport, exactly the `viewEnter` semantic. `inset` maps directly to the `view()` inset (it is documented as "like view-timeline-inset"; the JS runtime maps the same `inset` to `rootMargin` in [`handlers/viewEnter.ts`](packages/interact/src/handlers/viewEnter.ts), `insetToRootMargin`).
- **Activation-range** from `params.threshold` (default `0.2`): map to a point in the `entry` phase, e.g. `entry <threshold*100>%` (default `entry 20%`). _This is the one approximate mapping_ — IntersectionObserver threshold is a ratio-of-element while view-timeline ranges are position-based; pick the documented default and refine during implementation/testing.

---

## Part A — `generate()` emits native triggers (CSS)

Files: [`packages/interact/src/core/css.ts`](packages/interact/src/core/css.ts), [`packages/interact/src/core/cssUtils.ts`](packages/interact/src/core/cssUtils.ts), [`packages/interact/src/types/css.ts`](packages/interact/src/types/css.ts).

### 1. Opt-out flag (default ON)

Migrate the trailing arg to an options object — `generate(config, options?: { useFirstChild?: boolean; nativeTriggers?: boolean })` — with `nativeTriggers` **defaulting to `true`**. Thread through `_generate` → `parseInteraction` → `parseEffect`/`effectToCSS` / `triggerToCSS`. Keep `useFirstChild` working (default `true`).

- **Back-compat:** `generate()` and `_generate()` are currently `(config, useFirstChild = true)` (css.ts lines 517, 547) and are called with a positional boolean in tests. Preserve the positional-boolean call form OR update call sites; either way, `nativeTriggers: false` ⇒ byte-for-byte identical output (the regression baseline — see tests).

### 2. Register `animation-trigger` in the coordinated-list machinery

So per-effect custom props, alignment, and `var()` emission flow through automatically:

- Add `'animation-trigger'` to `ListPropertyName` ([`types/css.ts`](packages/interact/src/types/css.ts)), and to `LIST_PROPERTY_NAMES` and `LIST_PROPERTY_FALLBACKS` (`'none'`) in [`css.ts`](packages/interact/src/core/css.ts).
- **Keep it OUT of `LIST_ANIMATION_PROPERTY_NAMES`/`LIST_PROPERTY_NAMES_MOTION`** — its value is computed in interact (depends on trigger + `triggerType`), not produced by motion's `getCSSAnimation`.

### 3. `@supports` support on rules

Add `supports?: string` to `CSSRuleData` ([`types/css.ts`](packages/interact/src/types/css.ts)) and have `CSSRuleToString` ([`cssUtils.ts`](packages/interact/src/core/cssUtils.ts)) wrap the rule in `@supports (...) { … }` when set (compose with the existing `@media` wrap at line 151). Use a feature-detect condition such as `@supports (animation-trigger: --x play)`.

### 4. Compute the `animation-trigger` value

In `effectToCSS` (the `namedEffect || keyframeEffect` branch, css.ts lines 212–267): **always** add `'animation-trigger'` to `usedProperties` (keeps comma-positions aligned with `animation`/`-timeline`/`-range` when a target has multiple animations). Value = `--<triggerId> <entry> [<exit>]` from the table when `nativeTriggers` is on **and** the trigger is `viewEnter`; otherwise `none`. `triggerId` reuses the existing `motionTrigger.id` (`trigger-<interactionIdx>`, css.ts lines 457–461). The per-effect custom-prop _definition_ can stay ungated (an unused custom property is harmless).

### 5. Emit the coordinated `animation-trigger` list as a SEPARATE `@supports`-gated rule

Do not merge it into the shared `animation`/`-timeline`/`-range` coordinated rule from `buildListsRule` (those must stay ungated for the JS path). Either extend `buildListsRule` to split `animation-trigger` into its own rule carrying `supports`, or emit a dedicated rule for it.

### 6. Emit `timeline-trigger` on the source element

Extend `triggerToCSS` (or add a sibling) so that for `viewEnter` (when `nativeTriggers` is on) it returns a `@supports`-gated rule with `timeline-trigger: --<triggerId> view(<inset?>) <activation-range> [ / <active-range> ]`. `triggerToCSS` is currently called only for `viewProgress` in `parseInteraction` ([`css.ts`](packages/interact/src/core/css.ts), lines 462–464); add a parallel call for the view-enter trigger.

### 7. FOUC — reuse the paused animation, no new gated hide

The existing coordinated `animation: …paused` already holds the element at keyframe 0 (e.g. `opacity:0` / slid-in position) with `fill: both`, so there is no flash. The trigger's `play-once`/`play`/`replay` action **resumes** the paused animation on activation; `fill` holds the end state afterward.

**Do not** emit the JS-gated `:not([data-interact-enter])` `visibility:hidden` for the native path — it would never be removed without JS. The animation frames + `fill` self-heal the reveal. (Verify the resume-a-paused-animation semantics against a real engine during testing; if an engine won't resume a `paused` animation via a trigger action, emit a non-`paused` `animation` variant inside the `@supports` block instead.)

---

## Part B — `create()` skips viewEnter JS where native is supported (double-play guard)

Files: [`packages/interact/src/core/Interact.ts`](packages/interact/src/core/Interact.ts), [`packages/interact/src/core/add.ts`](packages/interact/src/core/add.ts), relevant option types.

> **Why this is here:** with `nativeTriggers` on by default, `generate()` emits native CSS for `viewEnter` by default. If the JS runtime also binds its IntersectionObserver, both play in supporting browsers → double-play. Making the default coherent therefore requires the runtime to stand down where native works. **This is a proposed decision implied by the default-on flip** (the user asked to flip `nativeTriggers`'s default; this is its runtime consequence) — surfaced here for review.

- **Feature-detect, don't hand-coordinate.** In the binding path, check `CSS.supports('animation-trigger: --x play')` once. When supported, **skip** binding the JS `viewEnter` handler; when not supported, bind it as today (fallback). This auto-falls-back with no consumer coordination and no separate opt-out flag needed for the common case.
  - Optionally still expose an explicit override on `Interact.create` / `init` (currently `{ useCustomElement?: boolean }`, [`Interact.ts`](packages/interact/src/core/Interact.ts) lines 60 / 174) — e.g. `{ nativeViewEnter?: boolean }` — to force-skip or force-bind regardless of detection, for consumers who ship their own gating. Default behavior remains feature-detection.
- Thread the decision to the binding path in [`core/add.ts`](packages/interact/src/core/add.ts), where `TRIGGER_TO_HANDLER_MODULE_MAP[interaction.trigger]?.add(...)` is invoked. There are **three** call sites: effects at line 733 (`addInteraction`), and sequences at lines 453 (`_processSequences`) and 543 (`_processSequencesForTarget`). When skipping is in effect and `interaction.trigger === 'viewEnter'`, skip the `.add()` **for plain effects only** so no IntersectionObserver/handler is attached.
- **CRITICAL — exclude Sequences from the skip (see Part C).** Sequences still need their WAAPI timing (endDelay/stagger) for correct reverse playback, so the two sequence call sites (453, 543) must **still bind** even under native support. Skipping them blindly breaks reverse-stagger. All non-`viewEnter` triggers bind as before.
- Net effect: native CSS drives plain view-enter entrances where supported; the JS handler is never wired up for them (no double-play); browsers lacking `animation-trigger` fall back to the JS path automatically. Sequences keep their WAAPI timing regardless. Document the fallback behavior clearly.

---

## Part C — Sequences stay WAAPI-timed under native triggers (endDelay / reverse)

Files: [`packages/interact/src/core/add.ts`](packages/interact/src/core/add.ts), [`packages/interact/src/core/Interact.ts`](packages/interact/src/core/Interact.ts) (`getSequence`), [`packages/motion/src/Sequence.ts`](packages/motion/src/Sequence.ts).

**The constraint.** Motion's `Sequence` computes per-group timing at **runtime** in `applyOffsets` ([`Sequence.ts`](packages/motion/src/Sequence.ts) lines 64–84): a stagger `delay` per group index (`calculateOffsets`) and an `endDelay` per animation so that every animation shares the same total sequence duration (`delay + duration*iterations + endDelay === sequenceDuration`). The equal total timeline is what makes **reverse** playback stagger correctly (the last-finishing effect reverses first; earlier effects idle at their end state for `endDelay` before reversing).

**Why CSS can't do it.** The CSS path emits each effect via `getCSSAnimation(null, effectToAnimationOptions(effect), trigger)`. `effectToAnimationOptions(effect)` ([`handlers/utilities.ts`](packages/interact/src/handlers/utilities.ts) line 35) takes **only the effect** — no sequence/group index — and `getAnimationAsCSS` emits `name duration delay easing fill iterations direction paused` with **no `endDelay`** and **no per-index stagger offset**. So a purely CSS-driven sequence would lose both the stagger and the equal-total-timeline, and a native `play-backwards`/`reset` on exit would reverse each animation over only its own `delay+duration` — **breaking reverse timing**.

**The decision (per the user's instruction).** For effects inside a `Sequence`, **keep the WAAPI timing layer even when native triggers are ON.** The native `timeline-trigger` + `animation-trigger` may fire the play/reverse *action*, but `endDelay` (and the stagger offset) must be applied via WAAPI so that reversing the sequence yields the same effect timing in reverse as the forward run. Concretely this means Part B must **not** skip the JS binding for sequences (already called out above).

**Open verification point (do NOT resolve in the plan — verify against a real engine during implementation):**

- **Mechanism:** either (a) keep creating the motion `Sequence` (WAAPI) exactly as today so it owns all timing, and use the native trigger purely as the activation signal; or (b) let the native trigger drive CSS animations and, after they are created, reach the resulting `CSSAnimation` objects via `element.getAnimations()` and `effect.updateTiming({ endDelay })` to graft the WAAPI timing on. Option (a) is the lower-risk default (it is today's behavior minus the double-play guard for plain effects); option (b) is only worth exploring if we want sequences to also benefit from the pure-CSS play path.
- **Must confirm:** that a WAAPI-timed sequence and a native-triggered plain effect can coexist on the same page without conflicting (e.g. an element that is both a sequence member and has its own view-enter effect), and that reverse-stagger timing is visually identical to the JS-only path.

---

## Edge cases & notes

- `viewProgress` and event triggers are untouched; `transition`/no-effect branches in `effectToCSS` are untouched (they don't add `animation-trigger`).
- All four `triggerType`s (`once`/`alternate`/`repeat`/`state`) get a `paused` animation shorthand for `viewEnter` (motion appends `paused` whenever `isRunning` is false), so the trigger's action resumes it. Only `viewEnter`+`once`+same-element additionally gets the `visibility:hidden` FOUC gate today via `shouldUseInitial`; the native path relies on the paused-animation + `fill`, not on `visibility:hidden`.
- Sequences: the always-emit alignment rule means staggered effects each contribute an `animation-trigger` slot, all referencing the same interaction `triggerId` — fine. (Timing for those slots is still owned by WAAPI — Part C.)
- Naming: use `--<triggerId>` for the trigger name (unique per interaction), avoiding the spec's "later element wins on duplicate names" collision.

---

## Verification

**Unit ([`packages/interact/test/css.spec.ts`](packages/interact/test/css.spec.ts)):**

- `nativeTriggers: false` ⇒ output byte-for-byte unchanged (snapshot of an existing viewEnter case) — the regression baseline now that default is ON.
- Default (on), `viewEnter` + each `triggerType` ⇒ correct `timeline-trigger` (source, `view()`, activation/active range) and `animation-trigger` action(s) per the table; both inside `@supports`.
- Multiple animations on one target ⇒ `animation-trigger` list positions align with the `animation` list (always-emit `none` for non-native slots).
- `viewProgress`, `transition`, and no-effect cases ⇒ no `animation-trigger`/`timeline-trigger`.

**Runtime:**

- With native support present (mock `CSS.supports` → `true`): `create(config)` ⇒ no IntersectionObserver attached for plain `viewEnter` effects (assert handler/observer not created); **Sequences still bind** (WAAPI timing/endDelay present); other triggers still bind.
- With native support absent (mock `CSS.supports` → `false`): the JS `viewEnter` path binds as today (fallback).

**Manual:** load generated CSS in a browser with `animation-trigger` support (recent Chromium), scroll the element into view ⇒ entrance plays once natively with **no JS**; confirm it plays exactly once (no double-play); in a browser lacking support, confirm the existing JS path still works; for a **Sequence**, confirm reverse-stagger timing under native triggers matches the JS-only path.

> Run `nvm use` before any `yarn build` / `yarn test` (per CLAUDE.md).
