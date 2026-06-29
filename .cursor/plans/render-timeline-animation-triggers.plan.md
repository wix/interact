---
name: Render timeline-trigger + animation-trigger CSS
overview: 'Extend @wix/interact generate() to additionally emit native CSS timeline-trigger + animation-trigger declarations (opt-in) for viewEnter/pageVisible entrance animations so they play in pure CSS where supported, and add a create() option to skip the JS viewEnter handlers to prevent double-play.'
todos:
  - id: generate-options-flag
    content: 'Add a nativeTriggers opt-in option to generate()/_generate(), threaded through parseInteraction, parseEffect, effectToCSS, and triggerToCSS. Flag off produces byte-for-byte identical output.'
    status: pending
  - id: register-animation-trigger-prop
    content: 'Register animation-trigger in the coordinated-list machinery: add to ListPropertyName, LIST_PROPERTY_NAMES, and LIST_PROPERTY_FALLBACKS (none); keep it OUT of LIST_ANIMATION_PROPERTY_NAMES and LIST_PROPERTY_NAMES_MOTION.'
    status: pending
  - id: supports-on-cssrule
    content: 'Add an optional supports field to CSSRuleData and have CSSRuleToString wrap the rule in an @supports block when set, composing with the existing @media wrap.'
    status: pending
  - id: compute-animation-trigger-value
    content: 'In effectToCSS (namedEffect/keyframeEffect branch), always include animation-trigger in usedProperties and compute its value as the trigger name plus entry/exit actions per triggerType for viewEnter/pageVisible, else none.'
    status: pending
  - id: emit-animation-trigger-rule
    content: 'Emit the coordinated animation-trigger list as a separate @supports-gated rule, not merged into the shared animation/timeline/range coordinated rule from buildListsRule.'
    status: pending
  - id: emit-timeline-trigger
    content: 'Emit timeline-trigger on the source element for viewEnter/pageVisible (extend triggerToCSS or add a sibling), @supports-gated, using a view() source with derived activation/active range.'
    status: pending
  - id: fouc-paused-reuse
    content: 'Reuse the existing paused animation plus fill for FOUC; do NOT emit the JS-gated visibility:hidden for the native path. Verify resume-via-trigger semantics against a real engine.'
    status: pending
  - id: create-skip-flag
    content: 'Add a nativeViewEnter (skip) flag to Interact.create/init options and thread it to core/add.ts to skip handler binding for viewEnter/pageVisible interactions.'
    status: pending
  - id: unit-tests-css
    content: 'Add css.spec.ts tests: flag off unchanged; flag on emits correct timeline-trigger and animation-trigger per triggerType inside @supports; multi-animation alignment; viewProgress/transition/no-effect untouched.'
    status: pending
  - id: runtime-test-skip
    content: 'Test that create(config, { nativeViewEnter: true }) attaches no IntersectionObserver for viewEnter/pageVisible while other triggers still bind.'
    status: pending
  - id: manual-verification
    content: 'Manually verify native play-once on scroll in a supporting browser, no double-play with the skip flag on, and JS fallback when the flag is off or the browser lacks support.'
    status: pending
isProject: false
---

# Render `timeline-trigger` + `animation-trigger` CSS in `generate()`

## Context

`@wix/interact`'s `generate()` ([`packages/interact/src/core/css.ts`](packages/interact/src/core/css.ts)) turns an interact config into a CSS stylesheet. Today, for `viewEnter`/`pageVisible` entrance animations it emits a **paused** `animation` shorthand — motion's `getAnimationAsCSS` appends `paused` when `isRunning === false` ([`packages/motion/src/api/cssAnimations.ts`](packages/motion/src/api/cssAnimations.ts), line 31) — plus a FOUC initial-state rule gated on `:not([data-interact-enter])` ([`packages/interact/src/core/cssUtils.ts`](packages/interact/src/core/cssUtils.ts), line 127).

The animation only _plays_ when the JS runtime's IntersectionObserver fires and sets `data-interact-enter` / calls `.play()` ([`packages/interact/src/handlers/viewEnter.ts`](packages/interact/src/handlers/viewEnter.ts), [`packages/interact/src/handlers/effectHandlers.ts`](packages/interact/src/handlers/effectHandlers.ts)). **There is no JS-free play path** — a grep for `interact-enter` confirms the only CSS reference is the `:not(...)` gate, which JS opens.

The [CSS Animation Triggers spec](https://drafts.csswg.org/animation-triggers-1/) adds a **decoupled** model that lets these entrance animations play natively, without JS, where supported:

- **`timeline-trigger`** — defines a _named_ trigger driven by a timeline + activation range.
- **`animation-trigger`** — connects an animation to that named trigger via an _action_ (`play-once`, `play`, `replay`, `reset`, `play-forwards`/`play-backwards`, `pause`, …).

**Goal:** make `generate()` additionally emit `timeline-trigger` + `animation-trigger` for view-driven entrance triggers (opt-in), so they run in pure CSS where the browser supports them, and give `create()` a flag to skip the JS viewEnter handlers so the two paths don't both fire ("double-play").

**Decisions already made (with the user):**

- **Additive + opt-in flag** on `generate()`. With the flag off, output is byte-for-byte unchanged.
- **`create()` gets a new options flag to skip `viewEnter`/`pageVisible` interactions entirely** — that is the double-play guard (the runtime simply doesn't attach JS handlers for those).
- Scope: `viewEnter` + `pageVisible` only (they share the IntersectionObserver handler). `viewProgress` stays on `animation-timeline` scrubbing (it's a scrub, not a discrete trigger). `hover`/`click`/`pointerMove` are out of scope (event-, not timeline-, driven).

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

| `triggerType` | entry action    | exit action      | active-range                     | matches handler                                             |
| :------------ | :-------------- | :--------------- | :------------------------------- | :---------------------------------------------------------- |
| `once`        | `play-once`     | —                | default                          | plays once, unobserves                                      |
| `alternate`   | `play-forwards` | `play-backwards` | default (narrow, main threshold) | play / reverse on the main observer                         |
| `repeat`      | `replay`        | `reset`          | **wide** (full exit)             | `progress(0)+play` / `pause()+progress(0)` on EXIT_OBSERVER |
| `state`       | `play`          | `pause`          | **wide** (full exit)             | `play` / `pause` on EXIT_OBSERVER                           |

`repeat`/`state` use the runtime's wide `EXIT_OBSERVER_CONFIG` (deactivate only when fully out), so their active-range must be the full timeline (e.g. `… / entry 0% exit 100%`). `alternate` deactivates at the activation threshold, so it keeps the default active-range.

### Trigger source + activation range

- **Source** = a `view()` timeline of the keyed (source) element — `view()` tracks that element entering the viewport, exactly the `viewEnter` semantic. `inset` maps directly to the `view()` inset (it is documented as "like view-timeline-inset").
- **Activation-range** from `params.threshold` (default `0.2`): map to a point in the `entry` phase, e.g. `entry <threshold*100>%` (default `entry 20%`). _This is the one approximate mapping_ — IntersectionObserver threshold is a ratio-of-element while view-timeline ranges are position-based; pick the documented default and refine during implementation/testing.

---

## Part A — `generate()` emits native triggers (CSS)

Files: [`packages/interact/src/core/css.ts`](packages/interact/src/core/css.ts), [`packages/interact/src/core/cssUtils.ts`](packages/interact/src/core/cssUtils.ts), [`packages/interact/src/types/css.ts`](packages/interact/src/types/css.ts).

### 1. Opt-in flag

Add a `nativeTriggers` option. Prefer migrating the trailing arg to an options object — `generate(config, options?: { useFirstChild?: boolean; nativeTriggers?: boolean })` — threaded through `_generate` → `parseInteraction` → `parseEffect`/`effectToCSS` / `triggerToCSS`. Keep `useFirstChild` working. Flag off ⇒ identical output.

### 2. Register `animation-trigger` in the coordinated-list machinery

So per-effect custom props, alignment, and `var()` emission flow through automatically:

- Add `'animation-trigger'` to `ListPropertyName` ([`types/css.ts`](packages/interact/src/types/css.ts)), and to `LIST_PROPERTY_NAMES` and `LIST_PROPERTY_FALLBACKS` (`'none'`) in [`css.ts`](packages/interact/src/core/css.ts).
- **Keep it OUT of `LIST_ANIMATION_PROPERTY_NAMES`/`LIST_PROPERTY_NAMES_MOTION`** — its value is computed in interact (depends on trigger + `triggerType`), not produced by motion's `getCSSAnimation`.

### 3. `@supports` support on rules

Add `supports?: string` to `CSSRuleData` ([`types/css.ts`](packages/interact/src/types/css.ts)) and have `CSSRuleToString` ([`cssUtils.ts`](packages/interact/src/core/cssUtils.ts)) wrap the rule in `@supports (...) { … }` when set (compose with the existing `@media` wrap). Use a feature-detect condition such as `@supports (animation-trigger: --x play)`.

### 4. Compute the `animation-trigger` value

In `effectToCSS` (the `namedEffect || keyframeEffect` branch): **always** add `'animation-trigger'` to `usedProperties` (keeps comma-positions aligned with `animation`/`-timeline`/`-range` when a target has multiple animations). Value = `--<triggerId> <entry> [<exit>]` from the table when `nativeTriggers` is on **and** the trigger is `viewEnter`/`pageVisible`; otherwise `none`. `triggerId` reuses the existing `motionTrigger.id` (`trigger-<interactionIdx>`). The per-effect custom-prop _definition_ can stay ungated (an unused custom property is harmless).

### 5. Emit the coordinated `animation-trigger` list as a SEPARATE `@supports`-gated rule

Do not merge it into the shared `animation`/`-timeline`/`-range` coordinated rule from `buildListsRule` (those must stay ungated for the JS path). Either extend `buildListsRule` to split `animation-trigger` into its own rule carrying `supports`, or emit a dedicated rule for it.

### 6. Emit `timeline-trigger` on the source element

Extend `triggerToCSS` (or add a sibling) so that for `viewEnter`/`pageVisible` (when `nativeTriggers` is on) it returns a `@supports`-gated rule with `timeline-trigger: --<triggerId> view(<inset?>) <activation-range> [ / <active-range> ]`. `triggerToCSS` is currently called only for `viewProgress` in `parseInteraction` ([`css.ts`](packages/interact/src/core/css.ts), line 454); add a parallel call for the view-enter triggers.

### 7. FOUC — reuse the paused animation, no new gated hide

The existing coordinated `animation: …paused` already holds the element at keyframe 0 (e.g. `opacity:0` / slid-in position) with `fill: both`, so there is no flash. The trigger's `play-once`/`play`/`replay` action **resumes** the paused animation on activation; `fill` holds the end state afterward.

**Do not** emit the JS-gated `:not([data-interact-enter])` `visibility:hidden` for the native path — it would never be removed without JS. The animation frames + `fill` self-heal the reveal. (Verify the resume-a-paused-animation semantics against a real engine during testing; if an engine won't resume a `paused` animation via a trigger action, emit a non-`paused` `animation` variant inside the `@supports` block instead.)

---

## Part B — `create()` skips viewEnter JS (runtime double-play guard)

Files: [`packages/interact/src/core/Interact.ts`](packages/interact/src/core/Interact.ts), [`packages/interact/src/core/add.ts`](packages/interact/src/core/add.ts), relevant option types.

- Extend the existing options object on `Interact.create` / `init` ([`Interact.ts`](packages/interact/src/core/Interact.ts), lines 174 / 60, currently `{ useCustomElement?: boolean }`) with a flag, e.g. `{ nativeViewEnter?: boolean }` (or `skipViewEnterBinding`).
- Thread it to the binding path in [`core/add.ts`](packages/interact/src/core/add.ts), where `TRIGGER_TO_HANDLER_MODULE_MAP[interaction.trigger]?.add(...)` is invoked (lines ~453, 543, 733). When the flag is set and `interaction.trigger` ∈ `{ viewEnter, pageVisible }`, **skip** the `.add()` so no IntersectionObserver/handler is attached. All other triggers bind as before.
- Net effect: a consumer who passes `nativeTriggers` to `generate()` also passes `nativeViewEnter` to `create()`; native CSS drives entrances where supported, and the JS handler is never wired up for them — no double-play. (Trade-off the user accepted: in browsers lacking `animation-trigger`, those entrances won't play unless the consumer keeps the JS path; document this clearly.)

---

## Edge cases & notes

- `viewProgress` and event triggers are untouched; `transition`/no-effect branches in `effectToCSS` are untouched (they don't add `animation-trigger`).
- `pageVisible` shares `viewEnterHandler` and IntersectionObserver semantics, so it's mapped identically to `viewEnter`; note this in code comments.
- Sequences: the always-emit alignment rule means staggered effects each contribute an `animation-trigger` slot, all referencing the same interaction `triggerId` — fine.
- Naming: use `--<triggerId>` for the trigger name (unique per interaction), avoiding the spec's "later element wins on duplicate names" collision.

---

## Verification

**Unit ([`packages/interact/test/css.spec.ts`](packages/interact/test/css.spec.ts)):**

- Flag off ⇒ output byte-for-byte unchanged (snapshot of an existing viewEnter case).
- Flag on, `viewEnter` + each `triggerType` ⇒ correct `timeline-trigger` (source, `view()`, activation/active range) and `animation-trigger` action(s) per the table; both inside `@supports`.
- Multiple animations on one target ⇒ `animation-trigger` list positions align with the `animation` list (always-emit `none` for non-native slots).
- `viewProgress`, `transition`, and no-effect cases ⇒ no `animation-trigger`/`timeline-trigger`.

**Runtime:** `create(config, { nativeViewEnter: true })` ⇒ no IntersectionObserver attached for viewEnter/pageVisible (assert handler/observer not created); other triggers still bind.

**Manual:** load generated CSS in a browser with `animation-trigger` support (recent Chromium), scroll the element into view ⇒ entrance plays once natively with **no JS**; with `nativeViewEnter` on, confirm it plays exactly once (no double-play); with the flag off / unsupported browser, confirm the existing JS path still works.

> Run `nvm use` before any `yarn build` / `yarn test` (per CLAUDE.md).
